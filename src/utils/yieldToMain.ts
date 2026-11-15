interface SchedulerWithYield {
  yield?: () => Promise<void>;
}

export function yieldToMain(): Promise<void> {
  const maybeScheduler = (globalThis as { scheduler?: SchedulerWithYield }).scheduler;
  if (typeof maybeScheduler?.yield === 'function') {
    return maybeScheduler.yield();
  }
  return new Promise((resolve) => {
    window.setTimeout(resolve, 0);
  });
}

export function scheduleIdle(task: () => void, timeout = 300): () => void {
  if (typeof window === 'undefined') return () => {};

  if ('requestIdleCallback' in window && typeof window.requestIdleCallback === 'function') {
    const id = window.requestIdleCallback(() => task(), { timeout });
    return () => {
      if (typeof window.cancelIdleCallback === 'function') {
        window.cancelIdleCallback(id);
      }
    };
  }

  const timerId = window.setTimeout(task, 1);
  return () => window.clearTimeout(timerId);
}
