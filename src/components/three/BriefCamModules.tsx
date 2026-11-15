import { useState } from 'react';
import { m } from 'framer-motion';
import {
  Activity,
  AlertTriangle,
  BarChart3,
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
  onClose: () => void;
}

export function BriefCamOverlay({ activeModule, onSelectModule, onClose }: BriefCamOverlayProps) {
  const [objectClass, setObjectClass] = useState<'all' | 'person' | 'vehicle' | 'bag'>('all');
  const [isPlaying, setIsPlaying] = useState(true);
  const [scrubberTime, setScrubberTime] = useState(35);
  const [alertFilter, setAlertFilter] = useState<'all' | 'face' | 'plate' | 'intrusion'>('all');

  return (
    <div className="briefcam-overlay-panel" data-testid="briefcam-overlay">
      <div className="briefcam-header">
        <div className="briefcam-brand">
          <span className="briefcam-logo-icon">
            <Zap size={16} />
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
            <Search size={14} /> Review (Synopsis)
          </button>
          <button
            aria-pressed={activeModule === 'respond'}
            className={`briefcam-tab ${activeModule === 'respond' ? 'briefcam-tab--active' : ''}`}
            onClick={() => onSelectModule('respond')}
            type="button"
          >
            <ShieldAlert size={14} /> Respond (Alerts)
          </button>
          <button
            aria-pressed={activeModule === 'research'}
            className={`briefcam-tab ${activeModule === 'research' ? 'briefcam-tab--active' : ''}`}
            onClick={() => onSelectModule('research')}
            type="button"
          >
            <BarChart3 size={14} /> Research (Insights)
          </button>
        </div>
        <button className="icon-button briefcam-close" onClick={onClose} type="button">
          ✕
        </button>
      </div>

      <div className="briefcam-body">
        {activeModule === 'review' && (
          <div className="briefcam-review-view">
            <div className="briefcam-toolbar">
              <span className="mono-label">
                <Filter size={12} /> SYNOPSIS FILTER ENGINE
              </span>
              <div className="briefcam-filter-group">
                {(['all', 'person', 'vehicle', 'bag'] as const).map((cls) => (
                  <button
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
              {/* Simulated floating 3D synopsis object boxes */}
              <m.div
                animate={{ x: [0, 40, 80, 0], opacity: [0.8, 1, 0.9, 0.8] }}
                className="synopsis-bbox synopsis-bbox--person"
                style={{ top: '24%', left: '18%' }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
              >
                <span>👤 PERSON #104 · 1.4m/s</span>
                <small>Flipkart Dock Bay 3 · 07:14 IST</small>
              </m.div>

              <m.div
                animate={{ x: [0, -60, -120, 0] }}
                className="synopsis-bbox synopsis-bbox--vehicle"
                style={{ top: '55%', left: '52%' }}
                transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
              >
                <span>🚚 COMMERCIAL FLEET #42 · GIGO IN</span>
                <small>Speed: 12 km/h · Direction: North</small>
              </m.div>

              <m.div
                animate={{ scale: [1, 1.08, 1] }}
                className="synopsis-bbox synopsis-bbox--bag"
                style={{ top: '32%', left: '74%' }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              >
                <span>📦 UNATTENDED CARGO BAG</span>
                <small>Dwell Time: 14m · Alert ID #889</small>
              </m.div>
            </div>

            <div className="briefcam-timeline-bar">
              <button
                className="icon-button briefcam-play-btn"
                onClick={() => setIsPlaying(!isPlaying)}
                type="button"
              >
                {isPlaying ? <Pause size={14} /> : <Play size={14} />}
              </button>
              <div className="briefcam-timeline-track">
                <input
                  aria-label="Synopsis Scrubber"
                  className="briefcam-range"
                  max={100}
                  min={0}
                  onChange={(e) => setScrubberTime(Number(e.target.value))}
                  type="range"
                  value={scrubberTime}
                />
                <div className="briefcam-progress-fill" style={{ width: `${scrubberTime}%` }} />
              </div>
              <span className="briefcam-time-readout">07:45:{String(scrubberTime).padStart(2, '0')} IST</span>
            </div>
          </div>
        )}

        {activeModule === 'respond' && (
          <div className="briefcam-respond-view">
            <div className="briefcam-toolbar">
              <span className="mono-label">
                <AlertTriangle size={12} /> REAL-TIME RULE ALERTS
              </span>
              <div className="briefcam-filter-group">
                {(['all', 'face', 'plate', 'intrusion'] as const).map((f) => (
                  <button
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
              <div className="briefcam-alert-card briefcam-alert-card--urgent">
                <div className="alert-badge">FACE MATCH</div>
                <div className="alert-content">
                  <strong>Watchlist Subject Identified · Gate GIGO Entry</strong>
                  <p>High-confidence biometric match against authorized contractor registry #902.</p>
                  <small>Camera 01 · Flipkart Kalash Mega Hub · 12s ago</small>
                </div>
                <button className="button button--primary" type="button">Acknowledge</button>
              </div>

              <div className="briefcam-alert-card">
                <div className="alert-badge alert-badge--amber">LICENSE PLATE</div>
                <div className="alert-content">
                  <strong>Commercial Fleet HR-26-CQ-9918 · Dock 04</strong>
                  <p>Inbound transport vehicle cleared via automated GIGO gate log.</p>
                  <small>Camera 09 · Apron Perimeter · 1m ago</small>
                </div>
                <button className="button button--quiet" type="button">Inspect Feed</button>
              </div>

              <div className="briefcam-alert-card">
                <div className="alert-badge alert-badge--cyan">INTRUSION ZONE</div>
                <div className="alert-content">
                  <strong>Restricted Perimeter Breach Warning</strong>
                  <p>Personnel detected near fire exit corridor after shift hours.</p>
                  <small>Camera 24 · North Perimeter · 4m ago</small>
                </div>
                <button className="button button--quiet" type="button">View Synopsis</button>
              </div>
            </div>
          </div>
        )}

        {activeModule === 'research' && (
          <div className="briefcam-research-view">
            <div className="briefcam-toolbar">
              <span className="mono-label">
                <Activity size={12} /> QUANTITATIVE INSIGHTS &amp; HEATMAPS
              </span>
              <span className="briefcam-status-pill">Patli Corridor · 24H Aggregate</span>
            </div>

            <div className="briefcam-research-grid">
              <div className="briefcam-metric-box">
                <small>TOTAL OBJECT COUNT</small>
                <strong>14,890</strong>
                <span>+12.4% vs yesterday</span>
              </div>
              <div className="briefcam-metric-box">
                <small>AVG DWELL TIME</small>
                <strong>18.4 min</strong>
                <span>Loading dock turnaround</span>
              </div>
              <div className="briefcam-metric-box">
                <small>PEAK TRAFFIC HOUR</small>
                <strong>14:00 – 16:00</strong>
                <span>32 active camera channels</span>
              </div>
            </div>

            <div className="briefcam-heatmap-container">
              <div className="heatmap-glow-blob" />
              <div className="heatmap-trajectory-line" />
              <div className="heatmap-label">
                <BarChart3 size={16} /> FLIPKART KALASH FLOOR PLAN · TRAJECTORY DENSITY MAP
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
