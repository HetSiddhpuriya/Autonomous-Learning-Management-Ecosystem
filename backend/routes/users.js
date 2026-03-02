import express from 'express';
import User from '../models/User.js';
import Enrollment from '../models/Enrollment.js';
import Course from '../models/Course.js';
import Notification from '../models/Notification.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// GET /api/users - Admin only: list all users
router.get('/', protect, authorize('admin'), async (req, res) => {
    try {
        const users = await User.find().select('-password').sort({ createdAt: -1 });

        // Real-time status detection:
        // If a user hasn't had any activity (heartbeat) in the last 2 minutes,
        // treat them as offline even if the isOnline flag is set.
        const now = new Date();
        const twoMinutesAgo = new Date(now.getTime() - 2 * 60 * 1000);

        const updatedUsers = await Promise.all(users.map(async (u) => {
            const lastActiveDate = new Date(u.lastActive);
            if (u.isOnline && lastActiveDate < twoMinutesAgo) {
                // Background update for consistency
                u.isOnline = false;
                await User.findByIdAndUpdate(u._id, { isOnline: false });
                return { ...u.toJSON(), isOnline: false };
            }
            return u.toJSON();
        }));

        res.json(updatedUsers);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// PATCH /api/users/heartbeat - Update online status and last active time
router.patch('/heartbeat', protect, async (req, res) => {
    try {
        await User.findByIdAndUpdate(req.user._id, {
            isOnline: true,
            lastActive: new Date()
        });
        res.json({ status: 'ok' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET /api/users/instructor/students - Get all students enrolled in instructor's courses
router.get('/instructor/students', protect, authorize('instructor'), async (req, res) => {
    try {
        const courses = await Course.find({ instructorId: req.user._id });
        const courseIds = courses.map(c => c._id);
        const enrollments = await Enrollment.find({ courseId: { $in: courseIds } }).populate('studentId', '-password');

        // Remove duplicates if a student is enrolled in multiple courses
        const uniqueStudentsMap = new Map();
        enrollments.forEach(enrollment => {
            if (enrollment.studentId && !uniqueStudentsMap.has(enrollment.studentId._id.toString())) {
                uniqueStudentsMap.set(enrollment.studentId._id.toString(), {
                    ...enrollment.studentId.toObject(),
                    enrolledAt: enrollment.createdAt, // Just taking the first found enrollment date
                    lastActive: enrollment.studentId?.updatedAt || new Date().toISOString()
                });
            }
        });

        res.json(Array.from(uniqueStudentsMap.values()));
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST /api/users/wishlist/toggle - Toggle course in wishlist
router.post('/wishlist/toggle', protect, async (req, res) => {
    try {
        const { courseId } = req.body;
        if (!courseId) return res.status(400).json({ message: 'Course ID is required' });

        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const index = user.wishlist.indexOf(courseId);
        if (index === -1) {
            user.wishlist.push(courseId);
        } else {
            user.wishlist.splice(index, 1);
        }

        await user.save();
        const updatedUser = await User.findById(user._id).select('-password');
        res.json(updatedUser);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET /api/users/wishlist/my - Get current user's wishlist courses
router.get('/wishlist/my', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate('wishlist');
        if (!user) return res.status(404).json({ message: 'User not found' });

        res.json(user.wishlist);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET /api/users/:id
router.get('/:id', protect, async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// PATCH /api/users/:id - Update user profile
router.patch('/:id', protect, async (req, res) => {
    try {
        // Only allow users to update themselves (or admin to update anyone)
        if (req.user._id.toString() !== req.params.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const { name, email, avatar, isActive, currentPassword, newPassword } = req.body;

        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (newPassword) {
            if (!currentPassword) return res.status(400).json({ message: 'Current password is required to set new password' });
            const isMatch = await user.comparePassword(currentPassword);
            if (!isMatch) return res.status(401).json({ message: 'Invalid current password' });
            user.password = newPassword;
        }

        if (name !== undefined) user.name = name;
        if (email !== undefined) user.email = email;
        if (avatar !== undefined) user.avatar = avatar;
        if (isActive !== undefined && req.user.role === 'admin') user.isActive = isActive;
        if (req.body.status !== undefined && req.user.role === 'admin') {
            user.status = req.body.status;

            // Notify user of their application change
            await Notification.create({
                recipient: user._id, // notify the exact user
                title: 'Instructor Application Update',
                message: `Your instructor application has been ${req.body.status}.`,
                type: req.body.status === 'approved' ? 'success' : 'error',
                link: '/settings'
            });
        }
        if (req.body.role !== undefined && req.user.role === 'admin') user.role = req.body.role;

        // Instructor Registration Fields
        const { primaryExpertise, experienceLevel, yearsOfExperience, currentJobTitle, organization, registrationComplete } = req.body;
        if (primaryExpertise !== undefined) user.primaryExpertise = primaryExpertise;
        if (experienceLevel !== undefined) user.experienceLevel = experienceLevel;
        if (yearsOfExperience !== undefined) user.yearsOfExperience = yearsOfExperience;
        if (currentJobTitle !== undefined) user.currentJobTitle = currentJobTitle;
        if (organization !== undefined) user.organization = organization;
        if (registrationComplete !== undefined) user.registrationComplete = registrationComplete;

        await user.save();

        // Return without password
        const userResponse = await User.findById(user._id).select('-password');
        res.json(userResponse);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// DELETE /api/users/:id - Admin only
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json({ message: 'User deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

export default router;
