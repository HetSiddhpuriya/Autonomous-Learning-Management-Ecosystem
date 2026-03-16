import fs from 'fs';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/lms');
        const courses = await mongoose.model('Course', new mongoose.Schema({}, { strict: false }), 'courses').find({});
        
        const lessons = await mongoose.model('Lesson', new mongoose.Schema({}, { strict: false }), 'lessons').find({});
        
        // We want one lessonId per module
        const moduleLessons = {};
        lessons.forEach(l => {
            if (!moduleLessons[l.module]) {
                moduleLessons[l.module] = l._id.toString();
            }
        });
        
        const data = {
            courses: courses.map(c => ({ id: c._id.toString(), title: c.title })),
            moduleLessons
        };
        
        fs.writeFileSync('db_info.json', JSON.stringify(data, null, 2));
        console.log("Success");
    } catch (e) {
        console.error(e);
    }
    process.exit(0);
};
run();
