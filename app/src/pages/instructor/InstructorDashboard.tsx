import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { StatCard } from '@/components/common/StatCard';
import { ChartCard } from '@/components/common/ChartCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { mockCourses, mockCourseAnalytics, mockUsers } from '@/mock/data';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  Users,
  BookOpen,
  TrendingUp,
  Star,
  Plus,
  ArrowRight,
  Eye,
  Edit,
  MoreVertical,
} from 'lucide-react';

export function InstructorDashboard() {
  const { user } = useAuth();
  const myCourses = mockCourses.filter(c => c.instructorId === user?.id);
  const analytics = mockCourseAnalytics[0];

  // Mock data for charts
  const performanceData = [
    { month: 'Jan', students: 800, completion: 65 },
    { month: 'Feb', students: 950, completion: 68 },
    { month: 'Mar', students: 1100, completion: 72 },
    { month: 'Apr', students: 1250, completion: 75 },
  ];

  const scoreDistribution = [
    { range: '90-100', count: 45 },
    { range: '80-89', count: 78 },
    { range: '70-79', count: 52 },
    { range: '60-69', count: 30 },
    { range: 'Below 60', count: 15 },
  ];

  const dropOffData = analytics?.dropOffLessons.map(d => ({
    lesson: `Lesson ${d.lessonId.slice(1)}`,
    rate: d.dropOffRate,
  })) || [];

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#6b7280'];

  const totalStudents = myCourses.reduce((acc, c) => acc + c.enrolledStudents, 0);
  const averageRating = myCourses.reduce((acc, c) => acc + c.rating, 0) / myCourses.length;

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
            <h1 className="text-3xl font-bold">Welcome back, {user?.name?.split(' ')[0]}! 👋</h1>
            <p className="text-muted-foreground mt-1">
              Here's how your courses are performing today.
            </p>
          </div>
          <Button asChild>
            <Link to="/instructor/create-course">
              <Plus className="h-4 w-4 mr-2" />
              Create Course
            </Link>
          </Button>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Students"
          value={totalStudents.toLocaleString()}
          change={12}
          trend="up"
          icon={Users}
          delay={0.1}
        />
        <StatCard
          title="Active Courses"
          value={myCourses.length}
          icon={BookOpen}
          delay={0.2}
        />
        <StatCard
          title="Average Rating"
          value={averageRating.toFixed(1)}
          change={5}
          trend="up"
          icon={Star}
          delay={0.3}
        />
        <StatCard
          title="Avg. Completion"
          value={`${analytics?.averageCompletion || 0}%`}
          change={3}
          trend="up"
          icon={TrendingUp}
          delay={0.4}
        />
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Student Growth Chart */}
        <ChartCard
          title="Student Growth"
          description="Enrollment trends over time"
          delay={0.3}
        >
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="students"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--primary))' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {/* Score Distribution */}
        <ChartCard
          title="Score Distribution"
          description="Student performance across all courses"
          delay={0.4}
        >
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={scoreDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="range" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {scoreDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      {/* Drop-off Analysis */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.5 }}
      >
        <ChartCard
          title="Lesson Drop-off Analysis"
          description="Identify where students are leaving your courses"
          delay={0}
        >
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dropOffData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" domain={[0, 100]} />
                <YAxis dataKey="lesson" type="category" width={100} />
                <Tooltip formatter={(value) => `${value}%`} />
                <Bar
                  dataKey="rate"
                  fill="#ef4444"
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </motion.div>

      {/* My Courses */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.6 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">My Courses</h2>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/instructor/lessons">
              View All
              <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </Button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {myCourses.map((course, index) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.6 + index * 0.1 }}
            >
              <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative h-32">
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2">
                    <Badge variant={course.isPublished ? 'default' : 'secondary'}>
                      {course.isPublished ? 'Published' : 'Draft'}
                    </Badge>
                  </div>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-1 line-clamp-1">{course.title}</h3>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                    <span className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {course.enrolledStudents}
                    </span>
                    <span className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                      {course.rating}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Completion</span>
                      <span className="font-medium">{analytics?.averageCompletion || 0}%</span>
                    </div>
                    <Progress value={analytics?.averageCompletion || 0} className="h-2" />
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
