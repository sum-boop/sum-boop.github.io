import gsap from 'gsap';
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin';

gsap.registerPlugin(ScrambleTextPlugin);

const DEFAULT_CHARS = 'abcdefghijklmnopqrstuvwxyz!<>-_/[]{}=+*^?#';
const activeRestorers = new WeakMap<HTMLElement, () => void>();

export interface ScrambleRevealOptions {
  duration?: number;
  delay?: number;
  chars?: string;
}

function collectLeafElements(root: HTMLElement): HTMLElement[] {
  if (root.children.length === 0) {
    return (root.textContent ?? '').trim().length > 0 ? [root] : [];
  }

  if (!root.hasAttribute('data-scramble-ready')) {
    const childNodes = Array.from(root.childNodes);
    for (const node of childNodes) {
      if (node.nodeType === Node.TEXT_NODE && (node.nodeValue ?? '').trim().length > 0) {
        const span = document.createElement('span');
        span.setAttribute('data-scramble', '');
        span.textContent = node.nodeValue;
        root.replaceChild(span, node);
      }
    }
    root.setAttribute('data-scramble-ready', '');
  }

  const leaves: HTMLElement[] = [];
  const descendants = root.querySelectorAll('*');
  descendants.forEach((node) => {
    if (
      node instanceof HTMLElement &&
      node.children.length === 0 &&
      (node.textContent ?? '').trim().length > 0
    ) {
      leaves.push(node);
    }
  });
  return leaves;
}

export function restoreScramble(el: HTMLElement): void {
  activeRestorers.get(el)?.();
}

export function scrambleReveal(el: HTMLElement, opts?: ScrambleRevealOptions): void {
  if (typeof window === 'undefined') return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (el.hasAttribute('data-scrambled')) return;

  const fullText = (el.textContent ?? '').trim();
  if (!fullText) return;

  const leaves = collectLeafElements(el);
  if (leaves.length === 0) return;

  el.setAttribute('data-scrambled', '');

  const duration = Math.min(0.9, Math.max(0.1, opts?.duration ?? 0.9));
  const delay = opts?.delay ?? 0;
  const chars = opts?.chars ?? DEFAULT_CHARS;

  const hadAriaLabel = el.hasAttribute('aria-label');
  if (!hadAriaLabel) {
    el.setAttribute('aria-label', fullText);
  }

  let remaining = leaves.length;
  const restoreLeafFns: (() => void)[] = [];
  let observer: IntersectionObserver | null = null;
  let cleanedUp = false;

  const cleanupHost = () => {
    if (cleanedUp) return;
    cleanedUp = true;
    observer?.disconnect();
    observer = null;
    activeRestorers.delete(el);
    if (!hadAriaLabel) {
      el.removeAttribute('aria-label');
    }
  };

  for (const leaf of leaves) {
    const originalText = leaf.textContent ?? '';
    const prevAriaHidden = leaf.getAttribute('aria-hidden');
    leaf.setAttribute('aria-hidden', 'true');

    let settled = false;
    const finalize = () => {
      if (settled) return;
      settled = true;
      leaf.textContent = originalText;
      if (prevAriaHidden === null) {
        leaf.removeAttribute('aria-hidden');
      } else {
        leaf.setAttribute('aria-hidden', prevAriaHidden);
      }
      remaining -= 1;
      if (remaining <= 0) {
        cleanupHost();
      }
    };

    const forceRestore = () => {
      if (settled) return;
      gsap.killTweensOf(leaf);
      finalize();
    };
    restoreLeafFns.push(forceRestore);

    const scrambleVars = {
      text: originalText,
      chars,
      speed: 0.6,
      revealDelay: 0.15,
      tweenLength: false,
      trim: false,
    } as NonNullable<gsap.TweenVars['scrambleText']>;

    gsap.to(leaf, {
      duration,
      delay,
      ease: 'none',
      scrambleText: scrambleVars,
      onComplete: finalize,
      onInterrupt: finalize,
    });
  }

  activeRestorers.set(el, () => {
    for (const restoreLeaf of restoreLeafFns) {
      restoreLeaf();
    }
    cleanupHost();
  });

  if (typeof IntersectionObserver !== 'undefined') {
    let sawVisible = false;
    observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            sawVisible = true;
          } else if (sawVisible) {
            restoreScramble(el);
          }
        }
      },
      { threshold: 0 },
    );
    observer.observe(el);
  }
}
