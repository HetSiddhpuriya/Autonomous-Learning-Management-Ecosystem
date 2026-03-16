import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import {
    Plus,
    Search,
    Edit2,
    Trash2,
    Filter,
    BarChart3,
    Users,
    Trophy,
    BookOpen,
    PieChart as PieChartIcon,
    HelpCircle,
    TrendingUp,
    Clock,
    MoreVertical,
    CheckCircle2,
    AlertCircle
} from 'lucide-react';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    LineChart,
    Line,
    Legend
} from 'recharts';

interface PracticeQuestion {
    id: string;
    question: string;
    options: string[];
    correctAnswer: string;
    category: string;
    difficulty: 'easy' | 'medium' | 'hard';
    explanation: string;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export function PracticeArenaManagement() {
    const [activeTab, setActiveTab] = useState('management');
    const [questions, setQuestions] = useState<PracticeQuestion[]>([]);
    const [performance, setPerformance] = useState<any[]>([]);
    const [leaderboard, setLeaderboard] = useState<any[]>([]);
    const [analytics, setAnalytics] = useState<any>(null);
    const [searchTerm, setSearchTerm] = useState('');

    // Create / Edit State
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [newQuestion, setNewQuestion] = useState<Partial<PracticeQuestion>>({
        question: '',
        options: ['', '', '', ''],
        correctAnswer: '',
        category: 'General Science',
        difficulty: 'easy',
        explanation: ''
    });

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const fetchData = async () => {
        try {
            if (activeTab === 'management') {
                const res = await api.get('/practice/questions');
                setQuestions(res.data);
            } else if (activeTab === 'performance') {
                const res = await api.get('/practice/instructor/performance');
                setPerformance(res.data);
            } else if (activeTab === 'leaderboard') {
                const res = await api.get('/practice/leaderboard');
                setLeaderboard(res.data);
            } else if (activeTab === 'analytics') {
                const res = await api.get('/practice/instructor/analytics');
                setAnalytics(res.data);
            }
        } catch (err) {
            console.error('Failed to fetch data', err);
            toast.error("Failed to load data");
        }
    };

    const handleCreateOrUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (isEditing && editingId) {
                await api.put(`/practice/questions/${editingId}`, newQuestion);
                toast.success("Question updated!");
            } else {
                await api.post('/practice/questions', newQuestion);
                toast.success("Question created!");
            }
            setIsEditing(false);
            setEditingId(null);
            setNewQuestion({ question: '', options: ['', '', '', ''], correctAnswer: '', category: 'General Science', difficulty: 'easy', explanation: '' });
            fetchData();
        } catch (err) {
            toast.error("Operation failed");
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure you want to delete this question?")) {
            try {
                await api.delete(`/practice/questions/${id}`);
                toast.success("Question deleted");
                fetchData();
            } catch (err) {
                toast.error("Delete failed");
            }
        }
    };

    const startEdit = (q: PracticeQuestion) => {
        setNewQuestion(q);
        setIsEditing(true);
        setEditingId(q.id);
        document.getElementById('edit-section')?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <div className="space-y-10 pb-20 p-2 md:p-6 lg:p-10 bg-slate-50/50 min-h-screen">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="space-y-2">
                    <Badge variant="outline" className="px-3 py-1 bg-primary/10 text-primary border-primary/20 text-xs font-bold uppercase tracking-widest">Instructor Hub</Badge>
                    <h1 className="text-5xl font-black tracking-tighter leading-tight text-slate-900 flex items-center gap-4">
                        Practice Arena <span className="text-primary">Management</span>
                    </h1>
                    <p className="text-slate-500 font-medium text-lg max-w-2xl">Create high-quality challenges, track student progress, and analyze performance trends.</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" className="h-12 px-6 rounded-2xl font-bold bg-white shadow-soft"><BarChart3 className="mr-2 h-5 w-5" /> Export Data</Button>
                    <Button className="h-12 px-8 rounded-2xl font-bold bg-primary shadow-soft hover:scale-105 active:scale-95 transition-all"><Plus className="mr-2 h-5 w-5" /> Add Category</Button>
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
                <div className="bg-white p-2 rounded-3xl shadow-soft border inline-flex overflow-x-auto">
                    <TabsList className="bg-transparent border-none p-0 flex gap-1">
                        <TabsTrigger value="management" className="text-sm font-bold h-10 px-6 rounded-2xl data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-soft-sm transition-all"><BookOpen className="h-4 w-4 mr-2" /> Quiz Management</TabsTrigger>
                        <TabsTrigger value="performance" className="text-sm font-bold h-10 px-6 rounded-2xl data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-soft-sm transition-all"><Users className="h-4 w-4 mr-2" /> Student Performance</TabsTrigger>
                        <TabsTrigger value="leaderboard" className="text-sm font-bold h-10 px-6 rounded-2xl data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-soft-sm transition-all"><Trophy className="h-4 w-4 mr-2" /> Leaderboard</TabsTrigger>
                        <TabsTrigger value="analytics" className="text-sm font-bold h-10 px-6 rounded-2xl data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-soft-sm transition-all"><PieChartIcon className="h-4 w-4 mr-2" /> Quiz Analytics</TabsTrigger>
                    </TabsList>
                </div>

                {/* 1. QUIZ MANAGEMENT */}
                <TabsContent value="management" className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-400">
                    <div id="edit-section" className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* Form Section */}
                        <div className="lg:col-span-4">
                            <Card className="border-none shadow-premium rounded-3xl sticky top-24 overflow-hidden">
                                <div className="h-2 bg-primary" />
                                <CardHeader className="pb-4">
                                    <CardTitle className="text-2xl font-black">{isEditing ? 'Edit Question' : 'Add New Question'}</CardTitle>
                                    <CardDescription className="font-medium">Populate the global practice bank with engaging questions.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handleCreateOrUpdate} className="space-y-5">
                                        <div className="space-y-2">
                                            <label className="text-xs font-black uppercase text-slate-400 ml-1">The Question</label>
                                            <textarea
                                                className="w-full rounded-2xl bg-slate-50 border-2 border-transparent focus:border-primary/20 focus:bg-white outline-none p-4 transition-all min-h-[120px] font-medium resize-none shadow-inner"
                                                placeholder="Type your question here..."
                                                required
                                                value={newQuestion.question}
                                                onChange={(e) => setNewQuestion({ ...newQuestion, question: e.target.value })}
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-xs font-black uppercase text-slate-400 ml-1">Category</label>
                                                <select
                                                    className="w-full h-12 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-primary/20 focus:bg-white outline-none px-4 font-bold transition-all shadow-inner"
                                                    value={newQuestion.category}
                                                    onChange={(e) => setNewQuestion({ ...newQuestion, category: e.target.value })}
                                                >
                                                    <option>JavaScript</option>
                                                    <option>React</option>
                                                    <option>Node.js</option>
                                                    <option>General Science</option>
                                                </select>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-black uppercase text-slate-400 ml-1">Difficulty</label>
                                                <select
                                                    className="w-full h-12 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-primary/20 focus:bg-white outline-none px-4 font-bold transition-all shadow-inner"
                                                    value={newQuestion.difficulty}
                                                    onChange={(e) => setNewQuestion({ ...newQuestion, difficulty: e.target.value as any })}
                                                >
                                                    <option value="easy">Easy</option>
                                                    <option value="medium">Medium</option>
                                                    <option value="hard">Hard</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <label className="text-xs font-black uppercase text-slate-400 ml-1 flex justify-between items-center">
                                                <span>MCQ Options</span>
                                                <span className="text-primary lowercase opacity-60">Click correct answer</span>
                                            </label>
                                            {newQuestion.options?.map((opt, i) => (
                                                <div key={i} className="flex gap-2">
                                                    <div className="flex-1 relative group">
                                                        <Input
                                                            className="h-12 rounded-2xl bg-slate-50 border-transparent focus:bg-white font-medium pl-10 pr-4 transition-all"
                                                            placeholder={`Option ${i + 1}`}
                                                            value={opt}
                                                            required
                                                            onChange={(e) => {
                                                                const opts = [...newQuestion.options!];
                                                                opts[i] = e.target.value;
                                                                setNewQuestion({ ...newQuestion, options: opts });
                                                            }}
                                                        />
                                                        <div className={`absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 rounded-full border-2 ${newQuestion.correctAnswer === opt && opt !== '' ? 'bg-primary border-primary' : 'border-slate-300'}`} />
                                                        <button
                                                            type="button"
                                                            onClick={() => opt && setNewQuestion({ ...newQuestion, correctAnswer: opt })}
                                                            className="absolute inset-0 z-10 w-8"
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-xs font-black uppercase text-slate-400 ml-1">Explanation (Optional)</label>
                                            <textarea
                                                className="w-full rounded-2xl bg-slate-50 border-2 border-transparent focus:border-primary/20 focus:bg-white outline-none p-4 transition-all min-h-[80px] font-medium resize-none shadow-inner"
                                                placeholder="Help students learn from their mistakes..."
                                                value={newQuestion.explanation}
                                                onChange={(e) => setNewQuestion({ ...newQuestion, explanation: e.target.value })}
                                            />
                                        </div>

                                        <div className="flex gap-4 pt-4">
                                            {isEditing && (
                                                <Button type="button" variant="outline" className="flex-1 h-12 rounded-2xl font-bold" onClick={() => { setIsEditing(false); setEditingId(null); setNewQuestion({ question: '', options: ['', '', '', ''], correctAnswer: '', category: 'General Science', difficulty: 'easy', explanation: '' }); }}>Cancel</Button>
                                            )}
                                            <Button type="submit" className="flex-1 h-12 rounded-2xl font-bold shadow-soft transition-all hover:scale-105">{isEditing ? 'Save Changes' : 'Create Question'}</Button>
                                        </div>
                                    </form>
                                </CardContent>
                            </Card>
                        </div>

                        {/* List Section */}
                        <div className="lg:col-span-8 space-y-6">
                            <Card className="border-none shadow-premium bg-white rounded-3xl overflow-hidden">
                                <CardHeader className="pb-2 border-b">
                                    <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                                        <div>
                                            <CardTitle className="text-2xl font-black">Question Bank</CardTitle>
                                            <CardDescription className="font-medium">{questions.length} total questions available.</CardDescription>
                                        </div>
                                        <div className="relative w-full md:w-64">
                                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                            <Input className="pl-12 h-12 rounded-2xl bg-slate-50 border-transparent focus:bg-white transition-all shadow-inner" placeholder="Search questions..." />
                                        </div>
                                    </div>
                                </CardHeader>
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader className="bg-slate-50/50">
                                            <TableRow className="border-none">
                                                <TableHead className="py-4 pl-8 text-xs font-black uppercase text-slate-400">Category / Difficulty</TableHead>
                                                <TableHead className="py-4 text-xs font-black uppercase text-slate-400">Question Content</TableHead>
                                                <TableHead className="py-4 pr-8 text-right text-xs font-black uppercase text-slate-400">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {questions.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={3} className="h-64 text-center">
                                                        <div className="flex flex-col items-center gap-3">
                                                            <div className="h-16 w-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-300"><HelpCircle className="h-8 w-8" /></div>
                                                            <p className="text-slate-400 font-bold">No questions found in the arena.</p>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ) : questions.map((q) => (
                                                <TableRow key={q.id} className="group transition-colors hover:bg-slate-50/50">
                                                    <TableCell className="py-6 pl-8">
                                                        <div className="space-y-2">
                                                            <Badge className={`${q.difficulty === 'easy' ? 'bg-green-100 text-green-700' : q.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'} border-none rounded-full px-3 py-1 font-bold text-[10px] uppercase tracking-wider`}>{q.difficulty}</Badge>
                                                            <p className="text-xs font-black text-slate-400 ml-1">{q.category}</p>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="py-6 min-w-[300px]">
                                                        <p className="font-bold text-slate-800 leading-relaxed mb-2 line-clamp-2">{q.question}</p>
                                                        <div className="flex flex-wrap gap-2">
                                                            {q.options.map((opt, i) => (
                                                                <Badge key={i} variant="outline" className={`px-2 py-0.5 text-[10px] rounded-lg ${opt === q.correctAnswer ? 'border-primary text-primary font-bold' : 'text-slate-400 border-slate-200'}`}>{opt}</Badge>
                                                            ))}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="py-6 pr-8 text-right">
                                                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-primary/10 hover:text-primary transition-all" onClick={() => startEdit(q)}><Edit2 className="h-4 w-4" /></Button>
                                                            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-red-50 hover:text-red-500 transition-all font-bold" onClick={() => handleDelete(q.id)}><Trash2 className="h-4 w-4" /></Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </Card>
                        </div>
                    </div>
                </TabsContent>

                {/* 2. STUDENT PERFORMANCE */}
                <TabsContent value="performance" className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-400">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Card className="border-none shadow-soft rounded-3xl bg-white p-6 flex items-center gap-6">
                            <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary"><Users className="h-8 w-8" /></div>
                            <div>
                                <p className="text-sm font-black text-slate-400 uppercase tracking-wider">Active Students</p>
                                <h3 className="text-3xl font-black text-slate-900">{performance.length}</h3>
                            </div>
                        </Card>
                        <Card className="border-none shadow-soft rounded-3xl bg-white p-6 flex items-center gap-6">
                            <div className="h-16 w-16 rounded-2xl bg-green-50 flex items-center justify-center text-green-500"><TrendingUp className="h-8 w-8" /></div>
                            <div>
                                <p className="text-sm font-black text-slate-400 uppercase tracking-wider">Avg Accuracy</p>
                                <h3 className="text-3xl font-black text-slate-900">
                                    {performance.length > 0 ? (performance.reduce((acc, curr) => acc + parseFloat(curr.accuracy), 0) / performance.length).toFixed(1) : '0'}%
                                </h3>
                            </div>
                        </Card>
                        <Card className="border-none shadow-soft rounded-3xl bg-white p-6 flex items-center gap-6">
                            <div className="h-16 w-16 rounded-2xl bg-yellow-50 flex items-center justify-center text-yellow-500"><Trophy className="h-8 w-8" /></div>
                            <div>
                                <p className="text-sm font-black text-slate-400 uppercase tracking-wider">Top Achievement</p>
                                <h3 className="text-3xl font-black text-slate-900">Master Level</h3>
                            </div>
                        </Card>
                    </div>

                    <Card className="border-none shadow-premium bg-white rounded-3xl overflow-hidden">
                        <CardHeader className="flex flex-col md:flex-row justify-between md:items-center p-8 gap-4">
                            <div>
                                <CardTitle className="text-2xl font-black">Performance Audit</CardTitle>
                                <CardDescription className="text-slate-500 font-medium text-base">In-depth statistical breakdown of all student attempts.</CardDescription>
                            </div>
                            <div className="flex gap-4">
                                <div className="relative">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <Input className="pl-12 h-12 w-full md:w-64 rounded-2xl bg-slate-50 border-none font-bold shadow-inner" placeholder="Filter student..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                                </div>
                            </div>
                        </CardHeader>
                        <Table>
                            <TableHeader className="bg-slate-50/80">
                                <TableRow className="border-none">
                                    <TableHead className="py-5 pl-8 text-xs font-black uppercase text-slate-400">Student Identity</TableHead>
                                    <TableHead className="py-5 text-xs font-black uppercase text-slate-400">Attempts</TableHead>
                                    <TableHead className="py-5 text-xs font-black uppercase text-slate-400">Peak Score</TableHead>
                                    <TableHead className="py-5 text-xs font-black uppercase text-slate-400 text-center">Avg Accuracy</TableHead>
                                    <TableHead className="py-5 pr-8 text-right text-xs font-black uppercase text-slate-400">Assessment</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {performance.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())).map((p, i) => (
                                    <TableRow key={i} className="group hover:bg-slate-50/50 transition-colors">
                                        <TableCell className="py-6 pl-8">
                                            <div className="flex items-center gap-4">
                                                <div className="h-12 w-12 rounded-2xl bg-slate-100 flex items-center justify-center font-black text-primary border-2 border-slate-50 shadow-soft-sm group-hover:scale-110 transition-transform">{p.name.charAt(0)}</div>
                                                <p className="font-black text-slate-800 text-lg">{p.name}</p>
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-6">
                                            <Badge variant="outline" className="px-3 py-1 bg-white border-slate-200 text-slate-600 font-bold rounded-xl">{p.totalAttempts} Quizzes</Badge>
                                        </TableCell>
                                        <TableCell className="py-6">
                                            <div className="flex items-center gap-2">
                                                <span className="font-black text-xl text-slate-900">{p.bestScore}</span>
                                                <span className="text-xs font-bold text-slate-400 lowercase">pts</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-6">
                                            <div className="flex flex-col items-center gap-2">
                                                <span className="font-black text-primary">{p.accuracy}%</span>
                                                <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                    <div className="h-full bg-primary rounded-full shadow-[0_0_8px_rgba(37,99,235,0.4)]" style={{ width: `${p.accuracy}%` }} />
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-6 pr-8 text-right">
                                            <Badge className={`${parseFloat(p.accuracy) > 80 ? 'bg-green-500' : parseFloat(p.accuracy) > 50 ? 'bg-yellow-500' : 'bg-red-500'} text-white border-none px-4 py-1.5 rounded-2xl font-black text-xs shadow-soft-sm`}>{parseFloat(p.accuracy) > 80 ? 'EXCELLENT' : parseFloat(p.accuracy) > 50 ? 'GROWING' : 'NEEDS FOCUS'}</Badge>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </Card>
                </TabsContent>

                {/* 3. LEADERBOARD */}
                <TabsContent value="leaderboard" className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-400">
                    <Card className="border-none shadow-premium bg-white rounded-[2rem] overflow-hidden">
                        <div className="bg-gradient-to-r from-primary to-blue-700 p-12 text-white relative overflow-hidden">
                            <div className="relative z-10 space-y-2">
                                <h2 className="text-4xl font-black tracking-tighter">Global Honor Roll</h2>
                                <p className="text-primary-foreground/70 font-medium text-lg">Recognizing the most elite performers in the Practice Arena.</p>
                            </div>
                            <Trophy className="absolute right-0 top-0 h-64 w-64 text-white/10 transform translate-x-12 -translate-y-8 rotate-12" />
                        </div>
                        <Table>
                            <TableHeader className="bg-slate-50">
                                <TableRow className="border-none">
                                    <TableHead className="py-6 pl-12 text-[10px] font-black uppercase text-slate-400 tracking-widest">Rank Position</TableHead>
                                    <TableHead className="py-6 text-[10px] font-black uppercase text-slate-400 tracking-widest">Contender</TableHead>
                                    <TableHead className="py-6 text-[10px] font-black uppercase text-slate-400 tracking-widest text-center">Score Ratio</TableHead>
                                    <TableHead className="py-6 text-[10px] font-black uppercase text-slate-400 tracking-widest">Time Elapsed</TableHead>
                                    <TableHead className="py-6 pr-12 text-right text-[10px] font-black uppercase text-slate-400 tracking-widest">Completion Date</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {leaderboard.map((l, i) => (
                                    <TableRow key={i} className="border-b border-slate-50 transition-all hover:bg-slate-50/50">
                                        <TableCell className="py-8 pl-12">
                                            <div className={`h-10 w-10 flex items-center justify-center rounded-2xl font-black text-lg ${i === 0 ? 'bg-yellow-400 text-white shadow-soft shadow-yellow-100 rotate-6' :
                                                i === 1 ? 'bg-slate-400 text-white rotate-[-3deg]' :
                                                    i === 2 ? 'bg-orange-500 text-white rotate-2' : 'bg-slate-100 text-slate-400 font-bold'
                                                }`}>
                                                {i + 1}
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-8 font-black text-slate-800 text-lg">{l.studentName}</TableCell>
                                        <TableCell className="py-8 text-center">
                                            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/5 rounded-full border border-primary/10">
                                                <span className="font-black text-primary text-xl">{l.score}%</span>
                                                <div className="h-4 w-[2px] bg-primary/20" />
                                                <CheckCircle2 className="h-4 w-4 text-primary" />
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-8">
                                            <div className="flex items-center gap-2 font-black text-slate-400">
                                                <Clock className="h-4 w-4" />
                                                <span>{Math.floor(l.timeTaken / 60)}m {l.timeTaken % 60}s</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-8 pr-12 text-right">
                                            <p className="font-bold text-slate-500">{new Date(l.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </Card>
                </TabsContent>

                {/* 4. QUIZ ANALYTICS */}
                <TabsContent value="analytics" className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-400">
                    {analytics && (
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                            {/* Daily Participation Line Chart */}
                            <Card className="lg:col-span-8 border-none shadow-premium bg-white rounded-3xl p-8">
                                <CardHeader className="px-0 pb-10">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <CardTitle className="text-3xl font-black tracking-tighter">Participation Trends</CardTitle>
                                            <CardDescription className="font-medium">Monitoring quiz engagement over the course of time.</CardDescription>
                                        </div>
                                        <Badge variant="outline" className="bg-primary/5 text-primary border-primary/10 px-4 py-1 rounded-full font-bold">Real-time Data</Badge>
                                    </div>
                                </CardHeader>
                                <div className="h-[400px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={analytics.dailyParticipation}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                            <XAxis dataKey="_id" axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 12, fontWeight: 700 }} dy={10} />
                                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 12, fontWeight: 700 }} dx={-10} />
                                            <Tooltip contentStyle={{ borderRadius: '1.5rem', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '1rem' }} itemStyle={{ fontWeight: 900, color: '#2563EB' }} />
                                            <Line type="monotone" dataKey="count" stroke="#2563EB" strokeWidth={6} dot={{ r: 8, fill: '#2563EB', strokeWidth: 4, stroke: '#fff' }} activeDot={{ r: 10, fill: '#2563EB', stroke: '#fff', strokeWidth: 4 }} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </Card>

                            {/* Category Accuracy Pie Chart */}
                            <Card className="lg:col-span-4 border-none shadow-premium bg-white rounded-3xl p-8">
                                <CardHeader className="px-0 pb-10">
                                    <CardTitle className="text-3xl font-black tracking-tighter">Skill Accuracy</CardTitle>
                                    <CardDescription className="font-medium">Performance split by categories.</CardDescription>
                                </CardHeader>
                                <div className="h-[300px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={analytics.categoryAccuracy}
                                                innerRadius={80}
                                                outerRadius={120}
                                                paddingAngle={10}
                                                dataKey="accuracy"
                                            >
                                                {analytics.categoryAccuracy.map((entry: any, index: number) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip contentStyle={{ borderRadius: '1rem' }} />
                                            <Legend verticalAlign="bottom" height={36} wrapperStyle={{ paddingTop: '2rem', fontWeight: 900 }} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </Card>

                            {/* Difficult Questions Bar Chart */}
                            <Card className="lg:col-span-12 border-none shadow-premium bg-white rounded-3xl p-8">
                                <CardHeader className="px-0 pb-10">
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center shadow-soft-sm"><AlertCircle className="h-7 w-7" /></div>
                                        <div>
                                            <CardTitle className="text-3xl font-black tracking-tighter">Tough Pillars</CardTitle>
                                            <CardDescription className="font-medium">Questions with the highest failure rates requiring instructor review.</CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <div className="h-[350px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={analytics.mostDifficult} layout="vertical">
                                            <XAxis type="number" hide />
                                            <YAxis dataKey="question" type="category" width={180} axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 13, fontWeight: 800 }} />
                                            <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '1rem' }} />
                                            <Bar dataKey="failRate" fill="#EF4444" radius={[0, 12, 12, 0]} barSize={40}>
                                                {analytics.mostDifficult.map((entry: any, index: number) => (
                                                    <Cell key={`cell-${index}`} fill={entry.failRate > 50 ? '#EF4444' : '#F59E0B'} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </Card>
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}
