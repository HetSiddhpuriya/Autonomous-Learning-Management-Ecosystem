import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { jsPDF } from 'jspdf';
import {
    CreditCard,
    Download,
    Receipt,
    Search,
    Filter,
    ArrowUpRight,
    Calendar,
    Wallet,
    Loader2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

export function TransactionsPage() {
    const { user } = useAuth();
    const [transactions, setTransactions] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                const response = await api.get('/courses/transactions/my');
                setTransactions(response.data);
            } catch (err) {
                console.error('Failed to fetch transactions:', err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchTransactions();
    }, []);

    const downloadReceipt = (transaction: any) => {
        const doc = new jsPDF();
        const date = new Date(transaction.enrolledAt).toLocaleDateString();

        // Header
        doc.setFillColor(245, 247, 250);
        doc.rect(0, 0, 210, 40, 'F');
        doc.setTextColor(225, 29, 72);
        doc.setFontSize(24);
        doc.setFont('helvetica', 'bold');
        doc.text('LEARNFLUX', 105, 20, { align: 'center' });
        doc.setFontSize(10);
        doc.setTextColor(100, 116, 139);
        doc.text('OFFICIAL TRANSACTION RECEIPT', 105, 30, { align: 'center' });

        // Order Info
        doc.setTextColor(30, 41, 59);
        doc.setFontSize(12);
        doc.text('TRANSACTION DETAILS', 20, 55);
        doc.setLineWidth(0.5);
        doc.line(20, 58, 190, 58);

        const details = [
            ['Transaction ID:', transaction.transactionId || 'N/A'],
            ['Date:', date],
            ['Student Name:', user?.name || 'Student'],
            ['Course Title:', transaction.courseId?.title || 'Course'],
            ['Payment Method:', (transaction.paymentMethod || 'UPI').toUpperCase()],
        ];

        let y = 70;
        details.forEach(([label, value]) => {
            doc.setFont('helvetica', 'bold');
            doc.text(label, 20, y);
            doc.setFont('helvetica', 'normal');
            doc.text(String(value), 70, y);
            y += 10;
        });

        doc.setFillColor(248, 250, 252);
        doc.rect(20, y + 5, 170, 25, 'F');
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('TOTAL AMOUNT PAID:', 30, y + 21);
        doc.setTextColor(5, 150, 105);
        doc.text(`INR ${transaction.amount?.toLocaleString('en-IN') || '4,999.00'}`, 180, y + 21, { align: 'right' });

        doc.save(`LearnFlux_Receipt_${transaction.transactionId || 'TXN'}.pdf`);
    };

    const filteredTransactions = transactions.filter(t => {
        const title = t.courseId?.title || 'Unknown Course';
        const tid = t.transactionId || '';
        const search = searchQuery.toLowerCase();

        return title.toLowerCase().includes(search) ||
            tid.toLowerCase().includes(search);
    });

    return (
        <div className="space-y-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Transactions</h1>
                        <p className="text-muted-foreground mt-1 text-slate-500">
                            Track your learning investments and download receipts
                        </p>
                    </div>
                </div>
            </motion.div>

            {/* Stats Overview */}
            <div className="grid sm:grid-cols-3 gap-6">
                <Card className="bg-white border-slate-100 shadow-sm overflow-hidden">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-emerald-50 rounded-2xl">
                                <Wallet className="h-6 w-6 text-emerald-600" />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Spent</p>
                                <p className="text-2xl font-black text-slate-800">
                                    ₹{transactions.reduce((sum, t) => sum + (t.amount || 0), 0).toLocaleString('en-IN')}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-white border-slate-100 shadow-sm overflow-hidden">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-rose-50 rounded-2xl">
                                <Receipt className="h-6 w-6 text-rose-600" />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Purchases</p>
                                <p className="text-2xl font-black text-slate-800">{transactions.length}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-white border-slate-100 shadow-sm overflow-hidden">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-indigo-50 rounded-2xl">
                                <ArrowUpRight className="h-6 w-6 text-indigo-600" />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Active Plans</p>
                                <p className="text-2xl font-black text-slate-800">{transactions.length}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card className="bg-white border-slate-100 shadow-sm overflow-hidden">
                <CardHeader className="border-b border-slate-50 bg-slate-50/30">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <CardTitle className="text-lg">Purchase History</CardTitle>
                            <CardDescription>Detailed record of your lifetime enrollments</CardDescription>
                        </div>
                        <div className="relative w-full md:w-72">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="Search course or ID..."
                                className="pl-10 h-10 rounded-xl bg-white focus:ring-rose-500"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-24 space-y-4">
                            <Loader2 className="h-10 w-10 animate-spin text-rose-600" />
                            <p className="text-slate-500 font-medium">Fetching your records...</p>
                        </div>
                    ) : filteredTransactions.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-slate-50/50 text-slate-500 text-[10px] sm:text-xs">
                                    <tr>
                                        <th className="text-left font-bold py-4 px-6 uppercase tracking-wider">Transaction ID</th>
                                        <th className="text-left font-bold py-4 px-6 uppercase tracking-wider">Course Name</th>
                                        <th className="text-left font-bold py-4 px-6 uppercase tracking-wider">Method</th>
                                        <th className="text-left font-bold py-4 px-6 uppercase tracking-wider">Date</th>
                                        <th className="text-right font-bold py-4 px-6 uppercase tracking-wider">Amount</th>
                                        <th className="text-right font-bold py-4 px-6 uppercase tracking-wider">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {filteredTransactions.map((t, idx) => (
                                        <motion.tr
                                            key={t.id}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: idx * 0.05 }}
                                            className="hover:bg-slate-50 transition-colors group"
                                        >
                                            <td className="py-5 px-6">
                                                <span className="font-mono text-xs font-bold text-slate-400 group-hover:text-rose-600 transition-colors">
                                                    #{t.transactionId?.slice(-8) || 'N/A'}
                                                </span>
                                            </td>
                                            <td className="py-5 px-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-8 rounded-lg overflow-hidden bg-slate-100 shrink-0">
                                                        <img src={t.courseId?.thumbnail} className="w-full h-full object-cover" />
                                                    </div>
                                                    <span className="font-bold text-slate-700 text-sm line-clamp-1">{t.courseId?.title}</span>
                                                </div>
                                            </td>
                                            <td className="py-5 px-6">
                                                <Badge variant="outline" className="bg-white border-slate-200 text-slate-600 uppercase text-[10px] font-bold">
                                                    {t.paymentMethod || 'UPI'}
                                                </Badge>
                                            </td>
                                            <td className="py-5 px-6">
                                                <div className="flex items-center gap-2 text-slate-500 text-xs">
                                                    <Calendar className="h-3 w-3" />
                                                    {new Date(t.enrolledAt).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}
                                                </div>
                                            </td>
                                            <td className="py-5 px-6 text-right">
                                                <span className="font-black text-slate-800 text-sm">₹{(t.amount || 4999).toLocaleString('en-IN')}</span>
                                            </td>
                                            <td className="py-5 px-6 text-right">
                                                <Button
                                                    onClick={() => downloadReceipt(t)}
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-8 w-8 p-0 rounded-full hover:bg-rose-50 hover:text-rose-600"
                                                >
                                                    <Download className="h-4 w-4" />
                                                </Button>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-24 space-y-4">
                            <div className="bg-slate-50 p-4 rounded-full w-fit mx-auto ring-8 ring-slate-50/50">
                                <CreditCard className="h-8 w-8 text-slate-300" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-800">No transactions yet</h3>
                            <p className="text-sm text-slate-500 max-w-xs mx-auto">Once you purchase a course, your transaction details and receipts will appear here.</p>
                            <Button className="mt-4 bg-rose-600 hover:bg-rose-700" asChild>
                                <a href="/courses">Explore Marketplace</a>
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
