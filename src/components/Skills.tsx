import { memo, useRef, type PointerEvent as ReactPointerEvent } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap, ScrollTrigger } from '@/utils/animMaster';
import { ArrowUpRight, Cpu, Network, ScanEye, ShieldCheck } from 'lucide-react';
import { type VmsViewMode, useVms } from '@/context/VmsContext';
import { skillCategories, skillTicker } from '@/data/skills';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { VelocityMarquee, useIsTouch } from '@/motion';
import { SectionHeading } from './SectionHeading';

const icons = [ScanEye, Network, Cpu, ShieldCheck] as const;
const CATEGORY_VMS_MODES: readonly VmsViewMode[] = ['live', 'playback', 'smart-map', 'alarms'];

export const Skills = memo(function Skills() {
  const { viewMode, setViewMode } = useVms();
  const sectionRef = useRef<HTMLElement>(null);
  const cardsRef = useRef<(HTMLElement | null)[]>([]);
  const isTouch = useIsTouch();
  const prefersReducedMotion = useReducedMotion();
  const interactive = !isTouch && !prefersReducedMotion;

  // ScrollTrigger Batch for Staggered Card Reveals
  useGSAP(
    () => {
      if (prefersReducedMotion) return;

      const validCards = cardsRef.current.filter(Boolean);
      if (validCards.length === 0) return;

      ScrollTrigger.batch(validCards, {
        start: 'top 85%',
        onEnter: (batch) => {
          gsap.fromTo(
            batch,
            { y: 80, opacity: 0, rotateX: -15, transformPerspective: 1000 },
            {
              y: 0,
              opacity: 1,
              rotateX: 0,
              stagger: 0.15,
              duration: 1.0,
              ease: 'power3.out',
              overwrite: 'auto',
            },
          );
        },
        once: true,
      });
    },
    { scope: sectionRef, dependencies: [prefersReducedMotion] },
  );

  const handleSpotlightMove = (event: ReactPointerEvent<HTMLElement>) => {
    if (!interactive || event.pointerType === 'touch') return;
    const rect = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty('--spotlight-x', `${event.clientX - rect.left}px`);
    event.currentTarget.style.setProperty('--spotlight-y', `${event.clientY - rect.top}px`);
  };

  return (
    <section aria-labelledby="skills-title" className="content-section skills-section" id="skills" ref={sectionRef}>
      <div className="section-inner">
        <SectionHeading
          description="A working toolkit across Milestone XProtect Smart Client consoles, connectivity, gate operations, and safety response."
          eyebrow="Capabilities / signal map"
          id="skills-title"
          number="02"
          title="Systems in sync."
          tone="violet"
        />
        <div className="skills-grid">
          {skillCategories.map((category, index) => {
            const Icon = icons[index] ?? ScanEye;
            const mappedMode = CATEGORY_VMS_MODES[index] ?? 'live';
            const isVmsSynced = viewMode === mappedMode;
            return (
              <article
                className={`skill-card skill-card--${category.accent} spotlight-card ${
                  isVmsSynced ? 'skill-card--vms-active' : ''
                }`}
                key={category.name}
                onPointerMove={handleSpotlightMove}
                ref={(el) => (cardsRef.current[index] = el)}
              >
                <div className="skill-card-header">
                  <span className="skill-icon">
                    <Icon aria-hidden="true" size={19} />
                  </span>
                  <span className="mono-label">SKILL GROUP / 0{index + 1}</span>
                  <button
                    aria-label={`Sync VMS workstation to ${category.name}`}
                    aria-pressed={isVmsSynced}
                    className="skill-card-trigger"
                    onClick={() => setViewMode(mappedMode, { scrollToSection: false })}
                    type="button"
                  >
                    <ArrowUpRight aria-hidden="true" className="skill-arrow" size={16} />
                  </button>
                </div>
                <h3>{category.name}</h3>
                <ul className="skill-list">
                  {category.skills.map((skill) => (
                    <li key={skill}>{skill}</li>
                  ))}
                </ul>
                <span aria-hidden="true" className="skill-card-accent-bar" />
              </article>
            );
          })}
        </div>
      </div>
      <div aria-hidden="true" className="skill-ticker-wrap">
        <VelocityMarquee items={skillTicker} />
      </div>
    </section>
  );
});
