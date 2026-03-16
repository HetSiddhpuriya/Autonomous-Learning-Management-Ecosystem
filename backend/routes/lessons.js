import express from 'express';
import Lesson from '../models/Lesson.js';
import Course from '../models/Course.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// GET /api/lessons?courseId=xxx
router.get('/', protect, async (req, res) => {
    try {
        const { courseId } = req.query;
        if (!courseId) return res.status(400).json({ message: 'courseId is required' });
        const lessons = await Lesson.find({ courseId }).sort({ order: 1 });
        res.json(lessons);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET /api/lessons/:id
router.get('/:id', protect, async (req, res) => {
    try {
        const lesson = await Lesson.findById(req.params.id);
        if (!lesson) return res.status(404).json({ message: 'Lesson not found' });
        res.json(lesson);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST /api/lessons
router.post('/', protect, authorize('instructor', 'admin'), async (req, res) => {
    try {
        const lesson = await Lesson.create(req.body);
        // Update course lessonsCount and duration
        await Course.findByIdAndUpdate(req.body.courseId, { $inc: { lessonsCount: 1, duration: lesson.duration || 0 } });
        res.status(201).json(lesson);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// PUT /api/lessons/reorder
router.put('/reorder', protect, authorize('instructor', 'admin'), async (req, res) => {
    try {
        const { updates } = req.body;
        if (!updates || !Array.isArray(updates)) {
            return res.status(400).json({ message: 'updates array is required' });
        }

        const updatePromises = updates.map((update) => {
            return Lesson.findByIdAndUpdate(update.id, {
                order: update.order,
                module: update.module
            });
        });

        await Promise.all(updatePromises);
        res.json({ message: 'Lessons reordered successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// PATCH /api/lessons/:id
router.patch('/:id', protect, authorize('instructor', 'admin'), async (req, res) => {
    try {
        const oldLesson = await Lesson.findById(req.params.id);
        const oldDuration = oldLesson ? (oldLesson.duration || 0) : 0;

        const lesson = await Lesson.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!lesson) return res.status(404).json({ message: 'Lesson not found' });

        if (req.body.duration !== undefined) {
             const durationDiff = (lesson.duration || 0) - oldDuration;
             if (durationDiff !== 0) {
                 await Course.findByIdAndUpdate(lesson.courseId, { $inc: { duration: durationDiff } });
             }
        }

        res.json(lesson);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// DELETE /api/lessons/:id
router.delete('/:id', protect, authorize('instructor', 'admin'), async (req, res) => {
    try {
        const lesson = await Lesson.findByIdAndDelete(req.params.id);
        if (!lesson) return res.status(404).json({ message: 'Lesson not found' });
        await Course.findByIdAndUpdate(lesson.courseId, { $inc: { lessonsCount: -1, duration: -(lesson.duration || 0) } });
        res.json({ message: 'Lesson deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

export default router;
