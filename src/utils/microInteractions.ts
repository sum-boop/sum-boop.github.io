import { useEffect, useRef } from 'react';

interface ToastPayload {
  type: 'success' | 'error' | 'info';
  title: string;
  message: string;
}

type ShowToastFn = (toast: ToastPayload) => void;

const STYLE_ID = 'micro-interactions-style';
const BUTTON_SELECTOR =
  '.button, .btn, .btn-signal, .btn-ghost, .btn-icon, .icon-button, .nav-cta, .feed-filter, .corridor-chip, .channel-tab, .vms-tab, .form-submit';
const MAGNETIC_SELECTOR =
  '.nav-cta, .form-submit, .button--primary:not(.magnetic-button), .btn-signal';

const INJECTED_CSS = `
/* Task A4: Theme-aware Micro-Interactions */
.button,
.btn,
.btn-signal,
.btn-ghost,
.btn-icon,
.icon-button,
.nav-cta,
.feed-filter,
.corridor-chip,
.channel-tab,
.vms-tab,
.form-submit {
  position: relative;
  overflow: hidden;
  transition:
    transform 220ms cubic-bezier(0.22, 1, 0.36, 1),
    box-shadow 220ms cubic-bezier(0.22, 1, 0.36, 1),
    border-color 220ms cubic-bezier(0.22, 1, 0.36, 1),
    background-color 220ms cubic-bezier(0.22, 1, 0.36, 1),
    color 220ms cubic-bezier(0.22, 1, 0.36, 1);
}

@media (hover: hover) and (pointer: fine) and (min-width: 768px) {
  .button:not(:disabled):hover,
  .btn:not(:disabled):hover,
  .btn-signal:not(:disabled):hover,
  .btn-ghost:not(:disabled):hover,
  .btn-icon:not(:disabled):hover,
  .icon-button:not(:disabled):hover,
  .nav-cta:not(:disabled):hover,
  .feed-filter:not(:disabled):hover,
  .corridor-chip:not(:disabled):hover,
  .channel-tab:not(:disabled):hover,
  .vms-tab:not(:disabled):hover,
  .form-submit:not(:disabled):hover {
    transform: translateY(-2px) scale(1.03);
    box-shadow:
      0 10px 24px rgba(var(--accent-rgb, 0, 229, 255), 0.24),
      0 0 0 1px rgba(var(--accent-rgb, 0, 229, 255), 0.32);
  }
}

.is-pressed {
  transform: translateY(0) scale(0.97) !important;
  box-shadow: 0 2px 8px rgba(var(--accent-rgb, 0, 229, 255), 0.14) !important;
  transition-duration: 90ms !important;
}

/* Ripple */
.mi-ripple {
  position: absolute;
  border-radius: 50%;
  pointer-events: none;
  background: radial-gradient(
    circle,
    rgba(var(--accent-rgb, 0, 229, 255), 0.42) 0%,
    rgba(var(--accent-rgb, 0, 229, 255), 0.12) 60%,
    transparent 100%
  );
  transform: scale(0);
  opacity: 0.85;
  animation: mi-ripple-expand 480ms cubic-bezier(0.22, 1, 0.36, 1) forwards;
}

@keyframes mi-ripple-expand {
  to {
    transform: scale(1);
    opacity: 0;
  }
}

/* Form submit spinner + SVG checkmark */
.form-submit.is-loading::after {
  content: none;
  display: none;
}

.mi-spinner {
  display: inline-block;
  width: 15px;
  height: 15px;
  flex-shrink: 0;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: currentColor;
  border-radius: 50%;
  animation: mi-spin 0.72s linear infinite;
}

@keyframes mi-spin {
  to {
    transform: rotate(360deg);
  }
}

.form-submit.is-success {
  background-color: var(--color-accent-lime, #00ff9c) !important;
  border-color: var(--color-accent-lime, #00ff9c) !important;
  color: var(--color-on-accent, #05110d) !important;
  box-shadow: 0 10px 26px rgba(var(--status-rgb, 0, 255, 156), 0.32) !important;
}

.mi-check-svg {
  width: 17px;
  height: 17px;
  flex-shrink: 0;
}

.mi-check-path {
  fill: none;
  stroke: currentColor;
  stroke-width: 2.5;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-dasharray: 28;
  stroke-dashoffset: 28;
  animation: mi-check-draw 450ms cubic-bezier(0.22, 1, 0.36, 1) forwards;
}

@keyframes mi-check-draw {
  to {
    stroke-dashoffset: 0;
  }
}

/* Floating-label input underline sweep + valid indicator */
.form-field {
  position: relative;
}

.mi-field-sweep {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 2px;
  border-radius: 999px;
  background: var(--color-accent-cyan, var(--accent, #00e5ff));
  transform: scaleX(0);
  transform-origin: left center;
  opacity: 0;
  pointer-events: none;
  transition:
    transform 260ms cubic-bezier(0.22, 1, 0.36, 1),
    opacity 200ms ease;
}

.form-field:focus-within .mi-field-sweep {
  transform: scaleX(1);
  opacity: 1;
}

.form-field:focus-within input,
.form-field:focus-within textarea {
  box-shadow: 0 0 0 3px rgba(var(--accent-rgb, 0, 229, 255), 0.14);
}

.mi-field-valid {
  position: absolute;
  top: 0.95rem;
  right: 0.85rem;
  display: inline-grid;
  place-items: center;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  font-size: 11px;
  font-weight: 700;
  line-height: 1;
  color: var(--color-on-accent, #04130e);
  background: var(--color-accent-lime, #00ff9c);
  opacity: 0;
  transform: scale(0.7);
  pointer-events: none;
  transition:
    opacity 180ms ease,
    transform 220ms cubic-bezier(0.22, 1, 0.36, 1);
}

.form-field.mi-is-valid .mi-field-valid {
  opacity: 1;
  transform: scale(1);
}

/* Camera feed REC badge highlight & scanline sweep */
@media (hover: hover) and (pointer: fine) and (min-width: 768px) {
  .feed-card:hover .feed-image-label {
    border-color: rgba(var(--accent-rgb, 0, 229, 255), 0.65);
    color: var(--accent-cyan-text, #7ec2e8);
    box-shadow: 0 0 14px rgba(var(--accent-rgb, 0, 229, 255), 0.28);
    animation: mi-rec-blink 0.9s ease-in-out infinite;
  }
}

@keyframes mi-rec-blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.68; }
}

.mi-card-scanline {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 4;
  background: linear-gradient(
    180deg,
    transparent 0%,
    rgba(var(--accent-rgb, 0, 229, 255), 0.16) 48%,
    rgba(var(--accent-rgb, 0, 229, 255), 0.34) 50%,
    rgba(var(--accent-rgb, 0, 229, 255), 0.1) 54%,
    transparent 100%
  );
  transform: translateY(-100%);
  animation: mi-scanline-sweep 620ms cubic-bezier(0.22, 1, 0.36, 1) forwards;
}

@keyframes mi-scanline-sweep {
  from {
    transform: translateY(-100%);
    opacity: 0.95;
  }
  to {
    transform: translateY(100%);
    opacity: 0.1;
  }
}

/* Nav glide indicator */
.desktop-nav {
  position: relative;
}

.mi-nav-glide {
  position: absolute;
  left: 0;
  bottom: -2px;
  width: 100px;
  height: 2px;
  border-radius: 999px;
  pointer-events: none;
  opacity: 0;
  transform-origin: left center;
  background: linear-gradient(
    90deg,
    var(--color-accent-cyan, var(--accent, #00e5ff)),
    var(--color-accent-violet, #a78bfa)
  );
  transition:
    transform 240ms cubic-bezier(0.22, 1, 0.36, 1),
    opacity 160ms ease;
}

@media (prefers-reduced-motion: reduce) {
  .button,
  .btn,
  .btn-signal,
  .btn-ghost,
  .btn-icon,
  .icon-button,
  .nav-cta,
  .feed-filter,
  .corridor-chip,
  .channel-tab,
  .vms-tab,
  .form-submit,
  .mi-field-sweep,
  .mi-field-valid,
  .mi-nav-glide {
    transition: none !important;
  }

  .mi-ripple,
  .mi-card-scanline {
    display: none !important;
  }

  .mi-spinner {
    animation: none !important;
    border-style: dashed;
  }

  .mi-check-path {
    animation: none !important;
    stroke-dashoffset: 0 !important;
  }

  .feed-card:hover .feed-image-label {
    animation: none !important;
  }
}
`;

