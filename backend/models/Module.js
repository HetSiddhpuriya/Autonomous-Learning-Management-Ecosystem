import mongoose from 'mongoose';

const moduleSchema = new mongoose.Schema({
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    name: { type: String, required: true, trim: true },
}, { timestamps: true });

moduleSchema.set('toJSON', {
    transform: (_doc, ret) => {
        ret.id = ret._id.toString();
        ret.courseId = ret.courseId?.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
    },
});

export default mongoose.model('Module', moduleSchema);
