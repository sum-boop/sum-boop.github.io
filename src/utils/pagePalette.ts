import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const DARK_SECTION_IDS = ['hero', 'hero-workstation', 'contact'] as const;
const LIGHT_SECTION_IDS = [
  'scene',
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
  { id: 'scene', palette: { top: '#FAFAF7', bottom: '#FAFAF7' } },
  { id: 'about', palette: { top: '#FAFAF7', bottom: '#FAFAF7' } },
  { id: 'hero-workstation', palette: { top: '#000000', bottom: '#000000' } },
  { id: 'skills', palette: { top: '#FAFAF7', bottom: '#FAFAF7' } },
  { id: 'footprint', palette: { top: '#FAFAF7', bottom: '#FAFAF7' } },
  { id: 'operations', palette: { top: '#FAFAF7', bottom: '#FAFAF7' } },
  { id: 'experience', palette: { top: '#FAFAF7', bottom: '#FAFAF7' } },
  { id: 'certifications', palette: { top: '#FAFAF7', bottom: '#FAFAF7' } },
  { id: 'contact', palette: { top: '#000000', bottom: '#000000' } },
];

function initNavbarTone(sections: readonly HTMLElement[]): () => void {
  const header = document.getElementById('site-navigation');
  if (!header) {
    return () => {};
  }

  header.setAttribute('data-nav-tone', 'dark');
  const triggers: ScrollTrigger[] = [];

  for (const section of sections) {
    const tone = section.getAttribute('data-tone') === 'light' ? 'light' : 'dark';
    const trigger = ScrollTrigger.create({
      trigger: section,
      start: 'top 40px',
      end: 'bottom 40px',
      onToggle: (self) => {
        if (self.isActive) {
          header.setAttribute('data-nav-tone', tone);
        }
      },
    });
    triggers.push(trigger);

    const rect = section.getBoundingClientRect();
    if (rect.top <= 40 && rect.bottom >= 40) {
      header.setAttribute('data-nav-tone', tone);
    }
  }

  return () => {
    for (const st of triggers) {
      st.kill();
    }
    header.removeAttribute('data-nav-tone');
  };
}

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

  const cleanupNavTone = initNavbarTone(assignedToneElements);

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
    const workstationEl = document.getElementById('hero-workstation');
    const skillsEl = document.getElementById('skills');
    const contactEl = document.getElementById('contact');

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
          { '--bg-top': '#B0193C', '--bg-bottom': '#5A0C1E', duration: 0.45, ease: 'none' },
        )
        .to(pageBg, {
          '--bg-top': '#E47F97',
          '--bg-bottom': '#E47F97',
          duration: 0.55,
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
            end: 'top+=25% top',
            scrub: true,
          },
        },
      );
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
    cleanupNavTone();
    ctx.revert();
    for (const el of assignedToneElements) {
      el.removeAttribute('data-tone');
    }
  };
}
