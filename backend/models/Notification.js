import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // If null, means it's for all admins
    recipientRole: { type: String, enum: ['admin', 'instructor', 'student', 'all'], default: 'all' },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: { type: String, enum: ['info', 'success', 'warning', 'error'], default: 'info' },
    isRead: { type: Boolean, default: false },
    link: { type: String }, // Optional link to redirect when clicked
}, { timestamps: true });

notificationSchema.set('toJSON', {
    transform: (_doc, ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
    },
});

export default mongoose.model('Notification', notificationSchema);
