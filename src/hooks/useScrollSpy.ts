import { useEffect, useState } from 'react';

export function useScrollSpy(sectionIds: readonly string[]): string {
  const [activeId, setActiveId] = useState(sectionIds[0] ?? 'hero');

  useEffect(() => {
    const updateActive = () => {
      const vh = window.innerHeight || 900;
      const scrollBottom = window.scrollY + vh;
      const docHeight = document.documentElement.scrollHeight;

      if (scrollBottom >= docHeight - 60 && sectionIds.length > 0) {
        const lastId = sectionIds[sectionIds.length - 1];
        if (lastId) {
          setActiveId(lastId);
          return;
        }
      }

      const anchorY = vh * 0.26;
      let matched = sectionIds[0] ?? 'hero';

      for (const id of sectionIds) {
        const el = document.getElementById(id);
        if (!el) continue;
        const rect = el.getBoundingClientRect();
        if (rect.top <= anchorY) {
          matched = id;
        }
      }

      setActiveId((prev) => (prev === matched ? prev : matched));
    };

    let rafId = 0;
    const scheduleUpdate = () => {
      if (rafId !== 0) return;
      rafId = window.requestAnimationFrame(() => {
        rafId = 0;
        updateActive();
      });
    };

    updateActive();
    window.addEventListener('scroll', scheduleUpdate, { passive: true });
    window.addEventListener('resize', scheduleUpdate, { passive: true });

    return () => {
      if (rafId !== 0) window.cancelAnimationFrame(rafId);
      window.removeEventListener('scroll', scheduleUpdate);
      window.removeEventListener('resize', scheduleUpdate);
    };
  }, [sectionIds]);

  return activeId;
}
