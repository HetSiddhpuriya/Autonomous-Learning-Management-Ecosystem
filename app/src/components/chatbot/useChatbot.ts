import { useState, useRef, useCallback } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

export interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

const WELCOME_MESSAGE: ChatMessage = {
    id: 'welcome',
    role: 'assistant',
    content:
        "Hi! 👋 I'm your **AI Learning Assistant**. I can help you explore courses, quizzes, and features of this platform.\n\nTry asking me something or use the quick actions below!",
    timestamp: new Date(),
};

export function useChatbot() {
    const { user } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
    const [isLoading, setIsLoading] = useState(false);
    const idCounter = useRef(1);

    const toggleChat = useCallback(() => {
        setIsOpen((prev) => !prev);
    }, []);

    const closeChat = useCallback(() => {
        setIsOpen(false);
    }, []);

    const sendMessage = useCallback(
        async (content: string) => {
            if (!content.trim() || isLoading) return;

            const userMsg: ChatMessage = {
                id: `msg-${idCounter.current++}`,
                role: 'user',
                content: content.trim(),
                timestamp: new Date(),
            };

            setMessages((prev) => [...prev, userMsg]);
            setIsLoading(true);

            try {
                const { data } = await api.post('/ai/chat', {
                    message: content.trim(),
                    userId: user?.id || null,
                });

                const botMsg: ChatMessage = {
                    id: `msg-${idCounter.current++}`,
                    role: 'assistant',
                    content: data.reply,
                    timestamp: new Date(),
                };

                setMessages((prev) => [...prev, botMsg]);
            } catch {
                const errorMsg: ChatMessage = {
                    id: `msg-${idCounter.current++}`,
                    role: 'assistant',
                    content: "Sorry, I couldn't process your request right now. Please try again! 🔄",
                    timestamp: new Date(),
                };
                setMessages((prev) => [...prev, errorMsg]);
            } finally {
                setIsLoading(false);
            }
        },
        [isLoading, user?.id]
    );

    const clearChat = useCallback(() => {
        setMessages([WELCOME_MESSAGE]);
    }, []);

    return { isOpen, messages, isLoading, toggleChat, closeChat, sendMessage, clearChat };
}
