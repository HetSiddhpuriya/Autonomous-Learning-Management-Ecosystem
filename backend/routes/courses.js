import express from 'express';
import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';
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

        await Enrollment.create({ studentId: req.user._id, courseId: course._id });
        await Course.findByIdAndUpdate(course._id, { $inc: { enrolledStudents: 1 } });

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

export default router;
