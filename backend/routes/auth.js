import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import passport from '../config/passport.js';

const router = express.Router();

const generateToken = (id) =>
    jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

// POST /api/auth/register
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, role = 'student', phone, gender } = req.body;

        if (!name || !email || !password)
            return res.status(400).json({ message: 'Name, email, and password are required' });

        const existing = await User.findOne({ email });
        if (existing)
            return res.status(400).json({ message: 'Email already in use' });

        const status = role === 'instructor' ? 'pending' : 'approved';
        const user = await User.create({ name, email, password, role, phone, gender, status });
        const token = generateToken(user._id);

        let adminTitle = 'New user signed up';
        let adminMsg = `A new ${role} (${name}) has registered.`;
        let alertType = 'info';

        if (role === 'instructor') {
            adminTitle = 'Instructor pending approval';
            adminMsg = `${name} has applied to become an Instructor. Please review their application.`;
            alertType = 'warning';
        }

        await Notification.create({
            recipientRole: 'admin',
            title: adminTitle,
            message: adminMsg,
            type: alertType,
            link: '/admin/users'
        });

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

        if (role && user.role !== role && user.role !== 'admin')
            return res.status(401).json({ message: `No ${role} account found with this email` });

        if (user.role === 'instructor' && user.status === 'rejected')
            return res.status(403).json({ message: 'Your instructor application has been rejected by the admin.' });

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

// ─── Google OAuth ────────────────────────────────────────────────────────────

// GET /api/auth/google — Initiate Google OAuth
router.get('/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
);

// GET /api/auth/google/callback — Google OAuth callback
router.get('/google/callback',
    passport.authenticate('google', { session: false, failureRedirect: `${process.env.CLIENT_URL || 'http://localhost:5173'}/login?error=google_auth_failed` }),
    (req, res) => {
        // Generate JWT for the authenticated user
        const token = generateToken(req.user._id);
        const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
        // Redirect to frontend with token
        res.redirect(`${clientUrl}/auth/google/callback?token=${token}`);
    }
);

export default router;
