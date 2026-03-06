import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { CourseCard } from '@/components/common/CourseCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Search, Grid3X3, List } from 'lucide-react';
import api from '@/lib/api';
import { toast } from 'sonner';
import type { Course } from '@/types';

export function MyCoursesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [activeTab, setActiveTab] = useState('all');

  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchEnrolledCourses();
  }, []);

  const fetchEnrolledCourses = async () => {
    try {
      setLoading(true);
      const [coursesRes, progressRes] = await Promise.all([
        api.get('/courses/enrolled/my'),
        api.get('/progress')
      ]);

      const progressMap: Record<string, number> = {};
      progressRes.data.forEach((p: any) => {
        progressMap[p.courseId] = p.completionPercentage || 0;
      });

      const coursesWithProgress = coursesRes.data.map((course: any) => ({
        ...course,
        progress: Math.round(progressMap[course._id || course.id] || 0)
      }));

      setEnrolledCourses(coursesWithProgress);
    } catch (error) {
      toast.error('Failed to load your courses');
    } finally {
      setLoading(false);
    }
  };

  const completedCourses = enrolledCourses.filter(c => (c as any).progress >= 100);
  const inProgressCourses = enrolledCourses.filter(c => (c as any).progress < 100);

  const filterCourses = (courses: Course[]) => {
    return courses.filter(course =>
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const getCoursesForTab = () => {
    switch (activeTab) {
      case 'in-progress':
        return filterCourses(inProgressCourses);
      case 'completed':
        return filterCourses(completedCourses);
      default:
        return filterCourses(enrolledCourses);
    }
  };

  const displayedCourses = getCoursesForTab();

  const handleContinue = async (courseId: string) => {
    try {
      const [{ data: lessons }, { data: progressData }] = await Promise.all([
        api.get(`/lessons?courseId=${courseId}`),
        api.get(`/progress?courseId=${courseId}`)
      ]);

      const progress = progressData[0] || { completedLessons: [] };
      const incompleteLesson = lessons.find((l: any) => !progress.completedLessons.includes(l.id));
      const targetLessonId = incompleteLesson ? incompleteLesson.id : (lessons[0]?.id || 'start');

      navigate(`/student/courses/${courseId}/lessons/${targetLessonId}`);
    } catch (error) {
      toast.error('Failed to load course progress');
      navigate(`/courses/${courseId}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">My Courses</h1>
            <p className="text-muted-foreground mt-1">
              Manage and continue your learning journey
            </p>
          </div>
          <Button asChild>
            <Link to="/courses">Explore More Courses</Link>
          </Button>
        </div>
      </motion.div>

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="flex flex-col sm:flex-row gap-4"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search your courses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-12"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="icon"
            onClick={() => setViewMode('grid')}
            className="h-12 w-12"
          >
            <Grid3X3 className="h-5 w-5" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="icon"
            onClick={() => setViewMode('list')}
            className="h-12 w-12"
          >
            <List className="h-5 w-5" />
          </Button>
        </div>
      </motion.div>

      {/* Course Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6 h-12">
            <TabsTrigger value="all" className="h-10 px-6">
              All Courses
              <Badge variant="secondary" className="ml-2 font-normal rounded-full px-2">
                {enrolledCourses.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="in-progress" className="h-10 px-6">
              In Progress
              <Badge variant="secondary" className="ml-2 font-normal rounded-full px-2">
                {inProgressCourses.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="completed" className="h-10 px-6">
              Completed
              <Badge variant="secondary" className="ml-2 font-normal rounded-full px-2">
                {completedCourses.length}
              </Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-0">
            {loading ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-[350px] bg-muted/40 animate-pulse rounded-2xl border border-muted-foreground/10"></div>
                ))}
              </div>
            ) : displayedCourses.length > 0 ? (
              <div className={
                viewMode === 'grid'
                  ? 'grid sm:grid-cols-2 lg:grid-cols-3 gap-6'
                  : 'space-y-4'
              }>
                {displayedCourses.map((course, index) => {
                  return (
                    <CourseCard
                      key={course.id}
                      course={course}
                      progress={(course as any).progress || 0}
                      showProgress={true}
                      showActions
                      variant={viewMode === 'list' ? 'horizontal' : 'default'}
                      delay={index * 0.1}
                      onContinue={() => handleContinue(course.id)}
                    />
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-20 bg-white border border-slate-200 rounded-xl shadow-sm">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                  <Search className="h-8 w-8 text-slate-400" />
                </div>
                <h3 className="text-xl font-bold mb-2">No courses found</h3>
                <p className="text-muted-foreground mb-6">
                  {searchQuery
                    ? 'Try adjusting your search terms'
                    : 'You haven\'t enrolled in any courses yet'}
                </p>
                {!searchQuery && (
                  <Button asChild size="lg">
                    <Link to="/courses">Browse Courses</Link>
                  </Button>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}
