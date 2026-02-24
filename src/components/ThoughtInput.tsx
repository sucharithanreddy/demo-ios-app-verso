'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Loader2, Sparkles } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface ThoughtInputProps {
  onSubmit: (thought: string) => void;
  isLoading: boolean;
  placeholder?: string;
}

export function ThoughtInput({
  onSubmit,
  isLoading,
  placeholder = 'Share your thought here...',
}: ThoughtInputProps) {
  const [thought, setThought] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const submittingRef = useRef(false);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
    }
  }, [thought]);

  const handleSubmit = () => {
    if (submittingRef.current) return;
    if (thought.trim() && !isLoading) {
      submittingRef.current = true;
      onSubmit(thought.trim());
      setThought('');
      setTimeout(() => { submittingRef.current = false; }, 600);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.repeat) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="relative">
      {/* Glow effect */}
      <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 blur-xl opacity-60" />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative glass rounded-2xl border border-border/50 shadow-premium p-4"
      >
        <div className="flex items-end gap-3">
          {/* Sparkle icon */}
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-premium flex-shrink-0">
            <Sparkles className="w-5 h-5 text-primary-foreground" />
          </div>

          {/* Input area */}
          <div className="flex-1 relative">
            <Textarea
              ref={textareaRef}
              value={thought}
              onChange={(e) => setThought(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={isLoading}
              className={cn(
                'min-h-[48px] max-h-[150px] resize-none border-0 bg-transparent',
                'focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0',
                'text-foreground placeholder:text-muted-foreground/60',
                'text-[15px] leading-relaxed'
              )}
              rows={1}
            />
          </div>

          {/* Send Button */}
          <button
            onClick={handleSubmit}
            disabled={!thought.trim() || isLoading}
            className={cn(
              'flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center',
              'bg-gradient-to-br from-primary to-primary/80',
              'hover:bg-primary/90',
              'disabled:opacity-40 disabled:cursor-not-allowed',
              'transition-all duration-200 hover:scale-105 active:scale-95',
              'shadow-premium glow-primary'
            )}
          >
            <AnimatePresence mode="wait">
              {isLoading ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                >
                  <Loader2 className="w-5 h-5 animate-spin text-primary-foreground" />
                </motion.div>
              ) : (
                <motion.div
                  key="send"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                >
                  <Send className="w-5 h-5 text-primary-foreground" />
                </motion.div>
              )}
            </AnimatePresence>
          </button>
        </div>

        {/* Helper text */}
        <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground/60">
          <span>Press Enter to send, Shift+Enter for new line</span>
          {!isLoading && thought.trim() && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-1 text-primary"
            >
              <Sparkles className="w-3 h-3" />
              <span>Ready</span>
            </motion.div>
          )}
        </div>

        {/* Loading shimmer */}
        <AnimatePresence>
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent"
            >
              <motion.div
                className="h-full w-1/3 bg-primary/50"
                animate={{ x: ['0%', '300%'] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
