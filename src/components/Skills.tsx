import { Suspense, lazy, memo, useRef } from 'react';
import { ArrowUpRight, Cpu, Network, ScanEye, ShieldCheck } from 'lucide-react';
import { type VmsViewMode, useVms } from '@/context/VmsContext';
import { skillCategories, skillTicker } from '@/data/skills';
import { VelocityMarquee } from '@/motion';
import '@/styles/skillsBand.css';
import { SectionHeading } from './SectionHeading';

const SilverSpheres = lazy(() => import('@/components/three/SilverSpheres'));

const icons = [ScanEye, Network, Cpu, ShieldCheck] as const;
const CATEGORY_VMS_MODES: readonly VmsViewMode[] = ['live', 'playback', 'smart-map', 'alarms'];

export const Skills = memo(function Skills() {
  const { viewMode, setViewMode } = useVms();
  const gridRef = useRef<HTMLDivElement>(null);

  return (
    <section aria-labelledby="skills-title" className="content-section-5lab skills-section-5lab" id="skills">
      <div className="section-inner">
        <Suspense fallback={<div aria-hidden="true" className="skills-spheres" />}>
          <SilverSpheres />
        </Suspense>
        <div className="skills-band-layout">
          <SectionHeading
            description="A working toolkit across Milestone XProtect Smart Client consoles, connectivity, gate operations, and safety response."
            eyebrow="Capabilities / Signal Map"
            highlightWord="in sync."
            id="skills-title"
            number="02"
            title="Systems in sync."
            tone="amber"
          />

          {/* 5Lab Notable Clients / Services style hairline grid */}
          <div className="skills-grid-5lab" ref={gridRef}>
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
                  <span className="skill-cell-mono">0{index + 1} / {category.name.toUpperCase()}</span>
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
      </div>

      {/* Marquee ticker as a thin minimalist monochrome strip */}
      <div aria-hidden="true" className="skill-ticker-wrap-5lab">
        <VelocityMarquee items={skillTicker} />
      </div>
    </section>
  );
});
