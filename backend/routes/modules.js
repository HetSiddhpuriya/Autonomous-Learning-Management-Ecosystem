import express from 'express';
import Module from '../models/Module.js';
import Lesson from '../models/Lesson.js';
import Course from '../models/Course.js';

const router = express.Router();

// Get modules by courseId
router.get('/', async (req, res) => {
    try {
        const { courseId } = req.query;
        if (!courseId) {
            return res.status(400).json({ message: 'courseId is required' });
        }

        const modules = await Module.find({ courseId }).sort({ createdAt: 1 });
        res.json(modules);
    } catch (err) {
        console.error('Fetch modules error:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Create a new module
router.post('/', async (req, res) => {
    try {
        const { name, courseId } = req.body;

        if (!name || !courseId) {
            return res.status(400).json({ message: 'Missing name or courseId' });
        }

        const newModule = new Module({ name, courseId });
        await newModule.save();

        res.status(201).json(newModule);
    } catch (err) {
        console.error('Create module error:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Delete a module and all its lessons
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const deletedModule = await Module.findByIdAndDelete(id);

        if (!deletedModule) {
            return res.status(404).json({ message: 'Module not found' });
        }

        // First, find how many lessons are associated with this module
        const lessonsToDelete = await Lesson.find({
            module: deletedModule.name,
            courseId: deletedModule.courseId
        });

        if (lessonsToDelete.length > 0) {
            // Decrement the lessonsCount for the associated course
            await Course.findByIdAndUpdate(deletedModule.courseId, { 
                $inc: { lessonsCount: -lessonsToDelete.length } 
            });

            // Delete all lessons associated with this module's name
            await Lesson.deleteMany({ 
                module: deletedModule.name,
                courseId: deletedModule.courseId 
            });
        }

        res.json({ message: 'Module and associated lessons deleted successfully' });
    } catch (err) {
        console.error('Delete module error:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

export default router;
