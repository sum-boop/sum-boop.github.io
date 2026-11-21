import { ScrollTrigger } from 'gsap/ScrollTrigger';

/**
 * 5lab's services page keeps a round "Talk to 5Lab" button floating bottom-right.
 * Same idea here: a round "Talk to me" button that appears after the hero and
 * hides again once the Contact section is on screen.
 */
export function initTalkButton(): () => void {
  if (typeof document === 'undefined') return () => undefined;
  if (document.getElementById('talk-button')) return () => undefined;

  const link = document.createElement('a');
  link.id = 'talk-button';
  link.href = '#contact';
  link.setAttribute('data-curtain', 'true');
  link.setAttribute('aria-label', 'Talk to me: jump to the contact section');
  link.textContent = 'Talk to me';
  link.style.cssText = [
    'position:fixed',
    'right:clamp(12px,2vw,28px)',
    'bottom:84px',
    'z-index:950',
    'width:64px',
    'height:64px',
    'border-radius:50%',
    'display:grid',
    'place-items:center',
    'text-align:center',
    'font:500 11px/1.15 var(--font-body, system-ui, sans-serif)',
    'color:#fff',
    'text-decoration:none',
    'background:radial-gradient(circle at 32% 28%,#FF7A9C 0%,#E83E75 38%,#B72A5D 100%)',
    'box-shadow:0 0 28px 4px rgba(232,62,117,.45)',
    'opacity:0',
    'transform:scale(.8)',
    'pointer-events:none',
    'transition:opacity 260ms ease,transform 260ms cubic-bezier(.22,1,.36,1)',
  ].join(';');
  document.body.appendChild(link);

  const setVisible = (visible: boolean) => {
    link.style.opacity = visible ? '1' : '0';
    link.style.transform = visible ? 'scale(1)' : 'scale(.8)';
    link.style.pointerEvents = visible ? 'auto' : 'none';
  };

  const contact = document.getElementById('contact');
  const trigger = ScrollTrigger.create({
    start: () => window.innerHeight * 1.5,
    endTrigger: contact ?? undefined,
    end: contact ? 'top 60%' : 'max',
    onToggle: (self) => setVisible(self.isActive),
  });

  return () => {
    trigger.kill();
    link.remove();
  };
}
