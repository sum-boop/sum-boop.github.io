import { memo } from 'react';
import { ArrowUpRight, Crosshair, MapPin, ShieldCheck } from 'lucide-react';
import { useVms } from '@/context/VmsContext';
import { contact } from '@/data/contact';
import { careerSites } from '@/data/experience';
import { profile } from '@/data/profile';
import type { ThemeMode } from '@/hooks/useTheme';
import { CORRIDOR_COORDS } from '@/utils/vmsLogic';

interface FootprintMapProps {
  theme: ThemeMode;
}

interface CorridorNode {
  id: 'flipkart' | 'ekart';
  title: string;
  client: string;
  location: string;
  period: string;
  cameras: number;
  status: 'active' | 'past';
  coordsLabel: string;
  osmUrl: string;
  xPercent: number;
  yPercent: number;
}

const CORRIDOR_NODES: readonly CorridorNode[] = careerSites.map((site) => {
  const isFlipkart = site.id === 'flipkart';
  const id = isFlipkart ? 'flipkart' : 'ekart';
  const coords = CORRIDOR_COORDS[id];
  return {
    id,
    title: site.name,
    client: site.client,
    location: site.location,
    period: site.period,
    cameras: site.cameras,
    status: site.status,
    coordsLabel: isFlipkart ? '28.450° N, 76.850° E' : '28.426° N, 76.915° E',
    osmUrl: isFlipkart
      ? 'https://www.openstreetmap.org/?mlat=28.450&mlon=76.850#map=13/28.450/76.850'
      : 'https://www.openstreetmap.org/?mlat=28.426&mlon=76.915#map=13/28.426/76.915',
    xPercent: coords.xPercent,
    yPercent: coords.yPercent,
  };
});

