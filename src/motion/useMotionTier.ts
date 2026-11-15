import { useReducedMotion } from '@/hooks/useReducedMotion';

export type MotionTier = 'native' | 'framer' | 'reduced';

/**
 * Selects the scroll-reveal engine cleanly. Uses Framer Motion's
 * IntersectionObserver-based whileInView on capable devices and disables
 * motion under reduced-motion preferences so elements near section bounds
 * never get stuck invisible under view-timeline ranges.
 */
export function useMotionTier(): MotionTier {
  const prefersReducedMotion = useReducedMotion();
  return prefersReducedMotion ? 'reduced' : 'framer';
}
