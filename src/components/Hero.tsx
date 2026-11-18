import { Suspense, lazy, memo, useCallback, useEffect, useRef, useState } from 'react';
import { m, useScroll, useTransform } from 'framer-motion';
import {
  Activity,
  ArrowDownRight,
  BellRing,
  ChevronDown,
  Command,
  Film,
  Map as MapIcon,
  Monitor,
  Moon,
  Sun,
} from 'lucide-react';
import { VMS_WORKSPACE_PRESETS, type VmsViewMode, useVms } from '@/context/VmsContext';
import { profile } from '@/data/profile';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import type { ThemeMode } from '@/hooks/useTheme';
import { Counter, useIsTouch } from '@/motion';
import workstationHeroImg from '@/assets/images/workstation_command_hero_1794781430131.jpg';
import { splitText } from '@/utils/heroSplitText';
import { Clock } from './Clock';
import { StageSkeleton } from './StageSkeleton';

const SurveillanceStage3D = lazy(() =>
  import('./three/SurveillanceStage3D').then((module) => ({
    default: module.SurveillanceStage3D,
  })),
);

interface HeroProps {
  theme: ThemeMode;
  onToggleTheme: (origin?: { x: number; y: number }) => void;
  onOpenPalette: () => void;
}

const VMS_MODE_ICONS: Record<VmsViewMode, typeof Monitor> = {
  live: Monitor,
  playback: Film,
  'smart-map': MapIcon,
  alarms: BellRing,
};

const PROMPT_TEXT = 'CCTV Operator & Surveillance Specialist · Patli, Haryana';

