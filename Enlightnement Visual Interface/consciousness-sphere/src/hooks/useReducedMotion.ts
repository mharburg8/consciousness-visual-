import { useState, useEffect } from 'react';

/**
 * Reactively reads the `prefers-reduced-motion` media query.
 * Returns true if the user has requested reduced motion, false otherwise.
 * Updates automatically if the OS/browser preference changes at runtime.
 */
export function useReducedMotion(): boolean {
  const [reducedMotion, setReducedMotion] = useState<boolean>(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  return reducedMotion;
}
