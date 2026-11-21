import { memo, useId } from 'react';

const BADGE_COPY = 'SUMIT ANAND \u00B7 CCTV OPERATOR \u00B7 HARYANA \u00B7 ';

export const CircularBadge = memo(function CircularBadge() {
  const pathId = useId();

  return (
    <div aria-hidden="true" className="circular-badge">
      <svg
        aria-hidden="true"
        className="circular-badge-svg"
        fill="none"
        viewBox="0 0 136 136"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <path d="M 68, 68 m -54, 0 a 54,54 0 1,1 108,0 a 54,54 0 1,1 -108,0" id={pathId} />
        </defs>
        <circle cx="68" cy="68" fill="currentColor" r="2.5" />
        <text className="circular-badge-text">
          <textPath href={`#${pathId}`} lengthAdjust="spacing" startOffset="0%" textLength="335">
            {BADGE_COPY}
          </textPath>
        </text>
      </svg>
    </div>
  );
});
