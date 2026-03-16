import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';
import Progress from '../models/Progress.js';
import Quiz from '../models/Quiz.js';

// ─── Intent Detection ────────────────────────────────────────────────────────
function detectIntent(message) {
  const msg = message.toLowerCase().trim();

  // Greeting
  if (/^(hi|hello|hey|howdy|greetings|good\s*(morning|afternoon|evening))/i.test(msg)) {
    return 'greeting';
  }

  // My enrolled courses / my courses
  if (/(my\s+(enrolled\s+)?courses|courses\s+i.*(enrolled|taking|joined|purchased))/.test(msg)) {
    return 'my_courses';
  }

  // My progress
  if (/(my\s+progress|how\s+am\s+i\s+doing|completion|how\s+much.*completed)/.test(msg)) {
    return 'my_progress';
  }

  // Recommend courses
  if (/(recommend|suggest|best\s+(course|courses)|what\s+should\s+i\s+(learn|take|study)|popular|trending)/.test(msg)) {
    return 'recommend_courses';
  }

  // Search courses by keyword
  if (/(search|find|look\s*for|show\s*me).*course/.test(msg) || /course.*(about|on|for|related)/.test(msg)) {
    return 'search_courses';
  }

  // List / available courses
  if (/(what|which|list|show|available|all)\s*(courses?|classes?)/.test(msg) || /courses?\s*(available|offered|listed)/.test(msg)) {
    return 'list_courses';
  }

  // Navigation help
  if (/(where|how\s+to|navigate|find|go\s+to|access).*(dashboard|settings|quiz|practice|arena|lesson|certificate|wishlist|discussion|enroll|course|profile)/.test(msg)) {
    return 'navigation_help';
  }

  // Quiz help
  if (/(quiz|exam|test|assessment)/.test(msg)) {
    return 'quiz_help';
  }

  // Enroll help
  if (/(enroll|enrol|join|register|sign\s*up|purchase|buy).*course/.test(msg) || /how\s+to\s+(enroll|enrol|join)/.test(msg)) {
    return 'enroll_help';
  }

  // Help / general
  if (/(help|what\s+can\s+you\s+do|features|capability|support)/.test(msg)) {
    return 'help';
  }

  return 'general';
}

// ─── Navigation Map ──────────────────────────────────────────────────────────
const navigationMap = {
  dashboard: { path: '/student', description: 'Your main dashboard with overview of courses and progress' },
  settings: { path: '/student/settings', description: 'Update your profile, password, and preferences' },
  'my courses': { path: '/student/courses', description: 'View all your enrolled courses' },
  quiz: { path: 'Access quizzes through your course lessons', description: 'Quizzes are available inside each course lesson' },
  practice: { path: '/student/practice', description: 'Practice Arena — solve coding and quiz challenges' },
  arena: { path: '/student/practice', description: 'Practice Arena for extra practice' },
  certificate: { path: '/student/certificates', description: 'View and download your earned certificates' },
  wishlist: { path: '/student/wishlist', description: 'Courses you have saved for later' },
  discussion: { path: '/student/discussions', description: 'Community discussions and Q&A' },
  progress: { path: '/student/progress', description: 'Track your learning progress across courses' },
  recommendations: { path: '/student/recommendations', description: 'AI-recommended courses based on your interests' },
  courses: { path: '/courses', description: 'Browse all available courses on the platform' },
  enroll: { path: '/courses', description: 'Browse courses and click "Enroll" on the course details page' },
  profile: { path: '/student/settings', description: 'Manage your profile from the Settings page' },
  lesson: { path: 'Lessons are inside courses', description: 'Open a course, then select a lesson from the sidebar' },
};

// ─── Response Generators ─────────────────────────────────────────────────────

