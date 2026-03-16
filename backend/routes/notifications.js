import express from 'express';
import Notification from '../models/Notification.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// GET /api/notifications - Get notifications for the logged in user
router.get('/', protect, async (req, res) => {
    try {
        const query = {
            $or: [
                { recipient: req.user._id },
                { recipientRole: req.user.role },
                { recipientRole: 'all' }
            ]
        };

        const notifications = await Notification.find(query).sort({ createdAt: -1 }).limit(50);
        res.json(notifications);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// PATCH /api/notifications/:id/read - Mark notification as read
router.patch('/:id/read', protect, async (req, res) => {
    try {
        const notification = await Notification.findByIdAndUpdate(
            req.params.id,
            { isRead: true },
            { new: true }
        );
        res.json(notification);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// PATCH /api/notifications/read-all - Mark all as read for user
router.patch('/read-all', protect, async (req, res) => {
    try {
        const query = {
            $or: [
                { recipient: req.user._id },
                { recipientRole: req.user.role },
                { recipientRole: 'all' }
            ],
            isRead: false
        };
        await Notification.updateMany(query, { isRead: true });
        res.json({ message: 'All notifications marked as read' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

export default router;
