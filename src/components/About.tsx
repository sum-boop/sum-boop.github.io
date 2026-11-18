import { useRef, useState } from 'react';
import {
  Activity,
  ArrowRight,
  Eye,
  Fingerprint,
  MapPin,
  MessageCircle,
  ShieldCheck,
} from 'lucide-react';
import { contact } from '@/data/contact';
import { careerSites } from '@/data/experience';
import { profile } from '@/data/profile';
import { ChoreoReveal, Counter, Magnetic } from '@/motion';
import { assetPath } from '@/utils/assets';
import { useStaggeredCardGroup } from '@/utils/scrollStory';
import { SocialLinks } from './SocialLinks';

export function About() {
  const [imageFailed, setImageFailed] = useState(false);
  const employersRef = useRef<HTMLDivElement>(null);
  const metricsRef = useRef<HTMLDivElement>(null);

  useStaggeredCardGroup(employersRef, '.about-employer-item');
  useStaggeredCardGroup(metricsRef, '.about-metric');

  return (
    <section aria-labelledby="about-title" className="content-section-5lab" id="about">
      <div className="section-inner">
        {/* Statement-style intro + tagline area matching 5lab.co */}
        <header className="about-statement-header" id="designer-header">
          <ChoreoReveal as="p" className="section-eyebrow" direction="left" distance={20}>
            <span>01</span> / About &amp; Security Profile
          </ChoreoReveal>
          <ChoreoReveal delay={0.05} direction="up" distance={24}>
            <h2 className="about-statement-text" id="about-title">
              <span>Calm eyes. </span>
              <em className="hero-italic-accent">Clear records. </em>
              <span className="about-dimmed-text">
                Precision monitoring, gate control, and loss prevention across India&apos;s largest logistics hubs.
              </span>
            </h2>
          </ChoreoReveal>
        </header>

        {/* Asymmetric Operator Dossier & Summary Split */}
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
              <Fingerprint aria-hidden="true" size={14} /> IDENTITY / OPERATOR
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
            <ChoreoReveal direction="right" distance={24}>
              <div className="about-role-status">
                <span aria-hidden="true" className="status-pulse" />
                <span>Available for logistics &amp; industrial security roles</span>
                <span aria-hidden="true">·</span>
                <span>{profile.location}</span>
              </div>
              <p className="eyebrow-line">Operating profile · {profile.role}</p>
              <h3>{profile.aboutHeading}</h3>
              <p className="body-copy body-copy--lead">{profile.heroSummary}</p>
            </ChoreoReveal>

            {profile.aboutParagraphs.map((paragraph, index) => (
              <ChoreoReveal
                as="p"
                className="body-copy"
                delay={0.06 + index * 0.06}
                direction="right"
                distance={20}
                key={paragraph}
              >
                {paragraph}
              </ChoreoReveal>
            ))}

            <div className="about-cta-strip">
              <Magnetic>
                <a className="button button--primary magnetic-button" href="#contact">
                  <ShieldCheck aria-hidden="true" size={16} />
                  Message Directly
                  <ArrowRight aria-hidden="true" className="button-arrow" size={15} />
                </a>
              </Magnetic>
              <a className="button button--quiet" href="#operations">
                <Eye aria-hidden="true" size={16} />
                View Deployments
              </a>
              <div aria-label="Social and messaging links" className="about-socials">
                <SocialLinks variant="hero" />
                <a
                  aria-label="Chat with Sumit Anand on WhatsApp (opens in new tab)"
                  className="icon-button"
                  href={contact.whatsappUrl}
                  rel="noopener noreferrer"
                  target="_blank"
                  title="Chat on WhatsApp"
                >
                  <MessageCircle aria-hidden="true" size={16} />
                </a>
              </div>
            </div>

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
                const MetricIcon =
                  index === 0 ? Activity : index === 1 ? ShieldCheck : Fingerprint;
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
    </section>
  );
}
