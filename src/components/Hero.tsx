import { Suspense, lazy, memo, useEffect, useRef } from 'react';
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
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import type { ThemeMode } from '@/hooks/useTheme';
import {
  Counter,
  Magnetic,
  motionDurations,
  motionEasings,
  useIsTouch,
} from '@/motion';
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

  // Task A2: Vanilla Split-Text WAAPI Cinematic Reveal + Supporting Element Stagger
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
      const duration = isMobileOrCoarse ? 520 : 860;
      const easing = 'cubic-bezier(0.16, 1, 0.3, 1)';
      const maxDelayBudget = Math.max(0, 1520 - duration);

      // 1. 3D Cinematic Text Reveal for Kicker, Name + Headline, and Role
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
              transform: 'perspective(1100px) translate3d(0, 26px, -60px) rotateX(-70deg)',
              opacity: 0,
              filter: 'blur(4px)',
            },
            {
              transform: 'perspective(1100px) translate3d(0, 0, 0) rotateX(0deg)',
              opacity: 1,
              filter: 'blur(0px)',
              offset: 0.72,
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

      const headlineBaseDelay = kickerUnits.length > 0 ? (isMobileOrCoarse ? 50 : 90) : 0;
      const headlineBudget = Math.max(0, maxDelayBudget - headlineBaseDelay);
      const headlineStep =
        headlineUnits.length > 1
          ? Math.min(isMobileOrCoarse ? 52 : 24, headlineBudget / (headlineUnits.length - 1))
          : 0;

      const headlineAnimations: Animation[] = [];
      for (let i = 0; i < headlineUnits.length; i += 1) {
        const unit = headlineUnits[i];
        if (!unit) continue;
        const anim = unit.animate(
          [
            {
              transform:
                'perspective(1100px) translate3d(0, 44px, -95px) rotateX(-78deg) rotateY(10deg) scale(0.88)',
              opacity: 0,
              filter: 'blur(6px)',
            },
            {
              opacity: 1,
              filter: 'blur(0px)',
              offset: 0.58,
            },
            {
              transform:
                'perspective(1100px) translate3d(0, 0, 0) rotateX(0deg) rotateY(0deg) scale(1)',
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

      const roleBaseDelay = headlineBaseDelay + (isMobileOrCoarse ? 140 : 240);
      const roleStep =
        roleUnits.length > 1 ? Math.min(36, 200 / (roleUnits.length - 1)) : 0;
      for (let i = 0; i < roleUnits.length; i += 1) {
        const unit = roleUnits[i];
        if (!unit) continue;
        const anim = unit.animate(
          [
            {
              transform: 'perspective(1100px) translate3d(0, 28px, -60px) rotateX(-64deg)',
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
            duration: isMobileOrCoarse ? 420 : 680,
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
            if (!cancelled) {
              dispatchRevealed();
            }
          },
        );
      } else {
        dispatchRevealed();
      }

      // 2. Staged 3D Perspective Depth Reveal for Operator Details, Actions & Metric Cards
      const detailBlocks = heroEl.querySelectorAll<HTMLElement>(
        '.hero-status-line, .hero-summary, .hero-actions, .vms-workspace-bar, .hero-readout',
      );
      const detailDuration = isMobileOrCoarse ? 420 : 680;
      const detailBaseDelay = isMobileOrCoarse ? 180 : 280;

      detailBlocks.forEach((el, index) => {
        const anim = el.animate(
          [
            {
              transform:
                'perspective(1100px) translate3d(0, 28px, -64px) rotateX(-24deg) scale(0.97)',
              opacity: 0,
            },
            {
              transform:
                'perspective(1100px) translate3d(0, 0, 0) rotateX(0deg) scale(1)',
              opacity: 1,
            },
          ],
          {
            duration: detailDuration,
            delay: detailBaseDelay + index * 95,
            easing,
            fill: 'both',
          },
        );
        activeAnimations.push(anim);
      });

      const metricItems = heroEl.querySelectorAll<HTMLElement>(
        '.hero-metric, .hero-meta > span',
      );
      metricItems.forEach((el, index) => {
        const anim = el.animate(
          [
            {
              transform: 'perspective(900px) translate3d(0, 20px, -45px) rotateX(-38deg)',
              opacity: 0,
            },
            {
              transform: 'perspective(900px) translate3d(0, 0, 0) rotateX(0deg)',
              opacity: 1,
            },
          ],
          {
            duration: isMobileOrCoarse ? 360 : 580,
            delay: detailBaseDelay + 240 + index * 65,
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
      if (fallbackTimer !== null) {
        window.clearTimeout(fallbackTimer);
      }
      cancelAllAnimations();
    };
  }, [prefersReducedMotion]);

  // Task A2: Mouse-move rAF lerp parallax on stage & [data-parallax] layers
  useEffect(() => {
    const heroEl = heroRef.current;
    if (!heroEl) return;

    const reducedQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const coarseQuery = window.matchMedia('(pointer: coarse)');
    const narrowQuery = window.matchMedia('(max-width: 767px)');

    const parallaxLayers = Array.from(heroEl.querySelectorAll<HTMLElement>('[data-parallax]'));
    if (parallaxLayers.length === 0) return;

    let rafId = 0;
    let isInViewport = true;
    let pointerInside = false;
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    const lerpFactor = 0.08;

    const isParallaxEnabled = () =>
      !reducedQuery.matches &&
      !coarseQuery.matches &&
      !narrowQuery.matches &&
      isInViewport &&
      document.visibilityState !== 'hidden';

    const clearLayerStyles = () => {
      for (const layer of parallaxLayers) {
        layer.style.transform = '';
        layer.style.willChange = '';
      }
    };

    const setWillChangeActive = (active: boolean) => {
      const value = active ? 'transform' : '';
      for (const layer of parallaxLayers) {
        layer.style.willChange = value;
      }
    };

    const applyTransforms = (nx: number, ny: number) => {
      for (const layer of parallaxLayers) {
        const rawDepth = Number(layer.dataset.parallaxDepth ?? '1');
        const depthScale = Number.isFinite(rawDepth)
          ? Math.min(3, Math.max(0.25, rawDepth)) / 3
          : 1 / 3;

        const tx = nx * 12 * depthScale;
        const ty = ny * 12 * depthScale;
        const shouldTilt = layer.dataset.parallaxTilt === 'true';

        if (shouldTilt) {
          const rx = -ny * 6 * depthScale;
          const ry = nx * 6 * depthScale;
          layer.style.transform = `perspective(1100px) rotateX(${rx.toFixed(3)}deg) rotateY(${ry.toFixed(3)}deg) translate3d(${tx.toFixed(2)}px, ${ty.toFixed(2)}px, 0)`;
        } else {
          layer.style.transform = `translate3d(${tx.toFixed(2)}px, ${ty.toFixed(2)}px, 0)`;
        }
      }
    };

    const stopLoop = () => {
      if (rafId !== 0) {
        window.cancelAnimationFrame(rafId);
        rafId = 0;
      }
    };

    const tick = () => {
      rafId = 0;
      if (!isParallaxEnabled()) {
        if (reducedQuery.matches || coarseQuery.matches || narrowQuery.matches) {
          currentX = 0;
          currentY = 0;
          targetX = 0;
          targetY = 0;
          clearLayerStyles();
        }
        return;
      }

      currentX += (targetX - currentX) * lerpFactor;
      currentY += (targetY - currentY) * lerpFactor;

      const settled =
        Math.abs(targetX - currentX) < 0.002 && Math.abs(targetY - currentY) < 0.002;

      if (settled) {
        currentX = targetX;
        currentY = targetY;
      }

      if (!pointerInside && Math.abs(currentX) < 0.002 && Math.abs(currentY) < 0.002) {
        currentX = 0;
        currentY = 0;
        clearLayerStyles();
        return;
      }

      applyTransforms(currentX, currentY);

      if (!settled || pointerInside) {
        rafId = window.requestAnimationFrame(tick);
      }
    };

    const startLoop = () => {
      if (rafId === 0 && isParallaxEnabled()) {
        rafId = window.requestAnimationFrame(tick);
      }
    };

    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType === 'touch' || !isParallaxEnabled()) return;
      const rect = heroEl.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;

      if (!pointerInside) {
        pointerInside = true;
        setWillChangeActive(true);
      }

      const rawX = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      const rawY = ((event.clientY - rect.top) / rect.height) * 2 - 1;
      targetX = Math.max(-1, Math.min(1, rawX));
      targetY = Math.max(-1, Math.min(1, rawY));
      startLoop();
    };

    const onPointerLeave = () => {
      pointerInside = false;
      targetX = 0;
      targetY = 0;
      if (isParallaxEnabled()) {
        startLoop();
      } else {
        stopLoop();
        clearLayerStyles();
      }
    };

    const onEnvironmentChange = () => {
      if (!isParallaxEnabled()) {
        stopLoop();
        if (reducedQuery.matches || coarseQuery.matches || narrowQuery.matches) {
          pointerInside = false;
          targetX = 0;
          targetY = 0;
          currentX = 0;
          currentY = 0;
          clearLayerStyles();
        }
      } else if (pointerInside || Math.abs(currentX) > 0.002 || Math.abs(currentY) > 0.002) {
        startLoop();
      }
    };

    const observer =
      typeof IntersectionObserver !== 'undefined'
        ? new IntersectionObserver(
            (entries) => {
              const entry = entries[0];
              if (!entry) return;
              isInViewport = entry.isIntersecting;
              if (!isInViewport) {
                stopLoop();
              } else if (pointerInside || Math.abs(currentX) > 0.002 || Math.abs(currentY) > 0.002) {
                startLoop();
              }
            },
            { threshold: 0 },
          )
        : null;

    observer?.observe(heroEl);
    heroEl.addEventListener('pointermove', onPointerMove, { passive: true });
    heroEl.addEventListener('pointerleave', onPointerLeave, { passive: true });
    document.addEventListener('visibilitychange', onEnvironmentChange, { passive: true });
    reducedQuery.addEventListener('change', onEnvironmentChange);
    coarseQuery.addEventListener('change', onEnvironmentChange);
    narrowQuery.addEventListener('change', onEnvironmentChange);

    return () => {
      stopLoop();
      observer?.disconnect();
      heroEl.removeEventListener('pointermove', onPointerMove);
      heroEl.removeEventListener('pointerleave', onPointerLeave);
      document.removeEventListener('visibilitychange', onEnvironmentChange);
      reducedQuery.removeEventListener('change', onEnvironmentChange);
      coarseQuery.removeEventListener('change', onEnvironmentChange);
      narrowQuery.removeEventListener('change', onEnvironmentChange);
      clearLayerStyles();
    };
  }, []);

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });
  const copyY = useTransform(scrollYProgress, [0, 1], [0, -28]);
  const copyOpacity = useTransform(scrollYProgress, [0, 0.85, 1], [1, 0.94, 0.72]);
  const stageY = useTransform(scrollYProgress, [0, 1], [0, -18]);
  const stageScale = useTransform(scrollYProgress, [0, 1], [1, 0.95]);

  const activePreset = VMS_WORKSPACE_PRESETS.find((preset) => preset.id === viewMode);

  return (
    <section aria-labelledby="hero-title" className="hero-section" id="hero" ref={heroRef}>
      <div
        aria-hidden="true"
        className="hero-atmosphere"
        data-parallax="true"
        data-parallax-depth="1"
      >
        <span className="hero-orb hero-orb--cyan" />
        <span className="hero-orb hero-orb--violet" />
        <span className="hero-grid" />
      </div>
      <div className="hero-layout">
        <m.div {...(enableDepth ? { style: { y: copyY, opacity: copyOpacity } } : {})}>
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
              aria-label={`${profile.name} — eyes on every hub.`}
              className="hero-title"
              id="hero-title"
              ref={headlineRef}
            >
              <span className="hero-title-name">{profile.name}</span>{' '}
              <span className="hero-title-accent">— eyes on every hub.</span>
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

        <m.div
          animate={{ opacity: 1, scale: 1 }}
          className="hero-earth-column"
          initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.96 }}
          transition={{ duration: motionDurations.slow, delay: 0.16, ease: motionEasings.out }}
          {...(enableDepth ? { style: { y: stageY, scale: stageScale } } : {})}
        >
          <div
            className="hero-stage-stack"
            data-parallax="true"
            data-parallax-depth="3"
            data-parallax-tilt="true"
          >
            {isMobile ? (
              <div
                aria-label="Milestone XProtect Smart Client workstation preview"
                className="stage3d-shell stage3d-mobile-fallback"
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
                fallback={<StageSkeleton label="Loading 3D VMS workstation…" variant="vms" />}
              >
                <SurveillanceStage3D theme={theme} />
              </Suspense>
            )}
          </div>

          <div
            aria-label="Milestone XProtect VMS Smart Client modes"
            className="vms-workspace-bar"
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
        </m.div>
      </div>

      <div
        aria-label="Professional profile readout"
        className="hero-readout hero-readout--wide"
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
        </div>
      </div>

      <a aria-label="Scroll to expertise" className="hero-scroll" href="#about">
        <span>Scroll to explore</span>
        <ArrowDownRight aria-hidden="true" size={15} />
      </a>
    </section>
  );
});
