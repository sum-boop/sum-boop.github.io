import { Suspense, lazy, memo } from 'react';
import {
  Activity,
  ArrowDownRight,
  BellRing,
  Command,
  Film,
  Map as MapIcon,
  Monitor,
} from 'lucide-react';
import { VMS_WORKSPACE_PRESETS, type VmsViewMode, useVms } from '@/context/VmsContext';
import { profile } from '@/data/profile';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import type { ThemeMode } from '@/hooks/useTheme';
import { Counter } from '@/motion';
import workstationHeroImg from '@/assets/images/workstation_command_hero_1794781430131.jpg';
import { Clock } from './Clock';
import { StageSkeleton } from './StageSkeleton';

const SurveillanceStage3D = lazy(() =>
  import('./three/SurveillanceStage3D').then((module) => ({
    default: module.SurveillanceStage3D,
  })),
);

interface WorkstationBandProps {
  theme: ThemeMode;
  onOpenPalette: () => void;
}

const VMS_MODE_ICONS: Record<VmsViewMode, typeof Monitor> = {
  live: Monitor,
  playback: Film,
  'smart-map': MapIcon,
  alarms: BellRing,
};

export const WorkstationBand = memo(function WorkstationBand({
  theme,
  onOpenPalette,
}: WorkstationBandProps) {
  const { viewMode, statusNote, setViewMode } = useVms();
  const isMobile = useMediaQuery('(max-width: 767px)');
  const activePreset = VMS_WORKSPACE_PRESETS.find((preset) => preset.id === viewMode);

  return (
    <section
      aria-labelledby="workstation-title"
      className="content-section-5lab workstation-section-5lab"
      id="hero-workstation"
    >
      <div className="section-inner">
        <div className="workstation-band-header">
          <div>
            <p className="section-eyebrow">
              <span>00</span> / LIVE COMMAND WORKSTATION · MILESTONE XPROTECT VMS
            </p>
            <h2 className="workstation-title-5lab" id="workstation-title">
              3D XProtect Smart Client Workstation
            </h2>
          </div>
          <div className="workstation-utility-strip">
            <p className="workstation-note">
              Drag to look around · Click any monitor, deck or rack unit to inspect
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
            </div>
          </div>
        </div>

        <div className="workstation-frame-5lab">
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
                  <span className="stage3d-spec-title">Milestone XProtect VMS + BriefCam L4</span>
                </div>
                <span className="stage3d-spec-sub">
                  {activePreset ? `${activePreset.label} · ${statusNote}` : statusNote}
                </span>
              </div>
            </div>
          ) : (
            <Suspense
              fallback={<StageSkeleton label="Initializing 3D Command Room…" variant="vms" />}
            >
              <SurveillanceStage3D forceTheme="dark" theme={theme} />
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
    </section>
  );
});
