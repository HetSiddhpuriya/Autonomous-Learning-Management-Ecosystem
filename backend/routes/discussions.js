import express from 'express';
import Discussion from '../models/Discussion.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// GET /api/discussions?courseId=xxx
router.get('/', protect, async (req, res) => {
    try {
        const { courseId } = req.query;
        if (!courseId) return res.status(400).json({ message: 'courseId is required' });

        const messages = await Discussion.find({ courseId, parentId: null }).sort({ createdAt: 1 });
        res.json(messages);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST /api/discussions
router.post('/', protect, async (req, res) => {
    try {
        const { courseId, message, parentId = null } = req.body;

        const discussion = await Discussion.create({
            courseId,
            userId: req.user._id,
            userName: req.user.name,
            userAvatar: req.user.avatar,
            message,
            parentId,
        });

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

export default router;
