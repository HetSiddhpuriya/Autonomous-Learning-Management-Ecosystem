import { useState, type KeyboardEvent } from 'react';
import { Send } from 'lucide-react';

interface ChatInputProps {
    onSend: (message: string) => void;
    disabled?: boolean;
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
    const [value, setValue] = useState('');

    const handleSend = () => {
        if (!value.trim() || disabled) return;
        onSend(value);
        setValue('');
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="flex items-center gap-2 p-3 border-t border-border/50 bg-background/80">
            <input
                type="text"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask me anything..."
                disabled={disabled}
                className="flex-1 bg-muted/40 dark:bg-muted/30 rounded-xl px-4 py-2.5 text-sm outline-none placeholder:text-muted-foreground/50 focus:ring-2 focus:ring-primary/30 transition-all disabled:opacity-50"
            />
            <button
                onClick={handleSend}
                disabled={disabled || !value.trim()}
                className="flex-shrink-0 w-9 h-9 rounded-xl bg-primary hover:opacity-90 text-primary-foreground flex items-center justify-center hover:shadow-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-40 disabled:hover:scale-100 disabled:hover:shadow-none"
            >
                <Send className="w-4 h-4" />
            </button>
        </div>
    );
}
