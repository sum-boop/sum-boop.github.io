import { Eye } from 'lucide-react';
import { memo, useState } from 'react';
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
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const [hardFailed, setHardFailed] = useState(false);

  const fallback = assetPath('assets/sumit-monitoring-station.jpg');
  const imgSrc = failedSrc === deployment.cardImage ? fallback : deployment.cardImage;

  const handleImageError = () => {
    if (failedSrc !== deployment.cardImage) {
      setFailedSrc(deployment.cardImage);
    } else {
      setHardFailed(true);
    }
  };

  return (
    <article
      className={`feed-card-article ${featured ? 'feed-card--featured' : ''} ${
        isSelectedFeed ? 'feed-card--vms-active' : ''
      }`}
    >
      {/* Mobile / narrow header above photo matching 5Lab ref-mobile-390-mid.png */}
      <div className="feed-mobile-header">
        <p className="feed-mobile-eyebrow">
          0{index + 1} · {deployment.category} · {deployment.cardPeriod}
        </p>
        <h3 className="feed-mobile-title">{deployment.cardTitle}</h3>
      </div>

      {/* Tilted borderless 0px-radius full-bleed photographic card on desktop/tablet */}
      <button
        aria-label={`Open briefing: ${deployment.title}`}
        className={`feed-card ${isSelectedFeed ? 'feed-card--vms-active' : ''}`}
        onClick={() => onOpen(deployment)}
        type="button"
      >
        <span className="feed-image-wrap">
          {hardFailed ? (
            <span className="feed-image-fallback">
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
        </span>

        <span className="feed-card-content">
          <span className="feed-card-topline">
            <span>0{index + 1} / {deployment.category}</span>
            <span>{deployment.cardPeriod}</span>
          </span>
          <span className="feed-card-title">{deployment.cardTitle}</span>
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
      </button>

      {/* Mobile underlined title CTA underneath photo matching 5Lab ref-mobile-390-mid.png */}
      <div className="feed-mobile-footer">
        <button className="feed-mobile-link" onClick={() => onOpen(deployment)} type="button">
          Expand briefing — {deployment.site}
        </button>
      </div>
    </article>
  );
});
