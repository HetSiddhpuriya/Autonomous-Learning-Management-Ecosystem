import { motion } from 'framer-motion';
import type { Course } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Clock, Users, Star, BookOpen, Play } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CourseCardProps {
  course: Course;
  progress?: number;
  showProgress?: boolean;
  showActions?: boolean;
  variant?: 'default' | 'compact' | 'horizontal';
  delay?: number;
  onContinue?: () => void;
  onEnroll?: () => void;
}

export function CourseCard({
  course,
  progress = 0,
  showProgress = false,
  showActions = true,
  variant = 'default',
  delay = 0,
  onContinue,
  onEnroll,
}: CourseCardProps) {
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    return `${hours}h ${minutes % 60}m`;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300';
      case 'advanced':
        return 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  if (variant === 'horizontal') {
    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, delay }}
      >
        <Card className="overflow-hidden">
          <div className="flex flex-col sm:flex-row">
            <div className="sm:w-48 h-32 sm:h-auto relative">
              <img
                src={course.thumbnail}
                alt={course.title}
                className="w-full h-full object-cover"
              />
              <Badge className={cn('absolute top-2 left-2 capitalize', getDifficultyColor(course.difficulty))}>
                {course.difficulty}
              </Badge>
            </div>
            <CardContent className="flex-1 p-4">
              <div className="flex flex-col h-full justify-between">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-lg line-clamp-1">{course.title}</h3>
                    <div className="flex items-center gap-1 text-amber-500">
                      <Star className="h-4 w-4 fill-current" />
                      <span className="text-sm font-medium">{course.rating}</span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{course.instructorName}</p>
                  <p className="text-sm text-muted-foreground line-clamp-2 mt-2">{course.description}</p>
                </div>
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <BookOpen className="h-4 w-4" />
                      {course.lessonsCount} lessons
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {formatDuration(course.duration)}
                    </span>
                  </div>
                  {showActions && (
                    <Button size="sm" onClick={onContinue || onEnroll}>
                      {showProgress ? 'Continue' : 'Enroll'}
                    </Button>
                  )}
                </div>
                {showProgress && progress > 0 && (
                  <div className="mt-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                )}
              </div>
            </CardContent>
          </div>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
    >
      <Card className="overflow-hidden group hover:shadow-lg transition-shadow duration-300">
        <div className="relative aspect-video overflow-hidden">
          <img
            src={course.thumbnail}
            alt={course.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <Badge className={cn('absolute top-3 left-3 capitalize', getDifficultyColor(course.difficulty))}>
            {course.difficulty}
          </Badge>
          {course.price && (
            <Badge variant="secondary" className="absolute top-3 right-3 font-semibold">
              ${course.price}
            </Badge>
          )}
        </div>
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-2 mb-2">
            <Badge variant="outline" className="text-xs">
              {course.category}
            </Badge>
            <div className="flex items-center gap-1 text-amber-500">
              <Star className="h-4 w-4 fill-current" />
              <span className="text-sm font-medium">{course.rating}</span>
            </div>
          </div>
          
          <h3 className="font-semibold text-lg line-clamp-2 mb-1 group-hover:text-primary transition-colors">
            {course.title}
          </h3>
          <p className="text-sm text-muted-foreground mb-3">{course.instructorName}</p>
          
          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
            <span className="flex items-center gap-1">
              <BookOpen className="h-4 w-4" />
              {course.lessonsCount}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {formatDuration(course.duration)}
            </span>
            <span className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              {course.enrolledStudents.toLocaleString()}
            </span>
          </div>

          {showProgress && progress > 0 && (
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium">{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}

          {showActions && (
            <Button 
              className="w-full" 
              variant={showProgress && progress > 0 ? 'default' : 'outline'}
              onClick={onContinue || onEnroll}
            >
              {showProgress && progress > 0 ? (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Continue Learning
                </>
              ) : (
                'Enroll Now'
              )}
            </Button>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
