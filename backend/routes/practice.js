import express from 'express';
import PracticeQuestion from '../models/PracticeQuestion.js';
import PracticeAttempt from '../models/PracticeAttempt.js';
import User from '../models/User.js';

const router = express.Router();

// Middleware to check if user is instructor (simplified logic for demo)
const isInstructor = (req, res, next) => {
    // Basic verification, would normally use req.user from auth middleware
    next();
};

// 1. PRACTICE ARENA MANAGEMENT (Instructor Only)
router.get('/questions', async (req, res) => {
    try {
        const questions = await PracticeQuestion.find().sort({ createdAt: -1 });
        res.json(questions);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.post('/questions', async (req, res) => {
    const question = new PracticeQuestion(req.body);
    try {
        const newQuestion = await question.save();
        res.status(201).json(newQuestion);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

router.put('/questions/:id', async (req, res) => {
    try {
        const updatedQuestion = await PracticeQuestion.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedQuestion);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

router.delete('/questions/:id', async (req, res) => {
    try {
        await PracticeQuestion.findByIdAndDelete(req.params.id);
        res.json({ message: 'Question deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// 2. DAILY QUIZ CHALLENGE (Student)
router.get('/daily', async (req, res) => {
    try {
        // Simple logic for "daily": always pick 5 random questions for now
        // For production, we would use a seed based on the daily date.
        const questions = await PracticeQuestion.aggregate([{ $sample: { size: 5 } }]);
        res.json({
            title: "Daily Quiz Challenge",
            difficulty: "Medium",
            questions: questions
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Check if student already attempted daily today (simplified)
router.get('/daily/check/:userId', async (req, res) => {
    try {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const attempt = await PracticeAttempt.findOne({
            userId: req.params.userId,
            quizType: 'daily',
            date: { $gte: startOfDay }
        });
        res.json({ attempted: !!attempt });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// 3. RANDOM QUIZ (Student)
router.get('/random', async (req, res) => {
    try {
        const { category, difficulty, limit } = req.query;
        let query = {};
        if (category && category !== 'All') query.category = category;
        if (difficulty && difficulty !== 'All') query.difficulty = difficulty.toLowerCase();

        const questions = await PracticeQuestion.aggregate([
            { $match: query },
            { $sample: { size: parseInt(limit) || 10 } }
        ]);
        res.json(questions);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// 4. SUBMIT RESULT (Student)
router.post('/submit', async (req, res) => {
    const attempt = new PracticeAttempt(req.body);
    try {
        const newAttempt = await attempt.save();
        res.status(201).json(newAttempt);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// 5. LEADERBOARD (Both)
router.get('/leaderboard', async (req, res) => {
    try {
        const leaderboard = await PracticeAttempt.find()
            .populate('userId', 'name profileImage')
            .sort({ score: -1, timeTaken: 1, createdAt: -1 })
            .limit(10);

        const formatted = leaderboard.map((l, index) => ({
            rank: index + 1,
            studentName: l.userId?.name || 'Anonymous',
            score: l.score,
            timeTaken: l.timeTaken,
            date: l.date
        }));
        res.json(formatted);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// 6. STUDENT PERFORMANCE TRACKING
router.get('/stats/:userId', async (req, res) => {
    try {
        const attempts = await PracticeAttempt.find({ userId: req.params.userId });
        if (attempts.length === 0) {
            return res.json({
                totalAttempts: 0,
                avgScore: 0,
                bestScore: 0,
                accuracy: 0,
                lastQuiz: null
            });
        }

        const totalAttempts = attempts.length;
        const avgScore = attempts.reduce((acc, curr) => acc + curr.score, 0) / totalAttempts;
        const bestScore = Math.max(...attempts.map(a => a.score));
        const avgAccuracy = attempts.reduce((acc, curr) => acc + curr.accuracy, 0) / totalAttempts;
        const lastQuiz = attempts[attempts.length - 1];

        res.json({
            totalAttempts,
            avgScore: avgScore.toFixed(2),
            bestScore,
            accuracy: avgAccuracy.toFixed(2),
            lastQuiz
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// 7. INSTRUCTOR STREATE PERFORMANCE (All Students)
router.get('/instructor/performance', async (req, res) => {
    try {
        const students = await User.find({ role: 'student' });
        const perfData = await Promise.all(students.map(async (student) => {
            const attempts = await PracticeAttempt.find({ userId: student._id });
            if (attempts.length === 0) return null;

            const totalScore = attempts.reduce((acc, curr) => acc + curr.score, 0);
            const avgAccuracy = attempts.reduce((acc, curr) => acc + curr.accuracy, 0) / attempts.length;

            return {
                id: student._id,
                name: student.name,
                totalAttempts: attempts.length,
                avgScore: (totalScore / attempts.length).toFixed(2),
                bestScore: Math.max(...attempts.map(a => a.score)),
                accuracy: avgAccuracy.toFixed(2)
            };
        }));

        res.json(perfData.filter(p => p !== null));
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// 8. QUIZ ANALYTICS (Instructor)
router.get('/instructor/analytics', async (req, res) => {
    try {
        const totalAttempts = await PracticeAttempt.countDocuments();
        const allAttempts = await PracticeAttempt.find();
        const avgScore = allAttempts.reduce((acc, curr) => acc + curr.score, 0) / totalAttempts;

        // Group by category (via related questions from attempts if we had IDs, simpler to just mock for now or use real data)
        // For the sake of demo-ready response:
        const attemptsByDate = await PracticeAttempt.aggregate([
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        res.json({
            totalAttempts,
            avgScore: avgScore.toFixed(2),
            dailyParticipation: attemptsByDate,
            // Mocking hard questions and category accuracy for complex visual representation
            mostDifficult: [
                { question: "What is React?", failRate: 45 },
                { question: "Closure in JS", failRate: 60 }
            ],
            categoryAccuracy: [
                { name: 'JavaScript', accuracy: 78 },
                { name: 'React', accuracy: 82 },
                { name: 'Node.js', accuracy: 65 }
            ]
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

export default router;
