import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { StatCard } from '@/components/common/StatCard';
import { CourseCard } from '@/components/common/CourseCard';
import { ProgressRing } from '@/components/common/ProgressRing';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import api from '@/lib/api';
import {
  Flame,
  BookOpen,
  TrendingUp,
  Clock,
  AlertTriangle,
  Play,
  Lightbulb,
  ChevronRight,
  Target,
  Zap,
} from 'lucide-react';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
} from 'recharts';

export function StudentDashboard() {
  const { user } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const { data } = await api.get('/analytics/student');
        setAnalytics(data);
      } catch (error) {
        console.error('Failed to fetch analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const enrolledCourses = analytics?.enrolledCourses || [];
  const nextRecommendation = analytics?.recommendation || null;
  const weakTopics = analytics?.weakTopics || [];

  // Transform skill mastery data for radar chart
  const radarData = (analytics?.skillMastery || []).map((skill: any) => ({
    subject: skill.skill,
    A: skill.level,
    fullMark: 100,
  }));

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">
              {getGreeting()}, {user?.name?.split(' ')[0]}! 👋
            </h1>
            <p className="text-muted-foreground mt-1">
              Here's what's happening with your learning journey today.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <Flame className="h-5 w-5 text-orange-500" />
              <span className="font-semibold text-orange-700 dark:text-orange-300">
                {analytics?.streakDays || 0} Day Streak
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Courses in Progress"
          value={analytics?.coursesEnrolled || 0}
          icon={BookOpen}
          delay={0.1}
        />
        <StatCard
          title="Hours Learned"
          value={Math.round((analytics?.totalTimeSpent || 0) / 3600)}
          change={12}
          trend="up"
          icon={Clock}
          delay={0.2}
        />
        <StatCard
          title="Average Score"
          value={`${analytics?.averageScore || 0}%`}
          change={5}
          trend="up"
          icon={TrendingUp}
          delay={0.3}
        />
        <StatCard
          title="Completion Ratio"
          value={`${analytics?.overallCompletionRatio || 0}%`}
          icon={Target}
          delay={0.4}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column - Continue Learning & Recommendations */}
        <div className="lg:col-span-2 space-y-6">
          {/* Next Recommended Course */}
          {nextRecommendation && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <Card className="overflow-hidden border-primary/20 bg-white">
                <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <Badge className="mb-2 bg-primary/20 text-primary hover:bg-primary/30">
                        <Lightbulb className="h-3 w-3 mr-1" />
                        Recommended for You
                      </Badge>
                      <h3 className="text-xl font-bold mb-2">{nextRecommendation.title}</h3>
                      <p className="text-muted-foreground text-sm mb-4 line-clamp-2 max-w-lg">
                        {nextRecommendation.description}
                      </p>
                      <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-6 uppercase tracking-wider">
                        <Zap className="h-4 w-4 text-amber-500" />
                        Master {nextRecommendation.category}
                      </div>
                      <Button asChild>
                        <Link to={`/courses/${nextRecommendation.id || nextRecommendation._id}`}>
                          <Play className="h-4 w-4 mr-2" />
                          View Course Details
                        </Link>
                      </Button>
                    </div>
                    <div className="hidden sm:block">
                      <div className="w-32 h-24 rounded-lg overflow-hidden shadow-md border-2 border-white">
                        <img src={nextRecommendation.thumbnail} alt="Recommended" className="w-full h-full object-cover" />
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}

          {/* Weak Topics Alert */}
          {weakTopics.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
            >
              <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-900/20">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <AlertTitle className="text-amber-800 dark:text-amber-200">
                  Areas for Improvement
                </AlertTitle>
                <AlertDescription className="text-amber-700 dark:text-amber-300">
                  Based on your recent performance, consider focusing on:{' '}
                  <span className="font-medium">{weakTopics.join(', ')}</span>
                </AlertDescription>
              </Alert>
            </motion.div>
          )}

          {/* My Courses */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">My Courses</h2>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/student/courses">
                  View All
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {enrolledCourses.map((course: any, index: number) => {
                return (
                  <CourseCard
                    key={course.id || course._id}
                    course={course}
                    progress={course.progress}
                    showProgress
                    variant="horizontal"
                    delay={index * 0.1}
                  />
                );
              })}
            </div>
          </motion.div>
        </div>

        {/* Right Column - Skill Radar & Activity */}
        <div className="space-y-6">
          {/* Skill Mastery Radar Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Skill Mastery</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  {radarData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart data={radarData}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11 }} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} />
                        <Radar
                          name="Skills"
                          dataKey="A"
                          stroke="hsl(var(--primary))"
                          fill="hsl(var(--primary))"
                          fillOpacity={0.3}
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-muted-foreground gap-2">
                      <Target className="h-8 w-8 opacity-20" />
                      <p className="text-xs">Start learning to build your skill profile</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(analytics?.notifications || []).length > 0 ? (
                    (analytics?.notifications || []).slice(0, 3).map((notification: any) => (
                      <div
                        key={notification.id}
                        className="flex items-start gap-3 pb-3 border-b last:border-0 last:pb-0"
                      >
                        <div className={`w-2 h-2 rounded-full mt-2 ${notification.read ? 'bg-muted' : 'bg-primary'
                          }`} />
                        <div>
                          <p className="text-sm font-medium">{notification.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {notification.message}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(notification.timestamp).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-center text-muted-foreground py-4">No recent activity</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Weekly Study Goal */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.5 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Weekly Study Goal</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center">
                  <ProgressRing
                    progress={75}
                    size={140}
                    strokeWidth={10}
                    color="hsl(var(--primary))"
                  />
                </div>
                <p className="text-center text-sm text-muted-foreground mt-4">
                  15 of 20 hours completed this week
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
