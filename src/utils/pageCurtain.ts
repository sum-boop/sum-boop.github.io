import gsap from 'gsap';

/**
 * 5lab-style page transition for menu clicks: two black panels close from the
 * left and right edges and meet at a thin white seam, the brand mark shows in
 * the middle, the page jumps to the target while covered, then the panels open
 * outward from the centre. Imperative DOM so it needs no React wiring.
 */

const NS = 'http://www.w3.org/2000/svg';
const APERTURE_PATHS = [
  'm14.31 8 5.74 9.94',
  'M9.69 8h11.48',
  'm7.38 12 5.74-9.94',
  'M9.69 16 3.95 6.06',
  'M14.31 16H2.83',
  'm16.62 12-5.74 9.94',
];

let root: HTMLDivElement | null = null;
let left: HTMLDivElement | null = null;
let right: HTMLDivElement | null = null;
let seam: HTMLDivElement | null = null;
let mark: HTMLDivElement | null = null;
let busy = false;

function build(): void {
  if (root) return;
  root = document.createElement('div');
  root.setAttribute('aria-hidden', 'true');
  root.style.cssText =
    'position:fixed;inset:0;z-index:100000;pointer-events:none;visibility:hidden;';

  const panel = (side: 'left' | 'right'): HTMLDivElement => {
    const el = document.createElement('div');
    el.style.cssText = `position:absolute;top:0;bottom:0;${side}:0;width:50.2%;background:#000;will-change:transform;`;
    return el;
  };
  left = panel('left');
  right = panel('right');

  seam = document.createElement('div');
  seam.style.cssText =
    'position:absolute;top:0;bottom:0;left:50%;width:1px;margin-left:-0.5px;background:#fff;opacity:0;';

  mark = document.createElement('div');
  mark.style.cssText =
    'position:absolute;left:50%;top:50%;width:44px;height:44px;margin:-22px 0 0 -22px;color:#F83858;opacity:0;';
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('width', '44');
  svg.setAttribute('height', '44');
  svg.setAttribute('fill', 'none');
  svg.setAttribute('stroke', 'currentColor');
  svg.setAttribute('stroke-width', '1.6');
  svg.setAttribute('stroke-linecap', 'round');
  svg.setAttribute('stroke-linejoin', 'round');
  const circle = document.createElementNS(NS, 'circle');
  circle.setAttribute('cx', '12');
  circle.setAttribute('cy', '12');
  circle.setAttribute('r', '10');
  svg.appendChild(circle);
  APERTURE_PATHS.forEach((d) => {
    const path = document.createElementNS(NS, 'path');
    path.setAttribute('d', d);
    svg.appendChild(path);
  });
  mark.appendChild(svg);

  root.append(left, right, seam, mark);
  document.body.appendChild(root);
}

export function playPageCurtain(onCovered: () => void): void {
  if (typeof document === 'undefined') {
    onCovered();
    return;
  }
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced || busy) {
    onCovered();
    return;
  }
  build();
  if (!root || !left || !right || !seam || !mark) {
    onCovered();
    return;
  }
  busy = true;
  const rootEl = root;
  gsap.set(rootEl, { visibility: 'visible', pointerEvents: 'auto' });
  gsap.set(left, { xPercent: -100 });
  gsap.set(right, { xPercent: 100 });
  gsap.set([seam, mark], { opacity: 0 });
  gsap.set(mark, { scale: 0.8 });

  const tl = gsap.timeline({
    onComplete: () => {
      gsap.set(rootEl, { visibility: 'hidden', pointerEvents: 'none' });
      busy = false;
    },
  });
  tl.to([left, right], { xPercent: 0, duration: 0.45, ease: 'power3.inOut' })
    .to(seam, { opacity: 1, duration: 0.15 }, '-=0.15')
    .to(mark, { opacity: 1, scale: 1, duration: 0.3, ease: 'power2.out' }, '-=0.1')
    .call(onCovered)
    .to({}, { duration: 0.35 })
    .to(mark, { opacity: 0, scale: 1.1, duration: 0.2, ease: 'power2.in' })
    .to(seam, { opacity: 0, duration: 0.15 }, '<')
    .to(left, { xPercent: -100, duration: 0.55, ease: 'power3.inOut' })
    .to(right, { xPercent: 100, duration: 0.55, ease: 'power3.inOut' }, '<');
}
