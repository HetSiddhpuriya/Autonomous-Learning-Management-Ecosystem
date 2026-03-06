import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { QuizQuestion } from '@/components/common/QuizQuestion';
import api from '@/lib/api';
import {
  Clock,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Trophy,
  RotateCcw,
  ArrowRight,
  ChevronLeft,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export function QuizPage() {
  const { quizId } = useParams<{ quizId: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isReviewMode = searchParams.get('mode') === 'review';

  const [quiz, setQuiz] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const { data } = await api.get(`/quizzes/${quizId}`);
        setQuiz(data);

        if (isReviewMode) {
          try {
            const attemptRes = await api.get(`/quizzes/${quizId}/attempt`);
            if (attemptRes.data) {
              setAnswers(attemptRes.data.answers || new Array(data.questions.length).fill(null));
              setScore(attemptRes.data.score || 0);
              setTimeRemaining(0);
              setIsSubmitted(true);
              setShowResults(true);
            }
          } catch (err) {
            // Fallback for users who passed before attempt tracking was added
            setAnswers(data.questions.map((q: any) => q.correctAnswer));
            setScore(100);
            setTimeRemaining(0);
            setIsSubmitted(true);
            setShowResults(true);
          }
        } else {
          setAnswers(new Array(data.questions.length).fill(null));
          setTimeRemaining((data.timeLimit || 15) * 60);
        }
      } catch (err) {
        console.error("Failed to fetch quiz", err);
      } finally {
        setLoading(false);
      }
    };
    fetchQuiz();
  }, [quizId, isReviewMode]);

  // Timer
  useEffect(() => {
    if (isSubmitted || timeRemaining <= 0 || !quiz) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isSubmitted, timeRemaining, quiz]);

  const handleAnswerSelect = (answerIndex: number) => {
    if (isSubmitted) return;
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = answerIndex;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (quiz && currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (!quiz) return;
    try {
      const { data } = await api.post(`/quizzes/${quizId}/submit`, {
        answers,
        timeTaken: (quiz.timeLimit * 60) - timeRemaining
      });
      setScore(data.score);
      setIsSubmitted(true);
      setShowResults(true);
    } catch (err) {
      console.error("Failed to submit quiz", err);
    }
  };

  const handleRetry = () => {
    if (!quiz) return;
    setCurrentQuestionIndex(0);
    setAnswers(new Array(quiz.questions.length).fill(null));
    setTimeRemaining(quiz.timeLimit * 60);
    setIsSubmitted(false);
    setShowResults(false);
    setScore(0);
  };

  if (loading) return <div className="p-8 text-center animate-pulse">Loading Quiz...</div>;
  if (!quiz) return <div className="p-8 text-center">Quiz not found</div>;

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;
  const answeredCount = answers.filter(a => a !== null).length;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-2 mb-4">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Lesson
          </Button>
        </div>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">{quiz.title}</h1>
            <p className="text-muted-foreground mt-1">
              Test your understanding of the lesson material
            </p>
          </div>
          <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${timeRemaining < 60 ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' : 'bg-muted'
            }`}>
            <Clock className="h-5 w-5" />
            <span className="font-mono font-medium">{formatTime(timeRemaining)}</span>
          </div>
        </div>
      </motion.div>

      {/* Progress Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">
            Question {currentQuestionIndex + 1} of {quiz.questions.length}
          </span>
          <span className="text-sm text-muted-foreground">
            {answeredCount} of {quiz.questions.length} answered
          </span>
        </div>
        <Progress value={progress} className="h-2" />
      </motion.div>

      {/* Question */}
      <AnimatePresence mode="wait">
        <QuizQuestion
          key={currentQuestion.id || currentQuestion._id || currentQuestionIndex}
          question={currentQuestion}
          questionNumber={currentQuestionIndex + 1}
          totalQuestions={quiz.questions.length}
          selectedAnswer={answers[currentQuestionIndex]}
          onSelectAnswer={handleAnswerSelect}
          showCorrectAnswer={isSubmitted}
          timeRemaining={timeRemaining}
        />
      </AnimatePresence>

      {/* Navigation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="flex items-center justify-between"
      >
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentQuestionIndex === 0}
        >
          Previous
        </Button>

        <div className="flex items-center gap-2 flex-wrap max-w-[50%] justify-center">
          {quiz.questions.map((_: any, index: number) => (
            <button
              key={index}
              onClick={() => setCurrentQuestionIndex(index)}
              className={`w-8 h-8 rounded-full text-sm font-medium transition-colors ${index === currentQuestionIndex
                ? 'bg-primary text-primary-foreground'
                : answers[index] !== null
                  ? 'bg-primary/20 text-primary'
                  : 'bg-muted text-muted-foreground'
                }`}
            >
              {index + 1}
            </button>
          ))}
        </div>

        {currentQuestionIndex < quiz.questions.length - 1 ? (
          <Button onClick={handleNext}>Next</Button>
        ) : (
          !isSubmitted ? (
            <Button
              onClick={handleSubmit}
              disabled={answeredCount < quiz.questions.length}
            >
              Submit Quiz
            </Button>
          ) : (
            <Button onClick={() => navigate(`/student/courses/${quiz.courseId}/lessons/start`)}>
              Finish Review
            </Button>
          )
        )}
      </motion.div>

      {/* Results Dialog */}
      <Dialog open={showResults} onOpenChange={setShowResults}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl">
              {score >= quiz.passingScore ? (
                <span className="flex items-center justify-center gap-2 text-green-600">
                  <Trophy className="h-8 w-8" />
                  Congratulations!
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2 text-amber-600">
                  <AlertCircle className="h-8 w-8" />
                  Keep Trying!
                </span>
              )}
            </DialogTitle>
            <DialogDescription className="text-center">
              You scored {score}% on this quiz
            </DialogDescription>
          </DialogHeader>

          <div className="py-6">
            <div className="flex items-center justify-center mb-6">
              <div className={`w-32 h-32 rounded-full flex items-center justify-center ${score >= quiz.passingScore
                ? 'bg-green-100 dark:bg-green-900'
                : 'bg-amber-100 dark:bg-amber-900'
                }`}>
                <span className={`text-4xl font-bold ${score >= quiz.passingScore
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-amber-600 dark:text-amber-400'
                  }`}>
                  {score}%
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                <span className="text-sm">Passing Score</span>
                <span className="font-medium">{quiz.passingScore}%</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                <span className="text-sm">Correct Answers</span>
                <span className="font-medium">
                  {answers.filter((a, i) => a === quiz.questions[i].correctAnswer).length} / {quiz.questions.length}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                <span className="text-sm">Time Taken</span>
                <span className="font-medium">
                  {formatTime(quiz.timeLimit * 60 - timeRemaining)}
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            {!isReviewMode && (
              <Button variant="outline" className="flex-1" onClick={handleRetry}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Retry Quiz
              </Button>
            )}
            <Button variant="secondary" className="flex-1 border" onClick={() => setShowResults(false)}>
              Review Answers
            </Button>
            <Button className="flex-1" onClick={() => navigate(`/student/courses/${quiz.courseId}/lessons/start`)}>
              Continue
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
