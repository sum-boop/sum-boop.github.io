import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { restoreScramble, scrambleReveal } from '@/utils/scrambleReveal';
import { playPageCurtain } from '@/utils/pageCurtain';
import { initTalkButton } from '@/utils/talkButton';

gsap.registerPlugin(ScrollTrigger);

let lenisInstance: Lenis | null = null;
let tickerCallback: ((time: number) => void) | null = null;
let anchorClickHandler: ((event: MouseEvent) => void) | null = null;
let scrollTriggers: ScrollTrigger[] = [];
let scrambledHeadings: HTMLElement[] = [];
let disposeTalkButton: (() => void) | null = null;

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

  // Navbar remains visible at all scroll positions to match 5lab.co navigation chrome
  const header = document.getElementById('site-navigation');
  if (header) {
    header.classList.remove('site-header--hidden');
  }

  // Section Heading Reveals (slide up from mask) and crisp letter-only heading scramble
  const headings = document.querySelectorAll(
    '.section-heading h2, .workstation-title-5lab, .contact-giant-title-5lab, .works-group-title-5lab',
  );
  headings.forEach((heading) => {
    const revealTrigger = ScrollTrigger.create({
      trigger: heading,
      start: 'top 85%',
      once: true,
      onEnter: () => {
        gsap.fromTo(
          heading,
          { y: 50, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.9, ease: 'power3.out' },
        );
      },
    });
    scrollTriggers.push(revealTrigger);

    if (
      heading instanceof HTMLElement &&
      (heading.tagName === 'H1' ||
        heading.tagName === 'H2' ||
        heading.classList.contains('works-group-title-5lab')) &&
      !heading.closest('#hero-workstation')
    ) {
      scrambledHeadings.push(heading);
      const scrambleTrigger = ScrollTrigger.create({
        trigger: heading,
        start: 'top 85%',
        end: 'bottom top',
        onEnter: () =>
          scrambleReveal(heading, { duration: 0.55, chars: 'upperAndLowerCase' }),
        onLeave: () => restoreScramble(heading),
        onLeaveBack: () => restoreScramble(heading),
      });
      scrollTriggers.push(scrambleTrigger);
    }
  });

  // Fade-and-rise reveals for cards, paragraphs, and images
  const revealElements = document.querySelectorAll('.work-card-5lab, .skill-cell-5lab, .experience-editorial-row-5lab, .credential-card-5lab, .footprint-gmap-card-5lab, .briefcam-alert-card, .employer-chip, .about-metric');
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
  const parallaxItems = document.querySelectorAll('.identity-image, .workstation-frame-5lab, .footprint-gmap-card-5lab');
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
    const fromNav = anchor.closest('#site-navigation, .mobile-nav-overlay, [data-curtain]') !== null;
    if (fromNav) {
      // 5lab-style page transition: curtain closes, we jump while covered, curtain opens.
      playPageCurtain(() => {
        lenisInstance?.scrollTo(target, { offset: -84, immediate: true, force: true });
        ScrollTrigger.update();
      });
    } else {
      lenisInstance.scrollTo(target, { offset: -84 });
    }
    if (window.location.hash !== hash) {
      window.history.replaceState(null, '', hash);
    }
  };
  document.addEventListener('click', anchorClickHandler);
  disposeTalkButton = initTalkButton();

  return {
    destroy: () => destroySmoothScroll(),
  };
}

export function destroySmoothScroll(): void {
  for (const heading of scrambledHeadings) {
    restoreScramble(heading);
  }
  scrambledHeadings = [];

  for (const st of scrollTriggers) {
    st.kill();
  }
  scrollTriggers = [];

  if (anchorClickHandler) {
    document.removeEventListener('click', anchorClickHandler);
    anchorClickHandler = null;
  }
  if (disposeTalkButton) {
    disposeTalkButton();
    disposeTalkButton = null;
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
