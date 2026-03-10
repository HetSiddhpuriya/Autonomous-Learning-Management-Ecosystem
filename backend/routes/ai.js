import express from 'express';
import jwt from 'jsonwebtoken';
import { generateResponse } from '../services/aiAssistant.js';

const router = express.Router();

// Optional auth — extracts userId if token present, but doesn't block guests
function optionalAuth(req, _res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.userId = decoded.id;
    }
  } catch {
    // Token invalid or missing — that's fine, continue as guest
  }
  next();
}

// POST /api/ai/chat
router.post('/chat', optionalAuth, async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ message: 'Message is required' });
    }

    const userId = req.userId || req.body.userId || null;
    const reply = await generateResponse(message.trim(), userId);

    res.json({ reply });
  } catch (err) {
    console.error('AI chat error:', err);
    res.status(500).json({ message: 'Failed to process your message' });
  }
});

export default router;
