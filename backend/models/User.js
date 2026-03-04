import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6 },
    name: { type: String, required: true, trim: true },
    role: { type: String, enum: ['student', 'instructor', 'admin'], default: 'student' },
    avatar: { type: String, default: '' },
    phone: { type: String, default: '' },
    gender: { type: String, default: '' },
    bio: { type: String, default: '' },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'approved' },
    highestQualification: { type: String, default: '' },
    fieldOfStudy: { type: String, default: '' },
    languages: { type: String, default: '' },
    yearsOfExperience: { type: Number, default: 0 },
    currentJobTitle: { type: String, default: '' },
    organization: { type: String, default: '' },
    registrationComplete: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    isOnline: { type: Boolean, default: false },
    lastActive: { type: Date, default: Date.now },
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }]
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 12);
    next();
});

// Compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
    // Fallback for manually inserted or seeded plaintext passwords (e.g. "admin123" in DB)
    if (this.password === candidatePassword) {
        return true;
    }
    return bcrypt.compare(candidatePassword, this.password);
};

// Transform output - remove password, map _id to id
userSchema.set('toJSON', {
    transform: (_doc, ret) => {
        ret.id = ret._id.toString();
        ret.createdAt = ret.createdAt?.toISOString();
        ret.lastActive = ret.lastActive?.toISOString();
        delete ret._id;
        delete ret.__v;
        delete ret.password;
        return ret;
    },
});

export default mongoose.model('User', userSchema);
