import express from 'express';
import User from '../models/User.js';
import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';
import Progress from '../models/Progress.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// GET /api/analytics/student - Student's own analytics
router.get('/student', protect, authorize('student'), async (req, res) => {
    try {
        const studentId = req.user._id;
        const enrollments = await Enrollment.find({ studentId });
        const progress = await Progress.find({ studentId });

        const totalTimeSpent = progress.reduce((sum, p) => sum + (p.timeSpent || 0), 0);
        const coursesCompleted = progress.filter(p => p.completionPercentage === 100).length;

        res.json({
            studentId: studentId.toString(),
            totalTimeSpent,
            coursesCompleted,
            coursesEnrolled: enrollments.length,
            averageScore: 78, // Placeholder - would come from quiz attempts
            streakDays: 0,
            weeklyStudyHours: [0, 0, 0, 0, 0, 0, 0],
            skillMastery: [],
            weakTopics: [],
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET /api/analytics/instructor - Instructor's course analytics
router.get('/instructor', protect, authorize('instructor'), async (req, res) => {
    try {
        const courses = await Course.find({ instructorId: req.user._id });
        const analytics = await Promise.all(courses.map(async (course) => {
            const enrollments = await Enrollment.countDocuments({ courseId: course._id });
            const progresses = await Progress.find({ courseId: course._id });
            const avgCompletion = progresses.length
                ? Math.round(progresses.reduce((s, p) => s + p.completionPercentage, 0) / progresses.length)
                : 0;

            return {
                courseId: course.id,
                title: course.title,
                totalStudents: enrollments,
                averageCompletion: avgCompletion,
                averageScore: 80,
                dropOffLessons: [],
                engagementOverTime: [],
            };
        }));

        res.json(analytics);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET /api/analytics/platform - Admin platform analytics
router.get('/platform', protect, authorize('admin'), async (req, res) => {
    try {
        const [totalUsers, activeStudents, totalCourses, coursesPublished] = await Promise.all([
            User.countDocuments(),
            User.countDocuments({ role: 'student', isActive: true }),
            Course.countDocuments(),
            Course.countDocuments({ isPublished: true }),
        ]);

        // Top enrolled courses
        const topCourses = await Course.find({ isPublished: true })
            .sort({ enrolledStudents: -1 })
            .limit(5)
            .select('id enrolledStudents');

        res.json({
            totalUsers,
            activeStudents,
            totalCourses,
            coursesPublished,
            dailyActiveUsers: [],
            coursePopularity: topCourses.map(c => ({ courseId: c.id, enrollments: c.enrolledStudents })),
            trafficData: [],
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

export default router;
