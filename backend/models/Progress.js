import mongoose from 'mongoose';

const progressSchema = new mongoose.Schema({
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    completedLessons: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Lesson' }],
    passedQuizzes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Quiz' }],
    quizAttempts: [{
        quizId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz' },
        score: Number,
        answers: [Number],
        submittedAt: { type: Date, default: Date.now }
    }],
    totalLessons: { type: Number, default: 0 },
    completionPercentage: { type: Number, default: 0 },
    lastAccessed: { type: Date, default: Date.now },
    timeSpent: { type: Number, default: 0 }, // minutes
}, { timestamps: true });

// Ensure one progress doc per student per course
progressSchema.index({ courseId: 1, studentId: 1 }, { unique: true });

progressSchema.set('toJSON', {
    transform: (_doc, ret) => {
        ret.courseId = ret.courseId?.toString();
        ret.studentId = ret.studentId?.toString();
        ret.completedLessons = (ret.completedLessons || []).map(id => id?.toString());
        ret.passedQuizzes = (ret.passedQuizzes || []).map(id => id?.toString());
        ret.quizAttempts = (ret.quizAttempts || []).map(a => ({
            ...a.toObject?.() || a,
            quizId: a.quizId?.toString()
        }));
        ret.lastAccessed = ret.lastAccessed?.toISOString();
        delete ret._id;
        delete ret.__v;
        return ret;
    },
});

export default mongoose.model('Progress', progressSchema);
