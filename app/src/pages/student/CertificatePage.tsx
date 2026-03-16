import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import api from '@/lib/api';
import { toast } from 'sonner';
import { useAuth } from '@/context';
import { CertificateModal } from '@/components/common/CertificateModal';
import { StatCard } from '@/components/common/StatCard';
import { Award, Search, Download, Share2, BookOpen, Clock, Grid3X3, List } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export function CertificatePage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [loading, setLoading] = useState(true);
    const [enrolledCourses, setEnrolledCourses] = useState<any[]>([]);
    const [analytics, setAnalytics] = useState<any>(null);
    const [selectedCertificateCourse, setSelectedCertificateCourse] = useState<any | null>(null);
    const { user } = useAuth();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [coursesRes, progressRes, analyticsRes] = await Promise.all([
                api.get('/courses/enrolled/my'),
                api.get('/progress'),
                api.get('/analytics/student')
            ]);

            const progressMap: Record<string, number> = {};
            progressRes.data.forEach((p: any) => {
                progressMap[p.courseId] = p.completionPercentage || 0;
            });

            const coursesWithProgress = coursesRes.data.map((course: any) => ({
                ...course,
                progress: Math.round(progressMap[course._id || course.id] || 0)
            }));

            setEnrolledCourses(coursesWithProgress);
            setAnalytics(analyticsRes.data);
        } catch (error) {
            toast.error('Failed to load certificates data');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const completedCourses = enrolledCourses.filter(c => c.progress >= 100);
    const inProgressCourses = enrolledCourses.filter(c => c.progress < 100);
    const totalHoursLearned = Math.round((analytics?.totalTimeSpent || 0) / 3600);

    const filteredCertificates = completedCourses.filter(cert =>
        cert.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }
    return (
        <div className="space-y-8">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <h1 className="text-3xl font-bold">My Certificates</h1>
                <p className="text-muted-foreground mt-1">
                    View and manage all your earned certificates.
                </p>
            </motion.div>

            {/* Stats Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <StatCard
                    title="Total Certificates"
                    value={completedCourses.length}
                    icon={Award}
                    delay={0.1}
                />
                <StatCard
                    title="Courses in Progress"
                    value={inProgressCourses.length}
                    icon={BookOpen}
                    delay={0.2}
                />
                <StatCard
                    title="Hours Learned"
                    value={totalHoursLearned}
                    icon={Clock}
                    delay={0.3}
                />
            </div>

            {/* Search and Filters */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="flex flex-col sm:flex-row gap-4"
            >
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search certificates..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 h-12"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant={viewMode === 'grid' ? 'default' : 'outline'}
                        size="icon"
                        onClick={() => setViewMode('grid')}
                        className="h-12 w-12"
                    >
                        <Grid3X3 className="h-5 w-5" />
                    </Button>
                    <Button
                        variant={viewMode === 'list' ? 'default' : 'outline'}
                        size="icon"
                        onClick={() => setViewMode('list')}
                        className="h-12 w-12"
                    >
                        <List className="h-5 w-5" />
                    </Button>
                </div>
            </motion.div>

            {/* Certificates Grid */}
            <div className={
                viewMode === 'grid'
                    ? 'grid sm:grid-cols-2 lg:grid-cols-3 gap-6'
                    : 'space-y-4'
            }>
                {filteredCertificates.map((cert, index) => (
                    <motion.div
                        key={cert.id || cert._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: index * 0.1 }}
                    >
                        <Card className={`overflow-hidden h-full flex hover:shadow-lg transition-shadow bg-white ${viewMode === 'list' ? 'flex-row' : 'flex-col'}`}>
                            <div className={`relative ${viewMode === 'list' ? 'w-64 shrink-0' : 'aspect-video'}`}>
                                <img
                                    src={cert.thumbnail || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=500&auto=format&fit=crop&q=60'}
                                    alt={cert.title}
                                    className="absolute inset-0 w-full h-full object-cover"
                                />
                            </div>
                            <CardContent className={`flex-1 flex ${viewMode === 'list' ? 'flex-row items-center p-6 gap-6' : 'flex-col p-5'}`}>
                                <div className={`flex-1 ${viewMode === 'list' ? '' : 'mb-4'}`}>
                                    <h3 className="font-bold text-lg leading-tight mb-2 line-clamp-2">{cert.title}</h3>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Issued: {new Date().toLocaleDateString()}
                                    </p>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Instructor: {cert.instructorName || 'Unknown Instructor'}
                                    </p>
                                </div>
                                <div className={`flex items-center gap-3 ${viewMode === 'list' ? 'shrink-0' : 'mt-auto'}`}>
                                    <Button
                                        className={`${viewMode === 'list' ? '' : 'w-full'} bg-[#9c7853] hover:bg-[#866545] text-white gap-2`}
                                        variant="default"
                                        onClick={() => setSelectedCertificateCourse(cert)}
                                    >
                                        <Download className="h-4 w-4" />
                                        View Certificate
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}

                {filteredCertificates.length === 0 && (
                    <div className="col-span-full text-center py-12">
                        <Award className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                        <h3 className="text-lg font-medium text-muted-foreground">No certificates found</h3>
                        <p className="text-sm text-muted-foreground mt-1">Try adjusting your search query</p>
                    </div>
                )}
            </div>

            {/* Certificate Modal */}
            <CertificateModal
                isOpen={!!selectedCertificateCourse}
                onClose={() => setSelectedCertificateCourse(null)}
                course={selectedCertificateCourse}
                studentName={user?.name || 'Student'}
            />
        </div>
    );
}
