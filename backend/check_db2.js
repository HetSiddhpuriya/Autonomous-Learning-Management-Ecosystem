import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const run = async () => {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/lms');
    const courses = await mongoose.model('Course', new mongoose.Schema({}, { strict: false }), 'courses').find({});
    console.log(JSON.stringify(courses.map(c => ({ id: c._id, title: c.title })), null, 2));
    
    const lessons = await mongoose.model('Lesson', new mongoose.Schema({}, { strict: false }), 'lessons').find({});
    
    // We want one lessonId per module
    const moduleLessons = {};
    lessons.forEach(l => {
        if (!moduleLessons[l.module]) {
            moduleLessons[l.module] = l._id;
        }
    });
    console.log("Module Lessons:", JSON.stringify(moduleLessons, null, 2));

    process.exit(0);
};
run();
