export type SplitUnitMode = 'letters' | 'words';

export interface SplitTextOptions {
  mode?: SplitUnitMode;
  depth3D?: boolean;
}

function hasTransparentTextFill(element: Element | null): boolean {
  if (!element || typeof window === 'undefined') return false;
  let current: Element | null = element;
  while (current && current !== document.body) {
    const computed = window.getComputedStyle(current);
    const fill = computed.getPropertyValue('-webkit-text-fill-color').trim().toLowerCase();
    if (fill === 'transparent' || fill === 'rgba(0, 0, 0, 0)') {
      return true;
    }
    current = current.parentElement;
  }
  return false;
}

function applyGradientTextStyles(span: HTMLSpanElement): void {
  span.style.background = 'var(--hero-title-gradient)';
  span.style.setProperty('-webkit-background-clip', 'text');
  span.style.backgroundClip = 'text';
  span.style.setProperty('-webkit-text-fill-color', 'transparent');
}

function splitTextNode(
  textNode: Text,
  mode: SplitUnitMode,
  depth3D: boolean,
  units: HTMLElement[],
): DocumentFragment {
  const fragment = document.createDocumentFragment();
  const value = textNode.nodeValue ?? '';
  const inheritGradient = hasTransparentTextFill(textNode.parentElement);
  const tokens = value.split(/(\s+)/);

  for (const token of tokens) {
    if (!token) continue;

    if (/^\s+$/.test(token)) {
      fragment.appendChild(document.createTextNode(token));
      continue;
    }

    const wordMask = document.createElement('span');
    wordMask.setAttribute('aria-hidden', 'true');
    wordMask.dataset.splitMask = 'true';
    wordMask.style.display = 'inline-block';
    wordMask.style.overflow = depth3D ? 'visible' : 'hidden';
    wordMask.style.verticalAlign = 'bottom';
    wordMask.style.lineHeight = 'inherit';
    wordMask.style.whiteSpace = 'nowrap';
    wordMask.style.paddingBottom = '0.08em';
    wordMask.style.marginBottom = '-0.08em';
    if (depth3D) {
      wordMask.style.perspective = '1100px';
      wordMask.style.transformStyle = 'preserve-3d';
    }

    if (mode === 'words') {
      const wordSpan = document.createElement('span');
      wordSpan.setAttribute('aria-hidden', 'true');
      wordSpan.dataset.splitUnit = 'true';
      wordSpan.style.display = 'inline-block';
      if (depth3D) {
        wordSpan.style.transformOrigin = '50% 62% -26px';
        wordSpan.style.backfaceVisibility = 'hidden';
      }
      wordSpan.textContent = token;
      if (inheritGradient) {
        applyGradientTextStyles(wordSpan);
      }
      wordMask.appendChild(wordSpan);
      units.push(wordSpan);
    } else {
      for (const char of Array.from(token)) {
        const charSpan = document.createElement('span');
        charSpan.setAttribute('aria-hidden', 'true');
        charSpan.dataset.splitUnit = 'true';
        charSpan.style.display = 'inline-block';
        if (depth3D) {
          charSpan.style.transformOrigin = '50% 62% -22px';
          charSpan.style.backfaceVisibility = 'hidden';
        }
        charSpan.textContent = char;
        if (inheritGradient) {
          applyGradientTextStyles(charSpan);
        }
        wordMask.appendChild(charSpan);
        units.push(charSpan);
      }
    }

    fragment.appendChild(wordMask);
  }

  return fragment;
}

function collectTextNodes(root: Node, out: Text[]): void {
  for (const child of Array.from(root.childNodes)) {
    if (child.nodeType === Node.TEXT_NODE) {
      if ((child.nodeValue ?? '').trim().length > 0) {
        out.push(child as Text);
      }
    } else if (child.nodeType === Node.ELEMENT_NODE) {
      collectTextNodes(child, out);
    }
  }
}

/**
 * Idempotently wraps words and letters into `inline-block` spans while preserving
 * child elements, gradient fills, and accessible labels.
 */
export function splitText(
  el: HTMLElement | null,
  modeOrOptions: SplitUnitMode | SplitTextOptions = 'letters',
): HTMLElement[] {
  if (!el) return [];

  const mode: SplitUnitMode =
    typeof modeOrOptions === 'string' ? modeOrOptions : (modeOrOptions.mode ?? 'letters');
  const depth3D = typeof modeOrOptions === 'object' ? Boolean(modeOrOptions.depth3D) : false;

  if (el.dataset.splitDone === 'true') {
    return Array.from(el.querySelectorAll<HTMLElement>('[data-split-unit="true"]'));
  }

  const originalText = (el.dataset.originalText ?? el.textContent ?? '')
    .replace(/\s+/g, ' ')
    .trim();
  if (originalText) {
    el.dataset.originalText = originalText;
    if (!el.getAttribute('aria-label')) {
      el.setAttribute('aria-label', originalText);
    }
  }

  const textNodes: Text[] = [];
  collectTextNodes(el, textNodes);

  const units: HTMLElement[] = [];
  for (const textNode of textNodes) {
    const parent = textNode.parentNode;
    if (!parent) continue;
    const fragment = splitTextNode(textNode, mode, depth3D, units);
    parent.replaceChild(fragment, textNode);
  }

  for (const child of Array.from(el.children)) {
    if (child instanceof HTMLElement && !child.dataset.splitMask) {
      child.setAttribute('aria-hidden', 'true');
    }
  }

  el.dataset.splitDone = 'true';
  return units;
}
