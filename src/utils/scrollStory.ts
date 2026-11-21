import { useEffect, type DependencyList, type RefObject } from 'react';

/**
 * Staggered 3D card entrance using the Web Animations API.
 * Skips elements already marked with `data-staggered="true"`.
 */
export function useStaggeredCardGroup(
  containerRef: RefObject<HTMLElement | null>,
  itemSelector: string,
  deps: DependencyList = [],
): void {
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const reducedQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const coarseQuery = window.matchMedia('(pointer: coarse)');
    const narrowQuery = window.matchMedia('(max-width: 1023px)');

    let cancelled = false;
    let observer: IntersectionObserver | null = null;
    const activeAnimations: Animation[] = [];

    const clearInlineAnimationArtifacts = (el: HTMLElement) => {
      el.style.opacity = '';
      el.style.transform = '';
      el.style.willChange = '';
    };

    const showImmediately = () => {
      for (const anim of activeAnimations) {
        anim.cancel();
      }
      activeAnimations.length = 0;

      const items = container.querySelectorAll<HTMLElement>(itemSelector);
      items.forEach((item) => {
        clearInlineAnimationArtifacts(item);
        item.dataset.staggered = 'true';
      });
    };

    const animateGroup = () => {
      if (cancelled) return;
      if (reducedQuery.matches) {
        showImmediately();
        return;
      }

      const items = Array.from(container.querySelectorAll<HTMLElement>(itemSelector)).filter(
        (el) => el.dataset.staggered !== 'true',
      );

      if (items.length === 0) return;

      const isMobileOrCoarse = coarseQuery.matches || narrowQuery.matches;
      const duration = isMobileOrCoarse ? 600 : 900;
      const easing = 'cubic-bezier(0.22, 1, 0.36, 1)';
      const fromTransform = isMobileOrCoarse
        ? 'translateY(32px) scale(0.97)'
        : 'perspective(900px) translateY(40px) rotateX(10deg) scale(0.96)';
      const toTransform = isMobileOrCoarse
        ? 'translateY(0) scale(1)'
        : 'perspective(900px) translateY(0) rotateX(0deg) scale(1)';

      items.forEach((item, index) => {
        item.dataset.staggered = 'true';
        if (typeof item.animate !== 'function') return;

        const delay = Math.min(index * 90, 700);
        const anim = item.animate(
          [
            { opacity: 0, transform: fromTransform },
            { opacity: 1, transform: toTransform },
          ],
          {
            duration,
            delay,
            easing,
            fill: 'both',
          },
        );
        activeAnimations.push(anim);

        void anim.finished
          .then(() => {
            if (cancelled) return;
            if (typeof anim.commitStyles === 'function') {
              try {
                anim.commitStyles();
              } catch {
                // Element may be detached or hidden; ignore safely
              }
            }
            anim.cancel();
            clearInlineAnimationArtifacts(item);
          })
          .catch(() => {
            if (!cancelled) {
              clearInlineAnimationArtifacts(item);
            }
          });
      });
    };

    const setup = () => {
      observer?.disconnect();
      observer = null;

      if (reducedQuery.matches) {
        showImmediately();
        return;
      }

      const unrevealed = Array.from(container.querySelectorAll<HTMLElement>(itemSelector)).filter(
        (el) => el.dataset.staggered !== 'true',
      );
      if (unrevealed.length === 0) return;

      if (typeof IntersectionObserver === 'undefined') {
        animateGroup();
        return;
      }

      observer = new IntersectionObserver(
        (entries) => {
          const entry = entries[0];
          if (!entry || !entry.isIntersecting) return;
          observer?.unobserve(container);
          observer?.disconnect();
          observer = null;
          animateGroup();
        },
        { threshold: 0.05, rootMargin: '0px 0px -6% 0px' },
      );

      observer.observe(container);
    };

    const onReducedMotionChange = () => {
      if (reducedQuery.matches) {
        observer?.disconnect();
        observer = null;
        showImmediately();
      } else {
        setup();
      }
    };

    setup();
    reducedQuery.addEventListener('change', onReducedMotionChange);

    return () => {
      cancelled = true;
      observer?.disconnect();
      reducedQuery.removeEventListener('change', onReducedMotionChange);
      for (const anim of activeAnimations) {
        anim.cancel();
      }
      activeAnimations.length = 0;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [containerRef, itemSelector, ...deps]);
}

