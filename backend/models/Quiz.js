import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
    type: { type: String, enum: ['multiple_choice', 'true_false', 'fill_blank'], default: 'multiple_choice' },
    question: { type: String, required: true },
    options: [{ type: String }],
    correctAnswer: { type: Number, required: true },
    explanation: { type: String, default: '' },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'easy' },
    skillMapped: { type: String, default: '' },
}, { _id: true });

const quizSchema = new mongoose.Schema({
    lessonId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lesson', required: true },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    title: { type: String, required: true },
    timeLimit: { type: Number, default: 15 }, // minutes
    passingScore: { type: Number, default: 70 },
    questions: [questionSchema],
}, { timestamps: true });

quizSchema.set('toJSON', {
    transform: (_doc, ret) => {
        ret.id = ret._id.toString();
        ret.lessonId = ret.lessonId?.toString();
        ret.courseId = ret.courseId?.toString();
        ret.questions = (ret.questions || []).map(q => ({ ...q, id: q._id?.toString() }));
        delete ret._id;
        delete ret.__v;
        return ret;
    },
});

export default mongoose.model('Quiz', quizSchema);
