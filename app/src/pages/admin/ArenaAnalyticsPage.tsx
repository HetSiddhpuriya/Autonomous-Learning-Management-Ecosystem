import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChartCard } from '@/components/common/ChartCard';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
    PieChart,
    Pie,
    Cell,
    Legend,
    AreaChart,
    Area
} from 'recharts';
import {
    Download,
    TrendingUp,
    Users,
    Target,
    Zap,
    Clock,
    CheckCircle2,
    AlertCircle,
    HelpCircle,
    Trophy
} from 'lucide-react';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export function ArenaAnalyticsPage() {
    const [timeRange, setTimeRange] = useState('30d');
    const [analytics, setAnalytics] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const { data } = await api.get('/practice/instructor/analytics');
                setAnalytics(data);
            } catch (err) {
                console.error('Failed to fetch arena analytics:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchAnalytics();
    }, []);

    if (loading) return <div className="p-8 text-center text-muted-foreground font-bold">Loading Arena Intelligence...</div>;

    const keyMetrics = [
        { label: 'Total Attempts', value: analytics?.totalAttempts || 0, change: '+18%', icon: Zap, color: 'text-primary' },
        { label: 'Avg. Score', value: `${analytics?.avgScore}%` || '0%', change: '+5%', icon: Target, color: 'text-green-600' },
        { label: 'Daily Engagement', value: analytics?.dailyParticipation?.length || 0, change: '+12%', icon: Users, color: 'text-blue-600' },
        { label: 'Completion Rate', value: '92%', change: '+2%', icon: CheckCircle2, color: 'text-amber-600' },
    ];

    return (
        <div className="space-y-8 pb-20">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="space-y-1">
                        <h1 className="text-4xl font-black tracking-tight flex items-center gap-3">
                            Practice Arena <span className="text-primary italic">Intelligence</span>
                        </h1>
                        <p className="text-muted-foreground font-medium">
                            Global oversight of student practice behavior and quiz performance
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Select value={timeRange} onValueChange={setTimeRange}>
                            <SelectTrigger className="w-[150px] rounded-xl font-bold shadow-sm">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="7d">Last 7 days</SelectItem>
                                <SelectItem value="30d">Last 30 days</SelectItem>
                                <SelectItem value="90d">Last 90 days</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button variant="outline" className="rounded-xl font-bold border-2 shadow-sm">
                            <Download className="h-4 w-4 mr-2" />
                            Export Reports
                        </Button>
                    </div>
                </div>
            </motion.div>

            {/* Key Metrics Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {keyMetrics.map((metric, i) => (
                    <motion.div
                        key={metric.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: i * 0.1 }}
                    >
                        <Card className="border-none shadow-md hover:shadow-lg transition-all transform hover:-translate-y-1 overflow-hidden">
                            <div className={`h-1.5 w-full bg-slate-100 ${i === 0 ? 'bg-primary' : i === 1 ? 'bg-green-500' : i === 2 ? 'bg-blue-500' : 'bg-amber-500'}`} />
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <p className="text-xs font-black text-muted-foreground uppercase tracking-widest">{metric.label}</p>
                                        <p className="text-3xl font-black">{metric.value}</p>
                                        <p className="text-[10px] font-bold text-green-600 flex items-center gap-1">
                                            <TrendingUp className="h-3 w-3" /> {metric.change} from last period
                                        </p>
                                    </div>
                                    <div className={`p-4 rounded-2xl ${metric.color.replace('text-', 'bg-')}/10`}>
                                        <metric.icon className={`h-6 w-6 ${metric.color}`} />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            <div className="grid lg:grid-cols-12 gap-6">
                {/* Participation Over Time */}
                <div className="lg:col-span-8">
                    <ChartCard
                        title="Global Participation Trends"
                        description="Measuring interactive volume vs time"
                        delay={0.3}
                    >
                        <div className="h-80 pt-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={analytics?.dailyParticipation || []}>
                                    <defs>
                                        <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="_id" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 700 }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 700 }} />
                                    <Tooltip contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                                    <Area type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorCount)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </ChartCard>
                </div>

                {/* Skill Category Accuracy */}
                <div className="lg:col-span-4">
                    <ChartCard
                        title="Skill Mastery Distribution"
                        description="Avg. accuracy across categories"
                        delay={0.4}
                    >
                        <div className="h-80 flex flex-col">
                            <div className="flex-1">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={analytics?.categoryAccuracy || []}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={100}
                                            paddingAngle={8}
                                            dataKey="accuracy"
                                        >
                                            {(analytics?.categoryAccuracy || []).map((entry: any, index: number) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                        <Legend iconType="circle" wrapperStyle={{ paddingTop: '10px', fontWeight: 'bold' }} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </ChartCard>
                </div>

                {/* Most Difficult Questions */}
                <div className="lg:col-span-7">
                    <ChartCard
                        title="Systemic Knowledge Gaps"
                        description="Questions with highest failure rates"
                        delay={0.5}
                    >
                        <div className="h-[350px] pt-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={analytics?.mostDifficult || []} layout="vertical">
                                    <XAxis type="number" hide />
                                    <YAxis dataKey="question" type="category" width={180} axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 12, fontWeight: 700 }} />
                                    <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '1rem' }} />
                                    <Bar dataKey="failRate" fill="#ef4444" radius={[0, 10, 10, 0]} barSize={35}>
                                        {(analytics?.mostDifficult || []).map((entry: any, index: number) => (
                                            <Cell key={`cell-${index}`} fill={entry.failRate > 50 ? '#ef4444' : '#f97316'} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </ChartCard>
                </div>

                {/* Latest Activity Feed / Insights */}
                <div className="lg:col-span-5">
                    <Card className="border-none shadow-premium rounded-[2rem] overflow-hidden flex flex-col h-full bg-slate-900 text-white">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-2xl font-black flex items-center gap-2">
                                <HelpCircle className="h-6 w-6 text-primary" />
                                Platform Insights
                            </CardTitle>
                            <CardDescription className="text-slate-400 font-medium italic">AI-driven arena observations</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6 flex-1 overflow-y-auto">
                            <div className="p-5 rounded-3xl bg-white/5 border border-white/10 space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center"><CheckCircle2 className="h-4 w-4" /></div>
                                    <p className="font-black text-sm uppercase tracking-widest">Efficiency Up</p>
                                </div>
                                <p className="text-sm text-slate-300 font-medium leading-relaxed">Students are completing daily challenges 15% faster than last week. React mastery is at an all-time high of 82%.</p>
                            </div>

                            <div className="p-5 rounded-3xl bg-white/5 border border-white/10 space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center"><AlertCircle className="h-4 w-4" /></div>
                                    <p className="font-black text-sm uppercase tracking-widest">Difficulty Spike</p>
                                </div>
                                <p className="text-sm text-slate-300 font-medium leading-relaxed">JS Async/Await questions have a 60% failure rate. Consider recommending more targeted lessons in the student feed.</p>
                            </div>

                            <div className="p-6 rounded-3xl bg-primary shadow-xl shadow-primary/20 space-y-2 mt-auto">
                                <div className="flex items-center justify-between">
                                    <Trophy className="h-8 w-8 text-white/50" />
                                    <Badge variant="secondary" className="bg-white/20 text-white border-none">ACTIVE NOW</Badge>
                                </div>
                                <h4 className="text-2xl font-black">Arena Status</h4>
                                <p className="text-xs font-bold text-white/80 uppercase">System is optimized and healthy</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
