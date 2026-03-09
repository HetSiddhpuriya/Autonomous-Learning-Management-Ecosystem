import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const run = async () => {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/lms');
    const courses = await mongoose.model('Course', new mongoose.Schema({}, { strict: false }), 'courses').find({});
    console.log(courses.map(c => ({ id: c._id, title: c.title })));
    
    const lessons = await mongoose.model('Lesson', new mongoose.Schema({}, { strict: false }), 'lessons').find({});
    const modules = new Set(lessons.map(l => l.module));
    console.log("Modules:", Array.from(modules));
    
    process.exit(0);
};
run();
