import { memo } from 'react';
import { useClock } from '@/hooks/useClock';

interface ClockProps {
  className?: string;
  variant?: 'inline' | 'nav';
}

export const Clock = memo(function Clock({ className, variant = 'inline' }: ClockProps) {
  const time = useClock();

  if (variant === 'nav') {
    return (
      <div aria-label={`IST time ${time}`} className={className ?? 'nav-telemetry'}>
        <time>{time}</time>
      </div>
    );
  }

  return <time className={className}>{time}</time>;
});
