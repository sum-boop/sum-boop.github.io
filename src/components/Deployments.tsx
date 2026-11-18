import { m } from 'framer-motion';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useVms } from '@/context/VmsContext';
import { deployments } from '@/data/projects';
import { ChoreoReveal, motionDurations, motionEasings } from '@/motion';
import type { DeploymentBriefing } from '@/types/portfolio';
import { useStaggeredCardGroup } from '@/utils/scrollStory';
import { CameraFeedCard } from './CameraFeedCard';
import { SectionHeading } from './SectionHeading';

interface DeploymentsProps {
  onOpen: (deployment: DeploymentBriefing) => void;
}

export const Deployments = memo(function Deployments({ onOpen }: DeploymentsProps) {
  const { deploymentFilter, selectedFeedId, setDeploymentFilter } = useVms();
  const gridRef = useRef<HTMLDivElement>(null);

  const filters = useMemo(
    () => ['All deployments', ...new Set(deployments.map((deployment) => deployment.category))],
    [],
  );

  const visibleDeployments = useMemo(
    () =>
      deploymentFilter === 'All deployments'
        ? deployments
        : deployments.filter((deployment) => deployment.category === deploymentFilter),
    [deploymentFilter],
  );

  const [focusedId, setFocusedId] = useState<string>(visibleDeployments[0]?.id ?? 'op1');

  useEffect(() => {
    const candidate =
      visibleDeployments.find((item) => item.id === selectedFeedId) ?? visibleDeployments[0];
    if (candidate) {
      setFocusedId(candidate.id);
    }
  }, [selectedFeedId, visibleDeployments]);

  const activeDeployment =
    visibleDeployments.find((item) => item.id === focusedId) ?? visibleDeployments[0];

  useStaggeredCardGroup(gridRef, '.feed-card-choreo-wrap', [deploymentFilter]);

  const handleFilterChange = useCallback(
    (nextFilter: string) => {
      if (nextFilter === deploymentFilter) return;
      setDeploymentFilter(nextFilter);
    },
    [deploymentFilter, setDeploymentFilter],
  );

  return (
    <section
      aria-labelledby="operations-title"
      className="content-section-5lab operations-section-5lab"
      id="operations"
    >
      <div className="section-inner">
        <SectionHeading
          description="Illustrative feed imagery is not footage from the listed client sites. Filter synced directly with the Hero XProtect Smart Client console."
          eyebrow="Key deployments"
          highlightWord="deployments."
          id="operations-title"
          number="04"
          title="Camera feed deployments."
          tone="amber"
        />

        <ChoreoReveal direction="up" distance={16}>
          <div aria-label="Filter deployments" className="feed-filters" role="group">
            {filters.map((filter) => {
              const isActive = deploymentFilter === filter;
              const count =
                filter === 'All deployments'
                  ? deployments.length
                  : deployments.filter((d) => d.category === filter).length;
              return (
                <button
                  aria-pressed={isActive}
                  className={`feed-filter ${isActive ? 'feed-filter--active' : ''}`}
                  key={filter}
                  onClick={() => handleFilterChange(filter)}
                  type="button"
                >
                  <span className="feed-filter-label">{filter}</span>
                  <span className="feed-filter-count tabular-nums">{count}</span>
                </button>
              );
            })}
          </div>
        </ChoreoReveal>

        {/* 5Lab Category Showcase 2-Column Grid with zero tilt and smooth hover */}
        <div className="works-showcase-5lab" id="highlight-scroller">
          <div className="feed-bento-grid-5lab works-gallery-column" ref={gridRef}>
            {visibleDeployments.map((deployment, visibleIdx) => (
              <m.div
                animate={{ opacity: 1, y: 0 }}
                className="feed-bento-cell-5lab works-card-slot"
                initial={{ opacity: 0, y: 14 }}
                key={`${deploymentFilter}-${deployment.id}`}
                onFocus={() => setFocusedId(deployment.id)}
                onMouseEnter={() => setFocusedId(deployment.id)}
                transition={{
                  duration: motionDurations.fast,
                  ease: motionEasings.out,
                  delay: Math.min(visibleIdx * 0.04, 0.2),
                }}
              >
                <div className="feed-card-choreo-wrap">
                  <CameraFeedCard
                    deployment={deployment}
                    index={deployments.indexOf(deployment)}
                    isSelectedFeed={selectedFeedId === deployment.id}
                    onOpen={onOpen}
                  />
                </div>
              </m.div>
            ))}
          </div>

          {activeDeployment ? (
            <aside aria-live="polite" className="works-sticky-readout">
              <div className="works-sticky-inner">
                <p className="works-sticky-eyebrow">
                  DEPLOYMENT / 0{deployments.indexOf(activeDeployment) + 1} ·{' '}
                  {activeDeployment.category}
                </p>
                <h3 className="works-sticky-title">{activeDeployment.cardTitle}</h3>
                <p className="works-sticky-site">
                  {activeDeployment.site} · {activeDeployment.cardPeriod}
                  {activeDeployment.cardCameras
                    ? ` · ${activeDeployment.cardCameras} cameras`
                    : ''}
                </p>
                <p className="works-sticky-desc">{activeDeployment.cardDescription}</p>
                {activeDeployment.cardMetric ? (
                  <p className="works-sticky-metric tabular-nums">{activeDeployment.cardMetric}</p>
                ) : null}
                <button
                  className="works-sticky-link lab-underline-link"
                  onClick={() => onOpen(activeDeployment)}
                  type="button"
                >
                  Expand briefing
                </button>
              </div>
            </aside>
          ) : null}
        </div>
      </div>
    </section>
  );
});