interface FootprintStoryOptions {
  onStepChange?: (index: number) => void;
}

interface SavedInlineStyles {
  sectionMinHeight: string;
  sectionOverflow: string;
  innerPosition: string;
  innerTop: string;
}

/**
 * Pinned scroll-triggered storytelling for the Deployment Footprint section.
 * Sets `--story-progress` (0..1), pins inner wrapper on desktop fine pointers,
 * dispatches `footprint:step`, syncs `is-active` + `aria-current="step"`,
 * exposes `data-active-node` on canvas, and injects a thin vertical progress bar.
 */
export function useFootprintScrollStory(
  sectionRef: RefObject<HTMLElement | null>,
  innerRef: RefObject<HTMLDivElement | null>,
  stepListRef: RefObject<HTMLDivElement | null>,
  options: FootprintStoryOptions = {},
): void {
  const { onStepChange } = options;

  useEffect(() => {
    const section = sectionRef.current;
    const inner = innerRef.current;
    const stepList = stepListRef.current;
    if (!section || !inner) return;

    const reducedQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const desktopQuery = window.matchMedia('(min-width: 1024px) and (pointer: fine)');

    const savedStyles: SavedInlineStyles = {
      sectionMinHeight: section.style.minHeight,
      sectionOverflow: section.style.overflow,
      innerPosition: inner.style.position,
      innerTop: inner.style.top,
    };

    let rafId = 0;
    let resizeTimer: number | null = null;
    let isNearViewport = false;
    let isPinnedMode = false;
    let lastStepIndex = -1;
    let lastProgress = -1;
    let cachedSectionHeight = section.offsetHeight;
    let cachedViewportHeight = window.innerHeight || 800;

    let gateObserver: IntersectionObserver | null = null;
    let mobileStepObserver: IntersectionObserver | null = null;
    let resizeObserver: ResizeObserver | null = null;
    let progressTrack: HTMLDivElement | null = null;
    const mobileAnimations: Animation[] = [];

    const getStepElements = (): HTMLElement[] =>
      stepList ? Array.from(stepList.querySelectorAll<HTMLElement>('.site-row')) : [];

    const ensureProgressIndicator = () => {
      if (progressTrack && progressTrack.isConnected) return progressTrack;
      const track = document.createElement('div');
      track.setAttribute('aria-hidden', 'true');
      track.dataset.footprintProgress = 'true';
      track.style.position = 'absolute';
      track.style.right = '0px';
      track.style.top = '50%';
      track.style.transform = 'translateY(-50%)';
      track.style.width = '3px';
      track.style.height = '136px';
      track.style.borderRadius = '999px';
      track.style.backgroundColor = 'rgba(148, 163, 184, 0.22)';
      track.style.pointerEvents = 'none';
      track.style.zIndex = '6';
      track.style.overflow = 'hidden';

      const fill = document.createElement('span');
      fill.style.display = 'block';
      fill.style.width = '100%';
      fill.style.height = '100%';
      fill.style.borderRadius = '999px';
      fill.style.transformOrigin = 'top center';
      fill.style.transform = 'scaleY(var(--story-progress, 0))';
      fill.style.backgroundColor = 'var(--accent, var(--color-accent-cyan, #00e5ff))';
      track.appendChild(fill);

      if (!inner.style.position || inner.style.position === 'static') {
        inner.style.position = 'relative';
      }
      inner.appendChild(track);
      progressTrack = track;
      return track;
    };

    const removeProgressIndicator = () => {
      if (progressTrack && progressTrack.parentNode) {
        progressTrack.parentNode.removeChild(progressTrack);
      }
      progressTrack = null;
    };

    const restorePinStyles = () => {
      section.style.minHeight = savedStyles.sectionMinHeight;
      section.style.overflow = savedStyles.sectionOverflow;
      inner.style.position = savedStyles.innerPosition;
      inner.style.top = savedStyles.innerTop;
      removeProgressIndicator();
      isPinnedMode = false;
    };

    const applyPinStyles = () => {
      section.style.minHeight = '148vh';
      section.style.overflow = 'clip';
      inner.style.position = 'sticky';
      inner.style.top = '84px';
      ensureProgressIndicator();
      isPinnedMode = true;
    };

    const applyStepState = (
      index: number,
      progress: number,
      total: number,
      notifyCallback: boolean,
    ) => {
      const steps = getStepElements();
      steps.forEach((stepEl, i) => {
        if (i === index) {
          stepEl.classList.add('is-active');
          stepEl.setAttribute('aria-current', 'step');
        } else {
          stepEl.classList.remove('is-active');
          stepEl.removeAttribute('aria-current');
        }
      });

      const canvases = section.querySelectorAll<HTMLCanvasElement>('canvas');
      canvases.forEach((canvas) => {
        canvas.dataset.activeNode = String(index);
      });

      const mapContainer = section.querySelector<HTMLElement>('.footprint-map');
      if (mapContainer) {
        mapContainer.dataset.activeNode = String(index);
      }

      if (notifyCallback && index !== lastStepIndex) {
        onStepChange?.(index);
      }

      if (index !== lastStepIndex || Math.abs(progress - lastProgress) >= 0.02) {
        document.dispatchEvent(
          new CustomEvent('footprint:step', {
            detail: { index, progress, total },
          }),
        );
      }

      lastStepIndex = index;
      lastProgress = progress;
    };

    const updateScrollFrame = () => {
      rafId = 0;
      if (reducedQuery.matches) return;

      // Batch DOM reads first
      const rect = section.getBoundingClientRect();
      const viewportH = cachedViewportHeight || window.innerHeight || 800;
      const sectionH = rect.height || cachedSectionHeight || viewportH;

      const progress = isPinnedMode
        ? Math.max(0, Math.min(1, (84 - rect.top) / Math.max(1, sectionH - viewportH)))
        : Math.max(0, Math.min(1, (viewportH - rect.top) / Math.max(1, viewportH + sectionH)));

      const steps = getStepElements();
      const total = Math.max(3, steps.length);
      const stepIndex = Math.min(total - 1, Math.max(0, Math.floor(progress * total)));

      // Batch DOM writes together
      section.style.setProperty('--story-progress', progress.toFixed(4));
      applyStepState(stepIndex, progress, total, isPinnedMode);
    };

    const onScroll = () => {
      if (!isNearViewport || reducedQuery.matches || document.visibilityState === 'hidden') return;
      if (rafId === 0) {
        rafId = window.requestAnimationFrame(updateScrollFrame);
      }
    };

    const cleanupMobileStepReveal = () => {
      mobileStepObserver?.disconnect();
      mobileStepObserver = null;
      for (const anim of mobileAnimations) {
        anim.cancel();
      }
      mobileAnimations.length = 0;
      const steps = getStepElements();
      steps.forEach((step) => {
        step.style.opacity = '';
        step.style.transform = '';
      });
    };

    const setupMobileStepReveal = () => {
      cleanupMobileStepReveal();
      if (!stepList || reducedQuery.matches || isPinnedMode) return;

      const steps = getStepElements();
      if (steps.length === 0) return;

      if (typeof IntersectionObserver === 'undefined') return;

      mobileStepObserver = new IntersectionObserver(
        (entries) => {
          const entry = entries[0];
          if (!entry || !entry.isIntersecting) return;
          mobileStepObserver?.disconnect();
          mobileStepObserver = null;

          steps.forEach((step, idx) => {
            if (typeof step.animate !== 'function') return;
            const anim = step.animate(
              [
                { opacity: 0, transform: 'translateY(18px)' },
                { opacity: 1, transform: 'translateY(0)' },
              ],
              {
                duration: 480,
                delay: idx * 60,
                easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
                fill: 'both',
              },
            );
            mobileAnimations.push(anim);
            void anim.finished
              .then(() => {
                if (typeof anim.commitStyles === 'function') {
                  try {
                    anim.commitStyles();
                  } catch {
                    // Ignore detached element errors
                  }
                }
                anim.cancel();
                step.style.opacity = '';
                step.style.transform = '';
              })
              .catch(() => {
                step.style.opacity = '';
                step.style.transform = '';
              });
          });
        },
        { threshold: 0.15, rootMargin: '0px 0px -8% 0px' },
      );

      mobileStepObserver.observe(stepList);
    };

    const evaluateMode = () => {
      if (rafId !== 0) {
        window.cancelAnimationFrame(rafId);
        rafId = 0;
      }

      if (reducedQuery.matches) {
        cleanupMobileStepReveal();
        restorePinStyles();
        section.style.setProperty('--story-progress', '1');
        const total = Math.max(3, getStepElements().length);
        applyStepState(0, 1, total, false);
        return;
      }

      if (desktopQuery.matches) {
        cleanupMobileStepReveal();
        applyPinStyles();
      } else {
        restorePinStyles();
        setupMobileStepReveal();
      }

      cachedViewportHeight = window.innerHeight || 800;
      cachedSectionHeight = section.offsetHeight;
      updateScrollFrame();
    };

    const handleResize = () => {
      if (resizeTimer !== null) {
        window.clearTimeout(resizeTimer);
      }
      resizeTimer = window.setTimeout(() => {
        resizeTimer = null;
        evaluateMode();
      }, 150);
    };

    if (typeof IntersectionObserver !== 'undefined') {
      gateObserver = new IntersectionObserver(
        (entries) => {
          const entry = entries[0];
          if (!entry) return;
          isNearViewport = entry.isIntersecting;
          if (isNearViewport && !reducedQuery.matches) {
            if (rafId === 0) {
              rafId = window.requestAnimationFrame(updateScrollFrame);
            }
          } else if (rafId !== 0) {
            window.cancelAnimationFrame(rafId);
            rafId = 0;
          }
        },
        { threshold: 0, rootMargin: '20% 0px 20% 0px' },
      );
      gateObserver.observe(section);
    } else {
      isNearViewport = true;
    }

    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => {
        cachedSectionHeight = section.offsetHeight;
        cachedViewportHeight = window.innerHeight || 800;
        if (isNearViewport && !reducedQuery.matches && rafId === 0) {
          rafId = window.requestAnimationFrame(updateScrollFrame);
        }
      });
      resizeObserver.observe(section);
    }

    evaluateMode();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', handleResize, { passive: true });
    reducedQuery.addEventListener('change', evaluateMode);
    desktopQuery.addEventListener('change', evaluateMode);

    document.dispatchEvent(new CustomEvent('footprint:ready'));

    return () => {
      if (rafId !== 0) {
        window.cancelAnimationFrame(rafId);
      }
      if (resizeTimer !== null) {
        window.clearTimeout(resizeTimer);
      }
      gateObserver?.disconnect();
      resizeObserver?.disconnect();
      cleanupMobileStepReveal();
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', handleResize);
      reducedQuery.removeEventListener('change', evaluateMode);
      desktopQuery.removeEventListener('change', evaluateMode);
      restorePinStyles();
      section.style.removeProperty('--story-progress');

      const steps = getStepElements();
      steps.forEach((stepEl) => {
        stepEl.classList.remove('is-active');
        stepEl.removeAttribute('aria-current');
      });
    };
  }, [innerRef, onStepChange, sectionRef, stepListRef]);
}
