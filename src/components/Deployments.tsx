import { memo, useCallback, useMemo } from 'react';
import { useVms } from '@/context/VmsContext';
import { deployments } from '@/data/projects';
import { ChoreoReveal } from '@/motion';
import type { DeploymentBriefing } from '@/types/portfolio';
import { CameraFeedCard } from './CameraFeedCard';
import { SectionHeading } from './SectionHeading';

interface DeploymentsProps {
  onOpen: (deployment: DeploymentBriefing) => void;
}

interface DeploymentCategoryGroup {
  category: string;
  items: DeploymentBriefing[];
}

export const Deployments = memo(function Deployments({ onOpen }: DeploymentsProps) {
  const { deploymentFilter, selectedFeedId, setDeploymentFilter } = useVms();

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

  const groupedDeployments = useMemo<DeploymentCategoryGroup[]>(() => {
    const groups = new Map<string, DeploymentBriefing[]>();
    for (const deployment of visibleDeployments) {
      const existing = groups.get(deployment.category);
      if (existing) {
        existing.push(deployment);
      } else {
        groups.set(deployment.category, [deployment]);
      }
    }
    return Array.from(groups, ([category, items]) => ({ category, items }));
  }, [visibleDeployments]);

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
          italicAccent="deployments"
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

        <div className="works-showcase-5lab" id="highlight-scroller">
          {(() => {
            let visibleCardOffset = 0;
            return groupedDeployments.map((group) => (
              <div className="works-group-5lab" key={group.category}>
                <header className="works-group-header-5lab">
                  <p className="works-group-eyebrow-5lab">Experienced in</p>
                  <h2 className="works-group-title-5lab">{group.category}</h2>
                </header>

                <div className="works-group-grid-5lab">
                  {group.items.map((deployment) => {
                    const isEagerCard = visibleCardOffset < 2;
                    visibleCardOffset += 1;
                    return (
                      <CameraFeedCard
                        deployment={deployment}
                        eagerLoad={isEagerCard}
                        index={deployments.findIndex((item) => item.id === deployment.id)}
                        isSelectedFeed={selectedFeedId === deployment.id}
                        key={deployment.id}
                        onOpen={onOpen}
                      />
                    );
                  })}
                </div>
              </div>
            ));
          })()}
        </div>
      </div>
    </section>
  );
});
