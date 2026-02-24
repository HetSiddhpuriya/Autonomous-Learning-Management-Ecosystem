import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import {
  ArrowLeft,
  Plus,
  X,
  CheckCircle2,
  Loader2,
  Image as ImageIcon,
} from 'lucide-react';

export function CreateCoursePage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [courseData, setCourseData] = useState({
    title: '',
    description: '',
    category: '',
    customCategory: '',
    difficulty: '',
    skillTags: [] as string[],
    newTag: '',
    thumbnail: '',
    price: '',
    duration: '',
    durationUnit: 'minutes',
  });

  const categories = [
    'Data Science',
    'Web Development',
    'Mobile Development',
    'Cloud Computing',
    'Design',
    'Business',
    'Marketing',
  ];

  const difficulties = [
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' },
  ];

  const handleAddTag = () => {
    if (courseData.newTag.trim() && !courseData.skillTags.includes(courseData.newTag.trim())) {
      setCourseData(prev => ({
        ...prev,
        skillTags: [...prev.skillTags, prev.newTag.trim()],
        newTag: '',
      }));
    }
  };

  const handleRemoveTag = (tag: string) => {
    setCourseData(prev => ({
      ...prev,
      skillTags: prev.skillTags.filter(t => t !== tag),
    }));
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('File size must be less than 2MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setCourseData(prev => ({ ...prev, thumbnail: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      let calculatedDuration = Number(courseData.duration) || 0;
      if (courseData.durationUnit === 'hours') calculatedDuration *= 60;
      else if (courseData.durationUnit === 'months') calculatedDuration *= 30 * 24 * 60; // 30 days scale

      const payload = {
        title: courseData.title,
        description: courseData.description,
        category: courseData.category === 'other' ? courseData.customCategory : courseData.category,
        difficulty: courseData.difficulty,
        skillTags: courseData.skillTags, // Fix: Changed tags to skillTags as defined in model/schema
        thumbnail: courseData.thumbnail,
        price: Number(courseData.price) || 0,
        duration: calculatedDuration,
        isPublished: false,
      };
      await api.post('/courses', payload);
      toast.success('Course submitted to admin for review!');
      navigate('/instructor/lessons');
    } catch (error) {
      toast.error('Failed to create course');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return courseData.title.trim() && courseData.description.trim();
      case 2:
        const hasValidCategory = courseData.category === 'other' ? courseData.customCategory.trim() !== '' : courseData.category !== '';
        return hasValidCategory && courseData.difficulty !== '';
      case 3:
        return courseData.skillTags.length > 0 && courseData.price.trim() !== '' && courseData.duration.trim() !== '';
      default:
        return true;
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Course Title *</Label>
              <Input
                id="title"
                placeholder="e.g., Advanced Machine Learning"
                value={courseData.title}
                onChange={(e) => setCourseData(prev => ({ ...prev, title: e.target.value }))}
              />
              <p className="text-sm text-muted-foreground">
                Choose a clear, descriptive title for your course
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                placeholder="Describe what students will learn..."
                rows={6}
                value={courseData.description}
                onChange={(e) => setCourseData(prev => ({ ...prev, description: e.target.value }))}
              />
              <p className="text-sm text-muted-foreground">
                Minimum 100 characters. Be specific about learning outcomes.
              </p>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>Category *</Label>
              <Select
                value={courseData.category}
                onValueChange={(value) => setCourseData(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat.toLowerCase()}>{cat}</SelectItem>
                  ))}
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {courseData.category === 'other' && (
              <div className="space-y-2">
                <Label htmlFor="customCategory">Custom Category Name *</Label>
                <Input
                  id="customCategory"
                  placeholder="e.g., Personal Development"
                  value={courseData.customCategory}
                  onChange={(e) => setCourseData(prev => ({ ...prev, customCategory: e.target.value }))}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label>Difficulty Level *</Label>
              <Select
                value={courseData.difficulty}
                onValueChange={(value) => setCourseData(prev => ({ ...prev, difficulty: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent>
                  {difficulties.map(diff => (
                    <SelectItem key={diff.value} value={diff.value}>{diff.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Course Thumbnail</Label>
              <input
                type="file"
                id="thumbnail-upload"
                className="hidden"
                accept="image/jpeg, image/png, image/gif"
                onChange={handlePhotoChange}
              />
              <div
                className="border-2 border-dashed rounded-lg overflow-hidden text-center hover:bg-muted/50 transition-colors cursor-pointer"
                onClick={() => document.getElementById('thumbnail-upload')?.click()}
              >
                {courseData.thumbnail ? (
                  <img src={courseData.thumbnail} alt="Thumbnail preview" className="w-full h-48 object-cover" />
                ) : (
                  <div className="p-8">
                    <ImageIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-sm font-medium mb-1">Click to upload or drag and drop</p>
                    <p className="text-xs text-muted-foreground">
                      PNG, JPG or GIF (max. 2MB)
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>Skill Tags *</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Add a skill tag (e.g., Python, React)"
                  value={courseData.newTag}
                  onChange={(e) => setCourseData(prev => ({ ...prev, newTag: e.target.value }))}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                />
                <Button type="button" onClick={handleAddTag}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Add at least 3 skills students will learn
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {courseData.skillTags.map(tag => (
                <Badge key={tag} variant="secondary" className="px-3 py-1">
                  {tag}
                  <button
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-2 hover:text-red-500"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>

            {courseData.skillTags.length < 3 && (
              <p className="text-sm text-amber-600">
                Add {3 - courseData.skillTags.length} more tag(s)
              </p>
            )}

            <div className="pt-4 mt-2 border-t space-y-2">
              <Label htmlFor="price">Course Price (₹) *</Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00 (Leave 0 for free)"
                value={courseData.price}
                onChange={(e) => setCourseData(prev => ({ ...prev, price: e.target.value }))}
              />
              <p className="text-sm text-muted-foreground">
                Set to 0 if the course is free
              </p>
            </div>

            <div className="pt-4 mt-2 border-t space-y-2">
              <Label htmlFor="duration">Course Duration *</Label>
              <div className="flex gap-2">
                <Input
                  id="duration"
                  type="number"
                  min="1"
                  placeholder="e.g., 120"
                  value={courseData.duration}
                  onChange={(e) => setCourseData(prev => ({ ...prev, duration: e.target.value }))}
                  className="flex-1"
                />
                <Select
                  value={courseData.durationUnit}
                  onValueChange={(value) => setCourseData(prev => ({ ...prev, durationUnit: value }))}
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="minutes">Minutes</SelectItem>
                    <SelectItem value="hours">Hours</SelectItem>
                    <SelectItem value="months">Months</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <p className="text-sm text-muted-foreground">
                Estimated total time for completion
              </p>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="bg-muted rounded-lg p-6">
              <h3 className="font-semibold mb-4">Course Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Title</span>
                  <span className="font-medium">{courseData.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Category</span>
                  <span className="font-medium capitalize">{courseData.category === 'other' ? courseData.customCategory : courseData.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Price</span>
                  <span className="font-medium">{Number(courseData.price) === 0 ? 'Free' : `₹${Number(courseData.price).toLocaleString('en-IN')}`}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Duration</span>
                  <span className="font-medium capitalize">{courseData.duration} {courseData.durationUnit}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Difficulty</span>
                  <span className="font-medium capitalize">{courseData.difficulty}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Skills</span>
                  <span className="font-medium">{courseData.skillTags.length} tags</span>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <CheckCircle2 className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <p className="font-medium text-blue-900 dark:text-blue-100">Ready to Submit?</p>
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  After you submit, an admin will review your course. You can still add lessons while it's pending.
                </p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Button variant="ghost" size="sm" onClick={() => navigate('/instructor')} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Dashboard
        </Button>
        <h1 className="text-3xl font-bold">Create New Course</h1>
        <p className="text-muted-foreground mt-1">
          Share your knowledge with learners worldwide
        </p>
      </motion.div>

      {/* Progress */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Step {step} of 4</span>
          <span className="text-sm text-muted-foreground">{step * 25}%</span>
        </div>
        <Progress value={step * 25} className="h-2" />
      </motion.div>

      {/* Form Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>
              {step === 1 && 'Basic Information'}
              {step === 2 && 'Category & Level'}
              {step === 3 && 'Skills & Tags'}
              {step === 4 && 'Review & Submit'}
            </CardTitle>
            <CardDescription>
              {step === 1 && 'Start with the fundamentals of your course'}
              {step === 2 && 'Categorize your course for better discovery'}
              {step === 3 && 'Help students understand what they will learn'}
              {step === 4 && 'Review your course details before submitting'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {renderStep()}

            <div className="flex justify-between mt-8">
              <Button
                variant="outline"
                onClick={() => setStep(prev => prev - 1)}
                disabled={step === 1}
              >
                Previous
              </Button>
              {step < 4 ? (
                <Button
                  onClick={() => setStep(prev => prev + 1)}
                  disabled={!canProceed()}
                >
                  Next
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Submit for Review
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
