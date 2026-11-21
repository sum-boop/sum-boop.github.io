import { memo, useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowUpRight, Cpu, Network, ScanEye, ShieldCheck } from 'lucide-react';
import { type VmsViewMode, useVms } from '@/context/VmsContext';
import { skillCategories, skillTicker } from '@/data/skills';
import { VelocityMarquee } from '@/motion';
import { SkillsSphereCanvas } from './three/SkillsSphereCanvas';
import '@/styles/skillsBand.css';
import { SectionHeading } from './SectionHeading';

gsap.registerPlugin(ScrollTrigger);

const icons = [ScanEye, Network, Cpu, ShieldCheck] as const;
const CATEGORY_VMS_MODES: readonly VmsViewMode[] = ['live', 'playback', 'smart-map', 'alarms'];

export const Skills = memo(function Skills() {
  const { viewMode, setViewMode } = useVms();
  const paraRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const el = paraRef.current;
    if (!el) return;
    const text = el.textContent || '';
    const words = text.split(/\s+/);
    el.innerHTML = words
      .map(
        (w) => `<span class="reveal-word" style="opacity:0.28;transition:opacity 0.2s">${w}</span>`,
      )
      .join(' ');
    const spans = el.querySelectorAll('.reveal-word');

    const st = gsap.to(spans, {
      opacity: 1,
      stagger: 0.05,
      scrollTrigger: {
        trigger: el,
        start: 'top 82%',
        end: 'bottom 50%',
        scrub: true,
      },
    });

    return () => {
      st.kill();
    };
  }, []);

  return (
    <section
      aria-labelledby="skills-title"
      className="content-section-5lab skills-section-5lab"
      id="skills"
    >
      <div className="section-inner">
        <div
          className="skills-hero-top"
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            gap: '2rem',
            marginBottom: '2.5rem',
          }}
        >
          <SectionHeading
            description=""
            eyebrow="Capabilities / Signal Map"
            italicAccent="sync."
            id="skills-title"
            number="02"
            title="Systems in sync."
            tone="amber"
          />
          <div className="skills-pill-btns" style={{ display: 'flex', gap: '1rem' }}>
            <a
              className="button button--primary"
              href="#operations"
              style={{
                borderRadius: '9999px',
                padding: '0.75rem 1.5rem',
                background: '#000',
                color: '#fff',
              }}
            >
              View deployments <ArrowUpRight aria-hidden="true" size={15} />
            </a>
            <a
              className="button button--quiet"
              href="#hero-workstation"
              style={{
                borderRadius: '9999px',
                padding: '0.75rem 1.5rem',
                border: '1px solid var(--line-strong)',
                background: 'transparent',
              }}
            >
              Open workstation <ArrowUpRight aria-hidden="true" size={15} />
            </a>
          </div>
        </div>

        <p
          className="skills-scrub-para"
          ref={paraRef}
          style={{
            fontSize: 'clamp(1.25rem, 2.2vw, 1.85rem)',
            lineHeight: '1.4',
            fontWeight: 500,
            maxWidth: '38ch',
            marginBottom: '3.5rem',
          }}
        >
          A working toolkit across Milestone XProtect Smart Client consoles, connectivity, gate
          operations, and safety response, engineered for 24/7 reliability in mega logistics hubs.
        </p>

        <SkillsSphereCanvas />

        <div className="skills-secondary-heading" style={{ margin: '4rem 0 2rem' }}>
          <p className="eyebrow-line">03 / CAPABILITIES GRID</p>
          <h3
            className="skills-secondary-title"
            style={{
              fontSize: 'clamp(2rem, 3.8vw, 3.5rem)',
              fontWeight: 500,
              letterSpacing: '-0.03em',
              margin: 0,
            }}
          >
            Built to be{' '}
            <em
              className="hero-title-accent"
              style={{ color: '#ff223a', fontStyle: 'italic', fontFamily: 'var(--font-serif)' }}
            >
              dependable
            </em>
            .
          </h3>
        </div>

        <div className="skills-band-layout">
          <div className="skills-grid-5lab">
            {skillCategories.map((category, index) => {
              const Icon = icons[index] ?? ScanEye;
              const mappedMode = CATEGORY_VMS_MODES[index] ?? 'live';
              const isVmsSynced = viewMode === mappedMode;
              return (
                <article
                  className={`skill-cell-5lab ${isVmsSynced ? 'skill-cell-5lab--active' : ''}`}
                  key={category.name}
                >
                  <div className="skill-cell-header-5lab">
                    <span className="skill-cell-mono">
                      0{index + 1} / {category.name.toUpperCase()}
                    </span>
                    <button
                      aria-label={`Sync VMS workstation to ${category.name}`}
                      aria-pressed={isVmsSynced}
                      className="skill-cell-action-btn"
                      onClick={() => setViewMode(mappedMode, { scrollToSection: false })}
                      type="button"
                    >
                      <ArrowUpRight aria-hidden="true" size={16} />
                    </button>
                  </div>

                  <div className="skill-cell-body-5lab">
                    <div className="skill-cell-title-row">
                      <span className="skill-cell-icon-wrap">
                        <Icon aria-hidden="true" size={20} />
                      </span>
                      <h3>{category.name}</h3>
                    </div>

                    <ul className="skill-cell-list-5lab">
                      {category.skills.map((skill) => (
                        <li key={skill}>{skill}</li>
                      ))}
                    </ul>
                  </div>
                </article>
              );
            })}
          </div>
        </div>

        <div
          className="skills-footer-line"
          style={{
            marginTop: '5rem',
            paddingTop: '2rem',
            borderTop: '1px dotted var(--hairline)',
            textAlign: 'center',
          }}
        >
          <p
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(1.35rem, 2vw, 1.8rem)',
              fontWeight: 500,
              margin: 0,
            }}
          >
            Talk to Sumit first,{' '}
            <em style={{ fontStyle: 'italic', fontFamily: 'var(--font-serif)', color: '#ff223a' }}>
              no big setup needed
            </em>
            .
          </p>
        </div>
      </div>

      <div aria-hidden="true" className="skill-ticker-wrap-5lab" style={{ marginTop: '4rem' }}>
        <VelocityMarquee items={skillTicker} />
      </div>
    </section>
  );
});
