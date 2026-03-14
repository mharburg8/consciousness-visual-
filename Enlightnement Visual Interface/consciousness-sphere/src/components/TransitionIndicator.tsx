import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import useExplorerStore from '../stores/useExplorerStore';

const FEAR_LAYER = 7;

function crossedThreshold(prev: number | null, next: number | null): boolean {
  if (prev === null || next === null) return false;
  const prevIsFear = prev === FEAR_LAYER;
  const nextIsFear = next === FEAR_LAYER;
  return prevIsFear !== nextIsFear;
}

export default function TransitionIndicator() {
  const selectedLayer = useExplorerStore((s) => s.selectedLayer);
  const prevLayerRef = useRef<number | null>(null);
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (crossedThreshold(prevLayerRef.current, selectedLayer)) {
      setVisible(true);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setVisible(false), 3000);
    }
    prevLayerRef.current = selectedLayer;
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [selectedLayer]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="threshold-indicator"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.4, ease: 'easeInOut' }}
          className="pointer-events-none fixed bottom-8 left-1/2 -translate-x-1/2 z-50"
          role="status"
          aria-live="polite"
        >
          <div
            style={{
              background: 'rgba(10, 14, 26, 0.75)',
              border: '1px solid rgba(212, 160, 74, 0.35)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              borderRadius: '9999px',
              padding: '0.5rem 1.25rem',
              color: '#d4a04a',
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '0.8125rem',
              letterSpacing: '0.02em',
              boxShadow: '0 0 18px rgba(212, 160, 74, 0.15)',
              whiteSpace: 'nowrap',
            }}
          >
            This is the threshold between contraction and expansion.
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
