import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { NotificationProvider } from '@/context/NotificationContext';
import { PublicLayout } from '@/layouts/PublicLayout';
import { AuthLayout } from '@/layouts/AuthLayout';
import { DashboardLayout } from '@/layouts/DashboardLayout';

// Public Pages
import { LandingPage } from '@/pages/public/LandingPage';
import { BrowseCoursesPage } from '@/pages/public/CoursesPage';
import { FeaturesPage } from '@/pages/public/FeaturesPage';
import { TestimonialsPage } from '@/pages/public/TestimonialsPage';
import { CourseDetailsPage } from '@/pages/public/CourseDetailsPage';

// Auth Pages
import { LoginPage } from '@/pages/auth/LoginPage';
import { RegisterPage } from '@/pages/auth/RegisterPage';
import { ForgotPasswordPage } from '@/pages/auth/ForgotPasswordPage';

// Student Pages
import { StudentDashboard } from '@/pages/student/StudentDashboard';
import { MyCoursesPage as StudentMyCourses } from '@/pages/student/MyCoursesPage';
import { RecommendationsPage } from '@/pages/student/RecommendationsPage';
import { ProgressPage } from '@/pages/student/ProgressPage';
import { DiscussionsPage } from '@/pages/student/DiscussionsPage';
import { SettingsPage } from '@/pages/student/SettingsPage';
import { LessonPage } from '@/pages/student/LessonPage';
import { QuizPage } from '@/pages/student/QuizPage';
import { WishlistPage } from '@/pages/student/WishlistPage';
import { PaymentCheckoutPage } from '@/pages/student/PaymentCheckoutPage';

// Instructor Pages
import { InstructorDashboard } from '@/pages/instructor/InstructorDashboard';
import { CreateCoursePage } from '@/pages/instructor/CreateCoursePage';
import { MyCoursesPage as InstructorMyCourses } from '@/pages/instructor/MyCoursesPage';
import { LessonsPage } from '@/pages/instructor/LessonsPage';
import { QuestionBankPage } from '@/pages/instructor/QuestionBankPage';
import { StudentsPage } from '@/pages/instructor/StudentsPage';
import { AnalyticsPage } from '@/pages/instructor/AnalyticsPage';

// Admin Pages
import { AdminDashboard } from '@/pages/admin/AdminDashboard';
import { UsersPage } from '@/pages/admin/UsersPage';
import { CoursesPage } from '@/pages/admin/CoursesPage';
import { PlatformAnalyticsPage } from '@/pages/admin/PlatformAnalyticsPage';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NotificationProvider>
          <Router>
            <Routes>
              {/* Standalone Protected Routes */}
              <Route path="/student/checkout/:courseId" element={<PaymentCheckoutPage />} />

              {/* Public Routes */}
              <Route element={<PublicLayout />}>
                <Route path="/" element={<LandingPage />} />
                <Route path="/courses" element={<BrowseCoursesPage />} />
                <Route path="/features" element={<FeaturesPage />} />
                <Route path="/testimonials" element={<TestimonialsPage />} />
                <Route path="/courses/:courseId" element={<CourseDetailsPage />} />
              </Route>

              {/* Auth Routes */}
              <Route element={<AuthLayout />}>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              </Route>

              {/* Student Routes */}
              <Route element={<DashboardLayout allowedRoles={['student']} />}>
                <Route path="/student" element={<StudentDashboard />} />
                <Route path="/student/courses" element={<StudentMyCourses />} />
                <Route path="/student/recommendations" element={<RecommendationsPage />} />
                <Route path="/student/progress" element={<ProgressPage />} />
                <Route path="/student/discussions" element={<DiscussionsPage />} />
                <Route path="/student/settings" element={<SettingsPage />} />
                <Route path="/student/courses/:courseId/lessons/:lessonId" element={<LessonPage />} />
                <Route path="/student/quiz/:quizId" element={<QuizPage />} />
                <Route path="/student/wishlist" element={<WishlistPage />} />
              </Route>

              {/* Instructor Routes */}
              <Route element={<DashboardLayout allowedRoles={['instructor']} />}>
                <Route path="/instructor" element={<InstructorDashboard />} />
                <Route path="/instructor/courses" element={<InstructorMyCourses />} />
                <Route path="/instructor/create-course" element={<CreateCoursePage />} />
                <Route path="/instructor/edit-course/:courseId" element={<CreateCoursePage />} />
                <Route path="/instructor/lessons" element={<LessonsPage />} />
                <Route path="/instructor/questions" element={<QuestionBankPage />} />
                <Route path="/instructor/students" element={<StudentsPage />} />
                <Route path="/instructor/analytics" element={<AnalyticsPage />} />
                <Route path="/instructor/settings" element={<SettingsPage />} />
              </Route>

              {/* Admin Routes */}
              <Route element={<DashboardLayout allowedRoles={['admin']} />}>
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/instructors" element={<UsersPage />} />
                <Route path="/admin/students" element={<UsersPage />} />
                <Route path="/admin/courses" element={<CoursesPage />} />
                <Route path="/admin/analytics" element={<PlatformAnalyticsPage />} />
                <Route path="/admin/settings" element={<SettingsPage />} />
              </Route>

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Router>
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
