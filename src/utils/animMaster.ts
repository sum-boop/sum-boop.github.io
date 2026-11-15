import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

let lenisInstance: Lenis | null = null;
let tickerCallback: ((time: number) => void) | null = null;
let anchorClickHandler: ((event: MouseEvent) => void) | null = null;

export function initSmoothScroll(): { destroy: () => void } | null {
  if (typeof window === 'undefined') return null;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return null;
  }

  if (lenisInstance) {
    return {
      destroy: () => destroySmoothScroll(),
    };
  }

  const instance = new Lenis({
    duration: 1.15,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    orientation: 'vertical',
    gestureOrientation: 'vertical',
    smoothWheel: true,
    touchMultiplier: 2,
  });

  lenisInstance = instance;
  instance.on('scroll', ScrollTrigger.update);

  tickerCallback = (time: number) => {
    lenisInstance?.raf(time * 1000);
  };
  gsap.ticker.add(tickerCallback);
  gsap.ticker.lagSmoothing(0);

  anchorClickHandler = (event: MouseEvent) => {
    if (!(event.target instanceof Element)) return;
    const anchor = event.target.closest<HTMLAnchorElement>('a[href^="#"]');
    if (!anchor) return;
    const hash = anchor.getAttribute('href');
    if (!hash || hash === '#') return;
    const target = document.getElementById(hash.slice(1));
    if (!target || !lenisInstance) return;
    event.preventDefault();
    lenisInstance.scrollTo(target, { offset: -84 });
    if (window.location.hash !== hash) {
      window.history.replaceState(null, '', hash);
    }
  };
  document.addEventListener('click', anchorClickHandler);

  return {
    destroy: () => destroySmoothScroll(),
  };
}

export function destroySmoothScroll(): void {
  if (anchorClickHandler) {
    document.removeEventListener('click', anchorClickHandler);
    anchorClickHandler = null;
  }
  if (tickerCallback) {
    gsap.ticker.remove(tickerCallback);
    tickerCallback = null;
  }
  if (lenisInstance) {
    lenisInstance.destroy();
    lenisInstance = null;
  }
}

export { gsap, ScrollTrigger };
