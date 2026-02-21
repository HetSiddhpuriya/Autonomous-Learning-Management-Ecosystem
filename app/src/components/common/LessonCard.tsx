import { motion } from 'framer-motion';
import type { Lesson } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Play, FileText, Clock, CheckCircle2, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LessonCardProps {
  lesson: Lesson;
  isLocked?: boolean;
  onClick?: () => void;
  onMarkComplete?: (completed: boolean) => void;
  delay?: number;
  variant?: 'default' | 'compact';
}

export function LessonCard({
  lesson,
  isLocked = false,
  onClick,
  onMarkComplete,
  delay = 0,
  variant = 'default',
}: LessonCardProps) {
  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  if (variant === 'compact') {
    return (
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, delay }}
      >
        <div
          className={cn(
            'flex items-center gap-3 p-3 rounded-lg transition-colors',
            isLocked
              ? 'opacity-60 cursor-not-allowed'
              : 'hover:bg-muted cursor-pointer',
            lesson.isCompleted && 'bg-green-50 dark:bg-green-900/20'
          )}
          onClick={!isLocked ? onClick : undefined}
        >
          <div className="flex-shrink-0">
            {isLocked ? (
              <Lock className="h-5 w-5 text-muted-foreground" />
            ) : lesson.isCompleted ? (
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            ) : (
              <Play className="h-5 w-5 text-primary" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className={cn(
              'text-sm font-medium truncate',
              lesson.isCompleted && 'text-green-700 dark:text-green-300'
            )}>
              {lesson.order}. {lesson.title}
            </p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatDuration(lesson.duration)}
              </span>
              {lesson.resources.length > 0 && (
                <span className="flex items-center gap-1">
                  <FileText className="h-3 w-3" />
                  {lesson.resources.length} resources
                </span>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
    >
      <Card
        className={cn(
          'overflow-hidden transition-all',
          isLocked ? 'opacity-60' : 'hover:shadow-md cursor-pointer',
          lesson.isCompleted && 'border-green-200 dark:border-green-800'
        )}
        onClick={!isLocked ? onClick : undefined}
      >
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            <div className={cn(
              'flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center',
              lesson.isCompleted
                ? 'bg-green-100 dark:bg-green-900'
                : 'bg-primary/10'
            )}>
              {isLocked ? (
                <Lock className="h-5 w-5 text-muted-foreground" />
              ) : lesson.isCompleted ? (
                <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
              ) : (
                <Play className="h-5 w-5 text-primary" />
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className={cn(
                    'font-medium',
                    lesson.isCompleted && 'text-green-700 dark:text-green-300'
                  )}>
                    {lesson.order}. {lesson.title}
                  </h4>
                  <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                    {lesson.description}
                  </p>
                </div>
                {onMarkComplete && !isLocked && (
                  <Checkbox
                    checked={lesson.isCompleted}
                    onCheckedChange={onMarkComplete}
                    onClick={(e) => e.stopPropagation()}
                  />
                )}
              </div>
              
              <div className="flex items-center gap-4 mt-3">
                <Badge variant="secondary" className="text-xs">
                  <Clock className="h-3 w-3 mr-1" />
                  {formatDuration(lesson.duration)}
                </Badge>
                {lesson.resources.length > 0 && (
                  <Badge variant="outline" className="text-xs">
                    <FileText className="h-3 w-3 mr-1" />
                    {lesson.resources.length} resources
                  </Badge>
                )}
                {lesson.isCompleted && (
                  <Badge className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 text-xs">
                    Completed
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
