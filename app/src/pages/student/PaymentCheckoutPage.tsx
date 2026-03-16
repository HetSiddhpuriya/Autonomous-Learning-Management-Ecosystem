import { useState, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CreditCard, QrCode, Building2, MapPin, ChevronRight, ChevronDown, PenLine, Smartphone, Wallet, Zap, Clock, Shield, CheckCircle2, Download, Loader2, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import type { Course } from '@/types';
import { Link } from 'react-router-dom';

export function PaymentCheckoutPage() {
    const { courseId } = useParams<{ courseId: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [course, setCourse] = useState<Course | null>(null);
    const [loading, setLoading] = useState(true);
    const [timeLeft, setTimeLeft] = useState(6 * 60 + 31); // 06:31
    const [paymentMethod, setPaymentMethod] = useState('upi');
    const [showQr, setShowQr] = useState(false);
    const [upiId, setUpiId] = useState('');
    const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success'>('idle');
    const [transactionId, setTransactionId] = useState('');
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [cardDetails, setCardDetails] = useState({
        number: '',
        expiry: '',
        cvv: '',
        name: ''
    });

    const handleCardInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setCardDetails(prev => ({ ...prev, [name]: value }));
    };

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
            setPaymentStatus('processing');
            setCurrentStepIndex(0);
            
            // Step 1: Payment Request Sent To UPI App / Bank
            await new Promise(resolve => setTimeout(resolve, 1500));
            setCurrentStepIndex(1);
            
            // Step 2: Waiting For Payment Confirmation
            await new Promise(resolve => setTimeout(resolve, 2500));

            const tid = 'TXN' + Math.random().toString(36).substr(2, 9).toUpperCase();

            await api.post(`/courses/${courseId}/enroll`, {
                transactionId: tid,
                paymentMethod: paymentMethod,
                amount: course?.price || 4999
            });

            // Step 3: Payment Successful
            setCurrentStepIndex(2);
            await new Promise(resolve => setTimeout(resolve, 1000));

            setTransactionId(tid);
            setPaymentStatus('success');
            toast.success('Payment successful! You are now enrolled.');
        } catch (error: any) {
            setPaymentStatus('idle');
            toast.error(error.response?.data?.message || 'Payment failed');
        }
    };

    const downloadReceipt = () => {
        const doc = new jsPDF();
        const date = new Date().toLocaleDateString();
        const time = new Date().toLocaleTimeString();

        // Header
        doc.setFillColor(245, 247, 250);
        doc.rect(0, 0, 210, 40, 'F');
        doc.setTextColor(225, 29, 72); // rose-600
        doc.setFontSize(24);
        doc.setFont('helvetica', 'bold');
        doc.text('LEARNFLUX', 105, 20, { align: 'center' });
        doc.setFontSize(10);
        doc.setTextColor(100, 116, 139); // slate-500
        doc.text('OFFICIAL TRANSACTION RECEIPT', 105, 30, { align: 'center' });

        // Order Info
        doc.setTextColor(30, 41, 59); // slate-800
        doc.setFontSize(12);
        doc.text('TRANSACTION DETAILS', 20, 55);
        doc.setLineWidth(0.5);
        doc.line(20, 58, 190, 58);

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');

        const details = [
            ['Transaction ID:', transactionId],
            ['Date:', `${date} ${time}`],
            ['Student Name:', user?.name || 'Student'],
            ['Student Email:', user?.email || 'N/A'],
            ['Course Title:', course?.title || 'Course'],
            ['Category:', course?.category || 'Education'],
            ['Payment Method:', paymentMethod.replace('_', ' ').toUpperCase()],
        ];

        let y = 70;
        details.forEach(([label, value]) => {
            doc.setFont('helvetica', 'bold');
            doc.text(label, 20, y);
            doc.setFont('helvetica', 'normal');
            doc.text(String(value), 70, y);
            y += 10;
        });

        // Amount Box
        doc.setFillColor(248, 250, 252);
        doc.rect(20, y + 5, 170, 25, 'F');
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('TOTAL AMOUNT PAID:', 30, y + 21);
        doc.setTextColor(5, 150, 105); // emerald-600
        doc.text(`INR ${price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, 180, y + 21, { align: 'right' });

        // Footer
        doc.setTextColor(148, 163, 184); // slate-400
        doc.setFontSize(8);
        doc.setFont('helvetica', 'italic');
        doc.text('This is a computer-generated receipt and does not require a physical signature.', 105, 280, { align: 'center' });
        doc.text('thank you for choosing LearnFlux - your gateway to mastery.', 105, 285, { align: 'center' });

        doc.save(`LearnFlux_Receipt_${transactionId}.pdf`);
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
                <Link to="/" className="flex items-center gap-2.5 group">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary via-primary/80 to-blue-400 flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform duration-200">
                        <Zap className="text-primary-foreground w-5 h-5 fill-primary-foreground/20" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-lg font-black tracking-tight bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent leading-none">
                            LearnFlux
                        </span>
                        <span className="text-[9px] font-bold text-muted-foreground tracking-[0.2em] uppercase mt-0.5 pl-0.5">
                            Ecosystem
                        </span>
                    </div>
                </Link>

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
                                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full py-4 space-y-8">
                                                {/* QR Code Section */}
                                                <div className="flex flex-col md:flex-row items-center gap-8 justify-between">
                                                    <div className="space-y-4 max-w-[200px]">
                                                        <h4 className="font-bold text-slate-800">Scan QR code</h4>
                                                        <p className="text-sm text-slate-500 text-xs">Open any UPI app like GPay, PhonePe, or Paytm and scan the code.</p>

                                                        <div className="flex gap-2 pt-2">
                                                            <div className="h-5 w-7 bg-slate-50 rounded border flex items-center justify-center text-[8px] font-bold text-slate-500 uppercase">GPay</div>
                                                            <div className="h-5 w-7 bg-indigo-50/50 rounded border border-indigo-100/50 flex items-center justify-center text-[8px] font-bold text-indigo-500 uppercase">PhPe</div>
                                                            <div className="h-5 w-7 bg-sky-50/50 rounded border border-sky-100/50 flex items-center justify-center text-[8px] font-bold text-sky-500 uppercase">Paytm</div>
                                                        </div>
                                                    </div>

                                                    <div className="relative group border border-slate-200 p-2 rounded-xl bg-white shadow-sm overflow-hidden shrink-0">
                                                        <QrCode className={`w-28 h-28 transition-all duration-300 ${!showQr ? 'text-slate-200 blur-sm' : 'text-slate-800'}`} />
                                                        {!showQr ? (
                                                            <div className="absolute inset-0 flex items-center justify-center">
                                                                <Button
                                                                    size="sm"
                                                                    onClick={() => setShowQr(true)}
                                                                    className="bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/20 text-xs h-8"
                                                                >
                                                                    Show QR
                                                                </Button>
                                                            </div>
                                                        ) : (
                                                            <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-white/60 backdrop-blur-sm rounded-xl">
                                                                <Button
                                                                    size="sm"
                                                                    onClick={handlePayment}
                                                                    className="bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/20 text-xs h-8"
                                                                >
                                                                    Simulate
                                                                </Button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Separator */}
                                                <div className="relative">
                                                    <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-100"></span></div>
                                                    <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-widest leading-none bg-white px-2 text-slate-400">OR</div>
                                                </div>

                                                {/* UPI ID Section */}
                                                <div className="space-y-4">
                                                    <h4 className="font-bold text-slate-800">Pay via UPI ID</h4>
                                                    <div className="relative">
                                                        <input
                                                            type="text"
                                                            placeholder="example@upi"
                                                            value={upiId}
                                                            onChange={(e) => setUpiId(e.target.value)}
                                                            className="w-full p-3 pl-10 rounded-lg border border-slate-200 focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all text-sm outline-none bg-slate-50/30 font-medium"
                                                        />
                                                        <Smartphone className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                                                    </div>
                                                    <Button
                                                        size="lg"
                                                        className="bg-red-600 hover:bg-red-700 w-full text-white font-bold shadow-lg shadow-red-600/20"
                                                        onClick={handlePayment}
                                                        disabled={!upiId.includes('@') || upiId.length < 5}
                                                    >
                                                        Verify & Pay ₹{price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                    </Button>
                                                </div>
                                            </motion.div>
                                        )}

                                        {(paymentMethod === 'credit_card' || paymentMethod === 'debit_card') && (
                                            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="h-full py-2">
                                                <div className="space-y-4">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <h4 className="font-bold text-slate-800 uppercase tracking-tight text-sm">Card Information</h4>
                                                        <div className="flex gap-1">
                                                            <div className="w-8 h-5 bg-slate-100 rounded border border-slate-200"></div>
                                                            <div className="w-8 h-5 bg-slate-100 rounded border border-slate-200"></div>
                                                        </div>
                                                    </div>

                                                    <div className="space-y-3">
                                                        <div className="relative">
                                                            <input
                                                                type="text"
                                                                name="name"
                                                                placeholder="Cardholder Name"
                                                                value={cardDetails.name}
                                                                onChange={handleCardInput}
                                                                className="w-full p-3 pl-10 rounded-lg border border-slate-200 focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all text-sm outline-none bg-slate-50/30"
                                                            />
                                                            <PenLine className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                                                        </div>

                                                        <div className="relative">
                                                            <input
                                                                type="text"
                                                                name="number"
                                                                placeholder="Card Number"
                                                                value={cardDetails.number}
                                                                onChange={(e) => {
                                                                    const val = e.target.value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim().slice(0, 19);
                                                                    setCardDetails(prev => ({ ...prev, number: val }));
                                                                }}
                                                                className="w-full p-3 pl-10 rounded-lg border border-slate-200 focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all text-sm outline-none bg-slate-50/30 font-mono tracking-wider"
                                                            />
                                                            <CreditCard className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                                                        </div>

                                                        <div className="grid grid-cols-2 gap-3">
                                                            <div className="relative">
                                                                <input
                                                                    type="text"
                                                                    name="expiry"
                                                                    placeholder="MM/YY"
                                                                    value={cardDetails.expiry}
                                                                    onChange={(e) => {
                                                                        let val = e.target.value.replace(/\D/g, '');
                                                                        if (val.length > 2) val = val.slice(0, 2) + '/' + val.slice(2, 4);
                                                                        setCardDetails(prev => ({ ...prev, expiry: val.slice(0, 5) }));
                                                                    }}
                                                                    className="w-full p-3 pl-10 rounded-lg border border-slate-200 focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all text-sm outline-none bg-slate-50/30"
                                                                />
                                                                <Clock className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                                                            </div>
                                                            <div className="relative">
                                                                <input
                                                                    type="password"
                                                                    name="cvv"
                                                                    placeholder="CVV"
                                                                    value={cardDetails.cvv}
                                                                    onChange={(e) => {
                                                                        const val = e.target.value.replace(/\D/g, '').slice(0, 3);
                                                                        setCardDetails(prev => ({ ...prev, cvv: val }));
                                                                    }}
                                                                    className="w-full p-3 pl-10 rounded-lg border border-slate-200 focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all text-sm outline-none bg-slate-50/30"
                                                                />
                                                                <Shield className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <Button
                                                        size="lg"
                                                        className="bg-red-600 hover:bg-red-700 w-full mt-4 text-white font-bold shadow-lg shadow-red-600/20"
                                                        onClick={handlePayment}
                                                        disabled={!cardDetails.name || !cardDetails.number || !cardDetails.expiry || !cardDetails.cvv}
                                                    >
                                                        Pay ₹{price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                    </Button>
                                                    <p className="text-[10px] text-center text-slate-400 flex items-center justify-center gap-1">
                                                        <Shield className="h-3 w-3" /> Secure SSL Encrypted Transaction
                                                    </p>
                                                </div>
                                            </motion.div>
                                        )}

                                        {paymentMethod === 'net_banking' && (
                                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center h-full space-y-6 py-12 text-center">
                                                <div className="p-4 bg-slate-50 rounded-full">
                                                    <Wallet className="w-12 h-12 text-slate-300" />
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-slate-800 text-lg mb-2">Proceed with Net Banking</h4>
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

            {/* Processing Modal Overlay */}
            {paymentStatus === 'processing' && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-white p-8 rounded-2xl shadow-2xl max-w-sm w-full space-y-6"
                    >
                        <div className="text-center">
                            <h3 className="text-xl font-bold text-slate-800">Processing Payment</h3>
                            <p className="text-sm text-slate-500 mt-2">Please do not refresh or close the window. We are securely communicating with your bank.</p>
                        </div>
                        
                        <div className="space-y-4 mt-6 bg-slate-50 rounded-xl p-4 border border-slate-100">
                            {[
                                paymentMethod === 'upi' ? "Payment Request Sent To UPI App" : "Payment Request Sent To Bank",
                                "Waiting For Payment Confirmation",
                                "Payment Successful"
                            ].map((step, idx) => (
                                <div key={idx} className="flex items-center gap-3">
                                    <div className={`w-8 h-8 shrink-0 rounded-full flex items-center justify-center ${currentStepIndex > idx ? 'bg-emerald-100 text-emerald-600' : currentStepIndex === idx ? 'bg-blue-100 text-blue-600' : 'bg-slate-200 text-slate-400'}`}>
                                        {currentStepIndex > idx ? <CheckCircle2 className="w-5 h-5" /> : currentStepIndex === idx ? <Loader2 className="w-5 h-5 animate-spin" /> : <div className="w-3 h-3 rounded-full bg-slate-300" />}
                                    </div>
                                    <span className={`text-sm font-bold ${currentStepIndex >= idx ? 'text-slate-800' : 'text-slate-400'}`}>{step}</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Success View Overlay */}
            {paymentStatus === 'success' && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
                    <motion.div
                        initial={{ opacity: 0, y: 30, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                        className="max-w-xl w-full mx-auto"
                    >
                        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden relative border border-slate-100">
                            {/* Top Decorative Header */}
                            <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 px-8 py-10 text-center text-white relative overflow-hidden">
                                <div className="absolute -top-12 -right-12 opacity-10 pointer-events-none">
                                    <Zap className="w-56 h-56 -rotate-12" />
                                </div>
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: "spring", damping: 15, delay: 0.1 }}
                                    className="bg-white/20 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5 backdrop-blur-md shadow-inner"
                                >
                                    <CheckCircle2 className="h-10 w-10 text-white" />
                                </motion.div>
                                <h2 className="text-2xl sm:text-3xl font-black tracking-tight mb-2">Payment Successful!</h2>
                                <p className="text-emerald-100 font-medium text-sm sm:text-base opacity-90">
                                    Your transaction was completed successfully
                                </p>
                            </div>

                            {/* Ticket Zig-Zag Divider Effect */}
                            <div className="relative h-4 bg-white -mt-2 z-10" style={{ backgroundImage: "radial-gradient(circle at 8px top, transparent 8px, white 9px)", backgroundSize: "16px 16px", backgroundPosition: "0 0" }}></div>
                            <div className="flex justify-between items-center absolute w-full -mt-2 z-20 px-0">
                                <div className="w-4 h-8 bg-slate-900/60 backdrop-blur-sm rounded-r-full -translate-x-full"></div>
                                <div className="border-t-2 border-dashed border-emerald-500/20 flex-1 mx-4"></div>
                                <div className="w-4 h-8 bg-slate-900/60 backdrop-blur-sm rounded-l-full translate-x-full"></div>
                            </div>

                            <div className="px-8 pb-8 pt-6">
                                <div className="space-y-6">
                                    {/* Grid Details */}
                                    <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                                        <div className="space-y-1.5">
                                            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Transaction ID</p>
                                            <div className="flex items-center gap-2 group">
                                                <p className="font-mono font-semibold text-slate-800 text-sm sm:text-base">{transactionId}</p>
                                                <button onClick={() => { navigator.clipboard.writeText(transactionId); toast.success('Copied to clipboard'); }} className="text-slate-300 hover:text-emerald-500 transition-colors opacity-0 group-hover:opacity-100">
                                                    <Copy className="h-3.5 w-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                        <div className="space-y-1.5 text-right">
                                            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Date & Time</p>
                                            <p className="font-semibold text-slate-800 text-sm sm:text-base">{new Date().toLocaleDateString('en-GB')} • {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</p>
                                        </div>
                                        <div className="space-y-1.5">
                                            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Payment Method</p>
                                            <p className="font-bold text-emerald-600 uppercase text-sm sm:text-base flex items-center gap-1.5">
                                                <Shield className="w-3.5 h-3.5" /> {paymentMethod.replace('_', ' ')}
                                            </p>
                                        </div>
                                        <div className="space-y-1.5 text-right">
                                            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Total Amount</p>
                                            <p className="text-2xl font-black text-slate-900">₹{price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
                                        </div>
                                    </div>

                                    {/* Course Details Box */}
                                    <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-100 flex items-center gap-4 hover:border-emerald-100 transition-colors">
                                        <div className="w-16 h-12 rounded-lg bg-slate-200 overflow-hidden shrink-0 shadow-sm border border-slate-200/60">
                                            <img src={course.thumbnail} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[9px] uppercase font-bold text-slate-400 tracking-widest mb-0.5">Purchased Course</p>
                                            <h4 className="font-bold text-slate-800 text-sm sm:text-base truncate">{course.title}</h4>
                                        </div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex flex-col sm:flex-row gap-3 mt-8">
                                    <Button
                                        onClick={downloadReceipt}
                                        variant="outline"
                                        className="flex-1 h-12 rounded-xl font-bold gap-2 border-2 hover:bg-slate-50 text-slate-700"
                                    >
                                        <Download className="h-4 w-4" /> Download Receipt
                                    </Button>
                                    <Button
                                        onClick={() => navigate('/student/courses')}
                                        className="flex-1 h-12 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/20"
                                    >
                                        Start Learning
                                    </Button>
                                </div>
                            </div>
                        </div>
                        <p className="text-center mt-5 text-sm font-medium text-white/80 drop-shadow-md">
                            A copy of the receipt was sent to <b>{user?.email}</b>
                        </p>
                    </motion.div>
                </div>
            )}
        </div>
    );
}


