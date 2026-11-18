import { AnimatePresence, m, useMotionValueEvent, useScroll } from 'framer-motion';
import { ArrowUp } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useReducedMotion } from '../hooks/useReducedMotion';

export function BackToTop() {
  const { scrollY } = useScroll();
  const [visible, setVisible] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  const updateVisibility = (y: number) => {
    const threshold =
      typeof window !== 'undefined' ? Math.max(680, window.innerHeight * 0.85) : 720;
    const shouldShow = y > threshold;
    setVisible((current) => (current === shouldShow ? current : shouldShow));
  };

  useMotionValueEvent(scrollY, 'change', updateVisibility);

  useEffect(() => {
    const sync = () => updateVisibility(window.scrollY);
    sync();
    window.addEventListener('scroll', sync, { passive: true });
    window.addEventListener('resize', sync, { passive: true });
    return () => {
      window.removeEventListener('scroll', sync);
      window.removeEventListener('resize', sync);
    };
  }, []);

  return (
    <AnimatePresence>
      {visible ? (
        <m.button
          aria-label="Back to top"
          className="back-to-top"
          exit={{ opacity: 0, y: 8 }}
          initial={{ opacity: 0, y: 8 }}
          onClick={() =>
            window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' })
          }
          type="button"
          whileTap={{ scale: 0.94 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <ArrowUp aria-hidden="true" size={17} />
        </m.button>
      ) : null}
    </AnimatePresence>
  );
}
