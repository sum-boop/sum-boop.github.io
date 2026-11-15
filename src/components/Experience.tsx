import { AnimatePresence, m, useScroll, useTransform } from 'framer-motion';
import { useRef, useState } from 'react';
import { ArrowUpRight, BriefcaseBusiness, ChevronDown, Shield } from 'lucide-react';
import { useVms } from '@/context/VmsContext';
import { experience } from '@/data/experience';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { ChoreoReveal, motionDurations, motionEasings, useIsTouch } from '@/motion';
import { SectionHeading } from './SectionHeading';

export function Experience() {
  const { activeSiteId, setActiveSiteId, viewMode } = useVms();
  const sectionRef = useRef<HTMLElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const isTouch = useIsTouch();
  const trackProgress = !prefersReducedMotion && !isTouch;

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start 0.75', 'end 0.55'],
  });
  const railScaleY = useTransform(scrollYProgress, [0, 1], [0.06, 1]);

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
      className="content-section experience-section"
      id="experience"
      ref={sectionRef}
    >
      <div className="section-inner">
        <SectionHeading
          eyebrow="Duty history"
          id="experience-title"
          number="05"
          title="Operational logbook."
          tone="violet"
        />
        <div className="experience-story-layout">
          <aside aria-label="Career progression index" className="experience-sticky-aside">
            <div className="experience-story-card">
              <div className="experience-story-head">
                <Shield aria-hidden="true" size={16} />
                <span className="mono-label">ACTIVE PROGRESSION</span>
              </div>
              <p className="experience-story-lead">
                2+ years of continuous CCTV control room and gate verification duties across major
                NCR logistics hubs.
              </p>
              <div className="experience-story-meter">
                <span aria-hidden="true" className="experience-story-rail">
                  <m.i
                    style={
                      trackProgress
                        ? { scaleY: railScaleY, transformOrigin: 'top center' }
                        : { scaleY: 1, transformOrigin: 'top center' }
                    }
                  />
                </span>
                <ol className="experience-story-steps">
                  {experience.map((entry, idx) => (
                    <li
                      className={`experience-story-step experience-story-step--${entry.status}`}
                      key={entry.id}
                    >
                      <span className="mono-label">
                        0{idx + 1} / {entry.startYear}–{entry.endYear}
                      </span>
                      <strong>{entry.site}</strong>
                      <small>{entry.company}</small>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </aside>

          <ol className="experience-timeline">
            {experience.map((entry, index) => {
              const entrySiteId = entry.site === 'Ekart Logistics' ? 'ekart' : 'flipkart';
              const isSiteHighlighted = viewMode === 'alarms' || activeSiteId === entrySiteId;
              const isExpanded = Boolean(expandedIds[entry.id]);
              const panelId = `experience-panel-${entry.id}`;
              return (
                <ChoreoReveal
                  as="li"
                  className={`experience-entry experience-entry--${entry.status} ${
                    isSiteHighlighted ? 'experience-entry--vms-focus' : ''
                  }`}
                  delay={index * 0.08}
                  direction={index % 2 === 0 ? 'right' : 'left'}
                  distance={28}
                  key={entry.id}
                >
                  <div aria-hidden="true" className="experience-rail">
                    <span />
                    <m.i
                      initial={{ scaleY: 0 }}
                      transition={{ duration: motionDurations.slow, ease: motionEasings.out }}
                      viewport={{ once: true, amount: 0.15 }}
                      whileInView={{ scaleY: 1 }}
                    />
                  </div>
                  <div className="experience-content">
                    <div className="experience-topline">
                      <span className="experience-date tabular-nums">
                        {entry.startYear} — {entry.endYear}
                      </span>
                      <span className={`experience-status experience-status--${entry.status}`}>
                        <i /> {entry.status === 'active' ? 'Active post' : 'Archived'}
                      </span>
                    </div>
                    <div className="experience-header-row">
                      <div>
                        <h3>{entry.role}</h3>
                        <div className="experience-meta-row">
                          <p className="experience-company">
                            <BriefcaseBusiness aria-hidden="true" size={15} /> {entry.company}
                          </p>
                          <a
                            className="experience-site"
                            href="#footprint"
                            onClick={() => setActiveSiteId(entrySiteId)}
                          >
                            {entry.site} <ArrowUpRight aria-hidden="true" size={13} />
                          </a>
                        </div>
                      </div>
                      <m.button
                        aria-controls={panelId}
                        aria-expanded={isExpanded}
                        className="experience-toggle"
                        onClick={() => toggleEntry(entry.id)}
                        type="button"
                        whileTap={{ scale: 0.97 }}
                      >
                        <span>{isExpanded ? 'Hide duties' : 'View duties'}</span>
                        <m.span
                          animate={{ rotate: isExpanded ? 180 : 0 }}
                          className="experience-chevron"
                          transition={{ duration: motionDurations.fast, ease: motionEasings.out }}
                        >
                          <ChevronDown aria-hidden="true" size={16} />
                        </m.span>
                      </m.button>
                    </div>

                    <AnimatePresence initial={false}>
                      {isExpanded ? (
                        <m.div
                          animate={{ opacity: 1, y: 0 }}
                          className="experience-accordion-body"
                          exit={{ opacity: 0, y: -6 }}
                          id={panelId}
                          initial={{ opacity: 0, y: -6 }}
                          transition={{ duration: motionDurations.fast, ease: motionEasings.out }}
                        >
                          <ul className="responsibility-list">
                            {entry.responsibilities.map((responsibility) => (
                              <li key={responsibility}>{responsibility}</li>
                            ))}
                          </ul>
                          <ul
                            aria-label={`Skills used at ${entry.company}`}
                            className="experience-tags"
                          >
                            {entry.skills.map((skill) => (
                              <li key={skill}>{skill}</li>
                            ))}
                          </ul>
                        </m.div>
                      ) : null}
                    </AnimatePresence>
                  </div>
                  <span aria-hidden="true" className="experience-index">
                    LOG / 0{index + 1}
                  </span>
                </ChoreoReveal>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
