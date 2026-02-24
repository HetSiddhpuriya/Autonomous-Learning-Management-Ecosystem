import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CourseCard } from '@/components/common/CourseCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Grid3X3, List, Filter } from 'lucide-react';
import api from '@/lib/api';
import { toast } from 'sonner';
import type { Course } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';

export function BrowseCoursesPage() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/courses');
            setCourses(data);
        } catch {
            toast.error('Failed to load courses');
        } finally {
            setLoading(false);
        }
    };

    const handleEnroll = async (courseId: string) => {
        navigate(`/courses/${courseId}`);
    };

    const filteredCourses = courses.filter((course) => {
        const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            course.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory ? course.category === selectedCategory : true;
        const matchesDifficulty = selectedDifficulty ? course.difficulty === selectedDifficulty : true;
        return matchesSearch && matchesCategory && matchesDifficulty;
    });

    const categories = Array.from(new Set(courses.map(c => c.category)));
    const difficulties = ['beginner', 'intermediate', 'advanced'];

    return (
        <div className="container px-6 py-12 mx-auto">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="mb-8"
            >
                <h1 className="text-4xl font-bold mb-2">Explore Courses</h1>
                <p className="text-muted-foreground text-lg">
                    Discover new skills, advance your career, and learn from industry experts.
                </p>
            </motion.div>

            {/* Search & Layout Actions */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="flex flex-col sm:flex-row gap-4 mb-6"
            >
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                        placeholder="Search for courses..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 h-14 text-lg bg-background shadow-sm border-muted-foreground/20 rounded-xl"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant={viewMode === 'grid' ? 'default' : 'outline'}
                        size="icon"
                        className="h-14 w-14 rounded-xl"
                        onClick={() => setViewMode('grid')}
                    >
                        <Grid3X3 className="h-6 w-6" />
                    </Button>
                    <Button
                        variant={viewMode === 'list' ? 'default' : 'outline'}
                        size="icon"
                        className="h-14 w-14 rounded-xl"
                        onClick={() => setViewMode('list')}
                    >
                        <List className="h-6 w-6" />
                    </Button>
                </div>
            </motion.div>

            {/* Filters (Categories and Difficulties) */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="flex flex-col md:flex-row gap-8 mb-10 bg-muted/20 p-6 rounded-2xl border border-muted-foreground/10"
            >
                {categories.length > 0 && (
                    <div className="flex-1">
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                            <Filter className="h-4 w-4" /> Categories
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            <Badge
                                variant={selectedCategory === null ? 'default' : 'secondary'}
                                className={`cursor-pointer text-sm px-4 py-1.5 transition-all ${selectedCategory === null ? 'shadow-md scale-105' : 'hover:bg-primary/20'}`}
                                onClick={() => setSelectedCategory(null)}
                            >
                                All
                            </Badge>
                            {categories.map(cat => (
                                <Badge
                                    key={cat}
                                    variant={selectedCategory === cat ? 'default' : 'secondary'}
                                    className={`cursor-pointer text-sm px-4 py-1.5 transition-all ${selectedCategory === cat ? 'shadow-md scale-105' : 'hover:bg-primary/20'}`}
                                    onClick={() => setSelectedCategory(cat)}
                                >
                                    {cat}
                                </Badge>
                            ))}
                        </div>
                    </div>
                )}

                <div className="md:w-64">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                        Difficulty
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        <Badge
                            variant={selectedDifficulty === null ? 'default' : 'outline'}
                            className={`cursor-pointer text-sm px-4 py-1.5 transition-all ${selectedDifficulty === null ? 'shadow-md scale-105' : 'hover:bg-primary/10'}`}
                            onClick={() => setSelectedDifficulty(null)}
                        >
                            Any
                        </Badge>
                        {difficulties.map(diff => (
                            <Badge
                                key={diff}
                                variant={selectedDifficulty === diff ? 'default' : 'outline'}
                                className={`cursor-pointer text-sm px-4 py-1.5 capitalize transition-all ${selectedDifficulty === diff ? 'shadow-md scale-105' : 'hover:bg-primary/10'}`}
                                onClick={() => setSelectedDifficulty(diff)}
                            >
                                {diff}
                            </Badge>
                        ))}
                    </div>
                </div>
            </motion.div>

            {/* Courses List */}
            {loading ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="h-[350px] bg-muted/40 animate-pulse rounded-2xl border border-muted-foreground/10"></div>
                    ))}
                </div>
            ) : filteredCourses.length > 0 ? (
                <div className={
                    viewMode === 'grid'
                        ? 'grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                        : 'space-y-6 max-w-5xl mx-auto'
                }>
                    {filteredCourses.map((course, index) => (
                        <CourseCard
                            key={course.id}
                            course={course}
                            onEnroll={() => handleEnroll(course.id)}
                            showActions
                            variant={viewMode === 'list' ? 'horizontal' : 'default'}
                            delay={index * 0.1}
                        />
                    ))}
                </div>
            ) : (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-24 bg-muted/10 rounded-3xl border border-dashed border-muted-foreground/30"
                >
                    <div className="w-20 h-20 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                        <Search className="h-10 w-10 text-muted-foreground/70" />
                    </div>
                    <h3 className="text-2xl font-semibold mb-3">No courses found</h3>
                    <p className="text-muted-foreground mb-8 max-w-md mx-auto text-lg leading-relaxed">
                        We couldn't find any courses matching your specific filters. Try adjusting your search query or relaxing the categories.
                    </p>
                    <Button
                        variant="default"
                        size="lg"
                        className="rounded-full px-8 shadow-lg hover:shadow-xl transition-all"
                        onClick={() => {
                            setSearchQuery('');
                            setSelectedCategory(null);
                            setSelectedDifficulty(null);
                        }}
                    >
                        Clear All Filters
                    </Button>
                </motion.div>
            )}
        </div>
    );
}
