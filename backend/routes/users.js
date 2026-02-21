import express from 'express';
import User from '../models/User.js';
import Enrollment from '../models/Enrollment.js';
import Course from '../models/Course.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// GET /api/users - Admin only: list all users
router.get('/', protect, authorize('admin'), async (req, res) => {
    try {
        const users = await User.find().select('-password').sort({ createdAt: -1 });
        res.json(users);
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
