import { motion } from 'framer-motion';
import type { Question } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuizQuestionProps {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  selectedAnswer: number | null;
  onSelectAnswer: (answerIndex: number) => void;
  showCorrectAnswer?: boolean;
  timeRemaining?: number;
}

export function QuizQuestion({
  question,
  questionNumber,
  totalQuestions,
  selectedAnswer,
  onSelectAnswer,
  showCorrectAnswer = false,
  timeRemaining,
}: QuizQuestionProps) {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300';
      case 'hard':
        return 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="overflow-hidden">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Badge variant="outline">
                Question {questionNumber} of {totalQuestions}
              </Badge>
              <Badge className={getDifficultyColor(question.difficulty)}>
                {question.difficulty}
              </Badge>
            </div>
            {timeRemaining !== undefined && (
              <div className={cn(
                'flex items-center gap-1 text-sm font-medium',
                timeRemaining < 60 && 'text-red-500 animate-pulse'
              )}>
                <Clock className="h-4 w-4" />
                {formatTime(timeRemaining)}
              </div>
            )}
          </div>
          <CardTitle className="text-lg leading-relaxed">
            {question.question}
          </CardTitle>
          {question.skillMapped && (
            <p className="text-xs text-muted-foreground">
              Skill: {question.skillMapped}
            </p>
          )}
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={selectedAnswer?.toString()}
            onValueChange={(value) => onSelectAnswer(parseInt(value))}
            className="space-y-3"
            disabled={showCorrectAnswer}
          >
            {question.options.map((option, index) => {
              const isSelected = selectedAnswer === index;
              const isCorrect = index === question.correctAnswer;
              const showResult = showCorrectAnswer;

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                >
                  <div
                    className={cn(
                      'flex items-center gap-3 p-4 rounded-lg border-2 transition-all cursor-pointer',
                      !showResult && isSelected && 'border-primary bg-primary/5',
                      !showResult && !isSelected && 'border-border hover:border-primary/50',
                      showResult && isCorrect && 'border-green-500 bg-green-50 dark:bg-green-900/20',
                      showResult && isSelected && !isCorrect && 'border-red-500 bg-red-50 dark:bg-red-900/20',
                      showResult && !isSelected && !isCorrect && 'border-border opacity-50'
                    )}
                    onClick={() => !showResult && onSelectAnswer(index)}
                  >
                    <RadioGroupItem
                      value={index.toString()}
                      id={`option-${index}`}
                      className="sr-only"
                    />
                    <div className={cn(
                      'w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium',
                      !showResult && 'bg-muted',
                      showResult && isCorrect && 'bg-green-500 text-white',
                      showResult && isSelected && !isCorrect && 'bg-red-500 text-white'
                    )}>
                      {String.fromCharCode(65 + index)}
                    </div>
                    <Label
                      htmlFor={`option-${index}`}
                      className="flex-1 cursor-pointer font-normal"
                    >
                      {option}
                    </Label>
                    {showResult && isCorrect && (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    )}
                    {showResult && isSelected && !isCorrect && (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                  </div>
                </motion.div>
              );
            })}
          </RadioGroup>

          {showCorrectAnswer && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-6 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800"
            >
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5" />
                <div>
                  <p className="font-medium text-blue-900 dark:text-blue-100">Explanation</p>
                  <p className="text-sm text-blue-800 dark:text-blue-200 mt-1">
                    {question.explanation}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
