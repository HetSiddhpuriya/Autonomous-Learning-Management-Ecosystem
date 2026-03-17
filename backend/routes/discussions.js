import express from 'express';
import Discussion from '../models/Discussion.js';
import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// GET /api/discussions?courseId=xxx
router.get('/', protect, async (req, res) => {
    try {
        const { courseId } = req.query;
        if (!courseId) return res.status(400).json({ message: 'courseId is required' });

        // Access Control
        const course = await Course.findById(courseId);
        if (!course) return res.status(404).json({ message: 'Course not found' });

        let isAuthorized = false;
        if (req.user.role === 'admin' || course.instructorId.toString() === req.user._id.toString()) {
            isAuthorized = true;
        } else if (req.user.role === 'student') {
            const enrollment = await Enrollment.findOne({ studentId: req.user._id, courseId });
            if (enrollment) isAuthorized = true;
        }

        if (!isAuthorized) {
            return res.status(403).json({ message: 'Not authorized to view discussions for this course' });
        }

        const messages = await Discussion.find({ courseId, parentId: null }).sort({ createdAt: 1 });
        res.json(messages);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST /api/discussions
router.post('/', protect, async (req, res) => {
    try {
        const { courseId, message, parentId = null, attachmentUrl, attachmentName } = req.body;

        // Access Control
        const course = await Course.findById(courseId);
        if (!course) return res.status(404).json({ message: 'Course not found' });

        let isAuthorized = false;
        if (req.user.role === 'admin' || course.instructorId.toString() === req.user._id.toString()) {
            isAuthorized = true;
        } else if (req.user.role === 'student') {
            const enrollment = await Enrollment.findOne({ studentId: req.user._id, courseId });
            if (enrollment) isAuthorized = true;
        }

        if (!isAuthorized) {
            return res.status(403).json({ message: 'Not authorized to post discussions for this course' });
        }

        const discussion = await Discussion.create({
            courseId,
            userId: req.user._id,
            userName: req.user.name,
            userAvatar: req.user.avatar,
            message: message || '',
            attachmentUrl,
            attachmentName,
            parentId,
        });

        // Also broadcast the message immediately via our socket if it's set
        const socketManager = req.app.get('socketManager');
        if (socketManager && socketManager.io) {
            socketManager.io.to(courseId).emit('receive_message', discussion);
        }

        res.status(201).json(discussion);

        res.status(201).json(discussion);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// DELETE /api/discussions/:id
router.delete('/:id', protect, async (req, res) => {
    try {
        const discussion = await Discussion.findById(req.params.id);
        if (!discussion) return res.status(404).json({ message: 'Message not found' });

        if (discussion.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to delete this message' });
        }

        await discussion.deleteOne();
        res.json({ message: 'Message deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET /api/discussions/course/:courseId/members
router.get('/course/:courseId/members', protect, async (req, res) => {
    try {
        const { courseId } = req.params;
        const course = await Course.findById(courseId).populate('instructorId', 'name avatar role');
        if (!course) return res.status(404).json({ message: 'Course not found' });

        // Access Control
        let isAuthorized = false;
        if (req.user.role === 'admin' || (course.instructorId && course.instructorId.id === req.user._id.toString())) {
            isAuthorized = true;
        } else if (req.user.role === 'student') {
            const enrollment = await Enrollment.findOne({ studentId: req.user._id, courseId });
            if (enrollment) isAuthorized = true;
        }

        if (!isAuthorized) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const enrollments = await Enrollment.find({ courseId }).populate('studentId', 'name avatar role');
        
        let members = [];
        if (course.instructorId) {
            members.push({
                _id: course.instructorId._id,
                name: course.instructorId.name,
                avatar: course.instructorId.avatar || '',
                role: 'instructor'
            });
        }
        
        enrollments.forEach(e => {
            if (e.studentId) {
                members.push({
                    _id: e.studentId._id,
                    name: e.studentId.name,
                    avatar: e.studentId.avatar || '',
                    role: 'student'
                });
            }
        });

        // Add online status
        const socketManager = req.app.get('socketManager');
        const onlineUsers = socketManager ? socketManager.getOnlineUsers() : [];

        const membersWithStatus = members.map(m => ({
            ...m,
            isOnline: onlineUsers.includes(m._id.toString())
        }));

        res.json(membersWithStatus);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

export default router;