export const FootprintMap = memo(function FootprintMap({ theme }: FootprintMapProps) {
  const { activeSiteId, setActiveSiteId } = useVms();
  const activeNode = CORRIDOR_NODES.find((node) => node.id === activeSiteId) ?? CORRIDOR_NODES[0]!;

  const flipkartSvgX = (CORRIDOR_COORDS.flipkart.xPercent / 100) * 900;
  const flipkartSvgY = (CORRIDOR_COORDS.flipkart.yPercent / 100) * 440;
  const ekartSvgX = (CORRIDOR_COORDS.ekart.xPercent / 100) * 900;
  const ekartSvgY = (CORRIDOR_COORDS.ekart.yPercent / 100) * 440;

  return (
    <div className={`footprint-corridor-stack footprint-corridor-stack--${theme}`}>
      <div className="footprint-corridor-toolbar">
        <div aria-label="Corridor display mode" className="corridor-mode-group" role="group">
          <span className="corridor-status-tag">INTERACTIVE CORRIDOR RADAR</span>
        </div>

        <div aria-label="Focus deployment node" className="corridor-site-switches" role="group">
          {CORRIDOR_NODES.map((node) => {
            const selected = activeNode.id === node.id;
            return (
              <button
                aria-pressed={selected}
                className={`corridor-chip ${selected ? 'corridor-chip--selected' : ''}`}
                key={node.id}
                onClick={() => setActiveSiteId(node.id)}
                type="button"
              >
                <Crosshair aria-hidden="true" size={13} />
                <span>{node.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="footprint-radar-layout">
        <div className="footprint-map footprint-corridor-viewport">
          <div aria-hidden="true" className="corridor-radar-canvas">
            <svg
              className="corridor-radar-svg"
              preserveAspectRatio="xMidYMid slice"
              viewBox="0 0 900 440"
            >
              <defs>
                <radialGradient id="radar-glow" cx="34%" cy="44%" r="55%">
                  <stop offset="0%" stopColor="rgba(77, 166, 214, 0.2)" />
                  <stop offset="60%" stopColor="rgba(77, 166, 214, 0.05)" />
                  <stop offset="100%" stopColor="rgba(77, 166, 214, 0)" />
                </radialGradient>
              </defs>

              <rect fill="url(#radar-glow)" height="440" width="900" x="0" y="0" />

              <circle
                className="radar-ring"
                cx={flipkartSvgX}
                cy={flipkartSvgY}
                fill="none"
                r="78"
                stroke="rgba(77, 166, 214, 0.24)"
                strokeDasharray="4 6"
                strokeWidth="1.2"
              />
              <circle
                className="radar-ring"
                cx={flipkartSvgX}
                cy={flipkartSvgY}
                fill="none"
                r="156"
                stroke="rgba(77, 166, 214, 0.16)"
                strokeWidth="1"
              />
              <circle
                className="radar-ring"
                cx={flipkartSvgX}
                cy={flipkartSvgY}
                fill="none"
                r="242"
                stroke="rgba(77, 166, 214, 0.1)"
                strokeDasharray="6 8"
                strokeWidth="1"
              />

              <path
                d={`M 60 365 C 210 305, ${flipkartSvgX} ${flipkartSvgY}, ${ekartSvgX} ${ekartSvgY} S 800 180, 860 95`}
                fill="none"
                stroke="rgba(148, 163, 184, 0.32)"
                strokeDasharray="8 6"
                strokeWidth="2"
              />
              <path
                d={`M 155 48 C 245 140, ${flipkartSvgX - 24} ${flipkartSvgY - 30}, ${flipkartSvgX} ${flipkartSvgY} L 490 385`}
                fill="none"
                stroke="rgba(77, 166, 214, 0.24)"
                strokeWidth="1.6"
              />
              <line
                stroke="rgba(62, 180, 137, 0.5)"
                strokeDasharray="5 5"
                strokeWidth="1.8"
                x1={flipkartSvgX}
                x2={ekartSvgX}
                y1={flipkartSvgY}
                y2={ekartSvgY}
              />

              <text
                fill="rgba(148, 163, 184, 0.72)"
                fontFamily="monospace"
                fontSize="11"
                x="110"
                y="344"
              >
                KMP EXPRESSWAY CORRIDOR
              </text>
              <text
                fill="rgba(148, 163, 184, 0.72)"
                fontFamily="monospace"
                fontSize="11"
                x="630"
                y="196"
              >
                NH-48 FREIGHT ROUTE
              </text>
            </svg>
            <div className="corridor-radar-sweep" />
          </div>

          <div aria-hidden="true" className="footprint-map-overlay" />

          {CORRIDOR_NODES.map((node) => {
            const selected = activeNode.id === node.id;
            return (
              <button
                aria-label={`Select ${node.title} (${node.location})`}
                aria-pressed={selected}
                className={`corridor-pin ${selected ? 'corridor-pin--active' : ''} ${node.status === 'active' ? 'corridor-pin--current' : 'corridor-pin--past'}`}
                key={node.id}
                onClick={() => setActiveSiteId(node.id)}
                style={{ left: `${node.xPercent}%`, top: `${node.yPercent}%` }}
                type="button"
              >
                <span aria-hidden="true" className="corridor-pin-ring" />
                <span aria-hidden="true" className="corridor-pin-core" />
                <span className="corridor-pin-label">
                  <strong>{node.title}</strong>
                  <small>{node.cameras} cam</small>
                </span>
              </button>
            );
          })}

          <div className="footprint-map-top">
            <span>
              <MapPin aria-hidden="true" size={14} /> {activeNode.location} ·{' '}
              {activeNode.coordsLabel}
            </span>
            <span>
              <ShieldCheck aria-hidden="true" size={14} /> SMART MAP TELEMETRY
            </span>
          </div>
        </div>

        <aside aria-live="polite" className="footprint-details">
          <div className="footprint-details-heading">
            <span>{activeNode.status === 'active' ? 'CURRENT HUB' : 'PAST DEPLOYMENT'}</span>
          </div>
          <strong>{activeNode.title}</strong>
          <div className="footprint-readouts">
            <div>
              <small>CLIENT</small>
              {activeNode.client}
            </div>
            <div>
              <small>PERIOD</small>
              {activeNode.period}
            </div>
            <div>
              <small>CAMERAS</small>
              {activeNode.cameras} ch
            </div>
          </div>
          <p className="footprint-details-copy">
            Corridor node synced with XProtect Smart Map. Inspect coordinate telemetry or open the
            hub in OpenStreetMap or Google Maps.
          </p>
          <div className="footprint-details-links">
            <a href={activeNode.osmUrl} rel="noopener noreferrer" target="_blank">
              OpenStreetMap <span className="sr-only">(opens in new tab)</span>
              <ArrowUpRight aria-hidden="true" size={13} />
            </a>
            <a href={contact.mapUrl} rel="noopener noreferrer" target="_blank">
              Google Maps <span className="sr-only">(opens in new tab)</span>
              <ArrowUpRight aria-hidden="true" size={13} />
            </a>
          </div>
        </aside>
      </div>

      <div className="footprint-corridor-legend">
        <span>
          <MapPin aria-hidden="true" size={13} /> {profile.location} · 28.45° N, 76.85° E
        </span>
        <span>
          <ShieldCheck aria-hidden="true" size={13} /> Select any node to inspect Smart Map
          coordinates &amp; camera coverage
        </span>
      </div>
    </div>
  );
});
