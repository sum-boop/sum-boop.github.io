import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import '@/styles/servicesDark.css';

gsap.registerPlugin(ScrollTrigger);

const SECTION_TONES: readonly {
  id: string;
  tone: 'hero' | 'light' | 'dark';
  paletteTone: 'light' | 'dark';
}[] = [
  { id: 'hero', tone: 'hero', paletteTone: 'dark' },
  { id: 'scene', tone: 'light', paletteTone: 'light' },
  { id: 'about', tone: 'light', paletteTone: 'light' },
  { id: 'hero-workstation', tone: 'dark', paletteTone: 'dark' },
  { id: 'skills', tone: 'dark', paletteTone: 'dark' },
  { id: 'footprint', tone: 'light', paletteTone: 'light' },
  { id: 'operations', tone: 'light', paletteTone: 'light' },
  { id: 'experience', tone: 'light', paletteTone: 'light' },
  { id: 'certifications', tone: 'light', paletteTone: 'light' },
  { id: 'contact', tone: 'dark', paletteTone: 'dark' },
];

interface PalettePair {
  top: string;
  bottom: string;
}

const SECTION_FINAL_PALETTES: readonly { id: string; palette: PalettePair }[] = [
  { id: 'hero', palette: { top: '#711127', bottom: '#170308' } },
  { id: 'scene', palette: { top: '#FAFAF7', bottom: '#FAFAF7' } },
  { id: 'about', palette: { top: '#FAFAF7', bottom: '#FAFAF7' } },
  { id: 'hero-workstation', palette: { top: '#000000', bottom: '#000000' } },
  { id: 'skills', palette: { top: '#000000', bottom: '#000000' } },
  { id: 'footprint', palette: { top: '#FAFAF7', bottom: '#FAFAF7' } },
  { id: 'operations', palette: { top: '#FAFAF7', bottom: '#FAFAF7' } },
  { id: 'experience', palette: { top: '#FAFAF7', bottom: '#FAFAF7' } },
  { id: 'certifications', palette: { top: '#FAFAF7', bottom: '#FAFAF7' } },
  { id: 'contact', palette: { top: '#000000', bottom: '#000000' } },
];

function initNavbarTone(
  tracked: readonly { el: HTMLElement; tone: 'hero' | 'light' | 'dark' }[],
): () => void {
  const header = document.getElementById('site-navigation');
  if (!header || tracked.length === 0) {
    return () => {};
  }

  let currentTone: string | null = null;
  let rafId = 0;

  const syncTone = () => {
    rafId = 0;
    const probeY = 36;
    let nextTone: 'hero' | 'light' | 'dark' = tracked[0]!.tone;

    for (const item of tracked) {
      const rect = item.el.getBoundingClientRect();
      if (rect.top <= probeY && rect.bottom > probeY) {
        nextTone = item.tone;
        break;
      }
      if (rect.top <= probeY) {
        nextTone = item.tone;
      }
    }

    if (currentTone !== nextTone) {
      currentTone = nextTone;
      header.setAttribute('data-nav-tone', nextTone);
    }
  };

  const scheduleSync = () => {
    if (!rafId) {
      rafId = window.requestAnimationFrame(syncTone);
    }
  };

  syncTone();
  window.addEventListener('scroll', syncTone, { passive: true });
  window.addEventListener('resize', scheduleSync, { passive: true });
  ScrollTrigger.addEventListener('refresh', syncTone);

  return () => {
    if (rafId) {
      window.cancelAnimationFrame(rafId);
    }
    window.removeEventListener('scroll', syncTone);
    window.removeEventListener('resize', scheduleSync);
    ScrollTrigger.removeEventListener('refresh', syncTone);
    header.removeAttribute('data-nav-tone');
  };
}

export function initPagePalette(): () => void {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return () => {};
  }

  const assignedToneElements: HTMLElement[] = [];
  const trackedNavSections: { el: HTMLElement; tone: 'hero' | 'light' | 'dark' }[] = [];

  for (const entry of SECTION_TONES) {
    const el = document.getElementById(entry.id);
    if (el) {
      el.setAttribute('data-tone', entry.paletteTone);
      assignedToneElements.push(el);
      trackedNavSections.push({ el, tone: entry.tone });
    }
  }

  const cleanupNavTone = initNavbarTone(trackedNavSections);

  const pageBg = document.getElementById('page-bg');
  if (!pageBg) {
    return () => {
      cleanupNavTone();
      for (const el of assignedToneElements) {
        el.removeAttribute('data-tone');
      }
    };
  }

  const applyPalette = (top: string, bottom: string) => {
    pageBg.style.setProperty('--bg-top', top);
    pageBg.style.setProperty('--bg-bottom', bottom);
  };

  applyPalette('#711127', '#170308');

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const reducedTriggers: ScrollTrigger[] = [];

  if (prefersReduced) {
    for (const entry of SECTION_FINAL_PALETTES) {
      const sectionEl = document.getElementById(entry.id);
      if (!sectionEl) continue;

      const trigger = ScrollTrigger.create({
        trigger: sectionEl,
        start: 'top 60%',
        end: 'bottom 40%',
        onEnter: () => applyPalette(entry.palette.top, entry.palette.bottom),
        onEnterBack: () => applyPalette(entry.palette.top, entry.palette.bottom),
      });
      reducedTriggers.push(trigger);
    }

    const viewportFocusY = window.innerHeight * 0.45;
    for (const entry of SECTION_FINAL_PALETTES) {
      const sectionEl = document.getElementById(entry.id);
      if (!sectionEl) continue;
      const rect = sectionEl.getBoundingClientRect();
      if (rect.top <= viewportFocusY && rect.bottom >= viewportFocusY) {
        applyPalette(entry.palette.top, entry.palette.bottom);
        break;
      }
    }

    return () => {
      cleanupNavTone();
      for (const st of reducedTriggers) {
        st.kill();
      }
      for (const el of assignedToneElements) {
        el.removeAttribute('data-tone');
      }
    };
  }

  const ctx = gsap.context(() => {
    const heroEl = document.getElementById('hero');
    const sceneEl = document.getElementById('scene');

    if (heroEl) {
      const heroTl = gsap.timeline({
        scrollTrigger: {
          trigger: heroEl,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      });

      heroTl
        .fromTo(
          pageBg,
          { '--bg-top': '#711127', '--bg-bottom': '#170308' },
          { '--bg-top': '#B0193C', '--bg-bottom': '#5A0C1E', duration: 0.42, ease: 'none' },
        )
        .to(pageBg, {
          '--bg-top': '#E47F97',
          '--bg-bottom': '#E47F97',
          duration: 0.58,
          ease: 'none',
        });
    }

    if (sceneEl) {
      gsap.fromTo(
        pageBg,
        { '--bg-top': '#E47F97', '--bg-bottom': '#E47F97' },
        {
          '--bg-top': '#FAFAF7',
          '--bg-bottom': '#FAFAF7',
          ease: 'none',
          immediateRender: false,
          scrollTrigger: {
            trigger: sceneEl,
            start: 'top top',
            end: 'top+=10% top',
            scrub: true,
          },
        },
      );
    }
  });

  return () => {
    cleanupNavTone();
    ctx.revert();
    for (const el of assignedToneElements) {
      el.removeAttribute('data-tone');
    }
  };
}
