import mongoose from 'mongoose';

const practiceAttemptSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    score: { type: Number, required: true },
    totalQuestions: { type: Number, required: true },
    correctCount: { type: Number, required: true },
    wrongCount: { type: Number, required: true },
    timeTaken: { type: Number, required: true }, // in seconds
    accuracy: { type: Number, required: true },
    quizType: { type: String, enum: ['daily', 'random'], default: 'random' },
    date: { type: Date, default: Date.now },
}, { timestamps: true });

practiceAttemptSchema.set('toJSON', {
    transform: (_doc, ret) => {
        ret.id = ret._id.toString();
        ret.userId = ret.userId?.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
    },
});

export default mongoose.model('PracticeAttempt', practiceAttemptSchema);
