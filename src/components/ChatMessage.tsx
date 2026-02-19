'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Sparkles, Pencil, X, Check } from 'lucide-react';
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
        'flex w-full gap-3',
        isUser ? 'justify-end' : 'justify-start'
      )}
      onMouseEnter={() => isUser && onEdit && setShowEditButton(true)}
      onMouseLeave={() => setShowEditButton(false)}
    >
      {!isUser && (
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center shadow-lg">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
      )}

      <div
        className={cn(
          'max-w-[85%] md:max-w-[75%] rounded-2xl px-5 py-4 shadow-sm relative',
          isUser
            ? 'bg-gradient-to-br from-blue-600 to-teal-600 text-white rounded-br-md'
            : 'bg-white/80 backdrop-blur-sm border border-blue-100 text-gray-800 rounded-bl-md'
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
                  className="w-full bg-white/20 text-white placeholder-white/60 rounded-lg px-3 py-2 text-[15px] resize-none focus:outline-none focus:ring-2 focus:ring-white/30 min-h-[60px]"
                  placeholder="Edit your message..."
                  autoFocus
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={onEditCancel}
                    className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
                    title="Cancel (Esc)"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <button
                    onClick={onEditSave}
                    className="p-1.5 rounded-lg bg-white/30 hover:bg-white/40 transition-colors"
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
                      className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 transition-colors flex-shrink-0"
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
              <p className="text-[15px] leading-relaxed text-gray-700">{message.content}</p>
            )}

            {/* Thought Pattern + Note */}
            {(message.thoughtPattern || message.distortionType) && (
              <div className="flex flex-col gap-1">
                <span className="px-3 py-1.5 bg-gradient-to-r from-amber-100 to-orange-100 text-amber-700 text-xs font-medium rounded-full border border-amber-200 w-fit">
                  {message.thoughtPattern || message.distortionType}
                </span>
                {(message.patternNote || message.distortionExplanation) && (
                  <p className="text-sm text-gray-600 pl-1">
                    {message.patternNote || message.distortionExplanation}
                  </p>
                )}
              </div>
            )}

            {/* Reframe */}
            {message.reframe && message.reframe.trim() && (
              <div className="bg-gradient-to-r from-teal-50 to-emerald-50 rounded-xl p-4 border border-teal-100">
                <p className="text-[15px] text-gray-700">{message.reframe}</p>
              </div>
            )}

            {/* Question (optional - presence mode) */}
            {((message.question && message.question.trim()) || (message.probingQuestion && message.probingQuestion.trim())) && (
              <div className="bg-gradient-to-r from-blue-50 to-sky-50 rounded-xl p-4 border border-blue-100">
                <p className="text-[15px] text-blue-700 font-medium">
                  {message.question || message.probingQuestion}
                </p>
              </div>
            )}

            {/* Encouragement */}
            {message.encouragement && message.encouragement.trim() && (
              <p className="text-sm text-blue-600 font-medium">✨ {message.encouragement}</p>
            )}
          </div>
        ) : (
          // Fallback: plain text only
          <p className="text-[15px] leading-relaxed text-gray-700">{message.content}</p>
        )}
      </div>

      {isUser && (
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center shadow-lg">
          <User className="w-5 h-5 text-white" />
        </div>
      )}
    </motion.div>
  );
}
