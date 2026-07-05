'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Sparkles } from 'lucide-react';
import { IcebergVisualization, IcebergLayer } from './IcebergVisualization';

interface DraggableBubbleProps {
  currentLayer: IcebergLayer;
  discoveredInsights: Record<IcebergLayer, string | null>;
}

export function DraggableBubble({
  currentLayer,
  discoveredInsights,
}: DraggableBubbleProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedPosition = localStorage.getItem('journey-bubble-position');
      if (savedPosition) {
        try {
          return JSON.parse(savedPosition);
        } catch (e) {
          console.error('Failed to parse saved position', e);
        }
      }
    }
    return { x: 16, y: 100 };
  });
  const [isExpanded, setIsExpanded] = useState(false);
  const dragRef = useRef<HTMLDivElement>(null);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const elementStartPos = useRef({ x: 0, y: 0 });

  const completedCount = Object.values(discoveredInsights).filter(Boolean).length;

  useEffect(() => {
    if (!isDragging && typeof window !== 'undefined') {
      localStorage.setItem('journey-bubble-position', JSON.stringify(position));
    }
  }, [position, isDragging]);

  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    setIsDragging(true);
    dragStartPos.current = { x: e.clientX, y: e.clientY };
    elementStartPos.current = { ...position };
    if (dragRef.current) {
      dragRef.current.setPointerCapture(e.pointerId);
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const deltaX = e.clientX - dragStartPos.current.x;
    const deltaY = e.clientY - dragStartPos.current.y;
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    const bubbleSize = isExpanded ? 300 : 60;
    let newX = elementStartPos.current.x + deltaX;
    let newY = elementStartPos.current.y + deltaY;
    newX = Math.max(8, Math.min(newX, screenWidth - bubbleSize - 8));
    newY = Math.max(60, Math.min(newY, screenHeight - bubbleSize - 120));
    setPosition({ x: newX, y: newY });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (dragRef.current) {
      dragRef.current.releasePointerCapture(e.pointerId);
    }
    setIsDragging(false);
  };

  return (
    <div
      ref={dragRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      style={{
        position: 'fixed',
        left: position.x,
        top: position.y,
        zIndex: 50,
        touchAction: 'none',
        cursor: isDragging ? 'grabbing' : 'grab',
      }}
      className="lg:hidden"
    >
      <motion.div
        animate={{ scale: isDragging ? 1.05 : 1 }}
        transition={{ duration: 0.15 }}
      >
        {!isExpanded ? (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => !isDragging && setIsExpanded(true)}
            className="relative bg-gradient-to-br from-primary to-primary/80 rounded-full shadow-premium flex items-center justify-center"
            style={{ width: 60, height: 60 }}
          >
            <Sparkles className="w-6 h-6 text-primary-foreground" />
            {/* Progress indicator */}
            {completedCount > 0 && (
              <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-accent text-accent-foreground text-xs font-bold flex items-center justify-center shadow-lg">
                {completedCount}
              </div>
            )}
          </motion.button>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="glass rounded-2xl border border-border/50 shadow-premium overflow-hidden"
            style={{ width: 300 }}
          >
            <div className="bg-gradient-to-r from-primary to-primary/80 px-4 py-3 flex items-center justify-between">
              <span className="text-primary-foreground text-sm font-semibold">Your Journey</span>
              <button
                onClick={() => setIsExpanded(false)}
                className="text-primary-foreground/80 hover:text-primary-foreground transition-colors"
              >
                <ChevronDown className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 max-h-72 overflow-y-auto">
              <IcebergVisualization
                currentLayer={currentLayer}
                discoveredInsights={discoveredInsights}
              />
            </div>

            <div className="px-4 py-2 bg-secondary/50 border-t border-border/50">
              <p className="text-[10px] text-muted-foreground text-center">
                Drag to move • Tap header to collapse
              </p>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
