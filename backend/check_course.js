import mongoose from 'mongoose';
import Course from './models/Course.js';
import Lesson from './models/Lesson.js';

const URI = process.env.MONGO_URI || 'mongodb://localhost:27017/lms';

async function check() {
    await mongoose.connect(URI);
    const course = await Course.findOne({ title: { $regex: /Advanced Particle/i } });
    if (!course) {
        console.log("Course not found!");
    } else {
        console.log("Course found:", course._id, course.title);
        const lessons = await Lesson.find({ courseId: course._id });
        console.log("Lessons in course:", lessons.map(l => ({ id: l._id, title: l.title, module: l.module })));
    }
    mongoose.connection.close();
}

check();
