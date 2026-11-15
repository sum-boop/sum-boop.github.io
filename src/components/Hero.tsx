import { Suspense, lazy, memo, useRef } from 'react';
import { m, useScroll, useTransform } from 'framer-motion';
import {
  Activity,
  ArrowDownRight,
  ArrowRight,
  BellRing,
  Eye,
  Film,
  Map as MapIcon,
  MessageCircle,
  Monitor,
  ShieldCheck,
} from 'lucide-react';
import { VMS_WORKSPACE_PRESETS, type VmsViewMode, useVms } from '@/context/VmsContext';
import { contact } from '@/data/contact';
import { profile } from '@/data/profile';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import type { ThemeMode } from '@/hooks/useTheme';
import {
  Counter,
  Magnetic,
  SplitText,
  StaggerGroup,
  heroItemVariants,
  motionDurations,
  motionEasings,
  motionSprings,
  useIsTouch,
} from '@/motion';
import { Clock } from './Clock';
import { SocialLinks } from './SocialLinks';
import { StageSkeleton } from './StageSkeleton';

const SurveillanceStage3D = lazy(() =>
  import('./three/SurveillanceStage3D').then((module) => ({
    default: module.SurveillanceStage3D,
  })),
);

interface HeroProps {
  theme: ThemeMode;
}

const VMS_MODE_ICONS: Record<VmsViewMode, typeof Monitor> = {
  live: Monitor,
  playback: Film,
  'smart-map': MapIcon,
  alarms: BellRing,
};

