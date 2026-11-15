import { m } from 'framer-motion';
import { Award, GraduationCap } from 'lucide-react';
import { certifications, education } from '@/data/certifications';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { ChoreoReveal, motionSprings, useIsTouch } from '@/motion';
import { SectionHeading } from './SectionHeading';

export function Credentials() {
  const isTouch = useIsTouch();
  const prefersReducedMotion = useReducedMotion();
  const interactive = !isTouch && !prefersReducedMotion;

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
        <div className="credentials-layout">
          <ChoreoReveal direction="left" distance={28}>
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
          </ChoreoReveal>
          <div className="certification-grid">
            {certifications.map((certification, index) => (
              <ChoreoReveal
                delay={0.05 + index * 0.07}
                direction={index % 2 === 0 ? 'scale' : 'up'}
                key={certification.title}
              >
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
              </ChoreoReveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
