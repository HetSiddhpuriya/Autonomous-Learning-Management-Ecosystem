import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    instructorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    instructorName: { type: String, required: true },
    thumbnail: { type: String, default: '' },
    category: { type: String, required: true },
    skillTags: [{ type: String }],
    difficulty: { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'beginner' },
    duration: { type: Number, default: 0 }, // minutes
    lessonsCount: { type: Number, default: 0 },
    enrolledStudents: { type: Number, default: 0 },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    isPublished: { type: Boolean, default: false },
    price: { type: Number, default: 0 },
}, { timestamps: true });

courseSchema.set('toJSON', {
    transform: (_doc, ret) => {
        ret.id = ret._id.toString();
        ret.instructorId = ret.instructorId?.toString();
        ret.createdAt = ret.createdAt?.toISOString();
        delete ret._id;
        delete ret.__v;
        return ret;
    },
});

export default mongoose.model('Course', courseSchema);
