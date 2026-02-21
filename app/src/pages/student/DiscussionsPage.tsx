import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { mockDiscussionMessages, mockUsers, mockCourses } from '@/mock/data';
import type { DiscussionMessage } from '@/types';
import {
  Send,
  MessageSquare,
  Users,
  Search,
  MoreVertical,
  Phone,
  Video,
  Paperclip,
  Smile,
  Circle,
} from 'lucide-react';

export function DiscussionsPage() {
  const [messages, setMessages] = useState<DiscussionMessage[]>(mockDiscussionMessages);
  const [newMessage, setNewMessage] = useState('');
  const [selectedCourse, setSelectedCourse] = useState<string>('c1');
  const [onlineUsers, setOnlineUsers] = useState<string[]>(['1', '2', '4']);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Simulate real-time messages
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        const randomMessages = [
          'Great point! I agree with that.',
          'Can someone explain this concept in more detail?',
          'Thanks for sharing!',
          'I found a helpful resource for this topic.',
          'Has anyone completed the latest assignment?',
        ];
        const randomUser = mockUsers[Math.floor(Math.random() * mockUsers.length)];
        const newMsg: DiscussionMessage = {
          id: `msg_${Date.now()}`,
          courseId: selectedCourse,
          userId: randomUser.id,
          userName: randomUser.name,
          userAvatar: randomUser.avatar,
          message: randomMessages[Math.floor(Math.random() * randomMessages.length)],
          timestamp: new Date().toISOString(),
        };
        setMessages(prev => [...prev, newMsg]);
      }
    }, 15000);

    return () => clearInterval(interval);
  }, [selectedCourse]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const message: DiscussionMessage = {
      id: `msg_${Date.now()}`,
      courseId: selectedCourse,
      userId: '1',
      userName: 'Alex Johnson',
      userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
      message: newMessage,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');
  };

  const filteredMessages = messages.filter(m => m.courseId === selectedCourse);
  const enrolledCourses = mockCourses.slice(0, 3);

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

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
                  {enrolledCourses.map((course) => {
                    const courseMessages = messages.filter(m => m.courseId === course.id);
                    const lastMessage = courseMessages[courseMessages.length - 1];
                    const isSelected = selectedCourse === course.id;

                    return (
                      <button
                        key={course.id}
                        onClick={() => setSelectedCourse(course.id)}
                        className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-left ${
                          isSelected
                            ? 'bg-primary/10'
                            : 'hover:bg-muted'
                        }`}
                      >
                        <div className="relative">
                          <img
                            src={course.thumbnail}
                            alt={course.title}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-background" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`font-medium truncate ${isSelected ? 'text-primary' : ''}`}>
                            {course.title}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {lastMessage ? `${lastMessage.userName}: ${lastMessage.message}` : 'No messages yet'}
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
            <CardHeader className="border-b pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={enrolledCourses.find(c => c.id === selectedCourse)?.thumbnail}
                    alt="Course"
                    className="w-10 h-10 rounded-lg object-cover"
                  />
                  <div>
                    <CardTitle className="text-base">
                      {enrolledCourses.find(c => c.id === selectedCourse)?.title}
                    </CardTitle>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Users className="h-3 w-3" />
                      {onlineUsers.length} online
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
              <ScrollArea className="h-[calc(100%-80px)] p-4">
                <div className="space-y-4">
                  <AnimatePresence>
                    {filteredMessages.map((message, index) => {
                      const isCurrentUser = message.userId === '1';
                      const showAvatar = index === 0 || filteredMessages[index - 1].userId !== message.userId;

                      return (
                        <motion.div
                          key={message.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          className={`flex gap-3 ${isCurrentUser ? 'flex-row-reverse' : ''}`}
                        >
                          {showAvatar ? (
                            <Avatar className="w-8 h-8 flex-shrink-0">
                              <AvatarImage src={message.userAvatar} />
                              <AvatarFallback>{message.userName[0]}</AvatarFallback>
                            </Avatar>
                          ) : (
                            <div className="w-8 flex-shrink-0" />
                          )}
                          <div className={`max-w-[70%] ${isCurrentUser ? 'items-end' : 'items-start'}`}>
                            {showAvatar && (
                              <p className={`text-xs text-muted-foreground mb-1 ${isCurrentUser ? 'text-right' : ''}`}>
                                {message.userName}
                              </p>
                            )}
                            <div
                              className={`px-4 py-2 rounded-2xl ${
                                isCurrentUser
                                  ? 'bg-primary text-primary-foreground rounded-br-md'
                                  : 'bg-muted rounded-bl-md'
                              }`}
                            >
                              <p className="text-sm">{message.message}</p>
                            </div>
                            <p className={`text-xs text-muted-foreground mt-1 ${isCurrentUser ? 'text-right' : ''}`}>
                              {formatTime(message.timestamp)}
                            </p>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>
            </CardContent>

            {/* Message Input */}
            <CardContent className="border-t p-4">
              <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                <Button type="button" variant="ghost" size="icon">
                  <Paperclip className="h-5 w-5" />
                </Button>
                <Input
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="flex-1"
                />
                <Button type="button" variant="ghost" size="icon">
                  <Smile className="h-5 w-5" />
                </Button>
                <Button type="submit" size="icon" disabled={!newMessage.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </CardContent>
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
              Online Now ({onlineUsers.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {onlineUsers.map((userId) => {
                const user = mockUsers.find(u => u.id === userId);
                if (!user) return null;
                return (
                  <div
                    key={user.id}
                    className="flex items-center gap-2 px-3 py-2 rounded-full bg-muted"
                  >
                    <Avatar className="w-6 h-6">
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback>{user.name[0]}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm">{user.name}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
