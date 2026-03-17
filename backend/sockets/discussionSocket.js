import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';
import Discussion from '../models/Discussion.js';

const onlineUsers = new Map(); // Map socket.id -> { userId, courseId }
const activeUsers = new Set(); // Set of userIds currently online

export default (io) => {
    // Middleware for JWT authentication
    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth.token;
            if (!token) return next(new Error('Authentication error: No token provided'));

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findById(decoded.id).select('-password');
            if (!user) return next(new Error('Authentication error: User not found'));

            socket.user = user;
            next();
        } catch (err) {
            next(new Error('Authentication error: Invalid token'));
        }
    });

    io.on('connection', (socket) => {
        // Mark user as online globally
        activeUsers.add(socket.user._id.toString());
        io.emit('user_online', socket.user._id.toString());

        socket.on('join_course', async (courseId, callback) => {
            try {
                // Access Control
                const course = await Course.findById(courseId);
                if (!course) {
                    if (callback) callback({ error: 'Course not found' });
                    return;
                }

                let isAuthorized = false;
                if (socket.user.role === 'admin' || course.instructorId.toString() === socket.user._id.toString()) {
                    isAuthorized = true;
                } else if (socket.user.role === 'student') {
                    const enrollment = await Enrollment.findOne({ studentId: socket.user._id, courseId });
                    if (enrollment) isAuthorized = true;
                }

                if (!isAuthorized) {
                    if (callback) callback({ error: 'Not authorized to join this course discussion' });
                    return;
                }

                // Leave previous course if any
                const prevSession = onlineUsers.get(socket.id);
                if (prevSession && prevSession.courseId) {
                    socket.leave(prevSession.courseId);
                }

                socket.join(courseId);
                onlineUsers.set(socket.id, { userId: socket.user._id.toString(), courseId });

                if (callback) callback({ success: true });
            } catch (err) {
                console.error("Socket join_course error:", err);
                if (callback) callback({ error: 'Internal server error' });
            }
        });

        socket.on('send_message', async (data, callback) => {
            try {
                const { courseId, message, parentId } = data;

                // Validate access again (just in case)
                const session = onlineUsers.get(socket.id);
                if (!session || session.courseId !== courseId) {
                    if (callback) callback({ error: 'You are not in this course room' });
                    return;
                }

                // Save to Database
                const discussion = await Discussion.create({
                    courseId,
                    userId: socket.user._id,
                    userName: socket.user.name,
                    userAvatar: socket.user.avatar,
                    message,
                    parentId: parentId || null
                });

                // Broadcast to room
                io.to(courseId).emit('receive_message', discussion);

                if (callback) callback({ success: true, message: discussion });
            } catch (err) {
                console.error("Socket send_message error:", err);
                if (callback) callback({ error: 'Failed to send message' });
            }
        });

        socket.on('typing', (courseId) => {
            socket.to(courseId).emit('user_typing', { userId: socket.user._id.toString(), userName: socket.user.name });
        });

        socket.on('stop_typing', (courseId) => {
            socket.to(courseId).emit('user_stop_typing', { userId: socket.user._id.toString() });
        });

        socket.on('disconnect', () => {
            const session = onlineUsers.get(socket.id);
            if (session) {
                onlineUsers.delete(socket.id);
            }
            
            // Re-evaluate if user is completely offline (they might have multiple tabs open)
            let isCompletelyOffline = true;
            for (const [id, userSession] of onlineUsers.entries()) {
                if (userSession.userId === socket.user._id.toString()) {
                    isCompletelyOffline = false;
                    break;
                }
            }

            if (isCompletelyOffline) {
                activeUsers.delete(socket.user._id.toString());
                io.emit('user_offline', socket.user._id.toString());
            }
        });
    });

    return {
        getOnlineUsers: () => Array.from(activeUsers)
    };
};
