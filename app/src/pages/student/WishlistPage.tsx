import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CourseCard } from '@/components/common/CourseCard';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import api from '@/lib/api';
import { toast } from 'sonner';
import type { Course } from '@/types';

export function WishlistPage() {
    const [wishlist, setWishlist] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchWishlist();
    }, []);

    const fetchWishlist = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/users/wishlist/my');
            setWishlist(data);
        } catch {
            toast.error('Failed to load wishlist');
        } finally {
            setLoading(false);
        }
    };

    const handleContinue = (courseId: string) => {
        navigate(`/courses/${courseId}`);
    };

    return (
        <div className="space-y-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="flex items-center gap-3"
            >
                <div className="p-3 bg-rose-100 text-rose-600 rounded-xl">
                    <Heart className="h-6 w-6 fill-current" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">My Wishlist</h1>
                    <p className="text-muted-foreground mt-1">
                        Courses you've saved for later
                    </p>
                </div>
            </motion.div>

            {loading ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-[350px] bg-muted/40 animate-pulse rounded-2xl border border-muted-foreground/10"></div>
                    ))}
                </div>
            ) : wishlist.length > 0 ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {wishlist.map((course, index) => (
                        <CourseCard
                            key={course.id}
                            course={course}
                            onEnroll={() => handleContinue(course.id)}
                            showActions
                            delay={index * 0.1}
                        />
                    ))}
                </div>
            ) : (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-24 bg-card rounded-3xl border shadow-sm"
                >
                    <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Heart className="h-10 w-10 text-rose-300" />
                    </div>
                    <h3 className="text-2xl font-semibold mb-2">Your wishlist is empty</h3>
                    <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                        Explore our catalog and find courses you'd like to learn in the future.
                    </p>
                    <Button
                        size="lg"
                        className="rounded-full px-8"
                        onClick={() => navigate('/courses')}
                    >
                        Browse Courses
                    </Button>
                </motion.div>
            )}
        </div>
    );
}
