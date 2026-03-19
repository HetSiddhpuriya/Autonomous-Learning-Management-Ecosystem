import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
    Send, 
    Search, 
    MoreVertical, 
    Phone, 
    Video, 
    Paperclip, 
    Smile, 
    Circle,
    Users,
    FileText,
    X,
    FileWarning
} from 'lucide-react';
import api from '@/lib/api';
import { useAuth } from '@/context';
import { io, Socket } from 'socket.io-client';
import type { DiscussionMessage, Course } from '@/types';

type Member = {
    _id: string;
    name: string;
    avatar: string;
    role: string;
    isOnline: boolean;
};

export function DiscussionsPage() {
    const { user } = useAuth();
    const [messages, setMessages] = useState<DiscussionMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
    const [selectedCourse, setSelectedCourse] = useState<string>('');
    const [members, setMembers] = useState<Member[]>([]);
    const [socket, setSocket] = useState<Socket | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Auto-scroll to bottom
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // 1. Fetch enrolled courses
    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const res = await api.get('/courses/enrolled/my');
                setEnrolledCourses(res.data);
                if (res.data.length > 0) {
                    setSelectedCourse(res.data[0].id || res.data[0]._id);
                }
            } catch (err) {
                console.error("Failed to fetch enrolled courses", err);
            }
        };
        fetchCourses();
    }, []);

    // 2. Setup socket connection
    useEffect(() => {
        const token = localStorage.getItem('token');
        const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/api$/, '');
        const newSocket = io(baseUrl, {
            auth: { token }
        });
        setSocket(newSocket);

        newSocket.on('user_online', (userId: string) => {
            setMembers(prev => prev.map(m => m._id === userId ? { ...m, isOnline: true } : m));
        });

        newSocket.on('user_offline', (userId: string) => {
            setMembers(prev => prev.map(m => m._id === userId ? { ...m, isOnline: false } : m));
        });

        return () => {
            newSocket.disconnect();
        };
    }, []);

    // 3. Handle course selection data fetching
    useEffect(() => {
        if (!selectedCourse) return;

        const fetchDiscussionData = async () => {
            try {
                const [messagesRes, membersRes] = await Promise.all([
                    api.get(`/discussions?courseId=${selectedCourse}`),
                    api.get(`/discussions/course/${selectedCourse}/members`)
                ]);
                setMessages(messagesRes.data);
                setMembers(membersRes.data);

                if (socket) {
                    socket.emit('join_course', selectedCourse, (response: any) => {
                        if (response?.error) console.error(response.error);
                    });
                }
            } catch (err) {
                console.error("Failed to fetch discussion data", err);
            }
        };

        fetchDiscussionData();
    }, [selectedCourse, socket]);

    // 4. Handle incoming messages for selected course
    useEffect(() => {
        if (!socket) return;
        const handleReceiveMessage = (msg: DiscussionMessage) => {
            if (msg.courseId === selectedCourse) {
                setMessages(prev => {
                    if (prev.find(m => m.id === msg.id)) return prev;
                    return [...prev, msg];
                });
            }
        };
        socket.on('receive_message', handleReceiveMessage);
        return () => {
            socket.off('receive_message', handleReceiveMessage);
        };
    }, [socket, selectedCourse]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if ((!newMessage.trim() && !selectedFile) || !selectedCourse || isUploading) return;

        const currentMessage = newMessage;
        const currentFile = selectedFile;
        
        setIsUploading(true);
        // Optimistically clear the UI
        setNewMessage('');
        setSelectedFile(null);
        
        try {
            let attachmentUrl = null;
            let attachmentName = null;

            if (currentFile) {
                const formData = new FormData();
                formData.append('file', currentFile);
                
                const uploadRes = await api.post('/upload/attachment', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                attachmentUrl = uploadRes.data.url;
                attachmentName = uploadRes.data.name;
            }

            const res = await api.post('/discussions', { 
                courseId: selectedCourse, 
                message: currentMessage,
                attachmentUrl,
                attachmentName
            });
            
            // Append locally to guarantee it shows instantly
            setMessages(prev => {
                if (prev.find(m => m.id === res.data.id)) return prev;
                return [...prev, res.data];
            });
        } catch (error) {
            console.error("Failed to send message", error);
            // Optionally restore message on failure
            setNewMessage(currentMessage);
            setSelectedFile(currentFile);
        } finally {
            setIsUploading(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const formatTime = (timestamp: string | undefined) => {
        if (!timestamp) return '';
        const date = new Date(timestamp);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const onlineUsersCount = members.filter(m => m.isOnline).length;
    const selectedCourseObj = enrolledCourses.find(c => (c.id || (c as any)._id) === selectedCourse) || null;

    return (
        <div className="space-y-6">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <h1 className="text-3xl font-bold">Discussions</h1>
                <p className="text-muted-foreground mt-1">
                    Connect with peers and instructors in your courses
                </p>
            </motion.div>

            {/* Chat Layout */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
            >
                <div className="grid lg:grid-cols-4 gap-6 h-[calc(100vh-280px)] min-h-[500px]">
                    {/* Sidebar - Course List */}
                    <Card className="lg:col-span-1 overflow-hidden">
                        <CardHeader className="pb-3">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input placeholder="Search discussions..." className="pl-9" />
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <ScrollArea className="h-[calc(100%-80px)]">
                                <div className="space-y-1 p-2">
                                    {enrolledCourses.length === 0 && (
                                        <p className="p-4 text-sm text-center text-muted-foreground">No enrolled courses found.</p>
                                    )}
                                    {enrolledCourses.map((course) => {
                                        const cId = course.id || (course as any)._id;
                                        const isSelected = selectedCourse === cId;
                                        return (
                                            <button
                                                key={cId}
                                                onClick={() => setSelectedCourse(cId)}
                                                className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-left ${isSelected
                                                        ? 'bg-primary/10'
                                                        : 'hover:bg-muted'
                                                    }`}
                                            >
                                                <div className="relative flex-shrink-0">
                                                    <img
                                                        src={course.thumbnail || 'https://images.unsplash.com/photo-1516321497487-e288fb19713f?w=1200&auto=format&fit=crop'}
                                                        alt={course.title}
                                                        className="w-12 h-12 rounded-lg object-cover"
                                                    />
                                                    {/* We can show an active dot here if members of this course are online, skipping for now */}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className={`font-medium truncate text-sm leading-snug ${isSelected ? 'text-primary' : ''}`}>
                                                        {course.title}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground truncate mt-1">
                                                        {course.instructorName || 'Instructor'}
                                                    </p>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </ScrollArea>
                        </CardContent>
                    </Card>

                    {/* Main Chat Area */}
                    <Card className="lg:col-span-3 flex flex-col overflow-hidden">
                        {/* Chat Header */}
                        {selectedCourseObj ? (
                            <>
                                <CardHeader className="border-b pb-4 shrink-0">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <img
                                                src={selectedCourseObj.thumbnail || 'https://images.unsplash.com/photo-1516321497487-e288fb19713f?w=1200&auto=format&fit=crop'}
                                                alt="Course"
                                                className="w-10 h-10 rounded-lg object-cover bg-muted"
                                            />
                                            <div>
                                                <CardTitle className="text-base">
                                                    {selectedCourseObj.title}
                                                </CardTitle>
                                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                    <Users className="h-3 w-3" />
                                                    {members.length} participants ({onlineUsersCount} online)
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button variant="ghost" size="icon">
                                                <Phone className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon">
                                                <Video className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon">
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardHeader>

                                {/* Messages */}
                                <CardContent className="flex-1 overflow-hidden p-0">
                                    <ScrollArea className="h-full p-4 flex flex-col">
                                        <div className="space-y-4">
                                            {messages.length === 0 && (
                                                <p className="text-center text-muted-foreground text-sm mt-4">
                                                    No messages yet. Be the first to start the discussion!
                                                </p>
                                            )}
                                            <AnimatePresence>
                                                {messages.map((message, index) => {
                                                    const isCurrentUser = message.userId === user?.id;
                                                    const showAvatar = index === 0 || messages[index - 1].userId !== message.userId;
                                                    // Determine if current message is from the instructor
                                                    const senderMember = members.find(m => m._id === message.userId);
                                                    const isInstructor = senderMember?.role === 'instructor';

                                                    return (
                                                        <motion.div
                                                            key={message.id || `msg-${index}`}
                                                            initial={{ opacity: 0, y: 10 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            exit={{ opacity: 0 }}
                                                            className={`flex gap-3 ${isCurrentUser ? 'flex-row-reverse' : ''}`}
                                                        >
                                                            {showAvatar ? (
                                                                <Avatar className={`w-8 h-8 flex-shrink-0 ${isInstructor ? 'ring-2 ring-primary' : ''}`}>
                                                                    <AvatarImage src={message.userAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${message.userName}`} />
                                                                    <AvatarFallback>{message.userName[0]}</AvatarFallback>
                                                                </Avatar>
                                                            ) : (
                                                                <div className="w-8 flex-shrink-0" />
                                                            )}
                                                            <div className={`max-w-[70%] ${isCurrentUser ? 'items-end' : 'items-start'}`}>
                                                                {showAvatar && (
                                                                    <div className={`flex items-center gap-1 mb-1 ${isCurrentUser ? 'flex-row-reverse' : ''}`}>
                                                                        <p className="text-xs text-muted-foreground font-medium">
                                                                            {message.userName}
                                                                        </p>
                                                                        {isInstructor && <span className="text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded-sm ml-1 font-semibold">Instructor</span>}
                                                                    </div>
                                                                )}
                                                                <div
                                                                    className={`px-4 py-2 rounded-2xl ${isCurrentUser
                                                                            ? 'bg-primary text-primary-foreground rounded-br-md'
                                                                            : isInstructor ? 'bg-amber-100 dark:bg-amber-900/30 rounded-bl-md border border-amber-200 dark:border-amber-800' : 'bg-muted rounded-bl-md'
                                                                        }`}
                                                                >
                                                                    {message.attachmentUrl && (
                                                                        <a 
                                                                            href={`${(import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/api$/, '')}${message.attachmentUrl}`} 
                                                                            target="_blank" 
                                                                            rel="noopener noreferrer"
                                                                            download={message.attachmentName || 'attachment'}
                                                                            className="flex items-center gap-2 mb-2 p-2 bg-black/10 dark:bg-white/10 rounded-md hover:bg-black/20 dark:hover:bg-white/20 transition-colors"
                                                                        >
                                                                            <FileText className="h-4 w-4 shrink-0" />
                                                                            <span className="text-sm truncate underline">{message.attachmentName || 'Attachment'}</span>
                                                                        </a>
                                                                    )}
                                                                    {message.message && <p className="text-sm whitespace-pre-wrap">{message.message}</p>}
                                                                </div>
                                                                <p className={`text-xs text-muted-foreground mt-1 ${isCurrentUser ? 'text-right' : ''}`}>
                                                                    {formatTime(message.timestamp)}
                                                                </p>
                                                            </div>
                                                        </motion.div>
                                                    );
                                                })}
                                            </AnimatePresence>
                                            <div ref={messagesEndRef} className="h-1"/>
                                        </div>
                                    </ScrollArea>
                                </CardContent>

                                {/* Message Input */}
                                <CardContent className="border-t p-4 shrink-0 bg-background z-10">
                                    {selectedFile && (
                                        <div className="flex items-center gap-2 mb-2 p-2 bg-muted rounded-md text-sm truncate max-w-sm">
                                            <FileText className="h-4 w-4 shrink-0 text-primary" />
                                            <span className="flex-1 truncate">{selectedFile.name}</span>
                                            <Button type="button" variant="ghost" size="icon" className="h-4 w-4 shrink-0 bg-transparent hover:bg-black/10 rounded-full cursor-pointer" onClick={() => setSelectedFile(null)}>
                                                <X className="h-4 w-4 text-muted-foreground" />
                                            </Button>
                                        </div>
                                    )}
                                    <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                                        <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} />
                                        <Button type="button" variant="ghost" size="icon" onClick={() => fileInputRef.current?.click()} className={`${selectedFile ? 'text-primary' : ''}`}>
                                            <Paperclip className="h-5 w-5" />
                                        </Button>
                                        <Input
                                            placeholder="Type a message..."
                                            value={newMessage}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                            className="flex-1"
                                            disabled={isUploading}
                                        />
                                        <Button type="button" variant="ghost" size="icon">
                                            <Smile className="h-5 w-5" />
                                        </Button>
                                        <Button type="submit" size="icon" disabled={(newMessage.trim() === '' && !selectedFile) || isUploading}>
                                            <Send className={`h-4 w-4 ${isUploading ? 'animate-pulse' : ''}`} />
                                        </Button>
                                    </form>
                                </CardContent>
                            </>
                        ) : (
                            <div className="flex-1 flex items-center justify-center">
                                <p className="text-muted-foreground">Select a course to start discussing.</p>
                            </div>
                        )}
                    </Card>
                </div>
            </motion.div>

            {/* Online Users */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
            >
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm flex items-center gap-2">
                            <Circle className="h-3 w-3 fill-green-500 text-green-500" />
                            Course Participants ({members.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-2">
                            {members.map((member) => (
                                <div
                                    key={member._id}
                                    className={`flex items-center gap-2 px-3 py-2 rounded-full border ${member.role === 'instructor' ? 'border-primary/50 bg-primary/5' : 'border-transparent bg-muted'}`}
                                >
                                    <div className="relative">
                                        <Avatar className={`w-8 h-8 ${member.role === 'instructor' ? 'border border-primary' : ''}`}>
                                            <AvatarImage src={member.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${member.name}`} />
                                            <AvatarFallback>{member.name[0]}</AvatarFallback>
                                        </Avatar>
                                        <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border border-white ${member.isOnline ? 'bg-green-500' : 'bg-slate-300'}`}></span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-medium leading-none">{member.name} {member._id === user?.id && '(You)'}</span>
                                        {member.role === 'instructor' && <span className="text-[10px] text-primary">Instructor</span>}
                                    </div>
                                </div>
                            ))}
                            {members.length === 0 && selectedCourseObj && (
                                <p className="text-sm text-muted-foreground">No members found.</p>
                            )}
                            {!selectedCourseObj && (
                                <p className="text-sm text-muted-foreground">Select a course to see its participants.</p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}
