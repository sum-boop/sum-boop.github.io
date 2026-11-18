import { Suspense, lazy, memo, useCallback, useRef, useState } from 'react';
import { ArrowUpRight, MapPin } from 'lucide-react';
import { type VmsSiteFocus, useVms } from '@/context/VmsContext';
import { contact } from '@/data/contact';
import { careerSites } from '@/data/experience';
import type { ThemeMode } from '@/hooks/useTheme';
import { useFootprintScrollStory } from '@/utils/scrollStory';
import { FootprintMap } from './FootprintMap';
import { SectionHeading } from './SectionHeading';

const EarthGlobe = lazy(() =>
  import('./EarthGlobe').then((module) => ({ default: module.EarthGlobe })),
);

interface FootprintProps {
  theme: ThemeMode;
}

export const Footprint = memo(function Footprint({ theme }: FootprintProps) {
  const { activeSiteId, setActiveSiteId } = useVms();
  const [corridorOverviewActive, setCorridorOverviewActive] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const stepListRef = useRef<HTMLDivElement>(null);

  const totalCameras = careerSites.reduce((sum, site) => sum + site.cameras, 0);

  const handleStoryStepChange = useCallback(
    (stepIndex: number) => {
      if (stepIndex === 1) {
        setCorridorOverviewActive(false);
        setActiveSiteId('ekart');
      } else if (stepIndex === 2) {
        setCorridorOverviewActive(true);
        setActiveSiteId('flipkart');
      } else {
        setCorridorOverviewActive(false);
        setActiveSiteId('flipkart');
      }
    },
    [setActiveSiteId],
  );

  useFootprintScrollStory(sectionRef, innerRef, stepListRef, {
    onStepChange: handleStoryStepChange,
  });

  const handleSelectSite = useCallback(
    (siteId: string, isCorridorOverview = false) => {
      setCorridorOverviewActive(isCorridorOverview);
      const focusSite: VmsSiteFocus = siteId === 'ekart' ? 'ekart' : 'flipkart';
      setActiveSiteId(focusSite);
    },
    [setActiveSiteId],
  );

  return (
    <section
      aria-labelledby="footprint-title"
      className="content-section-5lab footprint-section-5lab"
      id="footprint"
      ref={sectionRef}
    >
      <div className="section-inner" ref={innerRef}>
        <SectionHeading
          description="Interactive Patli–NCR logistics corridor radar layered over a subtle orbital backdrop — synced with XProtect Smart Map."
          eyebrow="Deployment Footprint"
          highlightWord="watch from."
          id="footprint-title"
          number="03"
          title="Where I watch from."
          tone="amber"
        />

        <div className="footprint-radar-stage">
          <div aria-hidden="true" className="footprint-ambient-globe">
            <Suspense fallback={null}>
              <EarthGlobe decorative theme={theme} />
            </Suspense>
          </div>

          <div className="footprint-layout footprint-layout--clean">
            <div className="footprint-gmap-card-5lab">
              <div className="footprint-gmap-header-5lab">
                <span>
                  <MapPin aria-hidden="true" size={15} /> PATLI LOGISTICS CORRIDOR · HARYANA, INDIA
                </span>
                <a href={contact.mapUrl} rel="noopener noreferrer" target="_blank">
                  Open Base in Google Maps <span className="sr-only">(opens in new tab)</span>
                  <ArrowUpRight aria-hidden="true" size={14} />
                </a>
              </div>
              <FootprintMap theme={theme} />
            </div>
          </div>
        </div>

        <div
          aria-label="Select deployment site on Smart Map"
          className="site-list-5lab"
          ref={stepListRef}
          role="group"
        >
          {careerSites.map((site, index) => {
            const isSelected = !corridorOverviewActive && activeSiteId === site.id;
            return (
              <button
                aria-pressed={isSelected}
                className={`site-row-5lab ${isSelected ? 'site-row-5lab--active' : ''}`}
                key={site.id}
                onClick={() => handleSelectSite(site.id)}
                type="button"
              >
                <span className="site-index-5lab">0{index + 1}</span>
                <span className="site-row-state-5lab">
                  <i
                    aria-hidden="true"
                    className={
                      site.status === 'active'
                        ? 'status-pulse'
                        : 'status-pulse status-pulse--muted'
                    }
                  />
                  {site.status === 'active' ? 'CURRENT' : 'ARCHIVED'}
                </span>
                <strong className="site-name-5lab">{site.name}</strong>
                <span className="site-client-5lab">
                  {site.client} · {site.period}
                </span>
                <span className="site-camera-count-5lab tabular-nums">{site.cameras} cameras</span>
              </button>
            );
          })}
          <button
            aria-pressed={corridorOverviewActive}
            className={`site-row-5lab ${corridorOverviewActive ? 'site-row-5lab--active' : ''}`}
            onClick={() => handleSelectSite('flipkart', true)}
            type="button"
          >
            <span className="site-index-5lab">03</span>
            <span className="site-row-state-5lab">
              <i aria-hidden="true" className="status-pulse" />
              CORRIDOR
            </span>
            <strong className="site-name-5lab">Patli–NCR Freight Corridor</strong>
            <span className="site-client-5lab">KMP Expressway · NH-48 Smart Map</span>
            <span className="site-camera-count-5lab tabular-nums">{totalCameras} cameras</span>
          </button>
        </div>
      </div>
    </section>
  );
});
