import { Suspense, lazy, memo, useCallback, useRef } from 'react';
import { ArrowUpRight, MapPin } from 'lucide-react';
import { useGSAP } from '@gsap/react';
import { gsap } from '@/utils/animMaster';
import { type VmsSiteFocus, useVms } from '@/context/VmsContext';
import { contact } from '@/data/contact';
import { careerSites } from '@/data/experience';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import type { ThemeMode } from '@/hooks/useTheme';
import { ChoreoReveal } from '@/motion';
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
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  // Scroll Trigger Pinning & Scrub Animation
  useGSAP(
    () => {
      if (prefersReducedMotion || !sectionRef.current || !stageRef.current) return;

      const mm = gsap.matchMedia();

      mm.add('(min-width: 768px)', () => {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top top',
            end: '+=120%',
            pin: true,
            scrub: 1,
            anticipatePin: 1,
          },
        });

        tl.fromTo(
          stageRef.current,
          { scale: 0.94, rotationX: 8, opacity: 0.7 },
          { scale: 1, rotationX: 0, opacity: 1, ease: 'none' },
        );
      });

      return () => mm.revert();
    },
    { scope: sectionRef, dependencies: [prefersReducedMotion] },
  );

  const handleSelectSite = useCallback(
    (siteId: string) => {
      const focusSite: VmsSiteFocus = siteId === 'ekart' ? 'ekart' : 'flipkart';
      setActiveSiteId(focusSite);
    },
    [setActiveSiteId],
  );

  return (
    <section
      aria-labelledby="footprint-title"
      className="content-section footprint-section"
      id="footprint"
      ref={sectionRef}
    >
      <div className="section-inner">
        <SectionHeading
          description="Interactive Patli–NCR logistics corridor radar layered over a subtle orbital backdrop — synced with XProtect Smart Map and kept separate from the 3D workstation."
          eyebrow="Deployment footprint"
          id="footprint-title"
          number="03"
          title="Where I watch from."
          tone="lime"
        />

        <div className="footprint-radar-stage" ref={stageRef}>
          <div aria-hidden="true" className="footprint-ambient-globe">
            <Suspense fallback={null}>
              <EarthGlobe decorative theme={theme} />
            </Suspense>
          </div>

          <div className="footprint-layout footprint-layout--clean">
            <ChoreoReveal className="footprint-gmap-card" direction="scale">
              <div className="footprint-gmap-header">
                <span>
                  <MapPin aria-hidden="true" size={15} /> PATLI LOGISTICS CORRIDOR · HARYANA, INDIA
                </span>
                <a href={contact.mapUrl} rel="noopener noreferrer" target="_blank">
                  Open Base in Google Maps <ArrowUpRight aria-hidden="true" size={14} />
                </a>
              </div>
              <FootprintMap theme={theme} />
            </ChoreoReveal>
          </div>
        </div>

        <div aria-label="Select deployment site on Smart Map" className="site-list" role="group">
          {careerSites.map((site, index) => {
            const isSelected = activeSiteId === site.id;
            return (
              <ChoreoReveal
                delay={index * 0.08}
                direction={index % 2 === 0 ? 'left' : 'right'}
                distance={18}
                key={site.id}
              >
                <button
                  aria-pressed={isSelected}
                  className={`site-row site-row-btn ${isSelected ? 'site-row--active' : ''}`}
                  onClick={() => handleSelectSite(site.id)}
                  type="button"
                >
                  <span className="site-index">0{index + 1}</span>
                  <span className="site-row-state">
                    <i
                      className={
                        site.status === 'active'
                          ? 'status-pulse'
                          : 'status-pulse status-pulse--muted'
                      }
                    />
                    {site.status === 'active' ? 'CURRENT' : 'ARCHIVED'}
                  </span>
                  <strong>{site.name}</strong>
                  <span>
                    {site.client} · {site.period}
                  </span>
                  <span className="site-camera-count tabular-nums">{site.cameras} cameras</span>
                </button>
              </ChoreoReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
});
