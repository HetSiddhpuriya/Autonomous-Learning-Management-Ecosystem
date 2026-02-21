/**
 * Seed script - populates MongoDB with the initial mock data
 * Run: node seed.js
 */
import 'dotenv/config';
import mongoose from 'mongoose';
import User from './models/User.js';
import Course from './models/Course.js';
import Lesson from './models/Lesson.js';
import Quiz from './models/Quiz.js';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/lms';

const seedUsers = [
    { email: 'student@learnflux.com', password: 'password123', name: 'Alex Johnson', role: 'student', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex', isActive: true },
    { email: 'instructor@learnflux.com', password: 'password123', name: 'Dr. Sarah Chen', role: 'instructor', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah', isActive: true },
    { email: 'admin@learnflux.com', password: 'password123', name: 'Michael Roberts', role: 'admin', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Michael', isActive: true },
    { email: 'emma@learnflux.com', password: 'password123', name: 'Emma Williams', role: 'student', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma', isActive: true },
    { email: 'david@learnflux.com', password: 'password123', name: 'David Park', role: 'instructor', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David', isActive: true },
];

async function seed() {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected');

    // Clear existing data
    await Promise.all([
        User.deleteMany({}),
        Course.deleteMany({}),
        Lesson.deleteMany({}),
        Quiz.deleteMany({}),
    ]);
    console.log('🗑️  Cleared existing data');

    // Create users
    const users = await User.insertMany(seedUsers);
    const instructorSarah = users.find(u => u.email === 'instructor@learnflux.com');
    const instructorDavid = users.find(u => u.email === 'david@learnflux.com');
    console.log(`👥 Created ${users.length} users`);

    // Create courses
    const courseData = [
        {
            title: 'Advanced Machine Learning',
            description: 'Master machine learning algorithms, neural networks, and deep learning techniques with hands-on projects.',
            instructorId: instructorSarah._id,
            instructorName: 'Dr. Sarah Chen',
            thumbnail: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=800&q=80',
            category: 'Data Science',
            skillTags: ['Python', 'TensorFlow', 'Neural Networks', 'Deep Learning'],
            difficulty: 'advanced',
            duration: 1800,
            enrolledStudents: 1250,
            rating: 4.8,
            isPublished: true,
            price: 89.99,
        },
        {
            title: 'Web Development Bootcamp',
            description: 'Complete guide to modern web development with React, Node.js, and cloud deployment.',
            instructorId: instructorDavid._id,
            instructorName: 'David Park',
            thumbnail: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&q=80',
            category: 'Web Development',
            skillTags: ['React', 'Node.js', 'TypeScript', 'AWS'],
            difficulty: 'intermediate',
            duration: 2400,
            enrolledStudents: 2100,
            rating: 4.9,
            isPublished: true,
            price: 79.99,
        },
        {
            title: 'Data Structures & Algorithms',
            description: 'Comprehensive course on fundamental data structures and algorithms for coding interviews.',
            instructorId: instructorSarah._id,
            instructorName: 'Dr. Sarah Chen',
            thumbnail: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=800&q=80',
            category: 'Computer Science',
            skillTags: ['Algorithms', 'Data Structures', 'Problem Solving', 'Python'],
            difficulty: 'intermediate',
            duration: 1500,
            enrolledStudents: 3200,
            rating: 4.7,
            isPublished: true,
            price: 69.99,
        },
        {
            title: 'UI/UX Design Fundamentals',
            description: 'Learn the principles of user interface and user experience design with practical projects.',
            instructorId: instructorDavid._id,
            instructorName: 'David Park',
            thumbnail: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&q=80',
            category: 'Design',
            skillTags: ['Figma', 'User Research', 'Prototyping', 'Design Systems'],
            difficulty: 'beginner',
            duration: 1200,
            enrolledStudents: 1500,
            rating: 4.6,
            isPublished: true,
            price: 59.99,
        },
        {
            title: 'Cloud Computing with AWS',
            description: 'Master AWS services, serverless architecture, and cloud infrastructure management.',
            instructorId: instructorSarah._id,
            instructorName: 'Dr. Sarah Chen',
            thumbnail: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80',
            category: 'Cloud Computing',
            skillTags: ['AWS', 'Serverless', 'Docker', 'Kubernetes'],
            difficulty: 'advanced',
            duration: 1600,
            enrolledStudents: 980,
            rating: 4.8,
            isPublished: true,
            price: 99.99,
        },
        {
            title: 'Mobile App Development',
            description: 'Build cross-platform mobile applications using React Native and modern mobile frameworks.',
            instructorId: instructorDavid._id,
            instructorName: 'David Park',
            thumbnail: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&q=80',
            category: 'Mobile Development',
            skillTags: ['React Native', 'iOS', 'Android', 'Mobile UI'],
            difficulty: 'intermediate',
            duration: 1400,
            enrolledStudents: 1100,
            rating: 4.5,
            isPublished: false,
            price: 74.99,
        },
    ];

    const courses = await Course.insertMany(courseData);
    const mlCourse = courses[0];
    const webCourse = courses[1];
    console.log(`📚 Created ${courses.length} courses`);

    // Create lessons for ML course
    const mlLessons = await Lesson.insertMany([
        { courseId: mlCourse._id, title: 'Introduction to Machine Learning', description: 'Overview of machine learning concepts.', duration: 45, order: 1, resources: [{ name: 'ML Cheatsheet', type: 'pdf', url: '#' }] },
        { courseId: mlCourse._id, title: 'Supervised Learning Basics', description: 'Classification and regression algorithms.', duration: 60, order: 2, resources: [] },
        { courseId: mlCourse._id, title: 'Neural Networks Fundamentals', description: 'Building your first neural network.', duration: 75, order: 3, resources: [] },
        { courseId: mlCourse._id, title: 'Deep Learning with TensorFlow', description: 'Implementing deep learning models.', duration: 90, order: 4, resources: [] },
    ]);

    const webLessons = await Lesson.insertMany([
        { courseId: webCourse._id, title: 'React Fundamentals', description: 'Building modern UIs with React hooks.', duration: 55, order: 1, resources: [] },
        { courseId: webCourse._id, title: 'State Management with Redux', description: 'Managing complex application state.', duration: 65, order: 2, resources: [] },
    ]);

    // Update course lesson counts
    await Course.findByIdAndUpdate(mlCourse._id, { lessonsCount: mlLessons.length });
    await Course.findByIdAndUpdate(webCourse._id, { lessonsCount: webLessons.length });
    console.log(`📖 Created ${mlLessons.length + webLessons.length} lessons`);

    // Create quiz for first ML lesson
    await Quiz.create({
        lessonId: mlLessons[0]._id,
        courseId: mlCourse._id,
        title: 'ML Basics Quiz',
        timeLimit: 15,
        passingScore: 70,
        questions: [
            { type: 'multiple_choice', question: 'Which is a type of supervised learning?', options: ['Clustering', 'Classification', 'Dimensionality Reduction', 'Association'], correctAnswer: 1, explanation: 'Classification is supervised learning.', difficulty: 'easy', skillMapped: 'Machine Learning Fundamentals' },
            { type: 'multiple_choice', question: 'What is the primary goal of regression?', options: ['Predict continuous values', 'Group similar data', 'Reduce dimensions', 'Find associations'], correctAnswer: 0, explanation: 'Regression predicts continuous values.', difficulty: 'easy', skillMapped: 'Machine Learning Fundamentals' },
            { type: 'multiple_choice', question: 'Which algorithm is commonly used for classification?', options: ['K-Means', 'Linear Regression', 'Logistic Regression', 'PCA'], correctAnswer: 2, explanation: 'Logistic Regression is a classification algorithm.', difficulty: 'medium', skillMapped: 'Classification Algorithms' },
        ],
    });
    console.log('❓ Created quiz');

    console.log('\n✅ Database seeded successfully!\n');
    console.log('📋 Demo Login Credentials:');
    console.log('  Student:    student@learnflux.com    / password123');
    console.log('  Instructor: instructor@learnflux.com / password123');
    console.log('  Admin:      admin@learnflux.com      / password123');

    await mongoose.disconnect();
    process.exit(0);
}

seed().catch(err => {
    console.error('❌ Seed failed:', err);
    process.exit(1);
});
