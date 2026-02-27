import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { StatCard } from '@/components/common/StatCard';
import { ChartCard } from '@/components/common/ChartCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { mockPlatformAnalytics } from '@/mock/data';
import type { User, Course } from '@/types';
import api from '@/lib/api';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
} from 'recharts';
import {
  Users,
  GraduationCap,
  TrendingUp,
  Activity,
  ArrowRight,
  Shield,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

export function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, coursesRes] = await Promise.all([
          api.get('/users'),
          api.get('/courses/all')
        ]);
        setUsers(usersRes.data);
        setCourses(coursesRes.data);
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
      }
    };
    fetchData();
  }, []);

  const totalUsers = users.length;
  const activeInstructors = users.filter(u => u.role === 'instructor' && u.isActive && u.status === 'approved').length;
  const activeStudents = users.filter(u => u.role === 'student' && u.isActive).length;
  const totalCoursesCount = courses.length;

  const { dailyActiveUsers, trafficData } = mockPlatformAnalytics;

  const recentUsers = [...users].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);
  const pendingCourses = courses.filter(c => !c.isPublished);

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
            <h1 className="text-3xl font-bold">Platform Overview</h1>
            <p className="text-muted-foreground mt-1">
              Monitor system health and user activity
            </p>
          </div>
          <Badge variant="outline" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Admin Access
          </Badge>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Users"
          value={totalUsers.toLocaleString()}
          change={8}
          trend="up"
          icon={Users}
          delay={0.1}
        />
        <StatCard
          title="Active Instructors"
          value={activeInstructors.toLocaleString()}
          change={4}
          trend="up"
          icon={Users}
          delay={0.2}
        />
        <StatCard
          title="Active Students"
          value={activeStudents.toLocaleString()}
          change={12}
          trend="up"
          icon={Activity}
          delay={0.3}
        />
        <StatCard
          title="Total Courses"
          value={totalCoursesCount}
          change={5}
          trend="up"
          icon={GraduationCap}
          delay={0.4}
        />
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Daily Active Users */}
        <ChartCard
          title="Daily Active Users"
          description="User activity over the last 7 days"
          delay={0.3}
        >
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyActiveUsers}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="hsl(var(--primary))"
                  fill="hsl(var(--primary))"
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {/* Traffic Overview */}
        <ChartCard
          title="Platform Traffic"
          description="Visits and unique visitors"
          delay={0.4}
        >
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trafficData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="visits"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  name="Total Visits"
                />
                <Line
                  type="monotone"
                  dataKey="uniqueVisitors"
                  stroke="#10b981"
                  strokeWidth={2}
                  name="Unique Visitors"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      {/* Bottom Row */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Course Popularity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
        >
          <ChartCard
            title="Popular Courses"
            description="Top courses by enrollment"
            delay={0}
          >
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={mockPlatformAnalytics.coursePopularity.slice(0, 5)}
                  layout="vertical"
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis
                    dataKey="courseId"
                    type="category"
                    width={60}
                    tickFormatter={(value) => `Course ${value.slice(1)}`}
                  />
                  <Tooltip />
                  <Bar dataKey="enrollments" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </motion.div>

        {/* Recent Users */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.6 }}
        >
          <Card className="h-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Recent Users</CardTitle>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/admin/students">
                    View All
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentUsers.map((user) => (
                  <div key={user.id} className="flex items-center gap-3">
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-10 h-10 rounded-full"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-sm">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                    <Badge variant={user.isActive ? 'default' : 'secondary'} className="text-xs">
                      {user.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Pending Approvals */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.7 }}
        >
          <Card className="h-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Pending Approvals</CardTitle>
                <Badge variant="secondary">{pendingCourses.length}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              {pendingCourses.length > 0 ? (
                <div className="space-y-4">
                  {pendingCourses.map((course) => (
                    <div key={course.id} className="p-3 rounded-lg border">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium text-sm">{course.title}</p>
                          <p className="text-xs text-muted-foreground">
                            by {course.instructorName}
                          </p>
                        </div>
                        <AlertCircle className="h-4 w-4 text-amber-500" />
                      </div>
                      <div className="flex gap-2 mt-3">
                        <Button size="sm" variant="outline" className="flex-1">
                          Review
                        </Button>
                        <Button size="sm" className="flex-1">
                          Approve
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-3" />
                  <p className="text-muted-foreground">All caught up!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
