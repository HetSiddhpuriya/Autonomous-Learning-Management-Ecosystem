// User Types
export type UserRole = 'student' | 'instructor' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  bio?: string;
  createdAt: string;
  lastActive: string;
  isActive: boolean;
  isOnline: boolean;
  status: 'pending' | 'approved' | 'rejected';
  highestQualification?: string;
  fieldOfStudy?: string;
  yearsOfExperience?: number;
  currentJobTitle?: string;
  organization?: string;
  languages?: string;
  registrationComplete?: boolean;
  wishlist?: string[];
}

// Course Types
export interface Course {
  id: string;
  title: string;
  description: string;
  instructorId: string;
  instructorName: string;
  thumbnail: string;
  category: string;
  skillTags: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: number; // in minutes
  lessonsCount: number;
  enrolledStudents: number;
  rating: number;
  isPublished: boolean;
  createdAt: string;
  price?: number;
  userRating?: number;
}

export interface Lesson {
  id: string;
  courseId: string;
  title: string;
  description: string;
  videoUrl?: string;
  duration: number;
  order: number;
  resources: Resource[];
  isCompleted?: boolean;
}

export interface Resource {
  id: string;
  name: string;
  type: 'pdf' | 'video' | 'link' | 'code';
  url: string;
}

// Progress Types
export interface CourseProgress {
  courseId: string;
  studentId: string;
  completedLessons: string[];
  totalLessons: number;
  completionPercentage: number;
  lastAccessed: string;
  timeSpent: number;
}

export interface SkillMastery {
  skill: string;
  level: number; // 0-100
  category: string;
}

// Quiz Types
export interface Quiz {
  id: string;
  lessonId: string;
  courseId: string;
  title: string;
  questions: Question[];
  timeLimit: number; // in minutes
  passingScore: number;
}

export interface Question {
  id: string;
  type: 'multiple_choice' | 'true_false' | 'fill_blank';
  question: string;
  options: string[];
  correctAnswer: number; // index of correct option
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  skillMapped: string;
}

export interface QuizAttempt {
  quizId: string;
  studentId: string;
  answers: number[];
  score: number;
  timeTaken: number;
  completedAt: string;
}

// Discussion Types
export interface DiscussionMessage {
  id: string;
  courseId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  message: string;
  attachmentUrl?: string;
  attachmentName?: string;
  timestamp: string;
  replies?: DiscussionMessage[];
}

// Recommendation Types
export interface Recommendation {
  id: string;
  type: 'lesson' | 'course' | 'practice';
  title: string;
  description: string;
  reason: string;
  priority: number;
  relatedSkills: string[];
}

// Analytics Types
export interface StudentAnalytics {
  studentId: string;
  totalTimeSpent: number;
  coursesCompleted: number;
  averageScore: number;
  streakDays: number;
  weeklyStudyHours: number[];
  skillMastery: SkillMastery[];
  weakTopics: string[];
}

export interface CourseAnalytics {
  courseId: string;
  totalStudents: number;
  averageCompletion: number;
  averageScore: number;
  dropOffLessons: { lessonId: string; dropOffRate: number }[];
  engagementOverTime: { date: string; activeStudents: number }[];
}

export interface PlatformAnalytics {
  totalUsers: number;
  activeStudents: number;
  totalCourses: number;
  coursesPublished: number;
  dailyActiveUsers: { date: string; count: number }[];
  coursePopularity: { courseId: string; enrollments: number }[];
  trafficData: { date: string; visits: number; uniqueVisitors: number }[];
}

// UI Types
export interface NavItem {
  label: string;
  href: string;
  icon: string;
}

export interface StatCardData {
  title: string;
  value: string | number;
  change?: number;
  icon: string;
  trend?: 'up' | 'down' | 'neutral';
}

export interface ChartData {
  name: string;
  value: number;
  [key: string]: any;
}
