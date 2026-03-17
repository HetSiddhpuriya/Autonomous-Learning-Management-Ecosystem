import mongoose from 'mongoose';

const discussionSchema = new mongoose.Schema({
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    userName: { type: String, required: true },
    userAvatar: { type: String, default: '' },
    message: { type: String }, // optional because they might just send an attachment
    attachmentUrl: { type: String, default: null },
    attachmentName: { type: String, default: null },
    parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Discussion', default: null },
}, { timestamps: true });

discussionSchema.set('toJSON', {
    transform: (_doc, ret) => {
        ret.id = ret._id.toString();
        ret.courseId = ret.courseId?.toString();
        ret.userId = ret.userId?.toString();
        ret.timestamp = ret.createdAt?.toISOString();
        ret.parentId = ret.parentId?.toString() || null;
        if (!ret.message) ret.message = ''; // Fallback for UI 
        delete ret._id;
        delete ret.__v;
        delete ret.createdAt;
        delete ret.updatedAt;
        return ret;
    },
});

export default mongoose.model('Discussion', discussionSchema);
