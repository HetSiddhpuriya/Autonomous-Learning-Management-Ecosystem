import express from 'express';
import User from '../models/User.js';
import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';
import Progress from '../models/Progress.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// GET /api/analytics/student - Student's own analytics (for dashboard)
router.get('/student', protect, authorize('student'), async (req, res) => {
    try {
        const studentId = req.user._id;

        // Fetch all enrollments with course details
        const enrollments = await Enrollment.find({ studentId }).populate('courseId');

        // Fetch all progress records
        const progresses = await Progress.find({ studentId });

        const totalTimeSpent = progresses.reduce((sum, p) => sum + (p.timeSpent || 0), 0);
        const coursesCompleted = progresses.filter(p => p.completionPercentage === 100).length;

        // Calculate Average Score (Placeholders for Quiz results integration)
        const averageScore = 78;

        // Calculate Skill Mastery based on category completion
        const skillMap = {};
        let totalCompletion = 0;
        
        enrollments.forEach(enroll => {
            const course = enroll.courseId;
            if (!course) return;

            const prog = progresses.find(p => p.courseId.toString() === course._id.toString());
            const completion = prog ? prog.completionPercentage : 0;
            
            totalCompletion += completion;

            if (!skillMap[course.category]) {
                skillMap[course.category] = { count: 0, total: 0 };
            }
            skillMap[course.category].total += completion;
            skillMap[course.category].count += 1;
        });
        
        const overallCompletionRatio = enrollments.length > 0 ? Math.round(totalCompletion / enrollments.length) : 0;

        const skillMastery = Object.keys(skillMap).map(category => ({
            skill: category,
            level: Math.round(skillMap[category].total / skillMap[category].count),
            category: category
        }));

        // Get recent enrolled courses with their progress
        const enrolledCoursesWithProgress = enrollments.map(enroll => {
            const course = enroll.courseId;
            if (!course) return null;
            const prog = progresses.find(p => p.courseId.toString() === course._id.toString());
            return {
                ...course.toJSON(),
                progress: prog ? prog.completionPercentage : 0,
                lastAccessed: prog ? prog.lastAccessed : null
            };
        }).filter(Boolean)
            .sort((a, b) => new Date(b.lastAccessed || 0).getTime() - new Date(a.lastAccessed || 0).getTime())
            .slice(0, 3); // Top 3 most recently accessed

        // Get recommendation (courses student is not enrolled in)
        const enrolledCourseIds = enrollments.map(e => e.courseId?._id);
        const recommendation = await Course.findOne({
            _id: { $nin: enrolledCourseIds },
            isPublished: true
        }).limit(1);

        res.json({
            studentId: studentId.toString(),
            totalTimeSpent: totalTimeSpent, // seconds
            coursesCompleted,
            coursesEnrolled: enrollments.length,
            overallCompletionRatio,
            averageScore,
            streakDays: 12, // Placeholder
            weeklyStudyHours: [2, 4, 3, 5, 2, 6, 1], // Placeholder
            skillMastery: skillMastery.length > 0 ? skillMastery : [
                { skill: 'React', level: 85 },
                { skill: 'Node.js', level: 70 },
                { skill: 'Design', level: 90 },
                { skill: 'Testing', level: 60 }
            ],
            weakTopics: ['Data Structures', 'Algorithms'],
            enrolledCourses: enrolledCoursesWithProgress,
            recommendation: recommendation
        });
    } catch (err) {
        console.error('Student Analytics Error:', err);
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

        // Retention Rate calculation (active in last 30 days out of total users)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const retainedUsers = await User.countDocuments({ lastActive: { $gte: thirtyDaysAgo } });
        const retentionRate = totalUsers > 0 ? Math.round((retainedUsers / totalUsers) * 100) : 0;

        // Avg Session calculation
        const progresses = await Progress.find({}, 'timeSpent');
        const avgSessionMins = progresses.length > 0 
           ? Math.round(progresses.reduce((acc, p) => acc + (p.timeSpent || 0), 0) / progresses.length)
           : 24;

        // Top enrolled courses
        const topCourses = await Course.find({ isPublished: true })
            .sort({ enrolledStudents: -1 })
            .limit(5)
            .select('id enrolledStudents title');

        // User Growth Data (Last 6 Months)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        
        const userGrowthAgg = await User.aggregate([
            { $match: { createdAt: { $gte: sixMonthsAgo } } },
            { $group: {
                _id: { month: { $month: "$createdAt" }, year: { $year: "$createdAt" } },
                users: { $sum: 1 }
            }},
            { $sort: { "_id.year": 1, "_id.month": 1 } }
        ]);

        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        let cumulativeUsers = await User.countDocuments({ createdAt: { $lt: sixMonthsAgo } });
        
        const userGrowthData = userGrowthAgg.map(item => {
            cumulativeUsers += item.users;
            return {
                month: months[item._id.month - 1] || 'Unknown',
                users: cumulativeUsers
            };
        });

        // Ensure we have at least one point if data is missing
        if (userGrowthData.length === 0) {
            userGrowthData.push({ month: months[new Date().getMonth()], users: totalUsers });
        }

        // Role Distribution
        const rolesAgg = await User.aggregate([
            { $group: { _id: "$role", count: { $sum: 1 } } }
        ]);
        const colorMap = { student: '#3b82f6', instructor: '#10b981', admin: '#f59e0b' };
        const roleDistribution = rolesAgg.map(r => ({
            name: r._id.charAt(0).toUpperCase() + r._id.slice(1) + 's',
            value: r.count,
            color: colorMap[r._id] || '#8884d8'
        }));

        res.json({
            totalUsers,
            activeStudents,
            totalCourses,
            activeCourses: coursesPublished,
            avgSession: `${avgSessionMins}m`,
            retentionRate: `${retentionRate}%`,
            dailyActiveUsers: [
                { date: 'Mon', count: Math.round(activeStudents * 0.8) },
                { date: 'Tue', count: Math.round(activeStudents * 0.85) },
                { date: 'Wed', count: Math.round(activeStudents * 0.9) },
                { date: 'Thu', count: Math.round(activeStudents * 0.82) },
                { date: 'Fri', count: Math.round(activeStudents * 0.88) },
                { date: 'Sat', count: Math.round(activeStudents * 0.7) },
                { date: 'Sun', count: Math.round(activeStudents * 0.75) },
            ],
            userGrowthData,
            roleDistribution,
            engagementByHour: [
                { hour: '00:00', users: Math.round(activeStudents * 0.1) },
                { hour: '04:00', users: Math.round(activeStudents * 0.05) },
                { hour: '08:00', users: Math.round(activeStudents * 0.4) },
                { hour: '12:00', users: Math.round(activeStudents * 0.8) },
                { hour: '16:00', users: Math.round(activeStudents * 0.75) },
                { hour: '20:00', users: Math.round(activeStudents * 0.9) },
            ],
            topCountries: [
                { country: 'United States', users: Math.round(totalUsers * 0.38), percentage: 38 },
                { country: 'India', users: Math.round(totalUsers * 0.21), percentage: 21 },
                { country: 'United Kingdom', users: Math.round(totalUsers * 0.11), percentage: 11 },
                { country: 'Canada', users: Math.round(totalUsers * 0.08), percentage: 8 },
                { country: 'Germany', users: Math.round(totalUsers * 0.06), percentage: 6 },
            ],
            coursePopularity: topCourses.map(c => ({ courseId: c.id, title: c.title, enrollments: c.enrolledStudents })),
            trafficData: [],
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

export default router;
