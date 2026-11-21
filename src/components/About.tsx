import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
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
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { ChoreoReveal, Counter, Magnetic } from '@/motion';
import { assetPath } from '@/utils/assets';
import { useStaggeredCardGroup } from '@/utils/scrollStory';
import { SocialLinks } from './SocialLinks';
import '@/styles/aboutBand.css';

gsap.registerPlugin(ScrollTrigger);

export function About() {
  const [imageFailed, setImageFailed] = useState(false);
  const bandRef = useRef<HTMLElement>(null);
  const employersRef = useRef<HTMLDivElement>(null);
  const metricsRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  useStaggeredCardGroup(employersRef, '.about-employer-item');
  useStaggeredCardGroup(metricsRef, '.about-metric');

  useEffect(() => {
    if (prefersReducedMotion || !bandRef.current) return;

    const ctx = gsap.context(() => {
      gsap.set('.about-band-line-inner', { yPercent: 110 });
      gsap.to('.about-band-line-inner', {
        yPercent: 0,
        duration: 0.9,
        ease: 'power3.out',
        stagger: 0.12,
        scrollTrigger: {
          trigger: '.about-band-lines',
          start: 'top 85%',
          once: true,
        },
      });

      gsap.set('.about-band-line', { '--line': 0 });
      gsap.to('.about-band-line', {
        '--line': 1,
        duration: 0.8,
        ease: 'power3.out',
        stagger: 0.12,
        scrollTrigger: {
          trigger: '.about-band-lines',
          start: 'top 85%',
          once: true,
        },
      });

      gsap.set('.about-hl', { '--hl': 0 });
      gsap.to('.about-hl', {
        '--hl': 1,
        duration: 0.7,
        ease: 'power3.out',
        stagger: 0.2,
        scrollTrigger: {
          trigger: '.about-statement-5lab',
          start: 'top 80%',
          once: true,
        },
      });
    }, bandRef);

    return () => {
      ctx.revert();
    };
  }, [prefersReducedMotion]);

  return (
    <section aria-labelledby="about-title" className="content-section-5lab" id="about">
      <div className="section-inner">
        {/* Statement-style intro + tagline area matching 5lab.co */}
        <header className="about-band-5lab" id="designer-header" ref={bandRef}>
          <ChoreoReveal as="p" className="section-eyebrow" direction="left" distance={20}>
            <span>01</span> / About &amp; Security Profile
          </ChoreoReveal>
          <p className="about-band-lines">
            <span className="about-band-line" style={{ transform: 'translateX(-2.5vw)' }}>
              <span className="about-band-line-inner">Precision monitoring,</span>
            </span>
            <span className="about-band-line" style={{ transform: 'translateX(3.5vw)' }}>
              <span className="about-band-line-inner">
                <em className="hero-italic-accent">gate control,</em> and
              </span>
            </span>
            <span className="about-band-line" style={{ transform: 'translateX(-1.5vw)' }}>
              <span className="about-band-line-inner">loss prevention across</span>
            </span>
            <span className="about-band-line" style={{ transform: 'translateX(3vw)' }}>
              <span className="about-band-line-inner">India&apos;s largest logistics hubs.</span>
            </span>
          </p>
          <h2 className="about-statement-5lab" id="about-title">
            <span className="about-hl">
              <span className="about-hl-text">Calm eyes</span>
            </span>
            <span aria-hidden="true" className="about-plus">
              {' '}
              +{' '}
            </span>
            <span className="about-hl">
              <span className="about-hl-text">Clear records</span>
            </span>
            <span>.</span>
          </h2>
        </header>
        <p className="about-dossier-eyebrow">Operator dossier</p>

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
    </section>
  );
}
