'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Sparkles, Pencil, X, Check, Brain, Lightbulb, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  // Premium fields (used by API)
  question?: string;
  thoughtPattern?: string;
  patternNote?: string;
  reframe?: string;
  encouragement?: string;
  icebergLayer?: string;
  layerInsight?: string;
  // Legacy fields (kept for backward compatibility)
  distortionType?: string;
  distortionExplanation?: string;
  probingQuestion?: string;
}

interface ChatMessageProps {
  message: Message;
  onEdit?: (messageId: string, newContent: string) => void;
  isEditing?: boolean;
  editContent?: string;
  onEditChange?: (content: string) => void;
  onEditSave?: () => void;
  onEditCancel?: () => void;
}

export function ChatMessage({
  message,
  onEdit,
  isEditing = false,
  editContent = '',
  onEditChange,
  onEditSave,
  onEditCancel,
}: ChatMessageProps) {
  const [showEditButton, setShowEditButton] = useState(false);
  const [showReframe, setShowReframe] = useState(false);
  const isUser = message.role === 'user';

  // Check if this has structured CBT response fields
  const hasStructuredResponse =
    !!(message.thoughtPattern || message.patternNote || message.reframe ||
       message.question || message.probingQuestion || message.encouragement);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onEditSave?.();
    } else if (e.key === 'Escape') {
      onEditCancel?.();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className={cn(
        'flex w-full gap-3 group',
        isUser ? 'justify-end' : 'justify-start'
      )}
      onMouseEnter={() => isUser && onEdit && setShowEditButton(true)}
      onMouseLeave={() => setShowEditButton(false)}
    >
      {!isUser && (
        <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-premium">
          <Sparkles className="w-5 h-5 text-primary-foreground" />
        </div>
      )}

      <div
        className={cn(
          'max-w-[85%] md:max-w-[75%] rounded-2xl px-5 py-4 relative',
          isUser
            ? 'bg-gradient-to-br from-primary to-primary/80 text-primary-foreground rounded-br-md shadow-premium'
            : 'glass border border-border/50 text-foreground rounded-bl-md shadow-premium'
        )}
      >
        {isUser ? (
          <div className="flex items-start gap-2">
            {isEditing ? (
              <div className="flex-1 flex flex-col gap-2">
                <textarea
                  value={editContent}
                  onChange={(e) => onEditChange?.(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="w-full bg-primary-foreground/10 text-primary-foreground placeholder:text-primary-foreground/60 rounded-xl px-3 py-2 text-[15px] resize-none focus:outline-none focus:ring-2 focus:ring-primary-foreground/30 min-h-[60px] border border-primary-foreground/20"
                  placeholder="Edit your message..."
                  autoFocus
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={onEditCancel}
                    className="p-2 rounded-lg bg-primary-foreground/10 hover:bg-primary-foreground/20 transition-colors"
                    title="Cancel (Esc)"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <button
                    onClick={onEditSave}
                    className="p-2 rounded-lg bg-primary-foreground/20 hover:bg-primary-foreground/30 transition-colors"
                    title="Save (Enter)"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <>
                <p className="text-[15px] leading-relaxed flex-1">{message.content}</p>
                {/* Edit button */}
                <AnimatePresence>
                  {showEditButton && onEdit && !isEditing && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      onClick={() => onEdit(message.id, message.content)}
                      className="p-2 rounded-lg bg-primary-foreground/10 hover:bg-primary-foreground/20 transition-colors flex-shrink-0"
                      title="Edit message"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </motion.button>
                  )}
                </AnimatePresence>
              </>
            )}
          </div>
        ) : hasStructuredResponse ? (
          // Premium 5-layer CBT response format
          <div className="space-y-4">
            {/* Acknowledgment */}
            {message.content && (
              <p className="text-[15px] leading-relaxed">{message.content}</p>
            )}

            {/* Thought Pattern + Note */}
            {(message.thoughtPattern || message.distortionType) && (
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <Brain className="w-4 h-4 text-primary" />
                  <span className="text-xs font-medium text-primary">Thought Pattern</span>
                </div>
                <span className="px-3 py-1.5 bg-primary/10 text-primary text-xs font-medium rounded-lg border border-primary/20 w-fit">
                  {message.thoughtPattern || message.distortionType}
                </span>
                {(message.patternNote || message.distortionExplanation) && (
                  <p className="text-sm text-muted-foreground pl-1">
                    {message.patternNote || message.distortionExplanation}
                  </p>
                )}
              </div>
            )}

            {/* Reframe */}
            {message.reframe && message.reframe.trim() && (
              <div>
                <button
                  onClick={() => setShowReframe(!showReframe)}
                  className="flex items-center gap-2 text-sm font-medium text-accent hover:text-accent/80 transition-colors"
                >
                  <Lightbulb className="w-4 h-4" />
                  <span>Reframe</span>
                  <span className="text-xs text-muted-foreground">
                    {showReframe ? '▲' : '▼'}
                  </span>
                </button>
                <AnimatePresence>
                  {showReframe && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-2 p-4 rounded-xl bg-accent/10 border border-accent/20"
                    >
                      <p className="text-[15px] leading-relaxed">{message.reframe}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Question */}
            {((message.question && message.question.trim()) || (message.probingQuestion && message.probingQuestion.trim())) && (
              <div className="bg-primary/5 rounded-xl p-4 border border-primary/10">
                <p className="text-[15px] font-medium text-foreground">
                  {message.question || message.probingQuestion}
                </p>
              </div>
            )}

            {/* Encouragement */}
            {message.encouragement && message.encouragement.trim() && (
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-accent" />
                <p className="text-sm text-muted-foreground italic">{message.encouragement}</p>
              </div>
            )}

            {/* Iceberg Layer Badge */}
            {message.icebergLayer && (
              <div className="pt-2 border-t border-border/50">
                <span className="text-xs px-2 py-1 rounded-lg bg-primary/5 text-primary border border-primary/10">
                  {message.icebergLayer === 'surface' && '🌊 Surface'}
                  {message.icebergLayer === 'trigger' && '⚡ Trigger'}
                  {message.icebergLayer === 'emotion' && '💜 Emotion'}
                  {message.icebergLayer === 'coreBelief' && '💎 Core Belief'}
                </span>
              </div>
            )}
          </div>
        ) : (
          // Fallback: plain text only
          <p className="text-[15px] leading-relaxed">{message.content}</p>
        )}
      </div>

      {isUser && (
        <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-secondary to-secondary/80 flex items-center justify-center shadow-premium border border-border/50">
          <User className="w-5 h-5 text-secondary-foreground" />
        </div>
      )}
    </motion.div>
  );
}
