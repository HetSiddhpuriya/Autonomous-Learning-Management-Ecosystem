import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';

// Route imports
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import courseRoutes from './routes/courses.js';
import lessonRoutes from './routes/lessons.js';
import quizRoutes from './routes/quizzes.js';
import progressRoutes from './routes/progress.js';
import discussionRoutes from './routes/discussions.js';
import analyticsRoutes from './routes/analytics.js';
import moduleRoutes from './routes/modules.js';
import notificationRoutes from './routes/notifications.js';
import uploadRoutes from './routes/upload.js';
import practiceRoutes from './routes/practice.js';
import aiRoutes from './routes/ai.js';
import recommendationRoutes from './routes/recommendations.js';
import path from 'path';
import passport from './config/passport.js';
import { createServer } from 'http';
import { Server } from 'socket.io';
import setupDiscussionSockets from './sockets/discussionSocket.js';

const app = express();
const httpServer = createServer(app);

// Initialize Socket.io
const io = new Server(httpServer, {
    cors: {
        origin: ['http://localhost:5173', 'http://localhost:3000'],
        credentials: true,
    }
});

// Setup socket handlers and capture the exported functions (like getOnlineUsers)
const socketManager = setupDiscussionSockets(io);
app.set('socketManager', socketManager); // Make it available to routes

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/lms';

// ─── Middleware ─────────────────────────────────────────────────────────────
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
}));
app.use(express.json({ limit: '500mb' }));
app.use(express.urlencoded({ extended: true, limit: '500mb' }));

// Initialize Passport
app.use(passport.initialize());

// Serve uploads folder statically
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// ─── Health Check ───────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' });
});

// ─── Routes ─────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/lessons', lessonRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/discussions', discussionRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/modules', moduleRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/practice', practiceRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/recommendations', recommendationRoutes);

// ─── Global Error Handler ────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error('❌ Error:', err.message);
  res.status(err.status || 500).json({ message: err.message || 'Internal Server Error' });
});

// ─── MongoDB + Server Startup ────────────────────────────────────────────────
mongoose.connect(MONGO_URI)
  .then(() => {
    console.log(`✅ MongoDB connected: ${MONGO_URI}`);
    httpServer.listen(PORT, () => {
      console.log(`🚀 LMS API Server running on http://localhost:${PORT}`);
      console.log(`📋 Health check: http://localhost:${PORT}/api/health`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  });