async function handleGreeting() {
  const greetings = [
    "Hello! 👋 I'm your AI Learning Assistant. How can I help you today?",
    "Hi there! 😊 Ready to help you with courses, navigation, or anything else on the platform!",
    "Hey! 🎓 I'm here to assist you. Ask me about courses, your progress, or how to use the platform.",
  ];
  return greetings[Math.floor(Math.random() * greetings.length)];
}

async function handleListCourses() {
  const courses = await Course.find({ isPublished: true })
    .sort({ enrolledStudents: -1 })
    .limit(10)
    .lean();

  if (!courses.length) {
    return "There are no published courses available at the moment. Check back soon! 📚";
  }

  let reply = `📚 **Here are the available courses:**\n\n`;
  courses.forEach((c, i) => {
    const difficulty = c.difficulty ? ` • ${c.difficulty}` : '';
    const enrolled = c.enrolledStudents ? ` • ${c.enrolledStudents} students` : '';
    reply += `${i + 1}. **${c.title}**${difficulty}${enrolled}\n`;
    if (c.description) {
      const desc = c.description.length > 80 ? c.description.slice(0, 80) + '…' : c.description;
      reply += `   _${desc}_\n`;
    }
  });
  reply += `\nBrowse all courses at **/courses** for more details!`;
  return reply;
}

async function handleSearchCourses(message) {
  // Extract search keywords (remove common filler words)
  const fillers = /\b(search|find|show|me|look|for|courses?|about|on|related|to|the|a|an|in|with|some)\b/gi;
  const keyword = message.replace(fillers, '').trim();

  if (!keyword) return handleListCourses();

  const courses = await Course.find({
    isPublished: true,
    $or: [
      { title: { $regex: keyword, $options: 'i' } },
      { description: { $regex: keyword, $options: 'i' } },
      { category: { $regex: keyword, $options: 'i' } },
      { skillTags: { $regex: keyword, $options: 'i' } },
    ],
  }).limit(8).lean();

  if (!courses.length) {
    return `🔍 I couldn't find courses matching **"${keyword}"**. Try browsing all courses at **/courses** or ask me for recommendations!`;
  }

  let reply = `🔍 **Courses matching "${keyword}":**\n\n`;
  courses.forEach((c, i) => {
    reply += `${i + 1}. **${c.title}** — ${c.category || 'General'}${c.difficulty ? ' • ' + c.difficulty : ''}\n`;
  });
  return reply;
}

async function handleRecommendCourses() {
  // Recommend top-rated / most enrolled published courses
  const courses = await Course.find({ isPublished: true })
    .sort({ enrolledStudents: -1, rating: -1 })
    .limit(5)
    .lean();

  if (!courses.length) {
    return "I don't have enough data to make recommendations right now. More courses are being added soon! 🚀";
  }

  let reply = `🌟 **Recommended courses for you:**\n\n`;
  courses.forEach((c, i) => {
    const rating = c.rating ? ` ⭐ ${c.rating}` : '';
    reply += `${i + 1}. **${c.title}**${rating} — ${c.category || 'General'}\n`;
  });
  reply += `\nVisit **/courses** to enroll in any of these!`;
  return reply;
}

async function handleMyCourses(userId) {
  if (!userId) {
    return "🔒 Please **log in** to see your enrolled courses. You can sign in from the login page!";
  }

  const enrollments = await Enrollment.find({ studentId: userId }).populate('courseId').lean();

  if (!enrollments.length) {
    return "You haven't enrolled in any courses yet! 📖 Browse available courses at **/courses** and start your learning journey.";
  }

  let reply = `📋 **Your enrolled courses:**\n\n`;
  enrollments.forEach((e, i) => {
    const course = e.courseId;
    if (course) {
      reply += `${i + 1}. **${course.title}** — ${course.category || 'General'}\n`;
    }
  });
  reply += `\nGo to **My Courses** to continue learning!`;
  return reply;
}

