import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { LessonCard } from '@/components/common/LessonCard';
import { mockLessons, mockCourses, mockQuizzes } from '@/mock/data';
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
} from 'lucide-react';

export function LessonPage() {
  const { courseId, lessonId } = useParams<{ courseId: string; lessonId: string }>();
  const [isCompleted, setIsCompleted] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // Find current lesson
  const currentLesson = mockLessons.find(l => l.id === lessonId) || mockLessons[0];
  const course = mockCourses.find(c => c.id === courseId) || mockCourses[0];
  const courseLessons = mockLessons.filter(l => l.courseId === courseId);
  const currentIndex = courseLessons.findIndex(l => l.id === lessonId);
  const nextLesson = courseLessons[currentIndex + 1];
  const prevLesson = courseLessons[currentIndex - 1];

  // Find quiz for this lesson
  const lessonQuiz = mockQuizzes.find(q => q.lessonId === lessonId);

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb & Navigation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Link to="/student/courses" className="hover:text-foreground">My Courses</Link>
          <ChevronRight className="h-4 w-4" />
          <Link to={`/student/courses/${courseId}`} className="hover:text-foreground">{course.title}</Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground">Lesson {currentLesson?.order}</span>
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Video Player */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <Card className="overflow-hidden">
              <div className="aspect-video bg-black relative group">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-white">
                    <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform cursor-pointer">
                      <Play className="h-10 w-10 fill-white" />
                    </div>
                    <p className="text-lg font-medium">{currentLesson?.title}</p>
                    <p className="text-sm text-white/70">Click to play</p>
                  </div>
                </div>
                {/* Video controls placeholder */}
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                  <div className="h-1 bg-white/30 rounded-full mb-4">
                    <div className="h-full w-1/3 bg-primary rounded-full" />
                  </div>
                  <div className="flex items-center justify-between text-white">
                    <div className="flex items-center gap-4">
                      <Play className="h-5 w-5 cursor-pointer" />
                      <span className="text-sm">12:34 / {formatDuration(currentLesson?.duration || 0)}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm">1x</span>
                      <MoreVertical className="h-5 w-5 cursor-pointer" />
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Lesson Info & Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="notes">Notes</TabsTrigger>
                <TabsTrigger value="resources">Resources</TabsTrigger>
                <TabsTrigger value="discussion">Discussion</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h1 className="text-2xl font-bold">{currentLesson?.title}</h1>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {formatDuration(currentLesson?.duration || 0)}
                      </span>
                      <span className="flex items-center gap-1">
                        <FileText className="h-4 w-4" />
                        {currentLesson?.resources?.length || 0} resources
                      </span>
                      <Badge variant="outline">Lesson {currentLesson?.order}</Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon">
                      <Bookmark className="h-5 w-5" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Share2 className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
                <p className="text-muted-foreground">{currentLesson?.description}</p>

                {lessonQuiz && (
                  <Card className="bg-primary/5 border-primary/20">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold flex items-center gap-2">
                            <CheckCircle2 className="h-5 w-5 text-primary" />
                            Lesson Quiz Available
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            Test your knowledge with {lessonQuiz.questions.length} questions
                          </p>
                        </div>
                        <Button asChild>
                          <Link to={`/student/quiz/${lessonQuiz.id}`}>Take Quiz</Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="notes">
                <Card>
                  <CardHeader>
                    <CardTitle>My Notes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <textarea
                      className="w-full h-48 p-4 rounded-lg border resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Take notes while watching the lesson..."
                    />
                    <div className="flex justify-end mt-4">
                      <Button>Save Notes</Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="resources">
                <Card>
                  <CardHeader>
                    <CardTitle>Lesson Resources</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {currentLesson?.resources?.map((resource) => (
                        <div
                          key={resource.id}
                          className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <FileText className="h-5 w-5 text-primary" />
                            <div>
                              <p className="font-medium">{resource.name}</p>
                              <p className="text-xs text-muted-foreground uppercase">{resource.type}</p>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                        </div>
                      ))}
                      {(!currentLesson?.resources || currentLesson.resources.length === 0) && (
                        <p className="text-center text-muted-foreground py-8">
                          No resources available for this lesson
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="discussion">
                <Card>
                  <CardHeader>
                    <CardTitle>Lesson Discussion</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground mb-4">
                        Join the discussion with other students
                      </p>
                      <Button asChild>
                        <Link to="/student/discussions">Go to Discussions</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </motion.div>

          {/* Navigation Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="flex items-center justify-between"
          >
            <Button
              variant="outline"
              disabled={!prevLesson}
              asChild={!!prevLesson}
            >
              {prevLesson ? (
                <Link to={`/student/courses/${courseId}/lessons/${prevLesson.id}`}>
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Previous Lesson
                </Link>
              ) : (
                <>
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Previous Lesson
                </>
              )}
            </Button>

            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 px-4 py-2 rounded-lg border cursor-pointer hover:bg-muted transition-colors">
                <Checkbox
                  checked={isCompleted}
                  onCheckedChange={(checked) => setIsCompleted(checked as boolean)}
                />
                <span className="text-sm font-medium">Mark as Complete</span>
              </label>
            </div>

            <Button
              disabled={!nextLesson}
              asChild={!!nextLesson}
            >
              {nextLesson ? (
                <Link to={`/student/courses/${courseId}/lessons/${nextLesson.id}`}>
                  Next Lesson
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Link>
              ) : (
                <>
                  Next Lesson
                  <ChevronRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </motion.div>
        </div>

        {/* Sidebar - Lesson List */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-base">Course Content</CardTitle>
              <p className="text-sm text-muted-foreground">
                {courseLessons.length} lessons • {formatDuration(courseLessons.reduce((acc, l) => acc + l.duration, 0))}
              </p>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[calc(100vh-400px)]">
                <div className="space-y-1 p-2">
                  {courseLessons.map((lesson, index) => (
                    <LessonCard
                      key={lesson.id}
                      lesson={lesson}
                      isLocked={index > currentIndex + 1}
                      variant="compact"
                      onClick={() => {}}
                    />
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
