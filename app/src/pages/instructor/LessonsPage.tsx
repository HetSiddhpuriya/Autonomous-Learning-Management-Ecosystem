import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import api from '@/lib/api';
import { toast } from 'sonner';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  MoreVertical,
  Play,
  GripVertical,
  Clock,
  FileText,
  CheckCircle2,
} from 'lucide-react';

export function LessonsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('c1');
  const [showAddModal, setShowAddModal] = useState(false);

  const [myCourses, setMyCourses] = useState<any[]>([]);
  const [lessons, setLessons] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newLessonData, setNewLessonData] = useState({
    title: '',
    description: '',
    videoUrl: '',
  });

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const { data } = await api.get('/courses/all');
        setMyCourses(data);
        if (data.length > 0) {
          setSelectedCourse(data[0]._id || data[0].id);
        }
      } catch (error) {
        console.error('Failed to fetch courses:', error);
      }
    };
    fetchCourses();
  }, []);

  useEffect(() => {
    if (!selectedCourse) return;
    const fetchLessons = async () => {
      try {
        const { data } = await api.get(`/lessons?courseId=${selectedCourse}`);
        setLessons(data);
      } catch (error) {
        console.error('Failed to fetch lessons:', error);
      }
    };
    fetchLessons();
  }, [selectedCourse]);

  const handleAddLesson = async () => {
    if (!newLessonData.title) {
      toast.error('Title is required');
      return;
    }
    setIsSubmitting(true);
    try {
      const payload = {
        title: newLessonData.title,
        description: newLessonData.description,
        videoUrl: newLessonData.videoUrl,
        courseId: selectedCourse,
        duration: 15, // Dummy for now
        order: lessons.length + 1,
        resources: []
      };
      const { data } = await api.post('/lessons', payload);
      setLessons([...lessons, data]);
      setNewLessonData({ title: '', description: '', videoUrl: '' });
      setShowAddModal(false);
      toast.success('Lesson added successfully');
    } catch (error) {
      toast.error('Failed to add lesson');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const course = myCourses.find(c => (c._id || c.id) === selectedCourse);

  const filteredLessons = lessons.filter(l =>
    l.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
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
            <h1 className="text-3xl font-bold">Lesson Manager</h1>
            <p className="text-muted-foreground mt-1">
              Organize and manage your course content
            </p>
          </div>
          <Button onClick={() => setShowAddModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Lesson
          </Button>
        </div>
      </motion.div>

      {/* Course Selector & Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="flex flex-col sm:flex-row gap-4"
      >
        <select
          value={selectedCourse}
          onChange={(e) => setSelectedCourse(e.target.value)}
          className="px-4 py-2 rounded-lg border bg-background"
        >
          {myCourses.map(course => (
            <option key={course._id || course.id} value={course._id || course.id}>{course.title}</option>
          ))}
        </select>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search lessons..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </motion.div>

      {/* Lessons List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{course?.title} - Lessons</CardTitle>
              <Badge variant="outline">
                {lessons.length} lessons • {formatDuration(lessons.reduce((acc, l) => acc + l.duration, 0))}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {filteredLessons.map((lesson, index) => (
                <motion.div
                  key={lesson._id || lesson.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="flex items-center gap-4 p-4 rounded-lg border hover:bg-muted transition-colors group"
                >
                  <div className="cursor-move text-muted-foreground hover:text-foreground">
                    <GripVertical className="h-5 w-5" />
                  </div>
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                    {lesson.order}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">{lesson.title}</h4>
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {lesson.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {formatDuration(lesson.duration)}
                    </span>
                    <span className="flex items-center gap-1">
                      <FileText className="h-4 w-4" />
                      {lesson.resources?.length || 0}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon">
                      <Play className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </motion.div>
              ))}
              {filteredLessons.length === 0 && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground">No lessons found</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Add Lesson Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add New Lesson</DialogTitle>
            <DialogDescription>
              Create a new lesson for {course?.title}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Lesson Title</label>
              <Input
                placeholder="Enter lesson title"
                value={newLessonData.title}
                onChange={(e) => setNewLessonData(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <textarea
                className="w-full p-3 rounded-lg border resize-none"
                rows={3}
                placeholder="Brief description of the lesson"
                value={newLessonData.description}
                onChange={(e) => setNewLessonData(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Video URL</label>
              <Input
                placeholder="Enter video URL"
                value={newLessonData.videoUrl}
                onChange={(e) => setNewLessonData(prev => ({ ...prev, videoUrl: e.target.value }))}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowAddModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddLesson} disabled={isSubmitting}>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Add Lesson
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
