import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import {
    Trophy,
    Zap,
    Target,
    Clock,
    CheckCircle,
    XCircle,
    ArrowRight,
    ArrowLeft,
    ChevronRight,
    TrendingUp,
    Award,
    BarChart2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface Question {
    id: string;
    question: string;
    options: string[];
    correctAnswer: string;
    category: string;
    difficulty: string;
    explanation: string;
}

interface PerformanceStats {
    totalAttempts: number;
    avgScore: string;
    bestScore: number;
    accuracy: string;
}

export function PracticeArenaPage() {
    const { user } = useAuth();
    const [view, setView] = useState<'selection' | 'quiz' | 'result'>('selection');
    const [quizMode, setQuizMode] = useState<'daily' | 'random'>('daily');
    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentIdx, setCurrentIdx] = useState(0);
    const [answers, setAnswers] = useState<string[]>([]);
    const [startTime, setStartTime] = useState<number>(0);
    const [timeLeft, setTimeLeft] = useState(30); // 30 seconds per question
    const [leaderboard, setLeaderboard] = useState<any[]>([]);
    const [stats, setStats] = useState<PerformanceStats | null>(null);
    const [dailyAttempted, setDailyAttempted] = useState(false);
    const [results, setResults] = useState<any>(null);

    // Random Quiz Config
    const [config, setConfig] = useState({
        category: 'All',
        difficulty: 'All',
        limit: 10
    });

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            if (user?.id) {
                const [dailyRes, statsRes, lbRes] = await Promise.all([
                    api.get(`/practice/daily/check/${user.id}`),
                    api.get(`/practice/stats/${user.id}`),
                    api.get('/practice/leaderboard')
                ]);
                setDailyAttempted(dailyRes.data.attempted);
                setStats(statsRes.data);
                setLeaderboard(lbRes.data);
            }
        } catch (err) {
            console.error('Failed to load practice data', err);
        }
    };

    const startDailyQuiz = async () => {
        if (dailyAttempted) {
            toast.error("You've already attempted today's daily challenge!");
            return;
        }
        try {
            const res = await api.get('/practice/daily');
            setQuestions(res.data.questions);
            setQuizMode('daily');
            initQuiz(res.data.questions);
        } catch (err) {
            toast.error("Failed to load daily quiz");
        }
    };

    const startRandomQuiz = async () => {
        try {
            const res = await api.get('/practice/random', { params: config });
            if (res.data.length === 0) {
                toast.info("No questions found for these filters");
                return;
            }
            setQuestions(res.data);
            setQuizMode('random');
            initQuiz(res.data);
        } catch (err) {
            toast.error("Failed to load random quiz");
        }
    };

    const initQuiz = (qList: Question[]) => {
        setCurrentIdx(0);
        setAnswers(new Array(qList.length).fill(''));
        setView('quiz');
        setStartTime(Date.now());
        setTimeLeft(30);
    };

    // Timer Logic
    useEffect(() => {
        let timer: any;
        if (view === 'quiz' && timeLeft > 0) {
            timer = setInterval(() => {
                setTimeLeft(prev => prev - 1);
            }, 1000);
        } else if (timeLeft === 0 && view === 'quiz') {
            handleNext(); // Auto-next if time runs out
        }
        return () => clearInterval(timer);
    }, [view, timeLeft]);

    const handleNext = () => {
        if (currentIdx < questions.length - 1) {
            setCurrentIdx(prev => prev + 1);
            setTimeLeft(30);
        } else {
            submitQuiz();
        }
    };

    const handlePrev = () => {
        if (currentIdx > 0) {
            setCurrentIdx(prev => prev - 1);
            setTimeLeft(30);
        }
    };

    const submitQuiz = async () => {
        const timeTaken = Math.floor((Date.now() - startTime) / 1000);
        let correct = 0;
        questions.forEach((q, i) => {
            if (answers[i] === q.correctAnswer) correct++;
        });

        const payload = {
            userId: user?.id,
            score: Math.round((correct / questions.length) * 100),
            totalQuestions: questions.length,
            correctCount: correct,
            wrongCount: questions.length - correct,
            timeTaken,
            accuracy: (correct / questions.length) * 100,
            quizType: quizMode
        };

        try {
            const res = await api.post('/practice/submit', payload);
            setResults({ ...payload, id: res.data.id });
            setView('result');
            fetchInitialData(); // Refresh stats and leaderboard
        } catch (err) {
            toast.error("Failed to submit result");
        }
    };

    if (view === 'quiz') {
        const q = questions[currentIdx];
        return (
            <div className="max-w-3xl mx-auto space-y-6">
                <div className="flex justify-between items-center bg-card p-4 rounded-xl border shadow-sm sticky top-0 z-10">
                    <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                            {currentIdx + 1}
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground uppercase">Question {currentIdx + 1} of {questions.length}</p>
                            <Progress value={((currentIdx + 1) / questions.length) * 100} className="h-1.5 w-32 mt-1" />
                        </div>
                    </div>
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-xl font-bold border transition-colors ${timeLeft < 10 ? 'bg-red-50 text-red-600 border-red-200' : 'bg-muted border-transparent'}`}>
                        <Clock className={`h-5 w-5 ${timeLeft < 10 ? 'animate-pulse' : ''}`} />
                        00:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}
                    </div>
                </div>

                <Card className="border-2 border-primary/10 overflow-hidden">
                    <CardHeader className="bg-muted/30 pb-8">
                        <div className="flex gap-2 mb-2">
                            <Badge variant="outline" className="bg-background">{q.category}</Badge>
                            <Badge variant="secondary" className="capitalize">{q.difficulty}</Badge>
                        </div>
                        <CardTitle className="text-2xl leading-relaxed">{q.question}</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-3">
                        {q.options.map((opt, i) => (
                            <button
                                key={i}
                                onClick={() => {
                                    const newAnswers = [...answers];
                                    newAnswers[currentIdx] = opt;
                                    setAnswers(newAnswers);
                                }}
                                className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center justify-between group ${answers[currentIdx] === opt
                                    ? 'border-primary bg-primary/5 text-primary shadow-sm'
                                    : 'border-muted hover:border-primary/50 hover:bg-muted/50'
                                    }`}
                            >
                                <div className="flex items-center gap-4">
                                    <span className={`h-8 w-8 flex items-center justify-center rounded-lg border font-bold text-sm ${answers[currentIdx] === opt ? 'bg-primary text-white border-primary' : 'bg-background text-muted-foreground'}`}>{String.fromCharCode(65 + i)}</span>
                                    <span className="font-medium">{opt}</span>
                                </div>
                                <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${answers[currentIdx] === opt ? 'border-primary bg-primary' : 'border-muted'}`}>
                                    {answers[currentIdx] === opt && <div className="h-2 w-2 rounded-full bg-white" />}
                                </div>
                            </button>
                        ))}
                    </CardContent>
                </Card>

                <div className="flex justify-between items-center gap-4">
                    <Button variant="outline" size="lg" disabled={currentIdx === 0} onClick={handlePrev} className="px-8 rounded-xl h-12">
                        <ArrowLeft className="h-4 w-4 mr-2" /> Previous
                    </Button>
                    <div className="flex gap-3">
                        {currentIdx === questions.length - 1 ? (
                            <Button size="lg" onClick={submitQuiz} className="px-10 rounded-xl h-12 bg-green-600 hover:bg-green-700 shadow-lg shadow-green-100">
                                Submit Quiz <Trophy className="ml-2 h-4 w-4" />
                            </Button>
                        ) : (
                            <Button size="lg" onClick={handleNext} className="px-10 rounded-xl h-12 shadow-lg shadow-primary/10">
                                Next <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    if (view === 'result') {
        return (
            <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="text-center space-y-2">
                    <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-yellow-100 text-yellow-600 mb-4 ring-8 ring-yellow-50">
                        <Trophy className="h-10 w-10" />
                    </div>
                    <h1 className="text-4xl font-black tracking-tight">Quiz Complete!</h1>
                    <p className="text-muted-foreground text-lg">Great effort! Here is how you performed.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card className="border-none shadow-md bg-primary text-primary-foreground transform hover:scale-105 transition-transform">
                        <CardContent className="pt-6 text-center">
                            <p className="text-xs uppercase font-bold opacity-70">Total Score</p>
                            <h3 className="text-4xl font-black">{results.score}%</h3>
                        </CardContent>
                    </Card>
                    <Card className="border-none shadow-md bg-green-500 text-white transform hover:scale-105 transition-transform">
                        <CardContent className="pt-6 text-center">
                            <p className="text-xs uppercase font-bold opacity-70">Correct</p>
                            <h3 className="text-4xl font-black">{results.correctCount} / {results.totalQuestions}</h3>
                        </CardContent>
                    </Card>
                    <Card className="border-none shadow-md bg-white border transform hover:scale-105 transition-transform">
                        <CardContent className="pt-6 text-center">
                            <p className="text-xs uppercase font-bold text-muted-foreground">Accuracy</p>
                            <h3 className="text-4xl font-black text-primary">{Math.round(results.accuracy)}%</h3>
                        </CardContent>
                    </Card>
                    <Card className="border-none shadow-md bg-white border transform hover:scale-105 transition-transform">
                        <CardContent className="pt-6 text-center">
                            <p className="text-xs uppercase font-bold text-muted-foreground">Time Taken</p>
                            <h3 className="text-4xl font-black text-primary">{Math.floor(results.timeTaken / 60)}m {results.timeTaken % 60}s</h3>
                        </CardContent>
                    </Card>
                </div>

                <Card className="border-2">
                    <CardHeader>
                        <CardTitle>Detailed Review</CardTitle>
                        <CardDescription>Review the correct answers for each question.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {questions.map((q, i) => (
                            <div key={i} className="p-4 rounded-xl border bg-muted/30">
                                <div className="flex gap-4">
                                    <div className={`h-8 w-8 shrink-0 flex items-center justify-center rounded-lg ${answers[i] === q.correctAnswer ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                        {answers[i] === q.correctAnswer ? <CheckCircle className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
                                    </div>
                                    <div className="space-y-2">
                                        <p className="font-bold">{q.question}</p>
                                        <div className="flex flex-wrap gap-4 text-sm mt-2">
                                            <p><span className="text-muted-foreground">Your answer:</span> <span className={answers[i] === q.correctAnswer ? 'text-green-600 font-bold' : 'text-red-600 font-bold'}>{answers[i] || 'Not attempted'}</span></p>
                                            {answers[i] !== q.correctAnswer && (
                                                <p><span className="text-muted-foreground">Correct answer:</span> <span className="text-green-600 font-bold">{q.correctAnswer}</span></p>
                                            )}
                                        </div>
                                        {q.explanation && (
                                            <div className="mt-3 p-3 bg-blue-50 text-blue-800 rounded-lg text-sm border border-blue-100">
                                                <p className="font-bold mb-1 flex items-center gap-2"><Target className="h-4 w-4" /> Explanation:</p>
                                                {q.explanation}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                <div className="flex justify-center">
                    <Button size="lg" onClick={() => setView('selection')} className="px-12 rounded-xl h-12 shadow-xl shadow-primary/20">
                        Back to Arena
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-12">
            {/* Welcome Header */}
            <div className="relative overflow-hidden rounded-3xl bg-primary px-8 py-12 text-white shadow-2xl">
                <div className="relative z-10 space-y-4 max-w-2xl">
                    <Badge variant="secondary" className="bg-white/20 text-white border-none backdrop-blur-md">PRACTICE ARENA</Badge>
                    <h1 className="text-5xl font-black tracking-tight leading-none">Sharpen Your Skills</h1>
                    <p className="text-xl text-primary-foreground/80 leading-relaxed font-medium">Daily challenges, random quizzes, and global leaderboards. Level up your knowledge every day.</p>
                </div>
                <div className="absolute right-0 top-0 h-full w-1/2 opacity-10 pointer-events-none">
                    <Trophy className="h-full w-full transform translate-x-20 translate-y-10 rotate-12" />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Column: Challenge & Random */}
                <div className="lg:col-span-8 space-y-8">
                    {/* Daily Challenge */}
                    <Card className="overflow-hidden border-2 border-yellow-200 shadow-yellow-50 bg-gradient-to-br from-yellow-50/50 to-white">
                        <div className="h-2 bg-yellow-400" />
                        <div className="p-8">
                            <div className="flex flex-col md:flex-row gap-8 items-center">
                                <div className="h-24 w-24 rounded-2xl bg-yellow-400 flex items-center justify-center text-white rotate-3 shadow-xl shadow-yellow-100 shrink-0">
                                    <Zap className="h-12 w-12 fill-current" />
                                </div>
                                <div className="flex-1 space-y-4 text-center md:text-left">
                                    <div>
                                        <h2 className="text-3xl font-black mb-1">Daily Quiz Challenge</h2>
                                        <p className="text-muted-foreground font-medium">Earn double points and climb the leaderboard faster with today's hand-picked set.</p>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-4 justify-center md:justify-start">
                                        <Badge variant="outline" className="px-4 py-1.5 rounded-full border-yellow-200 text-yellow-700 bg-yellow-100/50 flex gap-2"><Target className="h-4 w-4" /> 5 Questions</Badge>
                                        <Badge variant="outline" className="px-4 py-1.5 rounded-full border-yellow-200 text-yellow-700 bg-yellow-100/50 flex gap-2"><Clock className="h-4 w-4" /> 30s / Question</Badge>
                                    </div>
                                    <Button
                                        size="lg"
                                        disabled={dailyAttempted}
                                        onClick={startDailyQuiz}
                                        className="w-full md:w-auto px-10 h-14 rounded-2xl text-lg font-bold bg-yellow-500 hover:bg-yellow-600 shadow-lg shadow-yellow-200 transition-all hover:scale-105 active:scale-95"
                                    >
                                        {dailyAttempted ? 'Completed for Today' : 'Start Daily Challenge'}
                                        {!dailyAttempted && <ChevronRight className="ml-2 h-5 w-5" />}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Random Quiz Generator */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary"><Zap className="h-6 w-6" /></div>
                            <h2 className="text-2xl font-black">Quick Play</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-muted-foreground ml-1">CATEGORY</label>
                                <select
                                    className="w-full h-12 rounded-xl bg-card border-2 border-muted focus:border-primary outline-none px-4 font-medium"
                                    value={config.category}
                                    onChange={(e) => setConfig({ ...config, category: e.target.value })}
                                >
                                    <option>All</option>
                                    <option>JavaScript</option>
                                    <option>React</option>
                                    <option>Node.js</option>
                                    <option>General Science</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-muted-foreground ml-1">DIFFICULTY</label>
                                <select
                                    className="w-full h-12 rounded-xl bg-card border-2 border-muted focus:border-primary outline-none px-4 font-medium"
                                    value={config.difficulty}
                                    onChange={(e) => setConfig({ ...config, difficulty: e.target.value })}
                                >
                                    <option>All</option>
                                    <option>Easy</option>
                                    <option>Medium</option>
                                    <option>Hard</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-muted-foreground ml-1">QUESTIONS</label>
                                <select
                                    className="w-full h-12 rounded-xl bg-card border-2 border-muted focus:border-primary outline-none px-4 font-medium"
                                    value={config.limit}
                                    onChange={(e) => setConfig({ ...config, limit: parseInt(e.target.value) })}
                                >
                                    <option value="5">5 Questions</option>
                                    <option value="10">10 Questions</option>
                                    <option value="15">15 Questions</option>
                                </select>
                            </div>
                        </div>
                        <Button
                            size="lg"
                            onClick={startRandomQuiz}
                            className="w-full h-14 rounded-2xl text-lg font-bold shadow-xl shadow-primary/10 hover:scale-[1.01] active:scale-[0.99] transition-all"
                        >
                            Generate Random Quiz <Trophy className="ml-2 h-5 w-5" />
                        </Button>
                    </div>
                </div>

                {/* Right Column: Mini Leaderboard & Stats */}
                <div className="lg:col-span-4 space-y-6">
                    {/* Performance Summary */}
                    <Card className="border-2 shadow-sm">
                        <CardHeader className="pb-2">
                            <CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5 text-primary" /> Your Performance</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-3 rounded-xl bg-muted/50 border">
                                    <p className="text-xs font-bold text-muted-foreground uppercase">Quizzes</p>
                                    <p className="text-2xl font-black">{stats?.totalAttempts || 0}</p>
                                </div>
                                <div className="p-3 rounded-xl bg-muted/50 border">
                                    <p className="text-xs font-bold text-muted-foreground uppercase">Avg Score</p>
                                    <p className="text-2xl font-black text-primary">{stats?.avgScore || 0}%</p>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm font-bold">
                                    <span>Accuracy</span>
                                    <span className="text-primary">{stats?.accuracy || 0}%</span>
                                </div>
                                <Progress value={parseFloat(stats?.accuracy || '0')} className="h-2" />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Mini Leaderboard */}
                    <Card className="border-2 shadow-sm overflow-hidden">
                        <CardHeader className="bg-muted/30 pb-4">
                            <CardTitle className="flex items-center gap-2"><Award className="h-5 w-5 text-yellow-500" /> Leaderboard</CardTitle>
                        </CardHeader>
                        <div className="divide-y">
                            {leaderboard.length > 0 ? leaderboard.slice(0, 5).map((entry, i) => (
                                <div key={i} className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className={`h-8 w-8 rounded-lg flex items-center justify-center font-black text-sm ${i === 0 ? 'bg-yellow-100 text-yellow-600' :
                                            i === 1 ? 'bg-slate-100 text-slate-600' :
                                                i === 2 ? 'bg-orange-100 text-orange-600' : 'bg-muted text-muted-foreground'
                                            }`}>
                                            {i + 1}
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm leading-none">{entry.studentName}</p>
                                            <p className="text-xs text-muted-foreground mt-1">{Math.floor(entry.timeTaken / 60)}m {entry.timeTaken % 60}s</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-black text-primary">{entry.score}%</p>
                                    </div>
                                </div>
                            )) : (
                                <div className="p-8 text-center text-muted-foreground text-sm font-medium"> No attempts yet. Be the first!</div>
                            )}
                        </div>
                        {leaderboard.length > 5 && (
                            <div className="p-3 bg-muted/20 text-center">
                                <button className="text-xs font-bold text-primary hover:underline">View Full Leaderboard</button>
                            </div>
                        )}
                    </Card>

                    {/* Activity Graph Placeholder */}
                    <Card className="border-2 bg-gradient-to-br from-primary/5 to-white ring-1 ring-primary/10">
                        <CardContent className="pt-6 text-center space-y-3">
                            <div className="h-12 w-12 rounded-full bg-primary/10 text-primary mx-auto flex items-center justify-center">
                                <BarChart2 className="h-6 w-6" />
                            </div>
                            <h4 className="font-black">Unlock Mastery</h4>
                            <p className="text-xs text-muted-foreground px-4">Practice daily to unlock achievement badges and personalized insights.</p>
                            <Button variant="ghost" className="text-xs underline font-bold" disabled>Coming Soon</Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