export function injectMicroInteractionStyles(): void {
  if (typeof document === 'undefined') return;
  if (document.getElementById(STYLE_ID)) return;

  const styleEl = document.createElement('style');
  styleEl.id = STYLE_ID;
  styleEl.textContent = INJECTED_CSS;
  document.head.appendChild(styleEl);
}

async function copyTextSafe(text: string): Promise<boolean> {
  if (!text) return false;
  try {
    if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // Fallback below
  }

  try {
    const helper = document.createElement('textarea');
    helper.value = text;
    helper.setAttribute('readonly', '');
    helper.style.position = 'fixed';
    helper.style.opacity = '0';
    helper.style.pointerEvents = 'none';
    document.body.appendChild(helper);
    helper.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(helper);
    return ok;
  } catch {
    return false;
  }
}

export function useMicroInteractions(showToast: ShowToastFn): void {
  const showToastRef = useRef(showToast);

  useEffect(() => {
    showToastRef.current = showToast;
  }, [showToast]);

  useEffect(() => {
    injectMicroInteractionStyles();

    const reducedQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const coarseQuery = window.matchMedia('(pointer: coarse)');
    const narrowQuery = window.matchMedia('(max-width: 767px)');

    const temporaryNodes = new Set<HTMLElement>();
    const activeTimers = new Set<number>();

    // Enhance existing form fields idempotently with underline sweep + valid badge
    const enhanceFormFields = () => {
      const fields = document.querySelectorAll<HTMLElement>('.form-field');
      fields.forEach((field) => {
        if (!field.querySelector('.mi-field-sweep')) {
          const sweep = document.createElement('span');
          sweep.className = 'mi-field-sweep';
          sweep.setAttribute('aria-hidden', 'true');
          field.appendChild(sweep);
          temporaryNodes.add(sweep);
        }
        if (!field.querySelector('.mi-field-valid')) {
          const badge = document.createElement('span');
          badge.className = 'mi-field-valid';
          badge.setAttribute('aria-hidden', 'true');
          badge.textContent = '✓';
          field.appendChild(badge);
          temporaryNodes.add(badge);
        }
      });
    };

    enhanceFormFields();

    const fieldObserver =
      typeof MutationObserver !== 'undefined'
        ? new MutationObserver(() => enhanceFormFields())
        : null;
    fieldObserver?.observe(document.body, { childList: true, subtree: true });

    // Button press + keyboard Enter/Space press feedback
    const clearPressed = (target: EventTarget | null) => {
      if (!(target instanceof Element)) return;
      const btn = target.closest<HTMLElement>(BUTTON_SELECTOR);
      btn?.classList.remove('is-pressed');
    };

    const onPointerDown = (event: PointerEvent) => {
      if (!(event.target instanceof Element)) return;
      const btn = event.target.closest<HTMLElement>(BUTTON_SELECTOR);
      if (!btn || btn.hasAttribute('disabled') || btn.getAttribute('aria-disabled') === 'true') {
        return;
      }
      btn.classList.add('is-pressed');
    };

    const onPointerRelease = (event: PointerEvent) => {
      clearPressed(event.target);
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      if (!(event.target instanceof Element)) return;
      const btn = event.target.closest<HTMLElement>(BUTTON_SELECTOR);
      if (!btn || btn.hasAttribute('disabled')) return;
      btn.classList.add('is-pressed');
      const timer = window.setTimeout(() => {
        activeTimers.delete(timer);
        btn.classList.remove('is-pressed');
      }, 150);
      activeTimers.add(timer);
    };

    // Click delegation: ripple + [data-copy] clipboard toast
    const onDocumentClick = (event: MouseEvent) => {
      if (!(event.target instanceof Element)) return;

      const copyTrigger = event.target.closest<HTMLElement>('[data-copy]');
      if (copyTrigger) {
        const value = copyTrigger.dataset.copy || copyTrigger.textContent?.trim() || '';
        if (value) {
          void copyTextSafe(value).then((copied) => {
            showToastRef.current({
              type: copied ? 'success' : 'info',
              title: copied ? 'COPIED TO CLIPBOARD' : 'COPY UNAVAILABLE',
              message: value,
            });
          });
        }
      }

      if (reducedQuery.matches) return;
      const btn = event.target.closest<HTMLElement>(BUTTON_SELECTOR);
      if (!btn || btn.hasAttribute('disabled') || btn.classList.contains('is-loading')) return;

      const rect = btn.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;

      const size = Math.max(rect.width, rect.height) * 1.45;
      const clickX = event.clientX > 0 ? event.clientX - rect.left : rect.width / 2;
      const clickY = event.clientY > 0 ? event.clientY - rect.top : rect.height / 2;

      const ripple = document.createElement('span');
      ripple.className = 'mi-ripple';
      ripple.setAttribute('aria-hidden', 'true');
      ripple.style.width = `${size}px`;
      ripple.style.height = `${size}px`;
      ripple.style.left = `${clickX - size / 2}px`;
      ripple.style.top = `${clickY - size / 2}px`;

      btn.appendChild(ripple);
      temporaryNodes.add(ripple);

      const cleanupRipple = () => {
        temporaryNodes.delete(ripple);
        if (ripple.parentNode) ripple.parentNode.removeChild(ripple);
      };

      ripple.addEventListener('animationend', cleanupRipple, { once: true });
      const safetyTimer = window.setTimeout(() => {
        activeTimers.delete(safetyTimer);
        cleanupRipple();
      }, 540);
      activeTimers.add(safetyTimer);
    };

    // Delegated form field validity badge on blur/input
    const updateFieldValidity = (el: HTMLInputElement | HTMLTextAreaElement) => {
      const wrapper = el.closest<HTMLElement>('.form-field');
      if (!wrapper) return;
      const trimmed = el.value.trim();
      const valid = trimmed.length > 0 && el.checkValidity();
      wrapper.classList.toggle('mi-is-valid', valid);
    };

    const onFocusOut = (event: FocusEvent) => {
      const target = event.target;
      if (
        (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) &&
        target.closest('.form-field')
      ) {
        updateFieldValidity(target);
      }
    };

    const onInput = (event: Event) => {
      const target = event.target;
      if (
        (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) &&
        target.closest('.form-field')
      ) {
        const wrapper = target.closest<HTMLElement>('.form-field');
        if (wrapper && target.value.trim().length === 0) {
          wrapper.classList.remove('mi-is-valid');
        }
      }
    };

    // Camera feed scanline sweep (fine pointer desktop only)
    const onPointerOver = (event: PointerEvent) => {
      if (
        event.pointerType === 'touch' ||
        reducedQuery.matches ||
        coarseQuery.matches ||
        narrowQuery.matches
      ) {
        return;
      }
      if (!(event.target instanceof Element)) return;

      const card = event.target.closest<HTMLElement>('.feed-card');
      if (card) {
        const related = event.relatedTarget instanceof Node ? event.relatedTarget : null;
        if (!related || !card.contains(related)) {
          const imageWrap = card.querySelector<HTMLElement>('.feed-image-wrap');
          if (imageWrap && !imageWrap.querySelector('.mi-card-scanline')) {
            const scanline = document.createElement('span');
            scanline.className = 'mi-card-scanline';
            scanline.setAttribute('aria-hidden', 'true');
            imageWrap.appendChild(scanline);
            temporaryNodes.add(scanline);

            const removeScan = () => {
              temporaryNodes.delete(scanline);
              if (scanline.parentNode) scanline.parentNode.removeChild(scanline);
            };
            scanline.addEventListener('animationend', removeScan, { once: true });
            const timer = window.setTimeout(() => {
              activeTimers.delete(timer);
              removeScan();
            }, 680);
            activeTimers.add(timer);
          }
        }
      }

      // Desktop nav glide indicator
      const navLink = event.target.closest<HTMLElement>('.desktop-nav .nav-link');
      if (navLink) {
        const navContainer = navLink.closest<HTMLElement>('.desktop-nav');
        if (navContainer) {
          let glide = navContainer.querySelector<HTMLElement>('.mi-nav-glide');
          if (!glide) {
            glide = document.createElement('span');
            glide.className = 'mi-nav-glide';
            glide.setAttribute('aria-hidden', 'true');
            navContainer.appendChild(glide);
            temporaryNodes.add(glide);
          }
          const containerRect = navContainer.getBoundingClientRect();
          const linkRect = navLink.getBoundingClientRect();
          const offsetX = linkRect.left - containerRect.left;
          const scaleX = Math.max(0.01, linkRect.width / 100);
          glide.style.transform = `translate3d(${offsetX.toFixed(1)}px, 0, 0) scaleX(${scaleX.toFixed(4)})`;
          glide.style.opacity = '1';
        }
      }
    };

    const onPointerOut = (event: PointerEvent) => {
      if (!(event.target instanceof Element)) return;
      const desktopNav = event.target.closest<HTMLElement>('.desktop-nav');
      if (!desktopNav) return;
      const related = event.relatedTarget instanceof Node ? event.relatedTarget : null;
      if (related && desktopNav.contains(related)) return;

      const glide = desktopNav.querySelector<HTMLElement>('.mi-nav-glide');
      if (!glide) return;
      const activeLink = desktopNav.querySelector<HTMLElement>(
        '.nav-link[aria-current="location"]',
      );
      if (activeLink) {
        const containerRect = desktopNav.getBoundingClientRect();
        const linkRect = activeLink.getBoundingClientRect();
        const offsetX = linkRect.left - containerRect.left;
        const scaleX = Math.max(0.01, linkRect.width / 100);
        glide.style.transform = `translate3d(${offsetX.toFixed(1)}px, 0, 0) scaleX(${scaleX.toFixed(4)})`;
        glide.style.opacity = '0';
      } else {
        glide.style.opacity = '0';
      }
    };

    // Magnetic primary CTAs (rAF lerp within 60px radius, max 6px pull, fine pointers >= 768px)
    const magneticStates = new Map<
      HTMLElement,
      { currentX: number; currentY: number; targetX: number; targetY: number }
    >();
    let magneticRaf = 0;

    const resetMagneticTargets = () => {
      magneticStates.forEach((state, el) => {
        state.targetX = 0;
        state.targetY = 0;
        state.currentX = 0;
        state.currentY = 0;
        el.style.transform = '';
      });
      magneticStates.clear();
    };

    const tickMagnetic = () => {
      magneticRaf = 0;
      if (reducedQuery.matches || coarseQuery.matches || narrowQuery.matches) {
        resetMagneticTargets();
        return;
      }

      let hasPending = false;
      magneticStates.forEach((state, el) => {
        if (!el.isConnected) {
          magneticStates.delete(el);
          return;
        }
        state.currentX += (state.targetX - state.currentX) * 0.14;
        state.currentY += (state.targetY - state.currentY) * 0.14;

        const done =
          Math.abs(state.targetX - state.currentX) < 0.05 &&
          Math.abs(state.targetY - state.currentY) < 0.05 &&
          Math.abs(state.targetX) < 0.01 &&
          Math.abs(state.targetY) < 0.01;

        if (done) {
          el.style.transform = '';
          magneticStates.delete(el);
        } else {
          el.style.transform = `translate3d(${state.currentX.toFixed(2)}px, ${state.currentY.toFixed(2)}px, 0)`;
          hasPending = true;
        }
      });

      if (hasPending) {
        magneticRaf = window.requestAnimationFrame(tickMagnetic);
      }
    };

    const onPointerMove = (event: PointerEvent) => {
      if (
        event.pointerType === 'touch' ||
        reducedQuery.matches ||
        coarseQuery.matches ||
        narrowQuery.matches
      ) {
        return;
      }

      const candidates = document.querySelectorAll<HTMLElement>(MAGNETIC_SELECTOR);
      let anyNear = false;

      candidates.forEach((el) => {
        if (el.hasAttribute('disabled') || el.classList.contains('is-loading')) return;
        const rect = el.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const clampedX = Math.max(rect.left, Math.min(event.clientX, rect.right));
        const clampedY = Math.max(rect.top, Math.min(event.clientY, rect.bottom));
        const edgeDist = Math.hypot(event.clientX - clampedX, event.clientY - clampedY);

        if (edgeDist <= 60) {
          anyNear = true;
          const maxOffset = 6;
          const halfSpanX = Math.max(1, rect.width / 2 + 60);
          const halfSpanY = Math.max(1, rect.height / 2 + 60);
          const tx = Math.max(
            -maxOffset,
            Math.min(maxOffset, ((event.clientX - cx) / halfSpanX) * maxOffset * 1.4),
          );
          const ty = Math.max(
            -maxOffset,
            Math.min(maxOffset, ((event.clientY - cy) / halfSpanY) * maxOffset * 1.4),
          );

          const state = magneticStates.get(el) ?? {
            currentX: 0,
            currentY: 0,
            targetX: 0,
            targetY: 0,
          };
          state.targetX = tx;
          state.targetY = ty;
          magneticStates.set(el, state);
        } else {
          const existing = magneticStates.get(el);
          if (existing) {
            existing.targetX = 0;
            existing.targetY = 0;
            anyNear = true;
          }
        }
      });

      if ((anyNear || magneticStates.size > 0) && magneticRaf === 0) {
        magneticRaf = window.requestAnimationFrame(tickMagnetic);
      }
    };

    const onEnvironmentChange = () => {
      if (reducedQuery.matches || coarseQuery.matches || narrowQuery.matches) {
        if (magneticRaf !== 0) {
          window.cancelAnimationFrame(magneticRaf);
          magneticRaf = 0;
        }
        resetMagneticTargets();
      }
    };

    document.addEventListener('pointerdown', onPointerDown, { passive: true });
    document.addEventListener('pointerup', onPointerRelease, { passive: true });
    document.addEventListener('pointercancel', onPointerRelease, { passive: true });
    document.addEventListener('pointerleave', onPointerRelease, { passive: true });
    document.addEventListener('keydown', onKeyDown, { passive: true });
    document.addEventListener('click', onDocumentClick);
    document.addEventListener('focusout', onFocusOut, { passive: true });
    document.addEventListener('input', onInput, { passive: true });
    document.addEventListener('pointerover', onPointerOver, { passive: true });
    document.addEventListener('pointerout', onPointerOut, { passive: true });
    document.addEventListener('pointermove', onPointerMove, { passive: true });
    reducedQuery.addEventListener('change', onEnvironmentChange);
    coarseQuery.addEventListener('change', onEnvironmentChange);
    narrowQuery.addEventListener('change', onEnvironmentChange);

    return () => {
      fieldObserver?.disconnect();
      if (magneticRaf !== 0) {
        window.cancelAnimationFrame(magneticRaf);
      }
      resetMagneticTargets();
      activeTimers.forEach((id) => window.clearTimeout(id));
      activeTimers.clear();
      temporaryNodes.forEach((node) => {
        if (node.parentNode) node.parentNode.removeChild(node);
      });
      temporaryNodes.clear();

      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('pointerup', onPointerRelease);
      document.removeEventListener('pointercancel', onPointerRelease);
      document.removeEventListener('pointerleave', onPointerRelease);
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('click', onDocumentClick);
      document.removeEventListener('focusout', onFocusOut);
      document.removeEventListener('input', onInput);
      document.removeEventListener('pointerover', onPointerOver);
      document.removeEventListener('pointerout', onPointerOut);
      document.removeEventListener('pointermove', onPointerMove);
      reducedQuery.removeEventListener('change', onEnvironmentChange);
      coarseQuery.removeEventListener('change', onEnvironmentChange);
      narrowQuery.removeEventListener('change', onEnvironmentChange);
    };
  }, []);
}
