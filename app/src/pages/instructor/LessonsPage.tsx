import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useSearchParams } from 'react-router-dom';
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
  Upload,
} from 'lucide-react';

export function LessonsPage() {
  const [searchParams] = useSearchParams();
  const urlCourseId = searchParams.get('courseId');

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('c1');
  const [selectedModule, setSelectedModule] = useState('All Modules');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAddModuleModal, setShowAddModuleModal] = useState(false);
  const [newModuleName, setNewModuleName] = useState('');
  const [moduleError, setModuleError] = useState('');

  const [myCourses, setMyCourses] = useState<any[]>([]);
  const [lessons, setLessons] = useState<any[]>([]);
  const [modules, setModules] = useState<{ id: string, name: string }[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lessonFormData, setLessonFormData] = useState({
    title: '',
    description: '',
    module: '',
    videoUrl: '',
    duration: 0,
  });
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null);
  const [lessonModuleError, setLessonModuleError] = useState('');
  const [draggedLessonId, setDraggedLessonId] = useState<string | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [selectedVideoUrl, setSelectedVideoUrl] = useState('');
  const [selectedLessonTitle, setSelectedLessonTitle] = useState('');

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const { data } = await api.get('/courses/all');
        setMyCourses(data);
        if (data.length > 0) {
          if (urlCourseId && data.some((c: any) => (c._id || c.id) === urlCourseId)) {
            setSelectedCourse(urlCourseId);
          } else {
            setSelectedCourse(data[0]._id || data[0].id);
          }
        }
      } catch (error) {
        console.error('Failed to fetch courses:', error);
      }
    };
    fetchCourses();
  }, [urlCourseId]);

  useEffect(() => {
    if (!selectedCourse) return;
    const fetchLessonsAndModules = async () => {
      try {
        const [lessonsRes, modulesRes] = await Promise.all([
          api.get(`/lessons?courseId=${selectedCourse}`),
          api.get(`/modules?courseId=${selectedCourse}`)
        ]);

        setLessons(lessonsRes.data);

        const fetchedModules = modulesRes.data.map((m: any) => ({ id: m.id || m._id, name: m.name }));
        setModules(fetchedModules);

        if (fetchedModules.length > 0) {
          setSelectedModule(fetchedModules[0].name);
        } else {
          setSelectedModule('All Modules');
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      }
    };
    fetchLessonsAndModules();
  }, [selectedCourse]);

  const handleSubmitLesson = async () => {
    if (!lessonFormData.title) {
      toast.error('Title is required');
      return;
    }
    if (!lessonFormData.module) {
      setLessonModuleError('Module selection is required');
      return;
    }
    setIsSubmitting(true);
    setUploadProgress(0);
    try {
      let finalVideoUrl = lessonFormData.videoUrl;
      let calculatedDuration = 0;

      // Extract duration from video file if present
      if (videoFile) {
        calculatedDuration = await new Promise<number>((resolve) => {
          const video = document.createElement('video');
          video.preload = 'metadata';
          video.onloadedmetadata = () => {
            window.URL.revokeObjectURL(video.src);
            resolve(Math.round(video.duration / 60) || 1); // Ensure at least 1m
          };
          video.onerror = () => resolve(1);
          video.src = URL.createObjectURL(videoFile);
        });
      } else if (lessonFormData.videoUrl && isYoutubeUrl(lessonFormData.videoUrl)) {
        // For YouTube, we'd ideally use the API, but for now we'll simulate or use a default
        // since we can't easily get duration from just a URL without an API key
        calculatedDuration = 10; // Default YouTube duration if not specified
      }

      // Check if there is a file to upload
      if (videoFile) {
        const formData = new FormData();
        formData.append('video', videoFile);

        const uploadRes = await api.post('/upload', formData, {
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
            setUploadProgress(percentCompleted);
          },
        });

        // Use the returned URL and prepend backend URL if necessary
        // In this case, since the backend serves it at /uploads, we can prepend process.env server url or just keep the relative path if the frontend handles it, but usually absolute URL or full URL is better. Let's assume the API URL is known.
        // Or simply store the returned relative path /uploads/...
        finalVideoUrl = `http://localhost:5000${uploadRes.data.url}`;
      }

      if (editingLessonId) {
        const payload: any = {
          title: lessonFormData.title,
          description: lessonFormData.description,
          module: lessonFormData.module,
          videoUrl: finalVideoUrl,
          duration: Number(lessonFormData.duration) || calculatedDuration || 1,
        };
        const { data } = await api.patch(`/lessons/${editingLessonId}`, payload);
        setLessons(lessons.map(l => (l._id || l.id) === editingLessonId ? data : l));
        toast.success('Lesson updated successfully');
      } else {
        const payload = {
          title: lessonFormData.title,
          description: lessonFormData.description,
          module: lessonFormData.module,
          videoUrl: finalVideoUrl,
          courseId: selectedCourse,
          duration: Number(lessonFormData.duration) || calculatedDuration || 1,
          order: lessons.length + 1,
          resources: []
        };
        const { data } = await api.post('/lessons', payload);
        setLessons([...lessons, data]);
        toast.success('Lesson added successfully');
      }
      setLessonFormData({ title: '', description: '', module: '', videoUrl: '', duration: 0 });
      setVideoFile(null);
      setUploadProgress(0);
      setShowAddModal(false);
      setEditingLessonId(null);
    } catch (error) {
      toast.error(editingLessonId ? 'Failed to update lesson' : 'Failed to add lesson');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteLesson = async (lessonId: string) => {
    if (!window.confirm('Are you sure you want to delete this lesson?')) return;
    try {
      await api.delete(`/lessons/${lessonId}`);
      setLessons(lessons.filter(l => (l._id || l.id) !== lessonId));
      toast.success('Lesson deleted successfully');
    } catch (error) {
      toast.error('Failed to delete lesson');
      console.error(error);
    }
  };

  const openEditModal = (lesson: any) => {
    setLessonFormData({
      title: lesson.title,
      description: lesson.description || '',
      module: lesson.module,
      videoUrl: lesson.videoUrl || '',
      duration: lesson.duration || 0,
    });
    setVideoFile(null);
    setUploadProgress(0);
    setEditingLessonId(lesson._id || lesson.id);
    setShowAddModal(true);
    setLessonModuleError('');
  };

  const handlePlayVideo = (lesson: any) => {
    if (!lesson.videoUrl) {
      toast.error('No video URL provided for this lesson');
      return;
    }
    setSelectedVideoUrl(lesson.videoUrl);
    setSelectedLessonTitle(lesson.title);
    setShowVideoModal(true);
  };

  const getEmbedUrl = (url: string) => {
    if (url.includes('youtube.com/watch?v=')) {
      return url.replace('watch?v=', 'embed/');
    }
    if (url.includes('youtu.be/')) {
      return url.replace('youtu.be/', 'youtube.com/embed/');
    }
    return url;
  };

  const isYoutubeUrl = (url: string) => {
    return url.includes('youtube.com') || url.includes('youtu.be');
  };

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', id);
    setDraggedLessonId(id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedLessonId || draggedLessonId === targetId) {
      setDraggedLessonId(null);
      return;
    }

    if (searchQuery) {
      toast.info('Cannot reorder while searching');
      setDraggedLessonId(null);
      return;
    }

    const draggedIndex = lessons.findIndex(l => (l._id || l.id) === draggedLessonId);
    const targetIndex = lessons.findIndex(l => (l._id || l.id) === targetId);

    if (draggedIndex === -1 || targetIndex === -1) {
      setDraggedLessonId(null);
      return;
    }

    const newLessons = [...lessons];
    const [draggedItem] = newLessons.splice(draggedIndex, 1);

    // Automatically switch module if dropped into a different module
    const targetItem = lessons[targetIndex];
    if (draggedItem.module !== targetItem.module) {
      draggedItem.module = targetItem.module;
    }

    newLessons.splice(targetIndex, 0, draggedItem);

    // Recalculate global order sequentially
    const updatedLessons = newLessons.map((l, index) => ({
      ...l,
      order: index + 1
    }));

    setLessons(updatedLessons);
    setDraggedLessonId(null);

    // Persist to backend
    try {
      const updates = updatedLessons.map(l => ({
        id: l._id || l.id,
        order: l.order,
        module: l.module
      }));
      await api.put('/lessons/reorder', { updates });
    } catch (error) {
      toast.error('Failed to save order');
      console.error(error);
    }
  };

  const handleAddModule = async () => {
    const trimmedName = newModuleName.trim();
    if (!trimmedName) {
      setModuleError('Module name cannot be empty');
      return;
    }
    setModuleError('');

    try {
      const payload = {
        name: trimmedName,
        courseId: selectedCourse
      };

      const { data } = await api.post('/modules', payload);

      const newModule = { id: data.id || data._id, name: data.name };

      setModules(prev => {
        const updatedModules = [...prev, newModule];
        if (updatedModules.length === 1) {
          setSelectedModule(newModule.name);
        }
        return updatedModules;
      });

      toast.success(`Module "${trimmedName}" created successfully!`);
      setNewModuleName('');
      setShowAddModuleModal(false);
    } catch (error) {
      toast.error('Failed to create module');
      console.error(error);
    }
  };

  const handleDeleteModule = async (moduleId: string, moduleName: string) => {
    if (!window.confirm(`Are you sure you want to delete the module "${moduleName}" and ALL its lessons? This action cannot be undone.`)) return;
    try {
      await api.delete(`/modules/${moduleId}`);
      setModules(modules.filter(m => m.id !== moduleId));
      setLessons(lessons.filter(l => l.module !== moduleName));
      if (selectedModule === moduleName) {
        setSelectedModule('All Modules');
      }
      toast.success('Module and its lessons deleted successfully');
    } catch (error) {
      toast.error('Failed to delete module');
      console.error(error);
    }
  };

  const course = myCourses.find(c => (c._id || c.id) === selectedCourse);

  const filteredLessons = lessons.filter(l => {
    const matchesSearch = l.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesModule = selectedModule === 'All Modules' || l.module === selectedModule;
    return matchesSearch && matchesModule;
  });

  const sortedModules = [...modules].sort((a, b) => {
    const aLessons = lessons.filter(l => l.module === a.name);
    const bLessons = lessons.filter(l => l.module === b.name);
    const aMin = aLessons.length ? Math.min(...aLessons.map(l => l.order)) : Infinity;
    const bMin = bLessons.length ? Math.min(...bLessons.map(l => l.order)) : Infinity;
    return aMin - bMin;
  });

  const modulesToRender = sortedModules.length > 0
    ? sortedModules.filter(m => selectedModule === 'All Modules' || m.name === selectedModule)
    : [{ id: 'uncategorized', name: 'Lessons' }];

  const formatDuration = (minutes: number) => {
    const totalMinutes = Math.max(1, Math.round(minutes)); // Ensure at least 1 minute
    if (totalMinutes < 60) return `${totalMinutes}m`;
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
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
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => setShowAddModuleModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Module
            </Button>
            <Button onClick={() => setShowAddModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Lesson
            </Button>
          </div>
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

      {/* Modules Pagination Bar */}
      {sortedModules.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="flex flex-wrap items-center gap-2 pb-2"
        >
          <Button
            variant={selectedModule === 'All Modules' ? 'default' : 'outline'}
            onClick={() => setSelectedModule('All Modules')}
            className="whitespace-nowrap rounded-full"
          >
            All Modules
          </Button>
          {sortedModules.map(module => (
            <Button
              key={module.id}
              variant={selectedModule === module.name ? 'default' : 'outline'}
              onClick={() => setSelectedModule(module.name)}
              className="whitespace-nowrap rounded-full"
            >
              {module.name}
            </Button>
          ))}
        </motion.div>
      )}

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
                {lessons.length} lessons • {formatDuration(lessons.reduce((acc, l) => acc + (Number(l.duration) || 0), 0))}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {modulesToRender.map((mod) => {
                const modLessons = filteredLessons.filter((l) =>
                  modulesToRender.length === 0 ? true : l.module === mod.name
                );

                return (
                  <div key={mod.id} className="space-y-4">
                    <div className="flex items-center justify-between border-b pb-2">
                      <h3 className="text-lg font-semibold">{mod.name}</h3>
                      {mod.id !== 'uncategorized' && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                          onClick={() => handleDeleteModule(mod.id, mod.name)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <div className="space-y-2">
                      {modLessons.length > 0 ? (
                        modLessons.map((lesson, index) => (
                          <motion.div
                            key={lesson._id || lesson.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                            draggable={!searchQuery}
                            onDragStart={(e) => handleDragStart(e as unknown as React.DragEvent, lesson._id || lesson.id)}
                            onDragOver={handleDragOver as unknown as React.DragEventHandler}
                            onDrop={(e) => handleDrop(e as unknown as React.DragEvent, lesson._id || lesson.id)}
                            className={`flex items-center gap-4 p-4 rounded-lg border hover:bg-muted transition-colors group ${draggedLessonId === (lesson._id || lesson.id) ? 'opacity-50 border-dashed' : ''}`}
                          >
                            <div className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground">
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
                              <Button variant="ghost" size="icon" onClick={() => handlePlayVideo(lesson)}>
                                <Play className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => openEditModal(lesson)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600" onClick={() => handleDeleteLesson(lesson._id || lesson.id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </motion.div>
                        ))
                      ) : (
                        <div className="text-center py-6 border rounded-lg bg-muted/20">
                          <p className="text-muted-foreground">No lessons in this module</p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Add/Edit Lesson Modal */}
      <Dialog open={showAddModal} onOpenChange={(open) => {
        setShowAddModal(open);
        if (!open) {
          setLessonFormData({ title: '', description: '', module: '', videoUrl: '', duration: 0 });
          setVideoFile(null);
          setUploadProgress(0);
          setEditingLessonId(null);
          setLessonModuleError('');
        }
      }}>
        <DialogContent className="max-w-lg sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>{editingLessonId ? 'Edit Lesson' : 'Add New Lesson'}</DialogTitle>
            <DialogDescription>
              {editingLessonId ? 'Update lesson details' : `Create a new lesson for ${course?.title}`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto px-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Lesson Title</label>
              <Input
                placeholder="Enter lesson title"
                value={lessonFormData.title}
                onChange={(e) => setLessonFormData(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <textarea
                className="w-full p-3 rounded-lg border resize-none"
                rows={3}
                placeholder="Brief description of the lesson"
                value={lessonFormData.description}
                onChange={(e) => setLessonFormData(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Module Section <span className="text-red-500">*</span></label>
              <select
                className={`w-full px-4 py-2 rounded-lg border bg-background ${lessonModuleError ? 'border-red-500' : ''}`}
                value={lessonFormData.module}
                onChange={(e) => {
                  setLessonFormData(prev => ({ ...prev, module: e.target.value }));
                  if (lessonModuleError) setLessonModuleError('');
                }}
              >
                <option value="" disabled>Select a module</option>
                {sortedModules.map(m => (
                  <option key={m.id} value={m.name}>{m.name}</option>
                ))}
              </select>
              {lessonModuleError && <p className="text-sm text-red-500">{lessonModuleError}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Video Duration (Minutes)</label>
              <Input
                type="number"
                min="0"
                placeholder="Enter duration in minutes"
                value={lessonFormData.duration || ''}
                onChange={(e) => setLessonFormData(prev => ({ ...prev, duration: parseInt(e.target.value) || 0 }))}
              />
            </div>
            <div className="space-y-4 border p-4 rounded-lg bg-muted/20">
              <label className="text-sm font-medium">Video Source</label>

              <div className="space-y-2">
                <label className="text-xs text-muted-foreground">Upload local video</label>
                <div className="flex items-center gap-2">
                  <Input
                    type="file"
                    accept="video/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        setVideoFile(e.target.files[0]);
                        // Clear the URL field when a file is selected
                        setLessonFormData(prev => ({ ...prev, videoUrl: '' }));
                      }
                    }}
                  />
                  {videoFile && (
                    <Button variant="ghost" size="icon" onClick={() => setVideoFile(null)} className="flex-shrink-0 text-red-500 hover:text-red-700">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                {uploadProgress > 0 && isSubmitting && (
                  <div className="w-full bg-secondary rounded-full h-2 mt-2">
                    <div className="bg-primary h-2 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
                  </div>
                )}
              </div>

              <div className="relative flex items-center py-2">
                <div className="flex-grow border-t"></div>
                <span className="flex-shrink-0 mx-4 text-xs text-muted-foreground uppercase">or enter URL</span>
                <div className="flex-grow border-t"></div>
              </div>

              <div className="space-y-2">
                <label className="text-xs text-muted-foreground">Video URL (e.g., YouTube, Vimeo)</label>
                <Input
                  placeholder="Enter video URL"
                  value={lessonFormData.videoUrl}
                  disabled={!!videoFile}
                  onChange={(e) => setLessonFormData(prev => ({ ...prev, videoUrl: e.target.value }))}
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t mt-2">
            <Button variant="outline" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmitLesson} disabled={isSubmitting}>
              <CheckCircle2 className="h-4 w-4 mr-2" />
              {editingLessonId ? 'Save Changes' : 'Add Lesson'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Module Modal */}
      <Dialog open={showAddModuleModal} onOpenChange={(open) => {
        setShowAddModuleModal(open);
        if (!open) {
          setModuleError('');
          setNewModuleName('');
        }
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Module</DialogTitle>
            <DialogDescription>
              Create a new module section for {course?.title}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Module Name</label>
              <Input
                autoFocus
                placeholder="Enter module name"
                value={newModuleName}
                onChange={(e) => {
                  setNewModuleName(e.target.value);
                  if (moduleError) setModuleError('');
                }}
                className={moduleError ? "border-red-500" : ""}
              />
              {moduleError && <p className="text-sm text-red-500">{moduleError}</p>}
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowAddModuleModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddModule}>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Add Module
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Video Player Modal */}
      <Dialog open={showVideoModal} onOpenChange={setShowVideoModal}>
        <DialogContent className="max-w-[1200px] w-[90vw] p-0 overflow-hidden bg-black border-none">
          <DialogHeader className="p-4 bg-background border-b flex flex-row items-center justify-between">
            <div>
              <DialogTitle className="text-lg font-semibold">{selectedLessonTitle}</DialogTitle>
              <DialogDescription className="text-xs">
                Playing lesson video
              </DialogDescription>
            </div>
          </DialogHeader>
          <div className="aspect-video w-full">
            {isYoutubeUrl(selectedVideoUrl) ? (
              <iframe
                src={getEmbedUrl(selectedVideoUrl)}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            ) : (
              <video
                src={selectedVideoUrl}
                controls
                autoPlay
                className="w-full h-full"
              >
                Your browser does not support the video tag.
              </video>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div >
  );
}
