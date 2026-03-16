import React, { useRef, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, Loader2, Zap } from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { format } from 'date-fns';
import type { Course } from '@/types';

interface CertificateModalProps {
    isOpen: boolean;
    onClose: () => void;
    course: Course | null;
    studentName: string;
}

export function CertificateModal({ isOpen, onClose, course, studentName }: CertificateModalProps) {
    const certificateRef = useRef<HTMLDivElement>(null);
    const [isDownloading, setIsDownloading] = useState(false);

    if (!course) return null;

    const handleDownload = async () => {
        if (!certificateRef.current) return;

        try {
            setIsDownloading(true);
            const canvas = await html2canvas(certificateRef.current, {
                scale: 3,
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff'
            });

            const imgData = canvas.toDataURL('image/png');

            // A4 size landscape: 297mm x 210mm
            const pdf = new jsPDF('landscape', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`${course.title.replace(/\s+/g, '_')}_Certificate.pdf`);
        } catch (error) {
            console.error('Failed to generate PDF:', error);
        } finally {
            setIsDownloading(false);
        }
    };

    const currentMonthYear = format(new Date(), 'MMMM \'of\' yyyy');

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-[1020px] sm:max-w-[1020px] p-0 overflow-hidden bg-white border-none shadow-2xl overflow-x-auto">
                <DialogHeader className="sr-only">
                    <DialogTitle>Course Certificate</DialogTitle>
                    <DialogDescription>Download your course completion certificate</DialogDescription>
                </DialogHeader>

                <div className="relative">
                    {/* Action Ribbon */}
                    <div className="absolute top-4 right-4 z-50 flex gap-2">
                        <Button
                            onClick={handleDownload}
                            disabled={isDownloading}
                            className="bg-[#159288] hover:bg-[#11766d] text-white shadow-lg print:hidden"
                        >
                            {isDownloading ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                                <Download className="w-4 h-4 mr-2" />
                            )}
                            Download PDF
                        </Button>
                    </div>

                    {/* Certificate Container to capture */}
                    <div className="w-full flex justify-center py-4 sm:py-0 overflow-x-auto bg-slate-200">
                        <div
                            ref={certificateRef}
                            className="relative overflow-hidden select-none bg-[#f3f4f6] shrink-0 font-sans"
                            style={{ width: '960px', height: '678px' }}
                        >
                            {/* SVG Background Layers */}
                            <svg className="absolute inset-0 w-full h-full z-0 pointer-events-none" viewBox="0 0 960 678" xmlns="http://www.w3.org/2000/svg">
                                {/* Top Left Sweeps (Back to Front) */}
                                <path d="M 0,0 L 400,0 Q 150,250 0,600 Z" fill="#ffffff" />
                                <path d="M 0,0 L 280,0 Q 100,180 0,450 Z" fill="#e5e7eb" />
                                <path d="M 0,0 L 160,0 Q 60,110 0,280 Z" fill="#1e293b" />
                                <path d="M 0,0 L 80,0 Q 30,60 0,140 Z" fill="#0d9488" />

                                {/* Bottom Left Sweeps */}
                                <path d="M 0,678 L 600,678 Q 200,500 0,250 Z" fill="#ffffff" />
                                <path d="M 0,678 L 400,678 Q 120,550 0,350 Z" fill="#e5e7eb" />
                                <path d="M 0,678 L 220,678 Q 80,600 0,450 Z" fill="#1e293b" />
                                <path d="M 0,678 L 100,678 Q 30,640 0,550 Z" fill="#0d9488" />

                                {/* Bottom Right Sweeps */}
                                <path d="M 960,678 L 700,678 Q 850,550 960,350 Z" fill="#ffffff" />

                                {/* Top Right Subtle Sweep */}
                                <path d="M 960,0 L 960,200 Q 850,100 750,0 Z" fill="#ffffff" />
                            </svg>

                            {/* Inner Content wrapper */}
                            <div className="relative z-10 w-full h-full flex flex-col items-center justify-center text-center px-12 pt-4">

                                {/* Institution Name & Logo */}
                                <div className="flex items-center justify-center gap-3 mb-6 h-[32px]">
                                    <div className="w-8 h-8 rounded-[8px] bg-gradient-to-tr from-[#0d9488] via-[#159288] to-[#1e293b] flex items-center justify-center shadow-lg shadow-[#0d9488]/20 shrink-0">
                                        <Zap className="text-white w-5 h-5 fill-white/20" />
                                    </div>
                                    <h3 className="text-[20px] font-black tracking-[0.2em] text-[#1e293b] uppercase m-0 leading-[32px] h-[32px] flex items-center">
                                        LEARNFLUX
                                    </h3>
                                </div>

                                {/* Title Block */}
                                <div className="mb-8 flex flex-col items-center">
                                    <h1
                                        className="text-[54px] font-black text-[#1e293b] m-0 leading-none tracking-tight"
                                        style={{ textShadow: '2px 2px 0px #cbd5e1' }}
                                    >
                                        COURSE COMPLETION
                                    </h1>
                                    <h2
                                        className="text-[42px] font-black text-[#0d9488] m-0 uppercase leading-tight tracking-widest"
                                        style={{ textShadow: '2px 2px 0px #cbd5e1' }}
                                    >
                                        CERTIFICATE
                                    </h2>
                                </div>

                                {/* Presentation Text */}
                                <p className="text-[15px] font-bold text-[#000000] mb-4">
                                    This certificate is presented to
                                </p>

                                {/* Student Name */}
                                <div className="flex flex-col items-center mb-6 min-w-[300px]">
                                    <h2 className="text-[36px] font-black text-[#0d9488] tracking-wide m-0 leading-none">
                                        {studentName || 'Student Name'}
                                    </h2>
                                    {/* Pure structural flex layout instead of absolute/border properties to prevent html2canvas glitch */}
                                    <div className="w-[110%] h-[3px] bg-[#0d9488] mt-3"></div>
                                </div>

                                {/* Description */}
                                <div className="text-[14px] font-bold text-[#000000] leading-relaxed max-w-[650px] mb-6">
                                    For completing the course training in <span className="font-black">{course.title}</span>.
                                </div>

                                {/* Date */}
                                <p className="text-[14px] font-bold text-[#000000]">
                                    Given this <span className="font-black">{currentMonthYear}</span>.
                                </p>

                                {/* Signature Section - Bottom Right */}
                                <div className="absolute bottom-[60px] right-[60px] text-center">
                                    {/* LearnFlux Verified Stamp */}
                                    <div className="absolute -top-[85px] left-[35px] opacity-80 pointer-events-none select-none transform -rotate-[15deg] z-10 mix-blend-multiply">
                                        <svg width="110" height="110" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
                                            {/* Outer dashed border */}
                                            <circle cx="60" cy="60" r="54" fill="none" stroke="#0d9488" strokeWidth="3" strokeDasharray="8 4" />
                                            {/* Inner solid border */}
                                            <circle cx="60" cy="60" r="46" fill="none" stroke="#0d9488" strokeWidth="1.5" />
                                            {/* Circular text path */}
                                            <path id="stamp-curve" d="M 20 60 A 40 40 0 1 1 100 60 A 40 40 0 1 1 20 60" fill="transparent" />
                                            <text fill="#0d9488" fontSize="11" fontWeight="bold" letterSpacing="1">
                                                <textPath href="#stamp-curve" startOffset="50%" textAnchor="middle">
                                                    LEARNFLUX • OFFICIAL VERIFIED •
                                                </textPath>
                                            </text>
                                            {/* Center text */}
                                            <text x="60" y="58" fill="#0d9488" fontSize="18" fontWeight="900" textAnchor="middle">VALID</text>
                                            <text x="60" y="72" fill="#0d9488" fontSize="9" fontWeight="bold" textAnchor="middle">CERTIFICATE</text>
                                        </svg>
                                    </div>

                                    <div className="w-[180px] border-b-2 border-[#000000] mb-2 relative z-0"></div>
                                    <p className="font-black text-[#000000] text-[15px] leading-tight mb-1 relative z-20">LearnFlux Admin</p>
                                    <p className="font-black text-[#0d9488] text-[13px] uppercase tracking-wider relative z-20">CEO</p>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
