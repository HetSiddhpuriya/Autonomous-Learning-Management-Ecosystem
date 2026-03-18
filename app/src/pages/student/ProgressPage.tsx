import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChartCard } from '@/components/common/ChartCard';
import { ProgressRing } from '@/components/common/ProgressRing';
import { Badge } from '@/components/ui/badge';
import api from '@/lib/api';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  LineChart,
  Line,
} from 'recharts';
import {
  TrendingUp,
  Target,
  Clock,
  Award,
  Calendar,
  Flame,
  BookOpen,
  Zap,
  Loader2,
} from 'lucide-react';

export function ProgressPage() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await api.get('/analytics/student');
        setAnalytics(response.data);
      } catch (error) {
        console.error('Failed to fetch student analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const data = analytics || {
    skillMastery: [],
    weeklyStudyHours: [],
    totalTimeSpent: 0,
    coursesCompleted: 0,
    averageScore: 0,
    streakDays: 0,
    enrolledCourses: [],
    overallCompletionRatio: 0,
    coursesEnrolled: 0,
  };

  const {
    skillMastery,
    weeklyStudyHours,
    totalTimeSpent,
    coursesCompleted,
    averageScore,
    streakDays,
    enrolledCourses,
    overallCompletionRatio,
    coursesEnrolled,
  } = data;

  // Transform data for charts
  const radarData = skillMastery.map((skill: any) => ({
    subject: skill.skill,
    A: skill.level,
    fullMark: 100,
  }));

  const weeklyData = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => ({
    day,
    hours: weeklyStudyHours[index] || 0,
  }));

  const progressData = enrolledCourses.map((course: any) => ({
    name: course?.title?.length > 20 ? course.title.slice(0, 20) + '...' : course.title || 'Unknown',
    progress: course.progress || 0,
  }));

  const overallProgress = overallCompletionRatio || 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold">My Progress</h1>
        <p className="text-muted-foreground mt-1">
          Track your learning journey and achievements
        </p>
      </motion.div>

      {/* Overview Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Study Time</p>
                  <p className="text-2xl font-bold">{Math.round(totalTimeSpent / 3600)}h</p>
                </div>
                <div className="p-3 rounded-lg bg-primary/10">
                  <Clock className="h-5 w-5 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Courses Completed</p>
                  <p className="text-2xl font-bold">{coursesCompleted}</p>
                </div>
                <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900/30">
                  <Award className="h-5 w-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Average Score</p>
                  <p className="text-2xl font-bold">{averageScore}%</p>
                </div>
                <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.25 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Day Streak</p>
                  <p className="text-2xl font-bold">{streakDays}</p>
                </div>
                <div className="p-3 rounded-lg bg-orange-100 dark:bg-orange-900/30">
                  <Flame className="h-5 w-5 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Charts Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Skill Mastery Radar Chart */}
        <ChartCard
          title="Skill Mastery"
          description="Your proficiency across different skills"
          delay={0.3}
        >
          <div className="h-80">
            {radarData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} />
                  <Radar
                    name="Current Level"
                    dataKey="A"
                    stroke="hsl(var(--primary))"
                    fill="hsl(var(--primary))"
                    fillOpacity={0.3}
                  />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                  Enroll in a course to build skill mastery
                </div>
            )}
          </div>
        </ChartCard>

        {/* Weekly Study Hours */}
        <ChartCard
          title="Weekly Study Hours"
          description="Time spent learning this week"
          delay={0.4}
        >
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Bar
                  dataKey="hours"
                  fill="hsl(var(--primary))"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {/* Course Progress */}
        <ChartCard
          title="Course Progress"
          description="Completion percentage for each course"
          delay={0.5}
        >
          <div className="h-80">
            {progressData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={progressData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" domain={[0, 100]} />
                  <YAxis dataKey="name" type="category" width={150} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar
                    dataKey="progress"
                    fill="hsl(var(--primary))"
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                 No active courses yet
              </div>
            )}
          </div>
        </ChartCard>

        {/* Overall Progress Ring */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.6 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Overall Progress</CardTitle>
              <CardDescription>Average completion across all courses</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col h-[320px]">
                <div className="flex items-center justify-center py-8">
                  <ProgressRing
                    progress={overallProgress}
                    size={200}
                    strokeWidth={12}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4 mt-auto">
                  <div className="text-center p-4 rounded-lg bg-muted">
                    <p className="text-2xl font-bold">{coursesEnrolled}</p>
                    <p className="text-sm text-muted-foreground">Active Courses</p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-muted">
                    <p className="text-2xl font-bold">{coursesCompleted}</p>
                    <p className="text-sm text-muted-foreground">Completed</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Skills Breakdown */}
      {skillMastery && skillMastery.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.7 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Skills Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {skillMastery.map((skill: any) => (
                  <div key={skill.skill} className="p-4 rounded-lg border">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{skill.skill}</span>
                      <Badge variant={skill.level >= 80 ? 'default' : skill.level >= 50 ? 'secondary' : 'outline'}>
                        {skill.level >= 80 ? 'Master' : skill.level >= 50 ? 'Intermediate' : 'Beginner'}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Proficiency</span>
                        <span className="font-medium">{skill.level}%</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-primary rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${skill.level}%` }}
                          transition={{ duration: 1, delay: 0.8 }}
                        />
                      </div>
                    </div>
                    {skill.category && (
                      <p className="text-xs text-muted-foreground mt-2">{skill.category}</p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
