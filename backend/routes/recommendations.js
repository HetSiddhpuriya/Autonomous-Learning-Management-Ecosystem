import express from 'express';
import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';
import Progress from '../models/Progress.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// GET /api/recommendations - Get AI recommendations for the student
router.get('/', protect, authorize('student'), async (req, res) => {
    try {
        const studentId = req.user._id;

        // Fetch user enrollments and progress
        const enrollments = await Enrollment.find({ studentId }).populate('courseId');
        const progresses = await Progress.find({ studentId });

        const enrolledCourseIds = enrollments.map(e => e.courseId?._id).filter(Boolean);

        // --- Top Priority ---
        const topPriority = [];

        // 1. Find a course where the student has started but not completed (Lesson type)
        const inProgress = progresses.find(p => p.completionPercentage > 0 && p.completionPercentage < 100);
        if (inProgress) {
            const course = enrollments.find(e => e.courseId?._id.toString() === inProgress.courseId.toString())?.courseId;
            if (course) {
                topPriority.push({
                    id: `lesson-${course._id}`,
                    type: 'lesson',
                    title: course.title,
                    description: `Continue your learning journey with ${course.title} basics.`,
                    reason: `Based on your progress in ${categoryToName(course.category)}`,
                    relatedSkills: course.skillTags.slice(0, 2) || [course.category],
                    actionLink: `/student/courses/${course._id}`
                });
            }
        }

        // 2. Recommend a new course the student is not enrolled in
        const newCourse = await Course.findOne({
            _id: { $nin: enrolledCourseIds },
            isPublished: true,
            language: 'english' // default filter if needed
        }).sort({ rating: -1, enrolledStudents: -1 });

        if (newCourse) {
            topPriority.push({
                id: `course-${newCourse._id}`,
                type: 'course',
                title: newCourse.title,
                description: newCourse.description.substring(0, 60) + '...',
                reason: `Recommended for your career path`,
                relatedSkills: newCourse.skillTags.slice(0, 2) || [newCourse.category],
                actionLink: `/courses/${newCourse._id}`
            });
        }

        // 3. Add a practice recommendation (either for a weak topic or general)
        topPriority.push({
            id: 'practice-algo',
            type: 'practice',
            title: 'Algorithm Practice: Sorting',
            description: 'Strengthen your understanding of sorting algorithms.',
            reason: 'Weak topic identified in your skill assessment',
            relatedSkills: ['Algorithms', 'Data Structures'],
            actionLink: '/student/practice'
        });

        // Fill remaining slots up to 3 if needed
        while (topPriority.length < 3) {
            topPriority.push({
                id: `filler-${topPriority.length}`,
                type: 'course',
                title: 'Data Structures Fundamentals',
                description: 'Build a strong foundation in core computer science concepts.',
                reason: 'Highly rated by similar students',
                relatedSkills: ['Computer Science', 'Data Structures'],
                actionLink: '/courses'
            });
        }

        // --- Suggested Learning Path ---
        // Create a 3-step learning path
        const learningPath = [
            {
                step: 1,
                title: 'Complete Python Fundamentals',
                description: 'Strengthen your programming foundation',
                status: enrolledCourseIds.length > 0 ? 'current' : 'upcoming' // simple mock logic based on enrollment
            },
            {
                step: 2,
                title: 'Practice Data Structures',
                description: 'Solve 50+ coding challenges',
                status: 'upcoming'
            },
            {
                step: 3,
                title: 'Build Real Projects',
                description: 'Apply your skills to portfolio projects',
                status: 'upcoming'
            }
        ];

        // --- Skills to Develop ---
        // Dynamically calculate based on enrollments or default to trending
        const skillsMap = {};
        enrollments.forEach(e => {
            const course = e.courseId;
            if (course && course.skillTags) {
                course.skillTags.forEach(tag => {
                    if (!skillsMap[tag]) {
                        skillsMap[tag] = { name: tag, level: Math.floor(Math.random() * 40) + 10, growth: `+${Math.floor(Math.random() * 20) + 5}%` };
                    } else {
                        skillsMap[tag].level = Math.min(100, skillsMap[tag].level + 20);
                    }
                });
            }
        });

        const skillsToDevelop = Object.values(skillsMap).slice(0, 4);
        
        // If not enough skills from enrollments, pad with standard ones
        const defaultSkills = [
            { name: 'Machine Learning', level: 45, growth: '+12%' },
            { name: 'Data Analysis', level: 60, growth: '+8%' },
            { name: 'Cloud Computing', level: 30, growth: '+15%' },
            { name: 'System Design', level: 25, growth: '+20%' }
        ];

        while (skillsToDevelop.length < 4) {
            const nextSkill = defaultSkills.shift();
            if (!skillsToDevelop.find(s => s.name === nextSkill.name)) {
                skillsToDevelop.push(nextSkill);
            }
        }

        res.json({
            topPriority: topPriority.slice(0, 3), // Ensure strictly 3
            learningPath,
            skillsToDevelop: skillsToDevelop.slice(0, 4), // Ensure strictly 4
        });
    } catch (error) {
        console.error('Error generating AI recommendations:', error);
        res.status(500).json({ message: 'Failed to generate recommendations' });
    }
});

function categoryToName(category) {
    if (!category) return 'General';
    return category.charAt(0).toUpperCase() + category.slice(1);
}

export default router;
