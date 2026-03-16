import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import api from '@/lib/api';
import type { Course } from '@/types';
import {
    Users,
    Star,
    Plus,
    Eye,
    Edit,
    Search,
    BookOpen,
    Filter,
    Monitor,
    MoreVertical,
} from 'lucide-react';

export function MyCoursesPage() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                setIsLoading(true);
                const { data } = await api.get('/courses/all');
                setCourses(data);
            } catch (err) {
                console.error('Failed to fetch courses:', err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchCourses();
    }, []);

    const filteredCourses = courses.filter(course =>
        course.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-8">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold font-serif">My Courses</h1>
                        <p className="text-muted-foreground mt-1">
                            Manage and organize your published and draft courses.
                        </p>
                    </div>
                    <Button asChild>
                        <Link to="/instructor/create-course">
                            <Plus className="h-4 w-4 mr-2" />
                            Add Course
                        </Link>
                    </Button>
                </div>
            </motion.div>

            {/* Search & Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search your courses..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="icon">
                        <Filter className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon">
                        <Monitor className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Courses List */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCourses.map((course, index) => (
                    <motion.div
                        key={course.id || (course as any)._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                        <Card className="overflow-hidden hover:shadow-xl transition-all group border-primary/10">
                            <div className="relative h-48">
                                <img
                                    src={course.thumbnail}
                                    alt={course.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                                <div className="absolute top-3 right-3">
                                    <Badge className={course.isPublished ? "bg-emerald-500 hover:bg-emerald-600" : "bg-orange-500 hover:bg-orange-600"}>
                                        {course.isPublished ? 'Published' : 'Draft'}
                                    </Badge>
                                </div>
                                <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                                    <div className="flex items-center gap-2 text-white">
                                        <BookOpen className="h-4 w-4" />
                                        <span className="text-sm font-medium">{(course as any).lessonsCount || 0} Lessons</span>
                                    </div>
                                </div>
                            </div>
                            <CardContent className="p-5">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-bold text-lg leading-tight line-clamp-1 group-hover:text-primary transition-colors">{course.title}</h3>
                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                        <MoreVertical className="h-4 w-4" />
                                    </Button>
                                </div>

                                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                                    <span className="flex items-center gap-1.5 bg-primary/5 px-2 py-0.5 rounded-md">
                                        <Users className="h-3.5 w-3.5" />
                                        {course.enrolledStudents.toLocaleString()}
                                    </span>
                                    <span className="flex items-center gap-1.5 bg-amber-50 px-2 py-0.5 rounded-md text-amber-700">
                                        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                                        {course.rating}
                                    </span>
                                </div>

                                <div className="space-y-3 mb-6">
                                    <div className="flex justify-between text-xs font-medium">
                                        <span className="text-muted-foreground uppercase tracking-wider">Completion Rate</span>
                                        <span className="text-primary">85%</span>
                                    </div>
                                    <Progress value={85} className="h-1.5" />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <Button asChild variant="outline" size="sm" className="w-full bg-primary/5 hover:bg-primary/10 border-none">
                                        <Link to={`/courses/${course.id || (course as any)._id}`}>
                                            <Eye className="h-4 w-4 mr-2" />
                                            View
                                        </Link>
                                    </Button>
                                    <Button asChild size="sm" className="w-full">
                                        <Link to={`/instructor/edit-course/${course.id || (course as any)._id}`}>
                                            <Edit className="h-4 w-4 mr-2" />
                                            Edit
                                        </Link>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
                {filteredCourses.length === 0 && !isLoading && (
                    <div className="col-span-full py-20 text-center border-2 border-dashed rounded-2xl bg-muted/20">
                        <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                        <h3 className="text-xl font-bold">No courses found</h3>
                        <p className="text-muted-foreground mt-2">Try adjusting your search or create a new course.</p>
                        <Button asChild className="mt-6">
                            <Link to="/instructor/create-course">
                                <Plus className="h-4 w-4 mr-2" />
                                Create First Course
                            </Link>
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
