import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import api from '@/lib/api';
import { toast } from 'sonner';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Filter,
  CheckCircle2,
  XCircle,
  MoreVertical,
  BookOpen,
} from 'lucide-react';

export function QuestionBankPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [difficultyFilter, setDifficultyFilter] = useState('all');

  const [myCourses, setMyCourses] = useState<any[]>([]);
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newQuestionData, setNewQuestionData] = useState({
    courseId: '',
    difficulty: 'medium',
    question: '',
    options: ['', '', '', ''],
    correctAnswer: 0,
    skillMapped: '',
    explanation: ''
  });

  useEffect(() => {
    const fetchCoursesAndQuizzes = async () => {
      try {
        const [coursesRes, quizzesRes] = await Promise.all([
          api.get('/courses/all'),
          api.get('/quizzes') // Note: In production you might want to filter this by instructor's courses backend
        ]);
        setMyCourses(coursesRes.data);
        setQuizzes(quizzesRes.data);
      } catch (err) {
        console.error('Failed to fetch data', err);
      }
    };
    fetchCoursesAndQuizzes();
  }, []);

  const allQuestions = quizzes.flatMap(q =>
    (q.questions || []).map((question: any) => ({
      ...question,
      quizId: q._id || q.id,
      courseId: q.courseId,
    }))
  );

  const filteredQuestions = allQuestions.filter(q => {
    const matchesSearch = q.question.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCourse = selectedCourse === 'all' || q.courseId === selectedCourse;
    const matchesDifficulty = difficultyFilter === 'all' || q.difficulty === difficultyFilter;
    return matchesSearch && matchesCourse && matchesDifficulty;
  });

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
            <h1 className="text-3xl font-bold">Question Bank</h1>
            <p className="text-muted-foreground mt-1">
              Manage quiz questions for your courses
            </p>
          </div>
          <Button onClick={() => setShowAddModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Question
          </Button>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="flex flex-col sm:flex-row gap-4"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search questions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedCourse} onValueChange={setSelectedCourse}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="All Courses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Courses</SelectItem>
            {myCourses.map(course => (
              <SelectItem key={course._id || course.id} value={course._id || course.id}>{course.title}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
          <SelectTrigger className="w-[150px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Difficulty" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Levels</SelectItem>
            <SelectItem value="easy">Easy</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="hard">Hard</SelectItem>
          </SelectContent>
        </Select>
      </motion.div>

      {/* Questions List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>All Questions</CardTitle>
              <Badge variant="outline">{filteredQuestions.length} questions</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredQuestions.map((question, index) => (
                <motion.div
                  key={question._id || question.id || index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="p-4 rounded-lg border hover:bg-muted transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={getDifficultyColor(question.difficulty)}>
                          {question.difficulty}
                        </Badge>
                        <Badge variant="outline">{question.skillMapped}</Badge>
                      </div>
                      <p className="font-medium mb-3">{question.question}</p>
                      <div className="grid sm:grid-cols-2 gap-2">
                        {(question.options || []).map((option: string, optIndex: number) => (
                          <div
                            key={optIndex}
                            className={`flex items-center gap-2 p-2 rounded text-sm ${optIndex === question.correctAnswer
                              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                              : 'bg-muted'
                              }`}
                          >
                            {optIndex === question.correctAnswer ? (
                              <CheckCircle2 className="h-4 w-4" />
                            ) : (
                              <XCircle className="h-4 w-4 text-muted-foreground" />
                            )}
                            {option}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-red-500">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
              {filteredQuestions.length === 0 && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground">No questions found</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Add Question Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Question</DialogTitle>
            <DialogDescription>
              Create a new quiz question
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Question *</label>
              <textarea
                className="w-full p-3 rounded-lg border resize-none"
                rows={3}
                placeholder="Enter your question"
                value={newQuestionData.question}
                onChange={(e) => setNewQuestionData(prev => ({ ...prev, question: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Course *</label>
                <Select value={newQuestionData.courseId} onValueChange={(v) => setNewQuestionData(prev => ({ ...prev, courseId: v }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select course" />
                  </SelectTrigger>
                  <SelectContent>
                    {myCourses.map(course => (
                      <SelectItem key={course._id || course.id} value={course._id || course.id}>{course.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Difficulty *</label>
                <Select value={newQuestionData.difficulty} onValueChange={(v) => setNewQuestionData(prev => ({ ...prev, difficulty: v }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Skill Mapped</label>
              <Input
                placeholder="e.g., Machine Learning, React"
                value={newQuestionData.skillMapped}
                onChange={(e) => setNewQuestionData(prev => ({ ...prev, skillMapped: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Options *</label>
              <div className="space-y-2">
                {[0, 1, 2, 3].map((num) => (
                  <div key={num} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="correct"
                      className="w-4 h-4"
                      checked={newQuestionData.correctAnswer === num}
                      onChange={() => setNewQuestionData(prev => ({ ...prev, correctAnswer: num }))}
                    />
                    <Input
                      placeholder={`Option ${num + 1}`}
                      value={newQuestionData.options[num]}
                      onChange={(e) => {
                        const newOpts = [...newQuestionData.options];
                        newOpts[num] = e.target.value;
                        setNewQuestionData(prev => ({ ...prev, options: newOpts }));
                      }}
                    />
                  </div>
                ))}
              </div>
              <p className="text-sm text-muted-foreground">
                Select the radio button for the correct answer
              </p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Explanation</label>
              <textarea
                className="w-full p-3 rounded-lg border resize-none"
                rows={2}
                placeholder="Explain why the correct answer is right"
                value={newQuestionData.explanation}
                onChange={(e) => setNewQuestionData(prev => ({ ...prev, explanation: e.target.value }))}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowAddModal(false)}>
                Cancel
              </Button>
              <Button onClick={() => setShowAddModal(false)}>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Add Question
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
