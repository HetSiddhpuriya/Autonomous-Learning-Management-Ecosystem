import express from 'express';
import Module from '../models/Module.js';

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

export default router;
