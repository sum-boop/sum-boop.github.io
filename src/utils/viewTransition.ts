interface ViewTransitionOptions {
  kind?: 'theme' | 'layout';
  origin?: { x: number; y: number };
}

export function startSafeViewTransition(
  update: () => void,
  options: ViewTransitionOptions = {},
): void {
  if (typeof document === 'undefined' || typeof window === 'undefined') {
    update();
    return;
  }

  const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const startTransition =
    'startViewTransition' in document && typeof document.startViewTransition === 'function'
      ? document.startViewTransition.bind(document)
      : null;

  if (reducedMotion || !startTransition) {
    update();
    return;
  }

  const root = document.documentElement;
  const kind = options.kind ?? 'layout';

  if (kind === 'theme') {
    const x = options.origin?.x ?? window.innerWidth - 96;
    const y = options.origin?.y ?? 36;
    root.style.setProperty('--vt-origin-x', `${Math.round(x)}px`);
    root.style.setProperty('--vt-origin-y', `${Math.round(y)}px`);
    root.setAttribute('data-vt-kind', 'theme');
  } else {
    root.setAttribute('data-vt-kind', 'layout');
  }

  try {
    const transition = startTransition(() => {
      update();
    });
    void transition.finished.finally(() => {
      root.removeAttribute('data-vt-kind');
    });
  } catch {
    root.removeAttribute('data-vt-kind');
    update();
  }
}
