import { useRef, useState } from 'react';
import { Activity, Fingerprint, MapPin, ShieldCheck } from 'lucide-react';
import { careerSites } from '@/data/experience';
import { profile } from '@/data/profile';
import { ChoreoReveal, Counter } from '@/motion';
import { assetPath } from '@/utils/assets';
import { useStaggeredCardGroup } from '@/utils/scrollStory';
import { SectionHeading } from './SectionHeading';

export function About() {
  const [imageFailed, setImageFailed] = useState(false);
  const employersRef = useRef<HTMLDivElement>(null);
  const metricsRef = useRef<HTMLDivElement>(null);

  useStaggeredCardGroup(employersRef, '.about-employer-item');
  useStaggeredCardGroup(metricsRef, '.about-metric');

  return (
    <section aria-labelledby="about-title" className="content-section about-section" id="about">
      <div aria-hidden="true" className="editorial-diagonal-line editorial-diagonal-line--top" />
      <div className="section-inner">
        <SectionHeading
          eyebrow="Security profile"
          highlightWord="Clear records."
          id="about-title"
          number="01"
          title="Calm eyes. Clear records."
          tone="cyan"
        />

        {/* 5Lab Signature Dual Overlapping Crimson & Indigo Circles Diagram */}
        <ChoreoReveal className="about-venn-diagram" direction="up">
          <div className="venn-label venn-label--left">
            <span className="venn-word venn-word--crimson">Operations</span>
            <small>24/7 Control Room</small>
          </div>
          <div aria-hidden="true" className="venn-circles">
            <span className="venn-circle venn-circle--crimson" />
            <span className="venn-circle venn-circle--core" />
            <span className="venn-circle venn-circle--indigo" />
          </div>
          <div className="venn-label venn-label--right">
            <span className="venn-word venn-word--indigo">Systems</span>
            <small>Milestone XProtect</small>
          </div>
        </ChoreoReveal>

        <div className="about-layout">
          <ChoreoReveal className="identity-panel" direction="up">
            {!imageFailed ? (
              <img
                alt="Illustrative reference image of a CCTV monitoring station; not a personal photograph"
                className="identity-image"
                decoding="async"
                height="900"
                loading="lazy"
                onError={() => setImageFailed(true)}
                referrerPolicy="no-referrer"
                src={assetPath('assets/sumit-monitoring-station.jpg')}
                width="700"
              />
            ) : null}
            <div className="identity-overlay" />
            <div className="identity-label">
              <Fingerprint aria-hidden="true" size={15} /> IDENTITY / OPERATOR
            </div>
            <div aria-hidden="true" className="identity-monogram">
              SA
            </div>
            <div className="identity-details">
              <span className="mono-label">{profile.role}</span>
              <strong>{profile.name}</strong>
              <span>
                <MapPin aria-hidden="true" size={13} /> {profile.location}
              </span>
            </div>
            <div className="identity-status">
              <span aria-hidden="true" className="status-pulse" /> PROFILE / SUMIT ANAND
            </div>
          </ChoreoReveal>

          <div className="about-copy">
            <ChoreoReveal direction="right" distance={28}>
              <p className="eyebrow-line">Operating profile</p>
              <h3>{profile.aboutHeading}</h3>
            </ChoreoReveal>
            {profile.aboutParagraphs.map((paragraph, index) => (
              <ChoreoReveal
                as="p"
                className="body-copy"
                delay={0.06 + index * 0.06}
                direction="right"
                distance={24}
                key={paragraph}
              >
                {paragraph}
              </ChoreoReveal>
            ))}
            <div aria-label="Career sites" className="about-employers" ref={employersRef}>
              {careerSites.map((site) => (
                <div className="about-employer-item" key={site.id}>
                  <a className="employer-chip" href="#experience">
                    <span
                      aria-hidden="true"
                      className={
                        site.status === 'active'
                          ? 'status-pulse'
                          : 'status-pulse status-pulse--muted'
                      }
                    />
                    <span>
                      <strong>{site.client}</strong>
                      <small>
                        {site.name} · {site.period}
                      </small>
                    </span>
                  </a>
                </div>
              ))}
            </div>
            <div className="about-metrics" ref={metricsRef}>
              {profile.careerMetrics.map((metric, index) => {
                const MetricIcon = index === 0 ? Activity : index === 1 ? ShieldCheck : Fingerprint;
                return (
                  <div className="about-metric" key={metric.label}>
                    <MetricIcon aria-hidden="true" size={16} />
                    <Counter className="about-metric-value" value={metric.value} />
                    <span className="about-metric-label">{metric.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      <div aria-hidden="true" className="editorial-diagonal-line editorial-diagonal-line--bottom" />
    </section>
  );
}
