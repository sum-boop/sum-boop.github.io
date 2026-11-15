import { m } from 'framer-motion';
import { Award, GraduationCap } from 'lucide-react';
import { useRef } from 'react';
import { certifications, education } from '@/data/certifications';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { motionSprings, useIsTouch } from '@/motion';
import { useStaggeredCardGroup } from '@/utils/scrollStory';
import { SectionHeading } from './SectionHeading';

export function Credentials() {
  const isTouch = useIsTouch();
  const prefersReducedMotion = useReducedMotion();
  const interactive = !isTouch && !prefersReducedMotion;
  const layoutRef = useRef<HTMLDivElement>(null);

  useStaggeredCardGroup(layoutRef, '.credential-reveal-item');

  return (
    <section
      aria-labelledby="credentials-title"
      className="content-section credentials-section"
      id="certifications"
    >
      <div className="section-inner">
        <SectionHeading
          eyebrow="Certifications & training"
          id="credentials-title"
          number="06"
          title="Verified credentials."
          tone="amber"
        />
        <div className="credentials-layout" ref={layoutRef}>
          <div className="credential-reveal-item">
            <m.div
              className="education-card"
              transition={motionSprings.snappy}
              {...(interactive ? { whileHover: { y: -4 } } : {})}
            >
              <span className="credential-icon">
                <GraduationCap aria-hidden="true" size={21} />
              </span>
              <span className="mono-label">EDUCATION</span>
              <h3>{education}</h3>
              <span className="credential-note">Educational organization</span>
            </m.div>
          </div>
          <div className="certification-grid">
            {certifications.map((certification, index) => (
              <div className="credential-reveal-item" key={certification.title}>
                <m.article
                  className="certification-card"
                  transition={motionSprings.snappy}
                  {...(interactive ? { whileHover: { y: -4 } } : {})}
                >
                  <div className="certification-topline">
                    <Award aria-hidden="true" size={18} />
                    <span>0{index + 1} / CERTIFIED</span>
                  </div>
                  <h3>{certification.title}</h3>
                  <p>{certification.description}</p>
                </m.article>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
