import { m } from 'framer-motion';
import { ArrowUpRight, Eye, Radio, Shield } from 'lucide-react';
import { memo, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { motionSprings, useIsTouch } from '@/motion';
import type { DeploymentBriefing } from '@/types/portfolio';
import { assetPath } from '@/utils/assets';

interface CameraFeedCardProps {
  deployment: DeploymentBriefing;
  index: number;
  featured?: boolean;
  isSelectedFeed?: boolean;
  onOpen: (deployment: DeploymentBriefing) => void;
}

export const CameraFeedCard = memo(function CameraFeedCard({
  deployment,
  index,
  featured = false,
  isSelectedFeed = false,
  onOpen,
}: CameraFeedCardProps) {
  const [imgSrc, setImgSrc] = useState(deployment.cardImage);
  const [hardFailed, setHardFailed] = useState(false);
  const isTouch = useIsTouch();
  const prefersReducedMotion = useReducedMotion();
  const enabled = !isTouch && !prefersReducedMotion;

  const handleImageError = () => {
    const fallback = assetPath('assets/sumit-monitoring-station.jpg');
    if (imgSrc !== fallback) {
      setImgSrc(fallback);
    } else {
      setHardFailed(true);
    }
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (!enabled || event.pointerType === 'touch') return;
    const bounds = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty('--spotlight-x', `${event.clientX - bounds.left}px`);
    event.currentTarget.style.setProperty('--spotlight-y', `${event.clientY - bounds.top}px`);
  };

  return (
    <m.button
      aria-label={`Open briefing: ${deployment.title}`}
      className={`feed-card spotlight-card ${featured ? 'feed-card--featured' : ''} ${
        isSelectedFeed ? 'feed-card--vms-active' : ''
      }`}
      onClick={() => onOpen(deployment)}
      onPointerMove={handlePointerMove}
      transition={motionSprings.snappy}
      type="button"
      {...(enabled ? { whileHover: { y: -4 } } : {})}
      {...(!prefersReducedMotion ? { whileTap: { scale: 0.97 } } : {})}
    >
      <span className="feed-image-wrap">
        {hardFailed ? (
          <span className="feed-image-fallback">
            <Shield aria-hidden="true" size={28} />
            <span>{deployment.cardTitle}</span>
          </span>
        ) : (
          <img
            alt={deployment.imageAlt}
            className="feed-image"
            decoding="async"
            height="600"
            loading="lazy"
            onError={handleImageError}
            referrerPolicy="no-referrer"
            src={imgSrc}
            width="900"
          />
        )}
        <span className="feed-image-overlay" />
        <span className="feed-image-label">
          <Radio aria-hidden="true" size={13} /> ILLUSTRATIVE VISUAL
        </span>
      </span>
      <span className="feed-card-content">
        <span className="feed-card-topline">
          <span>DEPLOYMENT / 0{index + 1}</span>
          <span>{deployment.cardPeriod}</span>
        </span>
        <span className="feed-card-title-row">
          <span className="feed-card-title">{deployment.cardTitle}</span>
          <ArrowUpRight aria-hidden="true" className="feed-card-arrow" size={18} />
        </span>
        <span className="feed-card-meta">
          <span>
            {deployment.site === 'Flipkart Kalash Mega Hub' ? 'Flipkart Kalash' : 'Ekart Logistics'}
          </span>
          <span aria-hidden="true">·</span>
          <span className="tabular-nums">{deployment.cardCameras} cameras</span>
        </span>
        <span className="feed-card-description">{deployment.cardDescription}</span>
        <span className="feed-card-footer">
          {deployment.cardMetric ? (
            <span className="feed-card-metric tabular-nums">{deployment.cardMetric}</span>
          ) : (
            <span className="feed-card-category">{deployment.category}</span>
          )}
          <span className="feed-open">
            <Eye aria-hidden="true" size={14} /> Expand briefing
          </span>
        </span>
      </span>
    </m.button>
  );
});
