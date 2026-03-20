import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, X, MessageSquare, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import api from '@/lib/api';
import type { Course } from '@/types';
import { cn } from '@/lib/utils';

interface RatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  course: Course | null;
  onSuccess?: (newRating: number) => void;
}

export function RatingModal({ isOpen, onClose, course, onSuccess }: RatingModalProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!course) return null;

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    try {
      setIsSubmitting(true);
      await api.post(`/courses/${course.id}/rating`, { rating });
      toast.success('Thank you for your rating!');
      if (onSuccess) onSuccess(rating);
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to submit rating');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                  <Star className="w-5 h-5 text-amber-600 dark:text-amber-400 fill-current" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Rate this Course</h3>
                  <p className="text-xs text-muted-foreground">Share your learning experience</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <div className="p-8 text-center">
              <div className="mb-6">
                <div className="w-20 h-20 rounded-2xl overflow-hidden mx-auto mb-4 border-2 border-slate-100 dark:border-slate-800">
                  <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                </div>
                <h4 className="font-semibold text-lg px-4">{course.title}</h4>
                <p className="text-sm text-muted-foreground mt-1">Instructor: {course.instructorName}</p>
              </div>

              <div className="flex items-center justify-center gap-2 mb-8">
                {[1, 2, 3, 4, 5].map((star) => (
                  <motion.button
                    key={star}
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(star)}
                    className="p-1"
                  >
                    <Star
                      className={cn(
                        "w-10 h-10 transition-colors duration-200",
                        (hoverRating || rating) >= star
                          ? "text-amber-500 fill-amber-500 shadow-amber-200"
                          : "text-slate-300 dark:text-slate-700"
                      )}
                    />
                  </motion.button>
                ))}
              </div>

              <p className="text-sm font-medium mb-8">
                {rating === 1 && "I didn't like it much 😞"}
                {rating === 2 && "It was okay 😐"}
                {rating === 3 && "Good course! 🙂"}
                {rating === 4 && "Great experience! 🌟"}
                {rating === 5 && "Absolutely amazing! 🔥"}
                {!rating && "Select a star to rate"}
              </p>

              <div className="flex flex-col gap-3">
                <Button 
                  size="lg" 
                  className="w-full rounded-xl shadow-lg shadow-primary/20 h-12"
                  onClick={handleSubmit}
                  disabled={rating === 0 || isSubmitting}
                >
                  {isSubmitting ? "Submitting..." : (
                    <>
                      Submit Rating
                      <Send className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full text-slate-500"
                  onClick={onClose}
                >
                  Maybe later
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
