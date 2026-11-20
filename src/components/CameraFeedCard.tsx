import { ArrowUpRight } from 'lucide-react';
import { memo, useState } from 'react';
import type { DeploymentBriefing } from '@/types/portfolio';
import { assetPath } from '@/utils/assets';

interface CameraFeedCardProps {
  deployment: DeploymentBriefing;
  index: number;
  eagerLoad?: boolean;
  featured?: boolean;
  isSelectedFeed?: boolean;
  onOpen: (deployment: DeploymentBriefing) => void;
}

export const CameraFeedCard = memo(function CameraFeedCard({
  deployment,
  index,
  eagerLoad = index < 2,
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

  const siteLabel =
    deployment.site === 'Flipkart Kalash Mega Hub' ? 'Flipkart Kalash' : 'Ekart Logistics';
  const cameraLabel = deployment.cardCameras ? `${deployment.cardCameras} cameras` : null;
  const tagLineParts = [
    `0${index + 1}`,
    siteLabel,
    deployment.cardPeriod,
    cameraLabel,
    deployment.cardMetric,
  ].filter(Boolean);

  return (
    <article
      className={`work-card-5lab ${isSelectedFeed ? 'work-card-5lab--vms-active' : ''}`}
    >
      <button
        aria-label={`Open briefing: ${deployment.title}`}
        className="work-card-btn-5lab"
        onClick={() => onOpen(deployment)}
        type="button"
      >
        <span
          className="work-card-media-5lab"
          style={{ aspectRatio: '16 / 10', background: '#E4E3EE' }}
        >
          {hardFailed ? (
            <span className="work-card-fallback-5lab">
              <span>{deployment.cardTitle}</span>
            </span>
          ) : (
            <img
              alt={deployment.imageAlt}
              className="work-card-img-5lab"
              decoding={eagerLoad ? 'sync' : 'async'}
              height="600"
              loading={eagerLoad ? 'eager' : 'lazy'}
              onError={handleImageError}
              referrerPolicy="no-referrer"
              src={imgSrc}
              width="960"
            />
          )}
        </span>

        <span className="work-card-body-5lab">
          <span className="work-card-title-row-5lab">
            <span className="work-card-title-5lab">{deployment.cardTitle}</span>
            <ArrowUpRight aria-hidden="true" className="work-card-arrow-5lab" size={20} />
          </span>

          <span className="work-card-tagline-5lab tabular-nums">
            {tagLineParts.join(' · ')}
            {isSelectedFeed ? (
              <span className="work-card-vms-note-5lab"> · Active VMS view</span>
            ) : null}
          </span>

          <span className="work-card-desc-5lab">{deployment.cardDescription}</span>
        </span>
      </button>
    </article>
  );
});
