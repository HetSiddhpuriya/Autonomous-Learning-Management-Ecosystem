import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CreditCard, QrCode, Building2, MapPin, ChevronRight, ChevronDown, PenLine, Smartphone, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import type { Course } from '@/types';

export function PaymentCheckoutPage() {
    const { courseId } = useParams<{ courseId: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [course, setCourse] = useState<Course | null>(null);
    const [loading, setLoading] = useState(true);
    const [timeLeft, setTimeLeft] = useState(6 * 60 + 31); // 06:31
    const [paymentMethod, setPaymentMethod] = useState('upi');
    const [showQr, setShowQr] = useState(false);

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        if (user.role !== 'student') {
            toast.error('Only students can purchase courses');
            navigate('/');
            return;
        }
        fetchCourse();
    }, [user, courseId]);

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const fetchCourse = async () => {
        try {
            setLoading(true);
            const { data } = await api.get(`/courses/${courseId}`);
            setCourse(data);
        } catch {
            toast.error('Failed to load course details');
            navigate('/courses');
        } finally {
            setLoading(false);
        }
    };

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const handlePayment = async () => {
        try {
            await api.post(`/courses/${courseId}/enroll`);
            toast.success('Payment successful! You are now enrolled.');
            navigate('/student/courses');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Payment failed');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!course) return null;

    const price = course.price || 4999;

    return (
        <div className="min-h-screen bg-[#F5F7FA] text-slate-800 font-sans pb-20">
            {/* Top Header */}
            <header className="bg-white border-b sticky top-0 z-10 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3 text-2xl font-bold text-[#967657]">
                    <div className="bg-[#A48261] text-white p-1.5 flex items-center justify-center w-8 h-8 rounded-sm">
                        <span className="font-bold text-lg leading-none mt-0.5">L</span>
                    </div>
                    LearnFlux
                </div>

                <div className="hidden md:flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-full text-sm font-medium">
                    <span className="text-slate-500">Complete your payment in</span>
                    <span className="bg-emerald-600 text-white px-2 py-0.5 rounded text-xs tracking-wider">
                        {formatTime(timeLeft)}
                    </span>
                </div>

                <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-slate-200 border-2 border-slate-300 flex items-center justify-center text-xs font-bold text-slate-600">
                        {user?.name?.substring(0, 2).toUpperCase()}
                    </div>
                    <span className="text-sm font-bold hidden sm:block uppercase tracking-wide">
                        {user?.name}
                    </span>
                    <ChevronDown className="h-4 w-4 text-slate-400" />
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-4 mt-8">
                <h1 className="text-2xl font-normal text-slate-700 mb-6">
                    Welcome <span className="font-bold uppercase">{user?.name}</span>
                </h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Course Header Card */}
                        <Card className="border-0 shadow-sm rounded-xl overflow-hidden">
                            <CardContent className="p-0">
                                <div className="p-6 flex items-start gap-4">
                                    <div className="w-24 h-16 rounded overflow-hidden shrink-0 border border-slate-200 bg-slate-100">
                                        <img src={course.thumbnail} alt="Course" className="w-full h-full object-cover" />
                                    </div>
                                    <div>
                                        <p className="text-xs uppercase text-slate-500 tracking-wider font-semibold mb-1">LEARNFLUX EDUCATION PVT LTD</p>
                                        <h2 className="text-xl font-bold text-slate-900">{course.title}</h2>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Payment Methods Card */}
                        <Card className="border-0 shadow-sm rounded-xl">
                            <CardContent className="p-6">
                                <h3 className="text-lg font-bold text-slate-800 mb-6">Payment Methods</h3>

                                <div className="flex flex-col md:flex-row gap-6">
                                    {/* Methods List */}
                                    <div className="w-full md:w-1/3 space-y-3">
                                        <button
                                            onClick={() => setPaymentMethod('upi')}
                                            className={`w-full flex items-center justify-between p-4 rounded-lg border transition-all ${paymentMethod === 'upi' ? 'bg-rose-50 border-rose-100 text-rose-900' : 'bg-white border-slate-200 hover:border-rose-200'}`}
                                        >
                                            <div className="flex items-center gap-3 font-semibold text-sm">
                                                <Smartphone className={`h-5 w-5 ${paymentMethod === 'upi' ? 'text-rose-600' : 'text-slate-400'}`} />
                                                UPI
                                            </div>
                                            {paymentMethod === 'upi' && <ChevronRight className="h-4 w-4 text-rose-600" />}
                                        </button>

                                        <button
                                            onClick={() => setPaymentMethod('credit_card')}
                                            className={`w-full flex items-center justify-between p-4 rounded-lg border transition-all ${paymentMethod === 'credit_card' ? 'bg-rose-50 border-rose-100 text-rose-900' : 'bg-white border-slate-200 hover:border-rose-200'}`}
                                        >
                                            <div className="flex items-center gap-3 font-semibold text-sm">
                                                <CreditCard className={`h-5 w-5 ${paymentMethod === 'credit_card' ? 'text-rose-600' : 'text-slate-400'}`} />
                                                Credit Card
                                            </div>
                                            {paymentMethod === 'credit_card' && <ChevronRight className="h-4 w-4 text-rose-600" />}
                                        </button>

                                        <button
                                            onClick={() => setPaymentMethod('debit_card')}
                                            className={`w-full flex items-center justify-between p-4 rounded-lg border transition-all ${paymentMethod === 'debit_card' ? 'bg-rose-50 border-rose-100 text-rose-900' : 'bg-white border-slate-200 hover:border-rose-200'}`}
                                        >
                                            <div className="flex items-center gap-3 font-semibold text-sm">
                                                <CreditCard className={`h-5 w-5 ${paymentMethod === 'debit_card' ? 'text-rose-600' : 'text-slate-400'}`} />
                                                Debit Card
                                            </div>
                                            {paymentMethod === 'debit_card' && <ChevronRight className="h-4 w-4 text-rose-600" />}
                                        </button>

                                        <button
                                            onClick={() => setPaymentMethod('net_banking')}
                                            className={`w-full flex items-center justify-between p-4 rounded-lg border transition-all ${paymentMethod === 'net_banking' ? 'bg-rose-50 border-rose-100 text-rose-900' : 'bg-white border-slate-200 hover:border-rose-200'}`}
                                        >
                                            <div className="flex items-center gap-3 font-semibold text-sm">
                                                <Building2 className={`h-5 w-5 ${paymentMethod === 'net_banking' ? 'text-rose-600' : 'text-slate-400'}`} />
                                                Net Banking
                                            </div>
                                            {paymentMethod === 'net_banking' && <ChevronRight className="h-4 w-4 text-rose-600" />}
                                        </button>
                                    </div>

                                    {/* Action Area */}
                                    <div className="w-full md:w-2/3 md:pl-8 md:border-l border-slate-100">
                                        {paymentMethod === 'upi' && (
                                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col md:flex-row items-center gap-8 justify-between h-full py-4">
                                                <div className="space-y-4 max-w-[200px]">
                                                    <h4 className="font-bold text-slate-800">Scan QR code</h4>
                                                    <p className="text-sm text-slate-500">1. Open any UPI or banking app on your phone</p>
                                                    <p className="text-sm text-slate-500">2. Scan the QR code to pay</p>

                                                    <div className="flex gap-2 pt-4">
                                                        <div className="h-6 w-8 bg-slate-100 rounded border flex items-center justify-center text-[10px] font-bold text-slate-600">GPay</div>
                                                        <div className="h-6 w-8 bg-indigo-50 rounded border border-indigo-100 flex items-center justify-center text-[10px] font-bold text-indigo-700">PhPe</div>
                                                        <div className="h-6 w-8 bg-sky-50 rounded border border-sky-100 flex items-center justify-center text-[10px] font-bold text-sky-700">Paytm</div>
                                                    </div>
                                                </div>

                                                <div className="relative group border border-slate-200 p-2 rounded-xl bg-white shadow-sm overflow-hidden">
                                                    <QrCode className={`w-32 h-32 transition-all duration-300 ${!showQr ? 'text-slate-300 blur-sm' : 'text-slate-800'}`} />

                                                    {!showQr ? (
                                                        <div className="absolute inset-0 flex items-center justify-center">
                                                            <Button
                                                                onClick={() => setShowQr(true)}
                                                                className="bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/20"
                                                            >
                                                                Show QR Code
                                                            </Button>
                                                        </div>
                                                    ) : (
                                                        <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-white/60 backdrop-blur-sm rounded-xl">
                                                            <Button
                                                                onClick={handlePayment}
                                                                className="bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/20"
                                                            >
                                                                Simulate
                                                            </Button>
                                                        </div>
                                                    )}
                                                </div>
                                            </motion.div>
                                        )}

                                        {paymentMethod !== 'upi' && (
                                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center h-full space-y-6 py-12 text-center">
                                                <div className="p-4 bg-slate-50 rounded-full">
                                                    <Wallet className="w-12 h-12 text-slate-300" />
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-slate-800 text-lg mb-2">Proceed with {paymentMethod.replace('_', ' ')}</h4>
                                                    <p className="text-sm text-slate-500 max-w-[250px] mx-auto">You will be securely redirected to the payment gateway to complete your transaction.</p>
                                                </div>
                                                <Button size="lg" className="bg-red-600 hover:bg-red-700 w-full max-w-xs" onClick={handlePayment}>
                                                    Pay ₹{price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                </Button>
                                            </motion.div>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column (Sidebar) */}
                    <div className="space-y-6">
                        {/* Billing Details */}
                        <Card className="border-0 shadow-sm rounded-xl">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-bold text-slate-800">Billing details</h3>
                                </div>
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-2 text-sm text-slate-600">
                                        <MapPin className="w-4 h-4 shrink-0" />
                                        <span>Gujarat, 380006</span>
                                    </div>
                                    <button className="p-1 hover:bg-slate-100 rounded text-red-500 transition-colors">
                                        <PenLine className="w-4 h-4" />
                                    </button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Price Breakup */}
                        <Card className="border-0 shadow-sm rounded-xl">
                            <CardContent className="p-6">
                                <h3 className="font-bold text-slate-800 mb-6">Price breakup</h3>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-slate-500">Course Fee</span>
                                        <span className="font-medium text-slate-700">₹{price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                    </div>

                                    <div className="pt-4 border-t border-dashed border-slate-200 flex items-center justify-between">
                                        <span className="font-bold text-slate-800">Total Amount</span>
                                        <span className="font-bold text-lg text-slate-800">₹{price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Apply Scholarship */}
                        <Card className="border-0 shadow-sm rounded-xl cursor-pointer hover:shadow-md transition-shadow">
                            <CardContent className="p-6 flex items-center justify-between">
                                <span className="font-bold text-slate-800 text-sm tracking-wide">Apply Scholarship</span>
                                <ChevronRight className="w-5 h-5 text-slate-400" />
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>
        </div>
    );
}


