import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { LessonCard } from '@/components/common/LessonCard';
import api from '@/lib/api';
import { toast } from 'sonner';
import {
  Play,
  Clock,
  FileText,
  Download,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  Bookmark,
  Share2,
  MoreVertical,
  FileQuestion,
  ArrowRight,
} from 'lucide-react';

export function LessonPage() {
  const { courseId, lessonId } = useParams<{ courseId: string; lessonId: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  const [course, setCourse] = useState<any>(null);
  const [courseLessons, setCourseLessons] = useState<any[]>([]);
  const [progress, setProgress] = useState<any>(null);
  const [moduleQuizzes, setModuleQuizzes] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [courseId, lessonId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [courseRes, lessonsRes, progressRes, quizzesRes] = await Promise.all([
        api.get(`/courses/${courseId}`),
        api.get(`/lessons?courseId=${courseId}`),
        api.get(`/progress?courseId=${courseId}`),
        api.get(`/quizzes?courseId=${courseId}`)
      ]);
      setCourse(courseRes.data);
      const fetchedLessons = lessonsRes.data;
      setCourseLessons(fetchedLessons);

      const prog = progressRes.data[0] || { completedLessons: [], passedQuizzes: [], totalLessons: fetchedLessons.length, completionPercentage: 0 };
      setProgress(prog);

      const mQuizzes: Record<string, any> = {};
      fetchedLessons.forEach((l: any) => {
        if (l.module) {
          const q = quizzesRes.data.find((quiz: any) => quiz.lessonId === l.id);
          if (q && !mQuizzes[l.module]) mQuizzes[l.module] = q;
        }
      });
      setModuleQuizzes(mQuizzes);

      if (fetchedLessons.length > 0) {
        if (lessonId === 'start') {
          const incomplete = fetchedLessons.find((l: any) => !prog.completedLessons.includes(l.id));
          const target = incomplete ? incomplete.id : fetchedLessons[0].id;
          navigate(`/student/courses/${courseId}/lessons/${target}`, { replace: true });
        } else {
          // Check if the current requested lesson is locked
          const reqIdx = fetchedLessons.findIndex((l: any) => l.id === lessonId);
          if (reqIdx > 0) {
            const prevLesson = fetchedLessons[reqIdx - 1];
            let isLocked = !prog.completedLessons.includes(prevLesson.id);
            if (!isLocked && fetchedLessons[reqIdx].module !== prevLesson.module) {
              const prevModuleQuiz = mQuizzes[prevLesson.module];
              if (prevModuleQuiz) {
                const quizIdStr = prevModuleQuiz.id || prevModuleQuiz._id;
                const attempted = (prog.quizAttempts || []).some((a: any) => a.quizId === quizIdStr);
                if (!attempted) {
                  isLocked = true;
                }
              }
            }
            if (isLocked) {
              toast.error('You must complete previous lessons and exams first.');
              const firstIncomplete = fetchedLessons.find((l: any) => !prog.completedLessons.includes(l.id));
              const target = firstIncomplete ? firstIncomplete.id : fetchedLessons[0].id;
              navigate(`/student/courses/${courseId}/lessons/${target}`, { replace: true });
            }
          }
        }
      }
    } catch (error) {
      toast.error('Failed to load lesson data');
    } finally {
      setLoading(false);
    }
  };

  const currentLesson = courseLessons.find(l => l.id === lessonId) || courseLessons[0];
  const currentIndex = courseLessons.findIndex(l => l.id === lessonId);
  const nextLesson = courseLessons[currentIndex + 1];
  const prevLesson = courseLessons[currentIndex - 1];

  const isCompleted = progress?.completedLessons?.includes(currentLesson?.id);

  const isLastLessonInModule = !nextLesson || currentLesson?.module !== nextLesson?.module;
  const lastModuleInCourse = courseLessons.length > 0 ? courseLessons[courseLessons.length - 1].module : null;
  const isLastModule = currentLesson?.module === lastModuleInCourse;

  const moduleQuiz = currentLesson?.module ? moduleQuizzes[currentLesson.module] : null;
  const quizIdStr = moduleQuiz ? (moduleQuiz.id || moduleQuiz._id) : null;
  const hasPassedQuiz = moduleQuiz && (progress?.passedQuizzes || []).includes(quizIdStr);
  const hasAttemptedQuiz = moduleQuiz && (progress?.quizAttempts || []).some((a: any) => a.quizId === quizIdStr);
  const isExamSatisfied = isLastModule ? hasPassedQuiz : hasAttemptedQuiz;

  const showExamBlock = isLastLessonInModule && moduleQuiz && isCompleted;
  const nextLessonLockedByExam = isLastLessonInModule && moduleQuiz && !isExamSatisfied;

  let totalItems = courseLessons.length;
  let completedItems = progress?.completedLessons?.length || 0;
  const finalLesson = courseLessons[courseLessons.length - 1];
  const finalModuleQuiz = finalLesson ? moduleQuizzes[finalLesson.module] : null;

  if (finalModuleQuiz) {
    totalItems += 1;
    const quizIdStr = finalModuleQuiz.id || finalModuleQuiz._id;
    const passed = (progress?.passedQuizzes || []).includes(quizIdStr);
    if (passed) completedItems += 1;
  }
  const displayPercentage = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  const handleMarkComplete = async (checked: boolean) => {
    if (!currentLesson || !course) return;
    try {
      if (checked) {
        const res = await api.post('/progress/complete', {
          courseId: course.id,
          lessonId: currentLesson.id,
          timeSpent: 0
        });
        setProgress(res.data);
        toast.success('Lesson marked as completed!');
      } else {
        toast.info('Lesson is already completed.');
      }
    } catch (err) {
      toast.error('Failed to update progress');
    }
  };

  const formatDuration = (minutes: number) => {
    if (!minutes) return '0m';
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const isYoutubeUrl = (url: string) => {
    if (!url) return false;
    return url.includes('youtube.com') || url.includes('youtu.be');
  };

  const getEmbedUrl = (url: string) => {
    if (!url) return '';
    if (url.includes('youtube.com/watch?v=')) {
      return url.replace('watch?v=', 'embed/');
    }
    if (url.includes('youtu.be/')) {
      return url.replace('youtu.be/', 'youtube.com/embed/');
    }
    return url;
  };

  if (loading) {
    return <div className="p-8 text-center animate-pulse">Loading course data...</div>;
  }

  if (!currentLesson) {
    return <div className="p-8 text-center bg-white m-4 rounded-xl shadow-sm border border-slate-100">
      <h3 className="text-xl font-bold mb-2">Lesson not found</h3>
      <p className="text-muted-foreground mb-4">The lesson you are looking for does not exist or has been removed.</p>
      <Button asChild>
        <Link to={`/courses/${courseId}`}>Back to Course Details</Link>
      </Button>
    </div>;
  }

  return (
    <div className="space-y-6 flex flex-col lg:flex-row gap-6">
      {/* Main Content Area */}
      <div className="lg:flex-1 space-y-6 lg:min-w-0">
        {/* Navigation Breadcrumbs */}
        <motion.div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Link to="/student/courses" className="hover:text-foreground">My Courses</Link>
            <ChevronRight className="h-4 w-4 shrink-0" />
            <Link to={`/courses/${courseId}`} className="hover:text-foreground truncate max-w-[200px]">{course?.title}</Link>
            <ChevronRight className="h-4 w-4 shrink-0" />
            <span className="text-foreground truncate">Lesson {currentLesson?.order}</span>
          </div>
        </motion.div>

        {/* Video Player Box */}
        <motion.div>
          <Card className="overflow-hidden border-2 border-slate-100 shadow-md">
            {currentLesson.videoUrl ? (
              <div className="aspect-video bg-black rounded-lg overflow-hidden">
                {isYoutubeUrl(currentLesson.videoUrl) ? (
                  <iframe
                    key={currentLesson.id}
                    src={getEmbedUrl(currentLesson.videoUrl)}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <video
                    key={currentLesson.id}
                    className="w-full h-full object-contain"
                    controls
                    autoPlay
                    src={currentLesson.videoUrl}
                    poster={course?.thumbnail}
                  />
                )}
              </div>
            ) : (
              <div className="aspect-video bg-slate-900 relative flex items-center justify-center text-white">
                <div className="text-center p-4">
                  <Play className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg">No video URL provided for this lesson.</p>
                </div>
              </div>
            )}
          </Card>
        </motion.div>

        {/* Lesson Tabs */}
        <motion.div>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4 bg-transparent p-0 space-x-2 border-b w-full justify-start rounded-none h-auto">
              <TabsTrigger value="overview" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-3">Overview</TabsTrigger>
              <TabsTrigger value="resources" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-3">Resources</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{currentLesson?.title}</h1>
                  <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1 font-medium bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">
                      <Clock className="h-4 w-4" />
                      {formatDuration(currentLesson?.duration || 0)}
                    </span>
                    <span className="flex items-center gap-1 font-medium bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">
                      <FileText className="h-4 w-4" />
                      {currentLesson?.resources?.length || 0} resources
                    </span>
                    <Badge variant="outline" className="px-2 py-1 rounded-md">Lesson {currentLesson?.order}</Badge>
                  </div>
                </div>
              </div>
              <p className="text-muted-foreground leading-relaxed mt-4">{currentLesson?.description}</p>
            </TabsContent>

            <TabsContent value="resources">
              <Card className="border-slate-200 shadow-sm">
                <CardContent className="pt-6">
                  {currentLesson?.resources?.length > 0 ? (
                    <div className="space-y-3">
                      {currentLesson.resources.map((resource: any) => (
                        <div key={resource.id} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:border-slate-300 hover:bg-slate-50 transition-colors">
                          <div className="flex items-center gap-4">
                            <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
                              <FileText className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <p className="font-semibold text-slate-800 dark:text-slate-200">{resource.name}</p>
                              <p className="text-xs text-muted-foreground uppercase tracking-wide">{resource.type}</p>
                            </div>
                          </div>
                          <Button variant="outline" size="sm" asChild className="rounded-full">
                            <a href={resource.url} target="_blank" rel="noreferrer">
                              <Download className="h-4 w-4 mr-2" />
                              Open
                            </a>
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                        <FileText className="h-8 w-8 text-slate-300" />
                      </div>
                      <h3 className="text-lg font-bold mb-1">No Resources</h3>
                      <p className="text-muted-foreground">There are no additional resources for this lesson.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>

        {/* Action / Nav Buttons Below Video/Tabs */}
        <motion.div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 pt-4 border-t">
          <Button
            variant="outline"
            disabled={!prevLesson}
            asChild={!!prevLesson}
            className="w-full sm:w-auto hover:bg-slate-100"
          >
            {prevLesson ? (
              <Link to={`/student/courses/${courseId}/lessons/${prevLesson.id}`}>
                <ChevronLeft className="h-4 w-4 mr-2" />
                Previous Lesson
              </Link>
            ) : (
              <div className="cursor-not-allowed flex items-center">
                <ChevronLeft className="h-4 w-4 mr-2" />
                Previous Lesson
              </div>
            )}
          </Button>

          <label className={`flex items-center justify-center gap-3 px-6 py-3 rounded-full border-2 cursor-pointer transition-all ${isCompleted ? 'border-green-500 bg-green-50 text-green-700' : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'} w-full sm:w-auto`}>
            <Checkbox
              checked={isCompleted}
              onCheckedChange={(checked) => handleMarkComplete(checked as boolean)}
              disabled={isCompleted}
              className={isCompleted ? 'data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500' : ''}
            />
            <span className="text-sm font-bold uppercase tracking-wider">{isCompleted ? 'Completed' : 'Mark as Complete'}</span>
          </label>

          <Button
            disabled={!nextLesson || !isCompleted || nextLessonLockedByExam}
            asChild={!!nextLesson && isCompleted && !nextLessonLockedByExam}
            className="w-full sm:w-auto hover:bg-primary/90"
          >
            {nextLesson && isCompleted && !nextLessonLockedByExam ? (
              <Link to={`/student/courses/${courseId}/lessons/${nextLesson.id}`}>
                Next Lesson
                <ChevronRight className="h-4 w-4 ml-2" />
              </Link>
            ) : (
              <div className="cursor-not-allowed opacity-50 flex items-center" title={nextLesson && !isCompleted ? "Complete current lesson to unlock" : nextLessonLockedByExam ? "Complete module exam to unlock" : ""}>
                Next Lesson
                <ChevronRight className="h-4 w-4 ml-2" />
              </div>
            )}
          </Button>
        </motion.div>

        {showExamBlock && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-8">
            <Card className="border-amber-200 bg-amber-50/50 shadow-sm relative overflow-hidden">
              <div className={`absolute top-0 left-0 w-1 h-full ${isExamSatisfied ? 'bg-green-500' : 'bg-amber-500'}`} />
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                  <div>
                    <h3 className="text-xl font-bold flex items-center gap-2">
                      <FileQuestion className={`h-6 w-6 ${isExamSatisfied ? 'text-green-600' : 'text-amber-600'}`} />
                      Module Exam / Question Bank
                    </h3>
                    <p className="text-muted-foreground mt-2 text-sm leading-relaxed max-w-xl">
                      You have completed all lessons in this module. {isLastModule ? 'Before completing this course, you must pass this final assessment.' : 'Before unlocking the next module session, you must take this assessment.'}
                    </p>
                    {isExamSatisfied && (
                      <p className="text-green-600 font-medium mt-3 flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5" />
                        {isLastModule ? 'You have passed this module exam!' : 'You have completed this module assessment!'}
                      </p>
                    )}
                  </div>
                  <div className="shrink-0 w-full md:w-auto flex flex-col items-stretch">
                    {!isExamSatisfied ? (
                      <Button size="lg" className="bg-amber-500 hover:bg-amber-600 text-white w-full" asChild>
                        <Link to={`/student/quiz/${moduleQuiz.id || moduleQuiz._id}`}>
                          {hasAttemptedQuiz ? 'Retry Exam' : 'Start Exam'} <ArrowRight className="h-4 w-4 ml-2" />
                        </Link>
                      </Button>
                    ) : (
                      <Button size="lg" variant="outline" className="w-full border-green-200 hover:bg-green-50 text-green-700" asChild>
                        <Link to={`/student/quiz/${moduleQuiz.id || moduleQuiz._id}?mode=review`}>
                          Review Exam <ArrowRight className="h-4 w-4 ml-2" />
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>

      {/* Sidebar - Course Content & Progress */}
      <div className="lg:w-1/3 xl:w-1/4 shrink-0">
        <Card className="sticky top-6 shadow-md border-slate-200">
          <CardHeader className="pb-4 border-b bg-slate-50 dark:bg-slate-900 rounded-t-xl">
            <CardTitle className="text-lg font-bold">Course Content</CardTitle>
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-sm font-semibold text-slate-700 dark:text-slate-300">
                <span>{completedItems} / {totalItems} items</span>
                <span className="text-primary">{displayPercentage}%</span>
              </div>
              <Progress value={displayPercentage} className="h-2.5 rounded-full" />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[calc(100vh-250px)] rounded-b-xl">
              <div className="p-3 space-y-2 bg-slate-50/50 dark:bg-slate-900/50 min-h-full">
                {courseLessons.map((lesson, index) => {
                  const isCompletedLesson = progress?.completedLessons?.includes(lesson.id);
                  const isActive = lesson.id === currentLesson.id;
                  const showModuleHeader = index === 0 || lesson.module !== courseLessons[index - 1].module;

                  let isLocked = index > 0 && !progress?.completedLessons?.includes(courseLessons[index - 1].id);
                  if (index > 0 && courseLessons[index].module !== courseLessons[index - 1].module) {
                    const prevModuleQuiz = moduleQuizzes[courseLessons[index - 1].module];
                    if (prevModuleQuiz) {
                      const quizIdStr = prevModuleQuiz.id || prevModuleQuiz._id;
                      const attempted = (progress?.quizAttempts || []).some((a: any) => a.quizId === quizIdStr);
                      if (!attempted) {
                        isLocked = true;
                      }
                    }
                  }

                  let hasPendingExam = false;
                  const isLastInModule = index === courseLessons.length - 1 || courseLessons[index].module !== courseLessons[index + 1].module;
                  if (isCompletedLesson && isLastInModule) {
                    const modQuiz = moduleQuizzes[lesson.module];
                    if (modQuiz) {
                      const quizIdStr = modQuiz.id || modQuiz._id;
                      const isLastModule = courseLessons.length > 0 && lesson.module === courseLessons[courseLessons.length - 1].module;
                      if (isLastModule) {
                        const passed = (progress?.passedQuizzes || []).includes(quizIdStr);
                        if (!passed) hasPendingExam = true;
                      } else {
                        const attempted = (progress?.quizAttempts || []).some((a: any) => a.quizId === quizIdStr);
                        if (!attempted) hasPendingExam = true;
                      }
                    }
                  }

                  return (
                    <React.Fragment key={lesson.id}>
                      {showModuleHeader && (
                        <div className="pt-4 pb-1 px-1 first:pt-1">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-primary/80">
                            {lesson.module || 'Course Lessons'}
                          </h4>
                        </div>
                      )}
                      <LessonCard
                        lesson={{ ...lesson, isCompleted: isCompletedLesson }}
                        isLocked={isLocked}
                        isActive={isActive}
                        hasPendingExam={hasPendingExam}
                        variant="compact"
                        onClick={() => {
                          if (!isLocked) {
                            navigate(`/student/courses/${courseId}/lessons/${lesson.id}`);
                          }
                        }}
                      />
                    </React.Fragment>
                  );
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
