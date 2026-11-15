import { useEffect, useState } from 'react';

const formatIndiaTime = (): string =>
  `${new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  }).format(new Date())} IST`;

export function useClock(): string {
  const [time, setTime] = useState(formatIndiaTime);

  useEffect(() => {
    let intervalId: number | null = null;

    const start = () => {
      if (intervalId !== null || document.visibilityState === 'hidden') return;
      intervalId = window.setInterval(() => setTime(formatIndiaTime()), 1000);
    };

    const stop = () => {
      if (intervalId !== null) {
        window.clearInterval(intervalId);
        intervalId = null;
      }
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        stop();
      } else {
        setTime(formatIndiaTime());
        start();
      }
    };

    start();
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      stop();
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, []);

  return time;
}
