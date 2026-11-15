import { LayoutGroup, m } from 'framer-motion';
import { useScrollSpy } from '@/hooks/useScrollSpy';
import { motionSprings } from './tokens';

const SECTIONS = [
  { id: 'hero', code: '00', label: 'Overview' },
  { id: 'about', code: '01', label: 'Profile' },
  { id: 'skills', code: '02', label: 'Systems' },
  { id: 'footprint', code: '03', label: 'Footprint' },
  { id: 'operations', code: '04', label: 'Deployments' },
  { id: 'experience', code: '05', label: 'Logbook' },
  { id: 'certifications', code: '06', label: 'Credentials' },
  { id: 'contact', code: '07', label: 'Contact' },
] as const;

const SECTION_IDS = SECTIONS.map((section) => section.id);

export function SideSectionRail() {
  const activeId = useScrollSpy(SECTION_IDS);

  return (
    <nav aria-label="Section quick navigation" className="side-section-rail">
      <LayoutGroup id="side-section-rail">
        <div className="side-rail-list">
          {SECTIONS.map((section) => {
            const active = activeId === section.id;
            return (
              <a
                aria-current={active ? 'location' : undefined}
                aria-label={`Jump to ${section.label}`}
                className={`side-rail-item ${active ? 'side-rail-item--active' : ''}`}
                href={`#${section.id}`}
                key={section.id}
                title={`${section.code} · ${section.label}`}
              >
                <span className="side-rail-track">
                  {active ? (
                    <m.span
                      className="side-rail-pill"
                      layoutId="side-rail-active-pill"
                      transition={motionSprings.snappy}
                    />
                  ) : null}
                </span>
                <span className="side-rail-code">{section.code}</span>
                <span className="side-rail-label">{section.label}</span>
              </a>
            );
          })}
        </div>
      </LayoutGroup>
    </nav>
  );
}
