import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Play, CheckCircle, Clock, BookOpen, Star, Heart, Share2, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import api from '@/lib/api';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import type { Course } from '@/types';

export function CourseDetailsPage() {
    const { courseId } = useParams<{ courseId: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [course, setCourse] = useState<Course | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCourseDetails();
    }, [courseId]);

    const fetchCourseDetails = async () => {
        try {
            setLoading(true);
            const { data } = await api.get(`/courses/${courseId}`);
            setCourse(data);
        } catch (error) {
            toast.error('Failed to load course details');
            navigate('/courses');
        } finally {
            setLoading(false);
        }
    };

    const handleEnroll = async () => {
        if (!user) {
            toast.info('Please log in to enroll in this course');
            navigate('/login');
            return;
        }
        if (user.role !== 'student') {
            toast.error('Only students can enroll in courses');
            return;
        }
        try {
            await api.post(`/courses/${courseId}/enroll`);
            toast.success('Successfully enrolled in the course!');
            navigate('/student/courses');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to enroll');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!course) return null;

    // Mock data for display based on the image
    const whatYouWillLearn = course.skillTags && course.skillTags.length > 0
        ? course.skillTags
        : ['Master Web Development', 'Master JavaScript', 'Master React', 'Master Node.js', 'Build real-world projects'];

    const courseContent = [
        { title: 'Introduction to Web Development', duration: '15:00', lessons: 5 },
        { title: 'HTML5 Fundamentals', duration: '45:00', lessons: 10 },
        { title: 'CSS3 Styling', duration: '50:00', lessons: 12 },
        { title: 'JavaScript Basics', duration: '60:00', lessons: 15, details: 'This section covers the fundamentals of Javascript basics. You will learn through practical examples and hands-on exercises.' },
    ];

    return (
        <div className="flex flex-col w-full">
            {/* Top Dark Hero Section */}
            <section className="bg-slate-900 text-slate-50 pt-16 pb-32">
                <div className="container px-4 md:px-6 mx-auto relative">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
                        <div className="lg:col-span-2 space-y-6">
                            <div className="flex items-center gap-2">
                                <Badge variant="secondary" className="bg-blue-600 hover:bg-blue-700 text-white border-none rounded-md px-3">{course.category || 'Development'}</Badge>
                                <Badge variant="outline" className="text-slate-300 border-slate-600 rounded-md capitalize">{course.difficulty}</Badge>
                            </div>

                            <h1 className="text-3xl md:text-5xl font-bold leading-tight">
                                {course.title}
                            </h1>

                            <p className="text-lg text-slate-300">
                                {course.description}
                            </p>

                            <div className="flex items-center gap-4 text-sm font-medium">
                                <div className="flex items-center text-amber-500">
                                    <span className="font-bold mr-1">{course.rating || '4.8'}</span>
                                    {[1, 2, 3, 4].map(i => <Star key={i} className="h-4 w-4 fill-current inline" />)}
                                    <Star className="h-4 w-4 inline" /> {/* Half star rep */}
                                    <span className="text-blue-300 font-normal ml-2 hover:underline cursor-pointer">(245 reviews)</span>
                                </div>
                                <span className="text-slate-400">|</span>
                                <span>{(course.enrolledStudents || 1250).toLocaleString()} students</span>
                            </div>

                            <div className="flex items-center gap-3 pt-2">
                                <div className="h-10 w-10 rounded-full bg-slate-700 overflow-hidden">
                                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${course.instructorName}`} alt="Instructor" className="h-full w-full object-cover" />
                                </div>
                                <div className="text-sm">
                                    <p className="text-slate-400">Created by</p>
                                    <p className="font-semibold">{course.instructorName}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Bottom Content Section with Floating Card */}
            <section className="bg-slate-50 relative pb-20">
                <div className="container px-4 md:px-6 mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

                        {/* Main Content Area */}
                        <div className="lg:col-span-2 pt-12 space-y-12">
                            {/* What you will learn */}
                            <div className="bg-white p-8 rounded-xl border border-slate-200">
                                <h2 className="text-2xl font-bold mb-6 text-slate-900">What you will learn</h2>
                                <div className="grid sm:grid-cols-2 gap-4">
                                    {whatYouWillLearn.map((item, idx) => (
                                        <div key={idx} className="flex items-start gap-3">
                                            <CheckCircle className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                                            <span className="text-slate-700">{item}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Course Content */}
                            <div>
                                <h2 className="text-2xl font-bold mb-6 text-slate-900">Course Content</h2>
                                <div className="flex items-center gap-2 text-sm text-slate-500 mb-4 px-1">
                                    <span>{courseContent.length} sections</span>
                                    <span>•</span>
                                    <span>{course.lessonsCount || 156} lessons</span>
                                    <span>•</span>
                                    <span>{Math.floor((course.duration || 2520) / 60)} hours total</span>
                                </div>

                                <Accordion type="single" collapsible className="w-full bg-white rounded-xl border border-slate-200 overflow-hidden" defaultValue="item-3">
                                    {courseContent.map((section, idx) => (
                                        <AccordionItem key={idx} value={`item-${idx}`} className="border-b last:border-0 border-slate-200">
                                            <AccordionTrigger className="px-6 py-4 hover:bg-slate-50 text-slate-900 font-medium">
                                                <div className="flex items-center justify-between w-full pr-4 text-left">
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-slate-400 font-normal w-4">{idx + 1}</span>
                                                        <Play className="h-4 w-4 text-slate-400 shrink-0" />
                                                        <span>{section.title}</span>
                                                    </div>
                                                    <span className="text-sm text-slate-500 font-normal whitespace-nowrap hidden sm:block">
                                                        {section.lessons} lessons • {section.duration}
                                                    </span>
                                                </div>
                                            </AccordionTrigger>
                                            <AccordionContent className="bg-white px-6 py-4 pt-1 border-t border-slate-100 text-slate-600 bg-slate-50/50">
                                                {section.details || 'Includes comprehensive video lessons, downloadable resources, and quizzes to test your knowledge.'}
                                            </AccordionContent>
                                        </AccordionItem>
                                    ))}
                                </Accordion>
                            </div>

                            {/* Instructor Info */}
                            <div>
                                <h2 className="text-2xl font-bold mb-6 text-slate-900">Instructor</h2>
                                <div className="bg-white p-8 rounded-xl border border-slate-200 flex flex-col sm:flex-row gap-6">
                                    <div className="h-24 w-24 rounded-full overflow-hidden shrink-0">
                                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${course.instructorName}`} alt={course.instructorName} className="h-full w-full object-cover" />
                                    </div>
                                    <div className="space-y-3">
                                        <h3 className="text-xl font-bold text-slate-900">{course.instructorName}</h3>
                                        <p className="text-slate-500 font-medium">Senior Developer with 10+ years of experience</p>

                                        <div className="flex flex-wrap items-center gap-4 text-sm text-slate-700">
                                            <span className="flex items-center gap-1.5"><Star className="h-4 w-4 text-amber-500 fill-current" /> 4.8 Instructor Rating</span>
                                            <span className="flex items-center gap-1.5"><BookOpen className="h-4 w-4" /> 15,070 Students</span>
                                            <span className="flex items-center gap-1.5"><Play className="h-4 w-4" /> 12 Courses</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Sidebar - Floating Card */}
                        <div className="lg:col-span-1">
                            {/* This card floats out of the top section and sits on top of the backgrounds */}
                            <div className="lg:-mt-[150px] sticky top-24 z-20">
                                <Card className="border border-slate-200 shadow-xl overflow-hidden rounded-xl bg-white">
                                    <div className="relative aspect-video bg-slate-100 flex items-center justify-center group cursor-pointer overflow-hidden pb-1 border-b">
                                        <img src={course.thumbnail} alt="Course Preview" className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-500" />
                                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"></div>
                                        <div className="absolute h-16 w-16 bg-white/90 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 shadow-black/20 transition-transform">
                                            <Play className="h-8 w-8 text-black ml-1" />
                                        </div>
                                    </div>

                                    <CardContent className="p-6">
                                        <div className="mb-6 flex items-baseline gap-3">
                                            <span className="text-3xl font-bold text-slate-900">${course.price || 89.99}</span>
                                            <span className="text-slate-400 line-through text-lg">${((course.price || 89.99) * 2.2).toFixed(2)}</span>
                                        </div>

                                        <div className="space-y-3 mb-6">
                                            <Button size="lg" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium h-12 text-base rounded-md" onClick={handleEnroll}>
                                                Enroll Now
                                            </Button>
                                            <Button variant="outline" size="lg" className="w-full h-12 text-base font-medium rounded-md border-slate-300">
                                                Start Free Preview
                                            </Button>
                                        </div>

                                        <p className="text-center text-xs text-slate-500 mb-6">30-Day Money-Back Guarantee</p>

                                        <div className="flex gap-4 mb-8">
                                            <Button variant="ghost" className="flex-1 border border-slate-200 rounded-md py-4 h-auto text-slate-600 font-normal hover:bg-slate-50">
                                                <Heart className="h-4 w-4 text-slate-500 mr-2" />
                                                Wishlist
                                            </Button>
                                            <Button variant="ghost" className="flex-1 border border-slate-200 rounded-md py-4 h-auto text-slate-600 font-normal hover:bg-slate-50">
                                                <Share2 className="h-4 w-4 text-slate-500 mr-2" />
                                                Share
                                            </Button>
                                        </div>

                                        <div className="space-y-4">
                                            <h4 className="font-bold mb-2 text-slate-900">This course includes:</h4>

                                            <div className="flex items-center gap-3 text-sm text-slate-600">
                                                <Play className="h-4 w-4 text-slate-700 shrink-0" />
                                                <span>{Math.floor((course.duration || 2520) / 60)} hours on-demand video</span>
                                            </div>

                                            <div className="flex items-center gap-3 text-sm text-slate-600">
                                                <BookOpen className="h-4 w-4 text-slate-700 shrink-0" />
                                                <span>{course.lessonsCount || 156} lessons</span>
                                            </div>

                                            <div className="flex items-center gap-3 text-sm text-slate-600">
                                                <Clock className="h-4 w-4 text-slate-700 shrink-0" />
                                                <span>Full lifetime access</span>
                                            </div>

                                            <div className="flex items-center gap-3 text-sm text-slate-600">
                                                <Award className="h-4 w-4 text-slate-700 shrink-0" />
                                                <span>Certificate of completion</span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>

                    </div>
                </div>
            </section>
        </div>
    );
}
