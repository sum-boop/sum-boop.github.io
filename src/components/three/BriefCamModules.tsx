import { useEffect, useState } from 'react';
import { m } from 'framer-motion';
import {
  Activity,
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  Filter,
  Play,
  Pause,
  Search,
  ShieldAlert,
  Zap,
} from 'lucide-react';

type BriefCamModule = 'review' | 'respond' | 'research';

interface BriefCamOverlayProps {
  activeModule: BriefCamModule;
  onSelectModule: (module: BriefCamModule) => void;
  onInspectFeed?: () => void;
  onClose: () => void;
}

export function BriefCamOverlay({
  activeModule,
  onSelectModule,
  onInspectFeed,
  onClose,
}: BriefCamOverlayProps) {
  const [objectClass, setObjectClass] = useState<'all' | 'person' | 'vehicle' | 'bag'>('all');
  const [isPlaying, setIsPlaying] = useState(true);
  const [scrubberTime, setScrubberTime] = useState(35);
  const [alertFilter, setAlertFilter] = useState<'all' | 'face' | 'plate' | 'intrusion'>('all');
  const [acknowledgedAlerts, setAcknowledgedAlerts] = useState<string[]>([]);

  useEffect(() => {
    if (activeModule !== 'review' || !isPlaying) return;
    const timer = window.setInterval(() => {
      setScrubberTime((prev) => (prev >= 59 ? 0 : prev + 1));
    }, 900);
    return () => window.clearInterval(timer);
  }, [activeModule, isPlaying]);

  const toggleAcknowledge = (id: string) => {
    setAcknowledgedAlerts((prev) => (prev.includes(id) ? prev : [...prev, id]));
  };

  const showPerson = objectClass === 'all' || objectClass === 'person';
  const showVehicle = objectClass === 'all' || objectClass === 'vehicle';
  const showBag = objectClass === 'all' || objectClass === 'bag';

  const alerts = [
    {
      id: 'face-902',
      kind: 'face' as const,
      urgent: true,
      badge: 'FACE MATCH',
      badgeClass: 'alert-badge',
      title: 'Watchlist Subject Identified · Gate GIGO Entry',
      detail: 'High-confidence biometric match against authorized contractor registry #902.',
      meta: 'Gate GIGO · Flipkart Kalash Mega Hub · 12s ago',
      actionType: 'acknowledge' as const,
    },
    {
      id: 'plate-9918',
      kind: 'plate' as const,
      urgent: false,
      badge: 'LICENSE PLATE',
      badgeClass: 'alert-badge alert-badge--amber',
      title: 'Commercial Fleet HR-26-CQ-9918 · Dock 04',
      detail: 'Inbound transport vehicle cleared via automated GIGO gate log.',
      meta: 'Dock Apron · Perimeter · 1m ago',
      actionType: 'inspect' as const,
    },
    {
      id: 'intrusion-24',
      kind: 'intrusion' as const,
      urgent: false,
      badge: 'INTRUSION ZONE',
      badgeClass: 'alert-badge alert-badge--cyan',
      title: 'Restricted Perimeter Breach Warning',
      detail: 'Personnel detected near fire exit corridor after shift hours.',
      meta: 'Perimeter North · 4m ago',
      actionType: 'synopsis' as const,
    },
  ];

  const visibleAlerts =
    alertFilter === 'all' ? alerts : alerts.filter((alert) => alert.kind === alertFilter);

  return (
    <div className="briefcam-overlay-panel" data-testid="briefcam-overlay">
      <div className="briefcam-header">
        <div className="briefcam-brand">
          <span className="briefcam-logo-icon">
            <Zap aria-hidden="true" size={16} />
          </span>
          <div>
            <strong>BriefCam L4 Video Content Analytics</strong>
            <small>Integrated Smart Client Module · Video Synopsis &amp; BI</small>
          </div>
        </div>
        <div className="briefcam-tabs">
          <button
            aria-pressed={activeModule === 'review'}
            className={`briefcam-tab ${activeModule === 'review' ? 'briefcam-tab--active' : ''}`}
            onClick={() => onSelectModule('review')}
            type="button"
          >
            <Search aria-hidden="true" size={14} /> Review (Synopsis)
          </button>
          <button
            aria-pressed={activeModule === 'respond'}
            className={`briefcam-tab ${activeModule === 'respond' ? 'briefcam-tab--active' : ''}`}
            onClick={() => onSelectModule('respond')}
            type="button"
          >
            <ShieldAlert aria-hidden="true" size={14} /> Respond (Alerts)
          </button>
          <button
            aria-pressed={activeModule === 'research'}
            className={`briefcam-tab ${activeModule === 'research' ? 'briefcam-tab--active' : ''}`}
            onClick={() => onSelectModule('research')}
            type="button"
          >
            <BarChart3 aria-hidden="true" size={14} /> Research (Insights)
          </button>
        </div>
        <button
          aria-label="Close BriefCam analytics panel"
          className="icon-button briefcam-close"
          onClick={onClose}
          type="button"
        >
          <span aria-hidden="true">✕</span>
        </button>
      </div>

      <div className="briefcam-body">
        {activeModule === 'review' && (
          <div className="briefcam-review-view">
            <div className="briefcam-toolbar">
              <span className="mono-label">
                <Filter aria-hidden="true" size={12} /> SYNOPSIS FILTER ENGINE
              </span>
              <div className="briefcam-filter-group">
                {(['all', 'person', 'vehicle', 'bag'] as const).map((cls) => (
                  <button
                    aria-pressed={objectClass === cls}
                    key={cls}
                    className={`briefcam-chip ${objectClass === cls ? 'briefcam-chip--active' : ''}`}
                    onClick={() => setObjectClass(cls)}
                    type="button"
                  >
                    {cls.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <div className="briefcam-synopsis-canvas">
              <div className="synopsis-grid-overlay" />
              {showPerson ? (
                <m.div
                  animate={
                    isPlaying
                      ? { x: [0, 36, 72, 0], opacity: [0.85, 1, 0.9, 0.85] }
                      : { x: 0, opacity: 1 }
                  }
                  className="synopsis-bbox synopsis-bbox--person"
                  style={{ top: '20%', left: '12%' }}
                  transition={{ duration: 6, repeat: isPlaying ? Infinity : 0, ease: 'easeInOut' }}
                >
                  <span>PERSON #104 · 1.4m/s</span>
                  <small>Flipkart Dock Bay 3 · 07:14 IST</small>
                </m.div>
              ) : null}

              {showVehicle ? (
                <m.div
                  animate={isPlaying ? { x: [0, -48, -90, 0] } : { x: 0 }}
                  className="synopsis-bbox synopsis-bbox--vehicle"
                  style={{ top: '54%', left: '42%' }}
                  transition={{ duration: 8, repeat: isPlaying ? Infinity : 0, ease: 'easeInOut' }}
                >
                  <span>FLEET #42 · GIGO IN</span>
                  <small>Speed: 12 km/h · Direction: North</small>
                </m.div>
              ) : null}

              {showBag ? (
                <m.div
                  animate={isPlaying ? { scale: [1, 1.06, 1] } : { scale: 1 }}
                  className="synopsis-bbox synopsis-bbox--bag"
                  style={{ top: '26%', right: '8%' }}
                  transition={{ duration: 3, repeat: isPlaying ? Infinity : 0, ease: 'easeInOut' }}
                >
                  <span>UNATTENDED CARGO</span>
                  <small>Dwell Time: 14m · Alert #889</small>
                </m.div>
              ) : null}
            </div>

            <div className="briefcam-timeline-bar">
              <button
                aria-label={isPlaying ? 'Pause synopsis playback' : 'Play synopsis playback'}
                className="icon-button briefcam-play-btn"
                onClick={() => setIsPlaying((prev) => !prev)}
                type="button"
              >
                {isPlaying ? (
                  <Pause aria-hidden="true" size={14} />
                ) : (
                  <Play aria-hidden="true" size={14} />
                )}
              </button>
              <div className="briefcam-timeline-track">
                <input
                  aria-label="Synopsis Scrubber"
                  className="briefcam-range"
                  max={59}
                  min={0}
                  onChange={(e) => setScrubberTime(Number(e.target.value))}
                  type="range"
                  value={scrubberTime}
                />
                <div
                  className="briefcam-progress-fill"
                  style={{ width: `${Math.round((scrubberTime / 59) * 100)}%` }}
                />
              </div>
              <span className="briefcam-time-readout tabular-nums">
                07:45:{String(scrubberTime).padStart(2, '0')} IST
              </span>
            </div>
          </div>
        )}

        {activeModule === 'respond' && (
          <div className="briefcam-respond-view">
            <div className="briefcam-toolbar">
              <span className="mono-label">
                <AlertTriangle aria-hidden="true" size={12} /> REAL-TIME RULE ALERTS
              </span>
              <div className="briefcam-filter-group">
                {(['all', 'face', 'plate', 'intrusion'] as const).map((f) => (
                  <button
                    aria-pressed={alertFilter === f}
                    key={f}
                    className={`briefcam-chip ${alertFilter === f ? 'briefcam-chip--active' : ''}`}
                    onClick={() => setAlertFilter(f)}
                    type="button"
                  >
                    {f.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <div className="briefcam-alert-stream">
              {visibleAlerts.map((alert) => {
                const acked = acknowledgedAlerts.includes(alert.id);
                return (
                  <div
                    className={`briefcam-alert-card ${alert.urgent ? 'briefcam-alert-card--urgent' : ''}`}
                    key={alert.id}
                  >
                    <div className={alert.badgeClass}>{alert.badge}</div>
                    <div className="alert-content">
                      <strong>{alert.title}</strong>
                      <p>{alert.detail}</p>
                      <small>{alert.meta}</small>
                    </div>
                    {alert.actionType === 'acknowledge' ? (
                      <button
                        className={`button ${acked ? 'button--quiet' : 'button--primary'}`}
                        disabled={acked}
                        onClick={() => toggleAcknowledge(alert.id)}
                        type="button"
                      >
                        {acked ? (
                          <>
                            <CheckCircle2 aria-hidden="true" size={14} /> Acknowledged
                          </>
                        ) : (
                          'Acknowledge'
                        )}
                      </button>
                    ) : alert.actionType === 'inspect' ? (
                      <button
                        className="button button--quiet"
                        onClick={() => {
                          onInspectFeed?.();
                          onClose();
                        }}
                        type="button"
                      >
                        Inspect Feed
                      </button>
                    ) : (
                      <button
                        className="button button--quiet"
                        onClick={() => onSelectModule('review')}
                        type="button"
                      >
                        View Synopsis
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeModule === 'research' && (
          <div className="briefcam-research-view">
            <div className="briefcam-toolbar">
              <span className="mono-label">
                <Activity aria-hidden="true" size={12} /> QUANTITATIVE INSIGHTS &amp; HEATMAPS
              </span>
              <span className="briefcam-status-pill">Patli Corridor · 24H Aggregate</span>
            </div>

            <div className="briefcam-research-grid">
              <div className="briefcam-metric-box">
                <small>TOTAL OBJECT COUNT</small>
                <strong className="tabular-nums">14,890</strong>
                <span>+12.4% vs yesterday</span>
              </div>
              <div className="briefcam-metric-box">
                <small>AVG DWELL TIME</small>
                <strong className="tabular-nums">18.4 min</strong>
                <span>Loading dock turnaround</span>
              </div>
              <div className="briefcam-metric-box">
                <small>PEAK TRAFFIC HOUR</small>
                <strong className="tabular-nums">14:00 – 16:00</strong>
                <span>Multi-camera coverage</span>
              </div>
            </div>

            <div className="briefcam-heatmap-container">
              <div aria-hidden="true" className="heatmap-glow-blob" />
              <div aria-hidden="true" className="heatmap-trajectory-line">
                <svg preserveAspectRatio="none" viewBox="0 0 400 180">
                  <path
                    d="M 24 140 Q 120 40, 210 92 T 376 48"
                    fill="none"
                    stroke="rgba(56, 189, 248, 0.72)"
                    strokeDasharray="6 4"
                    strokeWidth="2.2"
                  />
                  <path
                    d="M 30 62 Q 160 148, 250 88 T 370 128"
                    fill="none"
                    stroke="rgba(52, 211, 153, 0.65)"
                    strokeWidth="2"
                  />
                  <circle cx="210" cy="92" fill="#f59e0b" r="4" />
                  <circle cx="376" cy="48" fill="#38bdf8" r="4" />
                </svg>
              </div>
              <div className="heatmap-label">
                <BarChart3 aria-hidden="true" size={16} /> FLIPKART KALASH FLOOR PLAN · TRAJECTORY
                DENSITY MAP
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
