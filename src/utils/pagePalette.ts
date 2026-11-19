import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const DARK_SECTION_IDS = ['hero', 'hero-workstation', 'contact'] as const;
const LIGHT_SECTION_IDS = [
  'about',
  'skills',
  'footprint',
  'operations',
  'experience',
  'certifications',
] as const;

interface PalettePair {
  top: string;
  bottom: string;
}

const SECTION_FINAL_PALETTES: readonly { id: string; palette: PalettePair }[] = [
  { id: 'hero', palette: { top: '#711127', bottom: '#170308' } },
  { id: 'about', palette: { top: '#FAFAF7', bottom: '#FAFAF7' } },
  { id: 'hero-workstation', palette: { top: '#000000', bottom: '#000000' } },
  { id: 'skills', palette: { top: '#FAFAF7', bottom: '#FAFAF7' } },
  { id: 'footprint', palette: { top: '#FAFAF7', bottom: '#FAFAF7' } },
  { id: 'operations', palette: { top: '#FAFAF7', bottom: '#FAFAF7' } },
  { id: 'experience', palette: { top: '#FAFAF7', bottom: '#FAFAF7' } },
  { id: 'certifications', palette: { top: '#FAFAF7', bottom: '#FAFAF7' } },
  { id: 'contact', palette: { top: '#000000', bottom: '#000000' } },
];

export function initPagePalette(): () => void {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return () => {};
  }

  const assignedToneElements: HTMLElement[] = [];
  for (const id of DARK_SECTION_IDS) {
    const el = document.getElementById(id);
    if (el) {
      el.setAttribute('data-tone', 'dark');
      assignedToneElements.push(el);
    }
  }
  for (const id of LIGHT_SECTION_IDS) {
    const el = document.getElementById(id);
    if (el) {
      el.setAttribute('data-tone', 'light');
      assignedToneElements.push(el);
    }
  }

  const pageBg = document.getElementById('page-bg');
  if (!pageBg) {
    return () => {
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
    const aboutEl = document.getElementById('about');
    const workstationEl = document.getElementById('hero-workstation');
    const skillsEl = document.getElementById('skills');
    const contactEl = document.getElementById('contact');

    if (heroEl && aboutEl) {
      const heroToAboutTl = gsap.timeline({
        scrollTrigger: {
          trigger: heroEl,
          start: 'top top',
          endTrigger: aboutEl,
          end: 'top 40%',
          scrub: true,
        },
      });

      heroToAboutTl
        .fromTo(
          pageBg,
          { '--bg-top': '#711127', '--bg-bottom': '#170308' },
          { '--bg-top': '#B0193C', '--bg-bottom': '#5A0C1E', duration: 0.28, ease: 'none' },
        )
        .to(pageBg, {
          '--bg-top': '#E47F97',
          '--bg-bottom': '#E47F97',
          duration: 0.3,
          ease: 'none',
        })
        .to(pageBg, {
          '--bg-top': '#FAFAF7',
          '--bg-bottom': '#FAFAF7',
          duration: 0.42,
          ease: 'none',
        });
    }

    if (workstationEl) {
      gsap.fromTo(
        pageBg,
        { '--bg-top': '#FAFAF7', '--bg-bottom': '#FAFAF7' },
        {
          '--bg-top': '#000000',
          '--bg-bottom': '#000000',
          ease: 'none',
          immediateRender: false,
          scrollTrigger: {
            trigger: workstationEl,
            start: 'top 82%',
            end: 'top 38%',
            scrub: true,
          },
        },
      );
    }

    if (skillsEl) {
      gsap.fromTo(
        pageBg,
        { '--bg-top': '#000000', '--bg-bottom': '#000000' },
        {
          '--bg-top': '#FAFAF7',
          '--bg-bottom': '#FAFAF7',
          ease: 'none',
          immediateRender: false,
          scrollTrigger: {
            trigger: skillsEl,
            start: 'top 82%',
            end: 'top 38%',
            scrub: true,
          },
        },
      );
    }

    if (contactEl) {
      gsap.fromTo(
        pageBg,
        { '--bg-top': '#FAFAF7', '--bg-bottom': '#FAFAF7' },
        {
          '--bg-top': '#000000',
          '--bg-bottom': '#000000',
          ease: 'none',
          immediateRender: false,
          scrollTrigger: {
            trigger: contactEl,
            start: 'top 95%',
            end: 'top 60%',
            scrub: true,
          },
        },
      );
    }
  });

  return () => {
    ctx.revert();
    for (const el of assignedToneElements) {
      el.removeAttribute('data-tone');
    }
  };
}
