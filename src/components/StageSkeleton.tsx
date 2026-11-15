import { memo } from 'react';

export type StageSkeletonVariant = 'vms';

interface StageSkeletonProps {
  variant: StageSkeletonVariant;
  label: string;
}

export const StageSkeleton = memo(function StageSkeleton({ label }: StageSkeletonProps) {
  return (
    <div
      aria-busy="true"
      aria-label={label}
      className="stage3d-shell stage3d-skeleton"
      data-testid="vms-stage-3d"
      role="status"
    >
      <div aria-hidden="true" className="stage-skeleton-inner">
        <div className="stage-skeleton-grid" />
        <div className="stage-skeleton-radar">
          <span className="stage-skeleton-radar-pulse" />
          <span className="stage-skeleton-radar-ring stage-skeleton-radar-ring--outer" />
          <span className="stage-skeleton-radar-ring stage-skeleton-radar-ring--mid" />
          <span className="stage-skeleton-radar-ring stage-skeleton-radar-ring--inner" />
          <span className="stage-skeleton-radar-sweep" />
          <span className="stage-skeleton-radar-core" />
        </div>
        <span className="stage-skeleton-label">{label}</span>
      </div>
    </div>
  );
});
