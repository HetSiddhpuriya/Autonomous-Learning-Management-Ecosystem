import type { ChatMessage as ChatMessageType } from './useChatbot';
import { Bot, User } from 'lucide-react';

interface ChatMessageProps {
    message: ChatMessageType;
}

// Basic markdown-ish rendering: bold, italic, bullet lists, numbered lists
function renderContent(content: string) {
    const lines = content.split('\n');

    return lines.map((line, i) => {
        // Process inline markdown
        let processed = line
            .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.+?)\*/g, '<em>$1</em>')
            .replace(/_(.+?)_/g, '<em>$1</em>');

        // Bullet points
        if (/^[•\-\*]\s/.test(line.trim())) {
            const text = line.trim().replace(/^[•\-\*]\s/, '');
            const processedText = text
                .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
                .replace(/\*(.+?)\*/g, '<em>$1</em>')
                .replace(/_(.+?)_/g, '<em>$1</em>');
            return (
                <div key={i} className="flex items-start gap-1.5 ml-2 my-0.5">
                    <span className="text-primary mt-1 text-xs">•</span>
                    <span dangerouslySetInnerHTML={{ __html: processedText }} />
                </div>
            );
        }

        // Numbered list
        if (/^\d+\.\s/.test(line.trim())) {
            return (
                <div key={i} className="ml-2 my-0.5">
                    <span dangerouslySetInnerHTML={{ __html: processed }} />
                </div>
            );
        }

        // Empty line → spacer
        if (!line.trim()) {
            return <div key={i} className="h-2" />;
        }

        return (
            <div key={i}>
                <span dangerouslySetInnerHTML={{ __html: processed }} />
            </div>
        );
    });
}

export function ChatMessage({ message }: ChatMessageProps) {
    const isBot = message.role === 'assistant';

    return (
        <div className={`flex gap-2.5 ${isBot ? 'justify-start' : 'justify-end'}`}>
            {isBot && (
                <div className="flex-shrink-0 w-7 h-7 rounded-full bg-primary flex items-center justify-center shadow-md mt-0.5">
                    <Bot className="w-4 h-4 text-primary-foreground" />
                </div>
            )}

            <div
                className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed shadow-sm ${isBot
                    ? 'bg-muted/60 dark:bg-muted/40 text-foreground rounded-bl-md'
                    : 'bg-primary text-primary-foreground rounded-br-md'
                    }`}
            >
                <div className="space-y-0.5">{renderContent(message.content)}</div>
                <div
                    className={`text-[10px] mt-1.5 ${isBot ? 'text-muted-foreground/60' : 'text-primary-foreground/70'
                        }`}
                >
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
            </div>

            {!isBot && (
                <div className="flex-shrink-0 w-7 h-7 rounded-full bg-accent flex items-center justify-center shadow-md mt-0.5">
                    <User className="w-4 h-4 text-accent-foreground" />
                </div>
            )}
        </div>
    );
}
