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
        <div className="stage-skeleton-console">
          <span className="stage-skeleton-screen" />
          <span className="stage-skeleton-base" />
        </div>
        <span className="stage-skeleton-label">{label}</span>
      </div>
    </div>
  );
});
