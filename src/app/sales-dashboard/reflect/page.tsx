'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Send,
  RotateCcw,
  Brain,
  Heart,
  Target,
  Zap,
  TrendingDown,
  MessageCircle,
  ChevronDown,
  Lightbulb,
  AlertCircle,
} from 'lucide-react';
import { SalesDashboardLayout } from '@/components/dashboard/SalesDashboardLayout';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  thoughtPattern?: string;
  reframe?: string;
  question?: string;
  encouragement?: string;
}

const SALES_SCENARIOS = [
  {
    icon: Target,
    title: 'Missed Target',
    prompt: 'I missed my quarterly target and feel like a failure...',
    color: 'from-red-500 to-orange-500',
  },
  {
    icon: MessageCircle,
    title: 'Rejection Fear',
    prompt: 'I\'m afraid to make cold calls because of rejection...',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    icon: Heart,
    title: 'Imposter Syndrome',
    prompt: 'I feel like I don\'t belong in sales...',
    color: 'from-purple-500 to-pink-500',
  },
  {
    icon: Zap,
    title: 'Deal Anxiety',
    prompt: 'I\'m nervous about closing this big deal...',
    color: 'from-amber-500 to-yellow-500',
  },
];

export default function SalesReflectPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showScenarios, setShowScenarios] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (text: string = input) => {
    if (!text.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setShowScenarios(false);
    setIsLoading(true);

    try {
      const response = await fetch('/api/reframe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userMessage: text.trim(),
          conversationHistory: messages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          sessionContext: { mode: 'sales' },
        }),
      });

      const data = await response.json();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.acknowledgment || 'Thank you for sharing.',
        thoughtPattern: data.thoughtPattern || data.distortionType,
        reframe: data.reframe,
        question: data.question || data.probingQuestion,
        encouragement: data.encouragement,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'I apologize, but I encountered an issue. Please try again.',
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setMessages([]);
    setShowScenarios(true);
  };

  return (
    <SalesDashboardLayout>
      <div className="max-w-3xl mx-auto h-[calc(100vh-8rem)] flex flex-col">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Reflect AI</h1>
                <p className="text-sm text-muted-foreground">Your AI thought companion</p>
              </div>
            </div>
            {messages.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                className="gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                New Session
              </Button>
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto rounded-2xl glass border border-border/50 p-4 mb-4">
          {messages.length === 0 && showScenarios ? (
            <div className="h-full flex flex-col items-center justify-center p-6">
              <div className="text-center mb-8">
                <Brain className="w-16 h-16 text-primary mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-foreground mb-2">
                  What's on your mind?
                </h2>
                <p className="text-muted-foreground max-w-md">
                  Share your thoughts about sales challenges, stress, or any concerns.
                  I'll help you reframe negative patterns and find clarity.
                </p>
              </div>

              {/* Quick Scenarios */}
              <div className="w-full max-w-lg">
                <p className="text-sm text-muted-foreground mb-4 text-center">
                  Common sales scenarios:
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {SALES_SCENARIOS.map((scenario) => (
                    <motion.button
                      key={scenario.title}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleSubmit(scenario.prompt)}
                      className="p-4 rounded-xl border border-border/50 hover:border-primary/30 bg-secondary/30 hover:bg-secondary/50 transition-all text-left group"
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          'w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-br',
                          scenario.color
                        )}>
                          <scenario.icon className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground group-hover:text-primary transition-colors">
                            {scenario.title}
                          </p>
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    'flex',
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  )}
                >
                  <div
                    className={cn(
                      'max-w-[85%] rounded-2xl px-4 py-3',
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary/50 border border-border/50'
                    )}
                  >
                    {message.role === 'user' ? (
                      <p className="text-sm">{message.content}</p>
                    ) : (
                      <div className="space-y-3">
                        <p className="text-sm text-foreground">{message.content}</p>
                        
                        {message.thoughtPattern && (
                          <div className="pt-2 border-t border-border/50">
                            <div className="flex items-center gap-2 mb-1">
                              <AlertCircle className="w-4 h-4 text-amber-500" />
                              <span className="text-xs font-medium text-muted-foreground">Thought Pattern</span>
                            </div>
                            <p className="text-sm font-medium text-amber-600 dark:text-amber-400">
                              {message.thoughtPattern}
                            </p>
                          </div>
                        )}
                        
                        {message.reframe && (
                          <div className="pt-2 border-t border-border/50">
                            <div className="flex items-center gap-2 mb-1">
                              <Lightbulb className="w-4 h-4 text-primary" />
                              <span className="text-xs font-medium text-muted-foreground">Reframe</span>
                            </div>
                            <p className="text-sm text-foreground">{message.reframe}</p>
                          </div>
                        )}

                        {message.question && (
                          <div className="pt-2 border-t border-border/50">
                            <p className="text-sm text-primary italic">{message.question}</p>
                          </div>
                        )}

                        {message.encouragement && (
                          <p className="text-xs text-muted-foreground italic">
                            {message.encouragement}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-secondary/50 rounded-2xl px-4 py-3 border border-border/50">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-primary animate-bounce" />
                      <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0.1s' }} />
                      <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0.2s' }} />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="glass rounded-2xl border border-border/50 p-4">
          <div className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              placeholder="Share what's on your mind..."
              className="flex-1 px-4 py-3 rounded-xl bg-secondary/50 border border-border/50 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 outline-none text-foreground placeholder:text-muted-foreground/60"
            />
            <Button
              onClick={() => handleSubmit()}
              disabled={!input.trim() || isLoading}
              className="bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-lg hover:shadow-xl transition-all"
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            Powered by AI • Your conversations are private
          </p>
        </div>
      </div>
    </SalesDashboardLayout>
  );
}
