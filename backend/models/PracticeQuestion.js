import mongoose from 'mongoose';

const practiceQuestionSchema = new mongoose.Schema({
    question: { type: String, required: true },
    options: [{ type: String, required: true }],
    correctAnswer: { type: String, required: true }, // The text or index of the correct option
    category: { type: String, required: true },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], required: true },
    explanation: { type: String, default: '' },
    instructorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

practiceQuestionSchema.set('toJSON', {
    transform: (_doc, ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
    },
});

export default mongoose.model('PracticeQuestion', practiceQuestionSchema);
