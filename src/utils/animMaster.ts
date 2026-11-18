import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

let lenisInstance: Lenis | null = null;
let tickerCallback: ((time: number) => void) | null = null;
let anchorClickHandler: ((event: MouseEvent) => void) | null = null;
let scrollTriggers: ScrollTrigger[] = [];
let lastScrollY = 0;

export function initSmoothScroll(): { destroy: () => void } | null {
  if (typeof window === 'undefined') return null;
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) {
    return null;
  }

  if (lenisInstance) {
    return {
      destroy: () => destroySmoothScroll(),
    };
  }

  const instance = new Lenis({
    duration: 1.2,
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

  // Navbar Hide on Scroll Down / Show on Scroll Up
  const header = document.getElementById('site-navigation');
  if (header) {
    const st = ScrollTrigger.create({
      start: 'top top',
      end: 'max',
      onUpdate: (self) => {
        const currentY = self.scroll();
        if (currentY > 120) {
          if (currentY > lastScrollY + 6) {
            header.classList.add('site-header--hidden');
          } else if (currentY < lastScrollY - 6) {
            header.classList.remove('site-header--hidden');
          }
        } else {
          header.classList.remove('site-header--hidden');
        }
        lastScrollY = currentY;
      },
    });
    scrollTriggers.push(st);
  }

  // Section Heading Reveals (slide up from mask)
  const headings = document.querySelectorAll('.section-heading h2, .workstation-title, .designer-headline');
  headings.forEach((heading) => {
    const st = ScrollTrigger.create({
      trigger: heading,
      start: 'top 85%',
      once: true,
      onEnter: () => {
        gsap.fromTo(
          heading,
          { y: 50, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.9, ease: 'power3.out' }
        );
      },
    });
    scrollTriggers.push(st);
  });

  // Fade-and-rise reveals for cards, paragraphs, and images
  const revealElements = document.querySelectorAll('.skill-card, .employer-chip, .about-metric, .footprint-gmap-card, .briefcam-alert-card, .cert-article, .contact-card');
  revealElements.forEach((el) => {
    const st = ScrollTrigger.create({
      trigger: el,
      start: 'top 90%',
      once: true,
      onEnter: () => {
        gsap.fromTo(
          el,
          { y: 40, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.85, ease: 'power3.out' }
        );
      },
    });
    scrollTriggers.push(st);
  });

  // Subtle Parallax on large imagery / cards
  const parallaxItems = document.querySelectorAll('.identity-image, .workstation-frame, .footprint-gmap-card');
  parallaxItems.forEach((item) => {
    const st = ScrollTrigger.create({
      trigger: item,
      start: 'top bottom',
      end: 'bottom top',
      scrub: true,
      onUpdate: (self) => {
        const progress = self.progress;
        const yOffset = (progress - 0.5) * 40; // ~40px movement
        gsap.set(item, { y: yOffset });
      },
    });
    scrollTriggers.push(st);
  });

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
  for (const st of scrollTriggers) {
    st.kill();
  }
  scrollTriggers = [];

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
