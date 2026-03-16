import { useEffect, useRef } from 'react';
import { X, Sparkles, Trash2 } from 'lucide-react';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import type { ChatMessage as ChatMessageType } from './useChatbot';

interface ChatbotWindowProps {
    messages: ChatMessageType[];
    isLoading: boolean;
    onSend: (message: string) => void;
    onClose: () => void;
    onClear: () => void;
}

const QUICK_ACTIONS = [
    { label: '📚 Show Courses', message: 'What courses are available?' },
    { label: '🌟 Recommended', message: 'Recommend me courses' },
    { label: '📋 My Courses', message: 'Show my enrolled courses' },
    { label: '❓ Help', message: 'What can you help me with?' },
];

function TypingIndicator() {
    return (
        <div className="flex gap-2.5 justify-start">
            <div className="flex-shrink-0 w-7 h-7 rounded-full bg-primary flex items-center justify-center shadow-md">
                <Sparkles className="w-4 h-4 text-primary-foreground" />
            </div>
            <div className="bg-muted/60 dark:bg-muted/40 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
                <div className="flex gap-1.5 items-center">
                    <div className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
            </div>
        </div>
    );
}

export function ChatbotWindow({ messages, isLoading, onSend, onClose, onClear }: ChatbotWindowProps) {
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom on new messages
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isLoading]);

    return (
        <div className="flex flex-col w-[380px] h-[560px] max-h-[80vh] max-w-[calc(100vw-2rem)] bg-background border border-border/50 rounded-2xl shadow-2xl shadow-black/20 dark:shadow-black/50 overflow-hidden">
            {/* ── Header ─────────────────────────────────────────── */}
            <div className="flex items-center justify-between px-4 py-3 bg-primary text-primary-foreground">
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                        <Sparkles className="w-4.5 h-4.5" />
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold leading-tight">AI Assistant</h3>
                        <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                            <span className="text-[11px] text-white/70">Online</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-1">
                    <button
                        onClick={onClear}
                        className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/15 transition-colors"
                        title="Clear chat"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/15 transition-colors"
                        title="Close"
                    >
                        <X className="w-4.5 h-4.5" />
                    </button>
                </div>
            </div>

            {/* ── Messages ───────────────────────────────────────── */}
            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto px-4 py-3 space-y-3 scrollbar-thin scrollbar-thumb-muted-foreground/20"
            >
                {messages.map((msg) => (
                    <ChatMessage key={msg.id} message={msg} />
                ))}
                {isLoading && <TypingIndicator />}
            </div>

            {/* ── Quick Actions ──────────────────────────────────── */}
            {messages.length <= 1 && (
                <div className="px-4 pb-2 flex flex-wrap gap-1.5">
                    {QUICK_ACTIONS.map((action) => (
                        <button
                            key={action.label}
                            onClick={() => onSend(action.message)}
                            className="text-xs px-3 py-1.5 rounded-full border border-border/60 bg-muted/30 hover:bg-primary/10 hover:border-primary/40 text-foreground/80 hover:text-primary dark:hover:text-primary transition-all"
                        >
                            {action.label}
                        </button>
                    ))}
                </div>
            )}

            {/* ── Input ──────────────────────────────────────────── */}
            <ChatInput onSend={onSend} disabled={isLoading} />
        </div>
    );
}