export const Hero = memo(function Hero({ theme }: HeroProps) {
  const { viewMode, statusNote, setViewMode } = useVms();
  const heroRef = useRef<HTMLElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const isTouch = useIsTouch();
  const enableDepth = !prefersReducedMotion && !isTouch;

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });
  const copyY = useTransform(scrollYProgress, [0, 1], [0, -28]);
  const copyOpacity = useTransform(scrollYProgress, [0, 0.85, 1], [1, 0.94, 0.72]);
  const stageY = useTransform(scrollYProgress, [0, 1], [0, -18]);
  const stageScale = useTransform(scrollYProgress, [0, 1], [1, 0.95]);

  const heroHeadline = `${profile.name} — eyes on every hub.`;
  const activePreset = VMS_WORKSPACE_PRESETS.find((preset) => preset.id === viewMode);

  return (
    <section aria-labelledby="hero-title" className="hero-section" id="hero" ref={heroRef}>
      <div aria-hidden="true" className="hero-atmosphere">
        <span className="hero-orb hero-orb--cyan" />
        <span className="hero-orb hero-orb--violet" />
        <span className="hero-grid" />
      </div>
      <div className="hero-layout">
        <m.div {...(enableDepth ? { style: { y: copyY, opacity: copyOpacity } } : {})}>
          <StaggerGroup className="hero-copy" immediate>
            <m.p className="hero-kicker" variants={heroItemVariants}>
              <span className="kicker-mark">SA /</span> MILESTONE XPROTECT VMS · CCTV OPERATIONS
            </m.p>
            <m.div className="hero-status-line" variants={heroItemVariants}>
              <span aria-hidden="true" className="status-pulse" />
              <span>Available for logistics &amp; industrial security roles</span>
              <span className="status-divider">/</span>
              <span>{profile.location}</span>
            </m.div>
            <h1 aria-label={heroHeadline} className="hero-title" id="hero-title">
              <SplitText text={profile.name} />
              <span className="hero-title-accent">
                <SplitText delay={0.14} text="— eyes on every hub." />
              </span>
            </h1>
            <m.p className="hero-role" variants={heroItemVariants}>
              {profile.role}
            </m.p>
            <m.p className="hero-summary" variants={heroItemVariants}>
              {profile.heroSummary}
            </m.p>

            <m.div
              aria-label="Milestone XProtect VMS Smart Client modes"
              className="vms-workspace-bar"
              role="group"
              variants={heroItemVariants}
            >
              <div className="vms-workspace-head">
                <span className="vms-workspace-title">
                  <Activity aria-hidden="true" size={13} /> XPROTECT SMART CLIENT CONSOLE
                </span>
                <span className="vms-workspace-status">{statusNote}</span>
              </div>
              <div className="vms-workspace-tabs">
                {VMS_WORKSPACE_PRESETS.map((preset) => {
                  const Icon = VMS_MODE_ICONS[preset.id];
                  const active = viewMode === preset.id;
                  return (
                    <button
                      aria-pressed={active}
                      className={`vms-tab ${active ? 'vms-tab--active' : ''}`}
                      key={preset.id}
                      onClick={() => setViewMode(preset.id, { scrollToSection: false })}
                      type="button"
                    >
                      <Icon aria-hidden="true" size={14} />
                      <span>{preset.label}</span>
                    </button>
                  );
                })}
                {activePreset ? (
                  <button
                    className="vms-jump-btn"
                    onClick={() => setViewMode(activePreset.id, { scrollToSection: true })}
                    type="button"
                  >
                    Jump to view <ArrowDownRight aria-hidden="true" size={13} />
                  </button>
                ) : null}
              </div>
            </m.div>

            <m.div className="hero-actions" variants={heroItemVariants}>
              <Magnetic>
                <m.a
                  className="button button--primary magnetic-button"
                  href="#contact"
                  transition={motionSprings.snappy}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <ShieldCheck aria-hidden="true" size={17} />
                  Message Directly
                  <ArrowRight aria-hidden="true" className="button-arrow" size={16} />
                </m.a>
              </Magnetic>
              <m.a
                className="button button--quiet"
                href="#operations"
                transition={{ duration: motionDurations.micro, ease: motionEasings.out }}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.97 }}
              >
                <Eye aria-hidden="true" size={17} />
                View Deployments
              </m.a>
              <div aria-label="Social and messaging links" className="hero-socials">
                <SocialLinks variant="hero" />
                <a
                  aria-label="Chat with Sumit Anand on WhatsApp"
                  className="icon-button"
                  href={contact.whatsappUrl}
                  rel="noopener noreferrer"
                  target="_blank"
                  title="Chat on WhatsApp"
                >
                  <MessageCircle aria-hidden="true" size={16} />
                </a>
              </div>
            </m.div>
            <m.div
              aria-label="Professional profile readout"
              className="hero-readout"
              role="group"
              variants={heroItemVariants}
            >
              <div className="hero-readout-head">
                <span className="hero-readout-signal">
                  <span aria-hidden="true" className="hero-readout-led" />
                  OPERATOR PROFILE
                </span>
                <Clock className="hero-readout-index" />
              </div>
              <div aria-label="Career highlights" className="hero-metrics">
                {profile.heroMetrics.map((metric) => (
                  <div className="hero-metric" key={metric.label}>
                    <Counter className="hero-metric-value" value={metric.value} />
                    <span className="hero-metric-label">{metric.label}</span>
                  </div>
                ))}
              </div>
              <div aria-label="Professional focus" className="hero-meta">
                {profile.metadata.map((item, idx) => (
                  <span key={item}>
                    {idx > 0 ? (
                      <span aria-hidden="true" className="meta-sep">
                        {' '}
                        ·{' '}
                      </span>
                    ) : null}
                    {item}
                  </span>
                ))}
              </div>
            </m.div>
          </StaggerGroup>
        </m.div>

        <m.div
          animate={{ opacity: 1, scale: 1 }}
          className="hero-earth-column"
          initial={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: motionDurations.slow, delay: 0.16, ease: motionEasings.out }}
          {...(enableDepth ? { style: { y: stageY, scale: stageScale } } : {})}
        >
          <div className="hero-stage-stack">
            <Suspense
              fallback={<StageSkeleton label="Loading 3D VMS workstation…" variant="vms" />}
            >
              <SurveillanceStage3D theme={theme} />
            </Suspense>
          </div>
        </m.div>
      </div>
      <a aria-label="Scroll to expertise" className="hero-scroll" href="#about">
        <span>Scroll to explore</span>
        <ArrowDownRight aria-hidden="true" size={15} />
      </a>
    </section>
  );
});