async function handleMyProgress(userId) {
  if (!userId) {
    return "🔒 Please **log in** to view your progress.";
  }

  const progressDocs = await Progress.find({ studentId: userId }).populate('courseId').lean();

  if (!progressDocs.length) {
    return "No progress data found yet. Start a course and begin learning! 🎯";
  }

  let reply = `📊 **Your learning progress:**\n\n`;
  progressDocs.forEach((p) => {
    const title = p.courseId?.title || 'Unknown Course';
    reply += `• **${title}** — ${p.completionPercentage || 0}% complete (${(p.completedLessons || []).length}/${p.totalLessons || 0} lessons)\n`;
  });
  return reply;
}

function handleNavigationHelp(message) {
  const msg = message.toLowerCase();
  let matched = null;

  for (const [key, info] of Object.entries(navigationMap)) {
    if (msg.includes(key)) {
      matched = { key, ...info };
      break;
    }
  }

  if (matched) {
    return `🧭 **${matched.key.charAt(0).toUpperCase() + matched.key.slice(1)}**\n\n${matched.description}\n\n📍 Path: **${matched.path}**`;
  }

  // General navigation help
  let reply = `🧭 **Here's how to navigate the platform:**\n\n`;
  for (const [key, info] of Object.entries(navigationMap)) {
    reply += `• **${key.charAt(0).toUpperCase() + key.slice(1)}** → ${info.path}\n`;
  }
  return reply;
}

async function handleQuizHelp() {
  return `📝 **About Quizzes:**\n\n• Quizzes are attached to individual lessons inside courses\n• Open a course → go to a lesson → take the quiz\n• You'll see your score immediately after submission\n• You need to pass quizzes to progress through modules\n• Check your quiz results in your **Progress** page\n\nGo to **My Courses** to find available quizzes!`;
}

function handleEnrollHelp() {
  return `🎓 **How to enroll in a course:**\n\n1. Browse courses at **/courses**\n2. Click on a course to view details\n3. Click the **"Enroll"** button\n4. Complete payment if required\n5. Start learning!\n\nYou can also check **Recommendations** for suggested courses.`;
}

function handleHelp() {
  return `🤖 **I can help you with:**\n\n• 📚 **Courses** — browse, search, or get recommendations\n• 📋 **My Courses** — view your enrolled courses\n• 📊 **Progress** — check your learning progress\n• 🧭 **Navigation** — find any page on the platform\n• 📝 **Quizzes** — understand how quizzes work\n• 🎓 **Enrollment** — learn how to enroll\n\nJust ask me anything! For example:\n_"What courses are available?"_\n_"Show my enrolled courses"_\n_"How do I take a quiz?"_`;
}

function handleGeneral(message) {
  return `I appreciate your question! While I'm specialized in helping with this learning platform, here are some things I can do:\n\n• Show available courses\n• Recommend courses\n• Show your enrolled courses and progress\n• Help you navigate the platform\n• Explain quizzes and enrollment\n\nTry asking me something like **"What courses are available?"** or **"How do I enroll?"** 😊`;
}

// ─── Main Entry Point ────────────────────────────────────────────────────────
export async function generateResponse(message, userId) {
  try {
    const intent = detectIntent(message);

    switch (intent) {
      case 'greeting':
        return await handleGreeting();
      case 'list_courses':
        return await handleListCourses();
      case 'search_courses':
        return await handleSearchCourses(message);
      case 'recommend_courses':
        return await handleRecommendCourses();
      case 'my_courses':
        return await handleMyCourses(userId);
      case 'my_progress':
        return await handleMyProgress(userId);
      case 'navigation_help':
        return handleNavigationHelp(message);
      case 'quiz_help':
        return await handleQuizHelp();
      case 'enroll_help':
        return handleEnrollHelp();
      case 'help':
        return handleHelp();
      default:
        return handleGeneral(message);
    }
  } catch (err) {
    console.error('AI Assistant error:', err);
    return "I'm sorry, I encountered an error processing your request. Please try again! 🔄";
  }
}
