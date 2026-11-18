import { AnimatePresence, m } from 'framer-motion';
import { useState } from 'react';
import { ArrowUpRight, ChevronDown } from 'lucide-react';
import { useVms } from '@/context/VmsContext';
import { experience } from '@/data/experience';
import { motionDurations, motionEasings } from '@/motion';
import { SectionHeading } from './SectionHeading';

export function Experience() {
  const { activeSiteId, setActiveSiteId, viewMode } = useVms();

  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    experience.forEach((entry) => {
      initial[entry.id] = entry.status === 'active';
    });
    return initial;
  });

  const toggleEntry = (id: string) => {
    setExpandedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <section
      aria-labelledby="experience-title"
      className="content-section-5lab experience-section-5lab"
      id="experience"
    >
      <div className="section-inner">
        <SectionHeading
          eyebrow="Duty history"
          highlightWord="logbook."
          id="experience-title"
          number="05"
          title="Operational logbook."
          tone="amber"
        />

        {/* 5Lab Large Editorial Experience List */}
        <div className="experience-editorial-list-5lab">
          {experience.map((entry, index) => {
            const entrySiteId = entry.site === 'Ekart Logistics' ? 'ekart' : 'flipkart';
            const isSiteHighlighted = viewMode === 'alarms' || activeSiteId === entrySiteId;
            const isExpanded = Boolean(expandedIds[entry.id]);
            const panelId = `experience-panel-${entry.id}`;

            return (
              <article
                className={`experience-editorial-row-5lab ${
                  isSiteHighlighted ? 'experience-editorial-row--active' : ''
                }`}
                key={entry.id}
              >
                <div className="experience-row-main-5lab">
                  <div className="experience-row-left-5lab">
                    <span className="experience-row-index-5lab">0{index + 1}</span>
                    <div>
                      <h3 className="experience-row-role-5lab">{entry.role}</h3>
                      <div className="experience-row-company-wrap">
                        <span className="experience-row-company-5lab">{entry.company}</span>
                        <a
                          className="experience-row-site-link"
                          href="#footprint"
                          onClick={() => setActiveSiteId(entrySiteId)}
                        >
                          {entry.site} <ArrowUpRight aria-hidden="true" size={14} />
                        </a>
                      </div>
                    </div>
                  </div>

                  <div className="experience-row-right-5lab">
                    <span className="experience-row-dates-5lab">
                      {entry.startYear} — {entry.endYear}
                    </span>
                    <button
                      aria-controls={panelId}
                      aria-expanded={isExpanded}
                      className="experience-row-toggle-btn"
                      onClick={() => toggleEntry(entry.id)}
                      type="button"
                    >
                      <span>{isExpanded ? 'Hide duties' : 'View duties'}</span>
                      <ChevronDown
                        aria-hidden="true"
                        className={`experience-row-chevron ${isExpanded ? 'experience-row-chevron--open' : ''}`}
                        size={16}
                      />
                    </button>
                  </div>
                </div>

                <AnimatePresence initial={false}>
                  {isExpanded ? (
                    <m.div
                      animate={{ opacity: 1, height: 'auto' }}
                      className="experience-editorial-accordion-5lab"
                      exit={{ opacity: 0, height: 0 }}
                      id={panelId}
                      initial={{ opacity: 0, height: 0 }}
                      transition={{ duration: motionDurations.fast, ease: motionEasings.out }}
                    >
                      <ul className="responsibility-list-5lab">
                        {entry.responsibilities.map((responsibility) => (
                          <li key={responsibility}>{responsibility}</li>
                        ))}
                      </ul>
                      <ul
                        aria-label={`Skills used at ${entry.company}`}
                        className="experience-tags-5lab"
                      >
                        {entry.skills.map((skill) => (
                          <li key={skill}>{skill}</li>
                        ))}
                      </ul>
                    </m.div>
                  ) : null}
                </AnimatePresence>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
