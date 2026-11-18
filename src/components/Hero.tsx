import { Suspense, lazy, memo, useEffect, useRef } from 'react';
import { m, useScroll, useTransform } from 'framer-motion';
import {
  Activity,
  ArrowDownRight,
  ArrowRight,
  BellRing,
  ChevronDown,
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
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import type { ThemeMode } from '@/hooks/useTheme';
import { Counter, Magnetic, useIsTouch } from '@/motion';
import workstationHeroImg from '@/assets/images/workstation_command_hero_1794781430131.jpg';
import { splitText } from '@/utils/heroSplitText';
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
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const revealedDispatchedRef = useRef(false);

  const prefersReducedMotion = useReducedMotion();
  const isTouch = useIsTouch();
  const isMobile = useMediaQuery('(max-width: 767px)');
  const enableDepth = !prefersReducedMotion && !isTouch;

  useEffect(() => {
    const heroEl = heroRef.current;
    const headlineEl = headlineRef.current;
    if (!heroEl || !headlineEl) return;

    const dispatchRevealed = () => {
      if (revealedDispatchedRef.current) return;
      revealedDispatchedRef.current = true;
      document.dispatchEvent(new CustomEvent('hero:revealed'));
    };

    if (prefersReducedMotion || typeof headlineEl.animate !== 'function') {
      dispatchRevealed();
      return;
    }

    let cancelled = false;
    let fallbackTimer: number | null = null;
    const activeAnimations: Animation[] = [];

    const cancelAllAnimations = () => {
      for (const anim of activeAnimations) {
        anim.cancel();
      }
      activeAnimations.length = 0;
    };

    const runReveal = () => {
      if (cancelled) return;

      const isMobileOrCoarse =
        window.matchMedia('(pointer: coarse)').matches ||
        window.matchMedia('(max-width: 767px)').matches;
      const unitMode = isMobileOrCoarse ? 'words' : 'letters';
      const duration = isMobileOrCoarse ? 520 : 840;
      const easing = 'cubic-bezier(0.16, 1, 0.3, 1)';
      const maxDelayBudget = Math.max(0, 1450 - duration);

      const kickerEl = heroEl.querySelector<HTMLElement>('.hero-kicker');
      const roleEl = heroEl.querySelector<HTMLElement>('.hero-role');
      const kickerUnits = splitText(kickerEl, { mode: 'words', depth3D: true });
      const headlineUnits = splitText(headlineEl, { mode: unitMode, depth3D: true });
      const roleUnits = splitText(roleEl, { mode: 'words', depth3D: true });

      const kickerStep =
        kickerUnits.length > 1
          ? Math.min(isMobileOrCoarse ? 34 : 24, (maxDelayBudget * 0.35) / (kickerUnits.length - 1))
          : 0;

      for (let i = 0; i < kickerUnits.length; i += 1) {
        const unit = kickerUnits[i];
        if (!unit) continue;
        const anim = unit.animate(
          [
            {
              transform: 'perspective(1100px) translate3d(0, 22px, -48px) rotateX(-64deg)',
              opacity: 0,
              filter: 'blur(3px)',
            },
            {
              transform: 'perspective(1100px) translate3d(0, 0, 0) rotateX(0deg)',
              opacity: 1,
              filter: 'blur(0px)',
            },
          ],
          {
            duration: Math.round(duration * 0.78),
            delay: i * kickerStep,
            easing,
            fill: 'both',
          },
        );
        activeAnimations.push(anim);
      }

      const headlineBaseDelay = kickerUnits.length > 0 ? (isMobileOrCoarse ? 45 : 80) : 0;
      const headlineBudget = Math.max(0, maxDelayBudget - headlineBaseDelay);
      const headlineStep =
        headlineUnits.length > 1
          ? Math.min(isMobileOrCoarse ? 52 : 22, headlineBudget / (headlineUnits.length - 1))
          : 0;

      const headlineAnimations: Animation[] = [];
      for (let i = 0; i < headlineUnits.length; i += 1) {
        const unit = headlineUnits[i];
        if (!unit) continue;
        const anim = unit.animate(
          [
            {
              transform:
                'perspective(1100px) translate3d(0, 38px, -85px) rotateX(-72deg) scale(0.9)',
              opacity: 0,
              filter: 'blur(5px)',
            },
            {
              transform: 'perspective(1100px) translate3d(0, 0, 0) rotateX(0deg) scale(1)',
              opacity: 1,
              filter: 'blur(0px)',
            },
          ],
          {
            duration,
            delay: headlineBaseDelay + i * headlineStep,
            easing,
            fill: 'both',
          },
        );
        activeAnimations.push(anim);
        headlineAnimations.push(anim);
      }

      const roleBaseDelay = headlineBaseDelay + (isMobileOrCoarse ? 130 : 210);
      const roleStep = roleUnits.length > 1 ? Math.min(34, 180 / (roleUnits.length - 1)) : 0;
      for (let i = 0; i < roleUnits.length; i += 1) {
        const unit = roleUnits[i];
        if (!unit) continue;
        const anim = unit.animate(
          [
            {
              transform: 'perspective(1100px) translate3d(0, 24px, -50px) rotateX(-60deg)',
              opacity: 0,
            },
            {
              transform: 'perspective(1100px) translate3d(0, 0, 0) rotateX(0deg)',
              opacity: 1,
            },
          ],
          {
            duration: isMobileOrCoarse ? 400 : 640,
            delay: roleBaseDelay + i * roleStep,
            easing,
            fill: 'both',
          },
        );
        activeAnimations.push(anim);
      }

      if (headlineAnimations.length > 0) {
        void Promise.all(headlineAnimations.map((a) => a.finished.catch(() => undefined))).then(
          () => {
            if (!cancelled) dispatchRevealed();
          },
        );
      } else {
        dispatchRevealed();
      }

      const detailBlocks = heroEl.querySelectorAll<HTMLElement>(
        '.hero-status-line, .hero-summary, .hero-actions',
      );
      const detailDuration = isMobileOrCoarse ? 400 : 640;
      const detailBaseDelay = isMobileOrCoarse ? 160 : 240;

      detailBlocks.forEach((el, index) => {
        const anim = el.animate(
          [
            { transform: 'translate3d(0, 24px, 0)', opacity: 0 },
            { transform: 'translate3d(0, 0, 0)', opacity: 1 },
          ],
          {
            duration: detailDuration,
            delay: detailBaseDelay + index * 85,
            easing,
            fill: 'both',
          },
        );
        activeAnimations.push(anim);
      });
    };

    const bootOverlayPresent = Boolean(document.querySelector('.boot-screen'));
    const onBootComplete = () => {
      if (fallbackTimer !== null) {
        window.clearTimeout(fallbackTimer);
        fallbackTimer = null;
      }
      runReveal();
    };

    if (bootOverlayPresent) {
      document.addEventListener('boot:complete', onBootComplete, { once: true });
      fallbackTimer = window.setTimeout(onBootComplete, 1100);
    } else {
      runReveal();
    }

    return () => {
      cancelled = true;
      document.removeEventListener('boot:complete', onBootComplete);
      if (fallbackTimer !== null) window.clearTimeout(fallbackTimer);
      cancelAllAnimations();
    };
  }, [prefersReducedMotion]);

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });
  const orbScale = useTransform(scrollYProgress, [0, 0.5], [1, 1.12]);
  const copyY = useTransform(scrollYProgress, [0, 0.45], [0, -26]);

  const activePreset = VMS_WORKSPACE_PRESETS.find((preset) => preset.id === viewMode);

  return (
    <section
      aria-labelledby="hero-title"
      className="hero-section hero-section--editorial"
      id="hero"
      ref={heroRef}
    >
      {/* ACT 1: 5Lab Crimson Radial Hero + Illuminated Cobalt-Violet-Crimson Sphere Orb */}
      <div className="hero-curtain">
        <div aria-hidden="true" className="hero-curtain-grain" />
        <div aria-hidden="true" className="hero-orb-stage">
          <m.span
            className="hero-sphere-orb"
            {...(enableDepth ? { style: { scale: orbScale } } : {})}
          />
        </div>

        <div className="hero-layout hero-layout--editorial">
          <m.div
            className="hero-copy-frame"
            {...(enableDepth ? { style: { y: copyY } } : {})}
          >
            <div className="hero-copy">
              <p className="hero-kicker">
                <span className="kicker-mark">SA /</span> MILESTONE XPROTECT VMS · CCTV OPERATIONS
              </p>
              <div className="hero-status-line">
                <span aria-hidden="true" className="status-pulse" />
                <span>Available for logistics &amp; industrial security roles</span>
                <span className="status-divider">·</span>
                <span>{profile.location}</span>
              </div>

              <h1
                aria-label={`${profile.name} — Eyes on every hub.`}
                className="hero-title"
                id="hero-title"
                ref={headlineRef}
              >
                <span className="hero-title-name">{profile.name}</span>{' '}
                <em className="hero-title-accent">Eyes on every hub.</em>
              </h1>

              <p className="hero-role">{profile.role}</p>
              <p className="hero-summary">{profile.heroSummary}</p>

              <div className="hero-actions">
                <Magnetic>
                  <a className="button button--primary magnetic-button" href="#contact">
                    <ShieldCheck aria-hidden="true" size={17} />
                    Message Directly
                    <ArrowRight aria-hidden="true" className="button-arrow" size={16} />
                  </a>
                </Magnetic>
                <a className="button button--quiet" href="#operations">
                  <Eye aria-hidden="true" size={17} />
                  View Deployments
                </a>
                <div aria-label="Social and messaging links" className="hero-socials">
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
            </div>
          </m.div>
        </div>

        <a aria-label="Scroll to interactive 3D command workstation" className="hero-scroll" href="#hero-workstation">
          <span>Scroll to explore</span>
          <ChevronDown aria-hidden="true" size={20} />
        </a>

        {/* Signature 5Lab Rotating Circular Stamp Badge anchored bottom-right */}
        <a aria-label="Jump to contact section" className="hero-stamp-badge" href="#contact">
          <svg aria-hidden="true" className="hero-stamp-svg" viewBox="0 0 120 120">
            <defs>
              <path
                d="M 60, 60 m -42, 0 a 42,42 0 1,1 84,0 a 42,42 0 1,1 -84,0"
                id="hero-stamp-circle"
              />
            </defs>
            <text className="hero-stamp-ring-text">
              <textPath href="#hero-stamp-circle" startOffset="0%">
                SUMIT ANAND • PATLI HARYANA • CCTV &amp; VMS •
              </textPath>
            </text>
          </svg>
          <span className="hero-stamp-center">Contact</span>
        </a>
      </div>

      {/* ACT 2 TOP BAND: Framed Interactive 3D XProtect Workstation + Dossier + Smart Client Console */}
      <div className="hero-workstation-band" id="hero-workstation">
        <div className="section-inner workstation-band-inner">
          <div className="workstation-band-header">
            <div>
              <p className="workstation-eyebrow">
                <span>00</span> / LIVE COMMAND WORKSTATION
              </p>
              <h2 className="workstation-title">3D XProtect Smart Client Workstation</h2>
            </div>
            <p className="workstation-note">
              Drag anywhere to orbit 360° · Scroll to pan · Click any monitor or deck to zoom in
            </p>
          </div>

          <div className="workstation-frame">
            {isMobile ? (
              <div
                aria-label="Milestone XProtect Smart Client workstation preview"
                className="stage3d-shell stage3d-shell--framed stage3d-mobile-fallback"
                data-testid="vms-stage-mobile-fallback"
              >
                <img
                  alt="Milestone XProtect VMS multi-monitor operator command workstation"
                  className="stage3d-fallback-img"
                  decoding="async"
                  loading="eager"
                  referrerPolicy="no-referrer"
                  src={workstationHeroImg}
                />
                <div aria-hidden="true" className="stage3d-fallback-scrim" />
                <div className="stage3d-spec-badge">
                  <div className="stage3d-spec-row">
                    <span className="stage3d-spec-title">
                      Milestone XProtect VMS + BriefCam L4
                    </span>
                  </div>
                  <span className="stage3d-spec-sub">
                    {activePreset ? `${activePreset.label} · ${statusNote}` : statusNote}
                  </span>
                </div>
                <span className="stage3d-caption-static">
                  Live 45+ Camera Command Desk · Desktop 3D Inspection
                </span>
              </div>
            ) : (
              <Suspense
                fallback={<StageSkeleton label="Initializing 3D Command Room…" variant="vms" />}
              >
                <SurveillanceStage3D theme={theme} />
              </Suspense>
            )}
          </div>

          <div className="hero-bottom-hud">
            <div
              aria-label="Professional profile readout"
              className="hero-readout hero-readout--compact"
              role="group"
            >
              <div className="hero-readout-head">
                <span className="hero-readout-signal">
                  <span aria-hidden="true" className="hero-readout-led" />
                  OPERATOR DOSSIER · {profile.name.toUpperCase()}
                </span>
                <Clock className="hero-readout-index" />
              </div>
              <div className="hero-readout-body">
                <div aria-label="Career highlights" className="hero-metrics">
                  {profile.heroMetrics.map((metric) => (
                    <div className="hero-metric" key={metric.label}>
                      <Counter className="hero-metric-value" value={metric.value} />
                      <span className="hero-metric-label">{metric.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div
              aria-label="Milestone XProtect VMS Smart Client modes"
              className="vms-workspace-bar vms-workspace-bar--edge"
              role="group"
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
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});
