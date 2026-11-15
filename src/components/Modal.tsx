import { AnimatePresence, m } from 'framer-motion';
import { useEffect, useRef, type MouseEvent, type PropsWithChildren } from 'react';
import { X } from 'lucide-react';
import { motionDurations, motionEasings, motionSprings } from '@/motion';

interface ModalProps extends PropsWithChildren {
  isOpen: boolean;
  titleId: string;
  onClose: () => void;
  onNavigate?: (direction: 'prev' | 'next') => void;
  className?: string;
}

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function Modal({
  isOpen,
  titleId,
  onClose,
  onNavigate,
  className = '',
  children,
}: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const previousFocus =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const dialog = dialogRef.current;
    document.body.classList.add('modal-open');
    dialog?.querySelector<HTMLElement>(FOCUSABLE_SELECTOR)?.focus({ preventScroll: true });

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }
      if (onNavigate && (event.key === 'ArrowLeft' || event.key === 'ArrowRight')) {
        const activeTag = document.activeElement?.tagName;
        if (activeTag !== 'INPUT' && activeTag !== 'TEXTAREA') {
          event.preventDefault();
          onNavigate(event.key === 'ArrowLeft' ? 'prev' : 'next');
          return;
        }
      }
      if (event.key !== 'Tab' || !dialog) return;

      const focusable = Array.from(dialog.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
        (element) =>
          !element.hasAttribute('hidden') && element.getAttribute('aria-hidden') !== 'true',
      );
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!first || !last) {
        event.preventDefault();
        dialog.focus();
      } else if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.classList.remove('modal-open');
      previousFocus?.focus({ preventScroll: true });
    };
  }, [isOpen, onClose, onNavigate]);

  const handleBackdrop = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) onClose();
  };

  return (
    <AnimatePresence>
      {isOpen ? (
        <m.div
          animate={{ opacity: 1 }}
          className="modal-backdrop"
          exit={{ opacity: 0 }}
          initial={{ opacity: 0 }}
          key="modal-backdrop"
          onMouseDown={handleBackdrop}
          transition={{ duration: motionDurations.micro, ease: motionEasings.out }}
        >
          <m.div
            animate={{ opacity: 1, y: 0, scale: 1 }}
            aria-labelledby={titleId}
            aria-modal="true"
            className={`modal-window ${className}`.trim()}
            exit={{ opacity: 0, y: 10, scale: 0.985 }}
            initial={{ opacity: 0, y: 14, scale: 0.985 }}
            ref={dialogRef}
            role="dialog"
            tabIndex={-1}
            transition={motionSprings.soft}
          >
            <button
              aria-label="Close dialog"
              className="icon-button modal-close"
              onClick={onClose}
              type="button"
            >
              <X aria-hidden="true" size={18} />
            </button>
            {children}
          </m.div>
        </m.div>
      ) : null}
    </AnimatePresence>
  );
}
