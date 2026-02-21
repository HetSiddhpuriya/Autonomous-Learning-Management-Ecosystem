import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = express.Router();

const generateToken = (id) =>
    jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

// POST /api/auth/register
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, role = 'student' } = req.body;

        if (!name || !email || !password)
            return res.status(400).json({ message: 'Name, email, and password are required' });

        const existing = await User.findOne({ email });
        if (existing)
            return res.status(400).json({ message: 'Email already in use' });

        const user = await User.create({ name, email, password, role });
        const token = generateToken(user._id);

        res.status(201).json({ token, user });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        const { email, password, role } = req.body;

        if (!email || !password)
            return res.status(400).json({ message: 'Email and password are required' });

        const user = await User.findOne({ email });
        if (!user)
            return res.status(401).json({ message: 'Invalid email or password' });

        const isMatch = await user.comparePassword(password);
        if (!isMatch)
            return res.status(401).json({ message: 'Invalid email or password' });

        if (role && user.role !== role)
            return res.status(401).json({ message: `No ${role} account found with this email` });

        // Update lastActive
        user.lastActive = new Date();
        await user.save({ validateBeforeSave: false });

        const token = generateToken(user._id);
        res.json({ token, user });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET /api/auth/me
import { protect } from '../middleware/auth.js';

router.get('/me', protect, (req, res) => {
    res.json({ user: req.user });
});

export default router;
