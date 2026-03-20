import mongoose from 'mongoose';

const enrollmentSchema = new mongoose.Schema({
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    enrolledAt: { type: Date, default: Date.now },
    transactionId: { type: String, unique: true, sparse: true },
    paymentMethod: { type: String },
    amount: { type: Number },
    status: { type: String, default: 'completed' },
    rating: { type: Number },
}, { timestamps: true });

enrollmentSchema.index({ studentId: 1, courseId: 1 }, { unique: true });

enrollmentSchema.set('toJSON', {
    transform: (_doc, ret) => {
        ret.id = ret._id.toString();
        
        // Let mongoose/JSON.stringify handle ObjectIds and Populated objects naturally
        
        delete ret._id;
        delete ret.__v;
        return ret;
    },
});

export default mongoose.model('Enrollment', enrollmentSchema);
