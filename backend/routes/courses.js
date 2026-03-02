import express from 'express';
import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';
import Module from '../models/Module.js';
import Lesson from '../models/Lesson.js';
import Notification from '../models/Notification.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// GET /api/courses - Get all published courses (public)
router.get('/', async (req, res) => {
    try {
        const { category, difficulty, search } = req.query;
        const filter = {};

        // Non-admin/instructor sees only published
        filter.isPublished = true;

        if (category) filter.category = category;
        if (difficulty) filter.difficulty = difficulty;
        if (search) filter.title = { $regex: search, $options: 'i' };

        const courses = await Course.find(filter).sort({ createdAt: -1 });
        res.json(courses);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET /api/courses/all - Admin/Instructor sees all (including unpublished)
router.get('/all', protect, authorize('admin', 'instructor'), async (req, res) => {
    try {
        const filter = req.user.role === 'instructor' ? { instructorId: req.user._id } : {};
        const courses = await Course.find(filter).sort({ createdAt: -1 });
        res.json(courses);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET /api/courses/:courseId/content - Get structured course with modules and lessons
router.get('/:courseId/content', async (req, res) => {
    try {
        const { courseId } = req.params;
        const course = await Course.findById(courseId).populate('instructorId', '-password');

        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        // Fetch instructor stats
        const instructorCourses = await Course.find({ instructorId: course.instructorId._id });
        const totalInstructorCourses = instructorCourses.length;
        const totalInstructorStudents = instructorCourses.reduce((sum, c) => sum + (c.enrolledStudents || 0), 0);

        // Calculate average instructor rating
        const coursesWithRatings = instructorCourses.filter(c => c.rating > 0);
        const avgRating = coursesWithRatings.length > 0
            ? (coursesWithRatings.reduce((sum, c) => sum + (c.rating || 0), 0) / coursesWithRatings.length).toFixed(1)
            : '4.8'; // Default rating if none exist yet

        // Add stats to the instructor object for the frontend
        const instructorData = {
            ...(course.instructorId.toObject ? course.instructorId.toObject() : course.instructorId),
            totalCourses: totalInstructorCourses,
            totalStudents: totalInstructorStudents,
            avgRating: avgRating
        };

        const modules = await Module.find({ courseId }).sort({ createdAt: 1 });
        const allLessons = await Lesson.find({ courseId }).sort({ order: 1 });

        // Structure the response 
        const structuredModules = modules.map(mod => {
            return {
                id: mod._id.toString(),
                name: mod.name,
                lessons: allLessons
                    .filter(lesson => lesson.module === mod.name)
                    .map(lesson => ({
                        id: lesson._id.toString(),
                        title: lesson.title,
                        duration: lesson.duration
                    }))
            };
        });

        // Handle uncategorized lessons (if any logic allowed lessons without explicitly mapped modules)
        const uncategorizedLessons = allLessons
            .filter(lesson => !modules.some(mod => mod.name === lesson.module))
            .map(lesson => ({
                id: lesson._id.toString(),
                title: lesson.title,
                duration: lesson.duration
            }));

        if (uncategorizedLessons.length > 0) {
            structuredModules.push({
                id: 'uncategorized',
                name: 'Other Lessons',
                lessons: uncategorizedLessons
            });
        }

        res.json({
            course: {
                ...course.toJSON(),
                instructorId: instructorData
            },
            modules: structuredModules,
            instructor: instructorData
        });
    } catch (err) {
        console.error('Fetch course content error:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// GET /api/courses/:id
router.get('/:id', async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) return res.status(404).json({ message: 'Course not found' });
        res.json(course);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST /api/courses - Instructor/Admin create course
router.post('/', protect, authorize('instructor', 'admin'), async (req, res) => {
    try {
        const course = await Course.create({
            ...req.body,
            instructorId: req.user._id,
            instructorName: req.user.name,
        });

        // Notify Admins
        await Notification.create({
            recipientRole: 'admin',
            title: 'New Course Created',
            message: `${req.user.name} created a new course: ${course.title}.`,
            type: 'info',
            link: '/admin/courses'
        });

        res.status(201).json(course);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// PATCH /api/courses/:id
router.patch('/:id', protect, authorize('instructor', 'admin'), async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) return res.status(404).json({ message: 'Course not found' });

        if (req.user.role === 'instructor' && course.instructorId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to edit this course' });
        }

        const updated = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        res.json(updated);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// DELETE /api/courses/:id
router.delete('/:id', protect, authorize('instructor', 'admin'), async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) return res.status(404).json({ message: 'Course not found' });

        if (req.user.role === 'instructor' && course.instructorId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        await course.deleteOne();
        res.json({ message: 'Course deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST /api/courses/:id/enroll - Student enrolls
router.post('/:id/enroll', protect, authorize('student'), async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) return res.status(404).json({ message: 'Course not found' });

        const existing = await Enrollment.findOne({ studentId: req.user._id, courseId: course._id });
        if (existing) return res.status(400).json({ message: 'Already enrolled' });

        const { transactionId, paymentMethod, amount } = req.body;

        await Enrollment.create({
            studentId: req.user._id,
            courseId: course._id,
            transactionId,
            paymentMethod,
            amount: amount || course.price
        });
        await Course.findByIdAndUpdate(course._id, { $inc: { enrolledStudents: 1 } });

        // Notify Instructor
        await Notification.create({
            recipient: course.instructorId,
            title: 'New Student Enrolled',
            message: `${req.user.name} has enrolled in your course: ${course.title}.`,
            type: 'success',
            link: '/instructor/students'
        });

        res.status(201).json({ message: 'Enrolled successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET /api/courses/enrolled/my - Student's enrolled courses
router.get('/enrolled/my', protect, authorize('student'), async (req, res) => {
    try {
        const enrollments = await Enrollment.find({ studentId: req.user._id }).populate('courseId');
        const courses = enrollments.map(e => e.courseId);
        res.json(courses);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET /api/courses/transactions/my - Student's transaction history
router.get('/transactions/my', protect, authorize('student'), async (req, res) => {
    try {
        const transactions = await Enrollment.find({ studentId: req.user._id })
            .populate('courseId')
            .sort({ enrolledAt: -1 });
        res.json(transactions);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

export default router;