export const Hero = memo(function Hero({ theme, onToggleTheme, onOpenPalette }: HeroProps) {
  const { viewMode, statusNote, setViewMode } = useVms();
  const heroRef = useRef<HTMLElement>(null);
  const curtainRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const revealedDispatchedRef = useRef(false);
  const [typedLength, setTypedLength] = useState(PROMPT_TEXT.length);

  const prefersReducedMotion = useReducedMotion();
  const isTouch = useIsTouch();
  const isMobile = useMediaQuery('(max-width: 767px)');
  const enableDepth = !prefersReducedMotion && !isTouch;

  const handleCurtainPointerMove = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    const el = curtainRef.current;
    if (!el || event.pointerType === 'touch') return;
    const rect = el.getBoundingClientRect();
    const xPct = ((event.clientX - rect.left) / rect.width) * 100;
    const yPct = ((event.clientY - rect.top) / rect.height) * 100;
    el.style.setProperty('--spotlight-x', `${xPct.toFixed(1)}%`);
    el.style.setProperty('--spotlight-y', `${yPct.toFixed(1)}%`);
  }, []);

  useEffect(() => {
    if (prefersReducedMotion) {
      setTypedLength(PROMPT_TEXT.length);
      return;
    }
    let idx = 0;
    setTypedLength(0);
    const timer = window.setInterval(() => {
      idx += 1;
      setTypedLength(idx);
      if (idx >= PROMPT_TEXT.length) {
        window.clearInterval(timer);
      }
    }, 22);
    return () => window.clearInterval(timer);
  }, [prefersReducedMotion]);

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
      const units = splitText(headlineEl, { mode: 'words', depth3D: true });
      const duration = 680;
      const easing = 'cubic-bezier(0.16, 1, 0.3, 1)';
      const step = units.length > 1 ? Math.min(45, 360 / (units.length - 1)) : 0;

      const headlineAnimations: Animation[] = [];
      for (let i = 0; i < units.length; i += 1) {
        const unit = units[i];
        if (!unit) continue;
        const anim = unit.animate(
          [
            {
              transform: 'perspective(1100px) translate3d(0, 32px, -48px) rotateX(-40deg)',
              opacity: 0,
            },
            {
              transform: 'perspective(1100px) translate3d(0, 0, 0) rotateX(0deg)',
              opacity: 1,
            },
          ],
          {
            duration,
            delay: i * step,
            easing,
            fill: 'both',
          },
        );
        activeAnimations.push(anim);
        headlineAnimations.push(anim);
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
  const orbScale = useTransform(scrollYProgress, [0, 0.45], [1, 1.12]);

  const activePreset = VMS_WORKSPACE_PRESETS.find((preset) => preset.id === viewMode);

  const handleThemeToggleClick = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      if (event.clientX > 0 || event.clientY > 0) {
        onToggleTheme({ x: event.clientX, y: event.clientY });
      } else {
        const rect = event.currentTarget.getBoundingClientRect();
        onToggleTheme({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
      }
    },
    [onToggleTheme],
  );

  return (
    <section
      aria-labelledby="hero-title"
      className="hero-section hero-section--editorial"
      id="hero"
      ref={heroRef}
    >
      {/* ACT 1: Exact 5Lab #scene-1 Crimson Sphere Curtain */}
      <div
        className="hero-curtain mouse-cursor-gradient-tracking"
        id="scene-1"
        onPointerMove={handleCurtainPointerMove}
        ref={curtainRef}
      >
        <div aria-hidden="true" className="hero-curtain-grain" />
        <div aria-hidden="true" className="hero-orb-stage">
          <m.span
            className="hero-sphere-orb"
            {...(enableDepth ? { style: { scale: orbScale } } : {})}
          />
        </div>

        {/* Centered monumental staggered 5Lab H1 (Desktop/Tablet staggered 2-line; Mobile 3-line under sphere) */}
        <div className="hero-layout hero-layout--editorial">
          <h1
            aria-label={`${profile.name} — Eyes on every hub.`}
            className="hero-title"
            id="hero-title"
            ref={headlineRef}
          >
            <span className="hero-title-row hero-title-row--top">
              <span className="hero-title-name">Sumit</span>{' '}
              <em className="hero-title-accent">Anand</em>
            </span>
            <span className="hero-title-row hero-title-row--bottom">
              <span>Eyes on </span>
              <span className="hero-mobile-break">every hub.</span>
            </span>
          </h1>
        </div>

        {/* Bottom-left typewriter role prompt (Desktop & Tablet >= 768px) */}
        <div aria-label={PROMPT_TEXT} className="hero-prompt-left" id="control-bar-left-text">
          <span aria-hidden="true">&gt;</span>
          <span>{PROMPT_TEXT.slice(0, typedLength)}</span>
          <span aria-hidden="true" className="hero-prompt-caret" />
        </div>

        {/* Bottom-center bouncing thin white chevron */}
        <a
          aria-label="Scroll to interactive 3D command workstation"
          className="hero-scroll"
          href="#hero-workstation"
        >
          <ChevronDown aria-hidden="true" size={28} strokeWidth={1.3} />
        </a>

        {/* Bottom-right quarter-cropped rotating crimson stamp */}
        <a aria-label="Jump to contact section" className="hero-stamp-badge" href="#contact">
          <svg aria-hidden="true" className="hero-stamp-svg" viewBox="0 0 180 180">
            <defs>
              <path
                d="M 90, 90 m -68, 0 a 68,68 0 1,1 136,0 a 68,68 0 1,1 -136,0"
                id="hero-stamp-circle"
              />
            </defs>
            <text className="hero-stamp-ring-text">
              <textPath href="#hero-stamp-circle" startOffset="0%">
                SUMIT ANAND • PATLI HARYANA • CCTV &amp; VMS • &nbsp;
              </textPath>
            </text>
          </svg>
          <span className="hero-stamp-center">Contact</span>
        </a>
      </div>

      {/* ACT 2 BAND 0: Framed 3D XProtect Smart Client Workstation + Operator Dossier */}
      <div className="hero-workstation-band" id="hero-workstation">
        <div className="section-inner workstation-band-inner">
          <div className="workstation-band-header">
            <div>
              <p className="workstation-eyebrow">
                <span>00</span> / LIVE COMMAND WORKSTATION · SA / MILESTONE XPROTECT VMS · CCTV
                OPERATIONS
              </p>
              <h2 className="workstation-title">3D XProtect Smart Client Workstation</h2>
            </div>
            <div className="workstation-utility-strip">
              <p className="workstation-note">
                Drag anywhere to orbit 360° · Scroll to pan · Click any monitor or deck to zoom in
              </p>
              <div className="workstation-actions">
                <Clock className="workstation-clock" variant="nav" />
                <button
                  aria-label="Open command palette (Ctrl+K)"
                  className="workstation-util-btn"
                  onClick={onOpenPalette}
                  title="Command palette (Ctrl+K / ⌘K)"
                  type="button"
                >
                  <Command aria-hidden="true" size={14} />
                  <span>Ctrl+K</span>
                </button>
                <button
                  aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
                  className="workstation-util-btn"
                  onClick={handleThemeToggleClick}
                  title={theme === 'dark' ? 'Light theme' : 'Dark theme'}
                  type="button"
                >
                  {theme === 'dark' ? (
                    <Sun aria-hidden="true" size={14} />
                  ) : (
                    <Moon aria-hidden="true" size={14} />
                  )}
                  <span>{theme === 'dark' ? 'Light' : 'Dark'}</span>
                </button>
              </div>
            </div>
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
