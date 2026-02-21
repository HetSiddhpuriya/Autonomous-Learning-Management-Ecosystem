import express from 'express';
import Progress from '../models/Progress.js';
import Lesson from '../models/Lesson.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// GET /api/progress?courseId=xxx - Student's progress for a course
router.get('/', protect, async (req, res) => {
    try {
        const { courseId } = req.query;
        const filter = { studentId: req.user._id };
        if (courseId) filter.courseId = courseId;

        const progress = await Progress.find(filter);
        res.json(progress);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST /api/progress/complete - Mark lesson as complete
router.post('/complete', protect, authorize('student'), async (req, res) => {
    try {
        const { courseId, lessonId, timeSpent = 0 } = req.body;

        const totalLessons = await Lesson.countDocuments({ courseId });

        let prog = await Progress.findOne({ courseId, studentId: req.user._id });

        if (!prog) {
            prog = await Progress.create({
                courseId,
                studentId: req.user._id,
                completedLessons: [lessonId],
                totalLessons,
                completionPercentage: Math.round((1 / totalLessons) * 100),
                timeSpent,
                lastAccessed: new Date(),
            });
        } else {
            // Only add if not already completed
            if (!prog.completedLessons.map(id => id.toString()).includes(lessonId)) {
                prog.completedLessons.push(lessonId);
            }
            prog.totalLessons = totalLessons;
            prog.completionPercentage = Math.round((prog.completedLessons.length / totalLessons) * 100);
            prog.timeSpent += timeSpent;
            prog.lastAccessed = new Date();
            await prog.save();
        }

        res.json(prog);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

export default router;
