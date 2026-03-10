import { MessageCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChatbotWindow } from './ChatbotWindow';
import { useChatbot } from './useChatbot';

export function ChatbotButton() {
    const { isOpen, messages, isLoading, toggleChat, closeChat, sendMessage, clearChat } = useChatbot();

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.9 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                    >
                        <ChatbotWindow
                            messages={messages}
                            isLoading={isLoading}
                            onSend={sendMessage}
                            onClose={closeChat}
                            onClear={clearChat}
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Floating Button */}
            <motion.button
                onClick={toggleChat}
                className="w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-xl shadow-primary/30 dark:shadow-primary/20 flex items-center justify-center hover:shadow-2xl hover:shadow-primary/40 transition-shadow"
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
            >
                <AnimatePresence mode="wait">
                    {isOpen ? (
                        <motion.div
                            key="close"
                            initial={{ rotate: -90, opacity: 0 }}
                            animate={{ rotate: 0, opacity: 1 }}
                            exit={{ rotate: 90, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            <X className="w-6 h-6" />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="open"
                            initial={{ rotate: 90, opacity: 0 }}
                            animate={{ rotate: 0, opacity: 1 }}
                            exit={{ rotate: -90, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            <MessageCircle className="w-6 h-6" />
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.button>
        </div>
    );
}
