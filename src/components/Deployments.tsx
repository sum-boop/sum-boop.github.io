import { AnimatePresence, LayoutGroup, m } from 'framer-motion';
import { memo, useCallback, useMemo, useRef } from 'react';
import { useVms } from '@/context/VmsContext';
import { deployments } from '@/data/projects';
import { ChoreoReveal, motionDurations, motionEasings, motionSprings } from '@/motion';
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
      className="content-section operations-section"
      id="operations"
    >
      <div className="section-inner">
        <SectionHeading
          description="Illustrative feed imagery is not footage from the listed client sites. Filter synced directly with the Hero XProtect Smart Client console."
          eyebrow="Key deployments"
          id="operations-title"
          number="04"
          title="Camera feed deployments."
          tone="amber"
        />

        <ChoreoReveal direction="up" distance={20}>
          <LayoutGroup id="deployment-filters">
            <div aria-label="Filter deployments" className="feed-filters" role="group">
              {filters.map((filter) => {
                const isActive = deploymentFilter === filter;
                const count =
                  filter === 'All deployments'
                    ? deployments.length
                    : deployments.filter((d) => d.category === filter).length;
                return (
                  <m.button
                    aria-pressed={isActive}
                    className={`feed-filter ${isActive ? 'feed-filter--active' : ''}`}
                    key={filter}
                    onClick={() => handleFilterChange(filter)}
                    type="button"
                    whileTap={{ scale: 0.97 }}
                  >
                    {isActive ? (
                      <m.span
                        aria-hidden="true"
                        className="feed-filter-pill"
                        layoutId="active-deployment-filter-pill"
                        transition={motionSprings.snappy}
                      />
                    ) : null}
                    <span className="feed-filter-label">{filter}</span>
                    <span className="feed-filter-count tabular-nums">{count}</span>
                  </m.button>
                );
              })}
            </div>
          </LayoutGroup>
        </ChoreoReveal>

        <LayoutGroup id="deployment-bento">
          <m.div className="feed-bento-grid" layout ref={gridRef}>
            <AnimatePresence mode="popLayout">
              {visibleDeployments.map((deployment, visibleIdx) => (
                <m.div
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  className={`feed-bento-cell ${visibleIdx === 0 && deploymentFilter === 'All deployments' ? 'feed-bento-cell--featured' : ''}`}
                  exit={{ opacity: 0, scale: 0.96 }}
                  initial={{ opacity: 0, y: 16 }}
                  key={deployment.id}
                  layout
                  transition={{
                    duration: motionDurations.fast,
                    ease: motionEasings.out,
                    layout: motionSprings.snappy,
                  }}
                >
                  <div className="feed-card-choreo-wrap">
                    <CameraFeedCard
                      deployment={deployment}
                      featured={visibleIdx === 0 && deploymentFilter === 'All deployments'}
                      index={deployments.indexOf(deployment)}
                      isSelectedFeed={selectedFeedId === deployment.id}
                      onOpen={onOpen}
                    />
                  </div>
                </m.div>
              ))}
            </AnimatePresence>
          </m.div>
        </LayoutGroup>
      </div>
    </section>
  );
});
