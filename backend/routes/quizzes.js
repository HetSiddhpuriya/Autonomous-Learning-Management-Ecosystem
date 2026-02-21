import express from 'express';
import Quiz from '../models/Quiz.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// GET /api/quizzes?courseId=xxx or ?lessonId=xxx
router.get('/', protect, async (req, res) => {
    try {
        const filter = {};
        if (req.query.courseId) filter.courseId = req.query.courseId;
        if (req.query.lessonId) filter.lessonId = req.query.lessonId;
        const quizzes = await Quiz.find(filter);
        res.json(quizzes);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET /api/quizzes/:id
router.get('/:id', protect, async (req, res) => {
    try {
        const quiz = await Quiz.findById(req.params.id);
        if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
        res.json(quiz);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST /api/quizzes
router.post('/', protect, authorize('instructor', 'admin'), async (req, res) => {
    try {
        const quiz = await Quiz.create(req.body);
        res.status(201).json(quiz);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// PATCH /api/quizzes/:id
router.patch('/:id', protect, authorize('instructor', 'admin'), async (req, res) => {
    try {
        const quiz = await Quiz.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
        res.json(quiz);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// DELETE /api/quizzes/:id
router.delete('/:id', protect, authorize('instructor', 'admin'), async (req, res) => {
    try {
        const quiz = await Quiz.findByIdAndDelete(req.params.id);
        if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
        res.json({ message: 'Quiz deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST /api/quizzes/:id/submit - Student submits quiz
router.post('/:id/submit', protect, authorize('student'), async (req, res) => {
    try {
        const quiz = await Quiz.findById(req.params.id);
        if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

        const { answers, timeTaken } = req.body;
        let correct = 0;

        quiz.questions.forEach((q, i) => {
            if (answers[i] === q.correctAnswer) correct++;
        });

        const score = Math.round((correct / quiz.questions.length) * 100);
        const passed = score >= quiz.passingScore;

        res.json({
            score,
            passed,
            correct,
            total: quiz.questions.length,
            timeTaken,
            completedAt: new Date().toISOString(),
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

export default router;
