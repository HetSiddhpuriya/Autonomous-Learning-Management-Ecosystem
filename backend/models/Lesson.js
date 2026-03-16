import mongoose from 'mongoose';

const resourceSchema = new mongoose.Schema({
    name: String,
    type: { type: String, enum: ['pdf', 'video', 'link', 'code'] },
    url: String,
}, { _id: true });

const lessonSchema = new mongoose.Schema({
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    title: { type: String, required: true },
    description: { type: String, default: '' },
    module: { type: String, default: '' },
    videoUrl: { type: String, default: '' },
    duration: { type: Number, default: 0 }, // minutes
    order: { type: Number, required: true },
    resources: [resourceSchema],
}, { timestamps: true });

lessonSchema.set('toJSON', {
    transform: (_doc, ret) => {
        ret.id = ret._id.toString();
        ret.courseId = ret.courseId?.toString();
        ret.resources = (ret.resources || []).map(r => ({ ...r, id: r._id?.toString() }));
        delete ret._id;
        delete ret.__v;
        return ret;
    },
});

export default mongoose.model('Lesson', lessonSchema);
