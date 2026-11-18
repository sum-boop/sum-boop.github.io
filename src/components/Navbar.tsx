import { AnimatePresence, m, useMotionValueEvent, useScroll } from 'framer-motion';
import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { Command, Moon, Sun, X } from 'lucide-react';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useScrollSpy } from '@/hooks/useScrollSpy';
import type { ThemeMode } from '@/hooks/useTheme';
import { ScrollProgress, motionDurations, motionEasings } from '@/motion';
import { Clock } from './Clock';

interface NavbarProps {
  theme: ThemeMode;
  onToggleTheme: (origin?: { x: number; y: number }) => void;
  onOpenPalette: () => void;
}

const links = [
  { href: '#operations', label: 'Works' },
  { href: '#about', label: 'Services' },
  { href: '#footprint', label: 'About' },
  { href: '#contact', label: 'Contact' },
] as const;

const mobileLinks = [
  { href: '#hero', label: 'Home' },
  { href: '#operations', label: 'Works' },
  { href: '#about', label: 'Services' },
  { href: '#footprint', label: 'About' },
  { href: '#experience', label: 'Logbook' },
  { href: '#certifications', label: 'Credentials' },
  { href: '#contact', label: 'Contact' },
] as const;

const sectionIds = [
  'hero',
  'about',
  'skills',
  'footprint',
  'operations',
  'experience',
  'certifications',
  'contact',
] as const;

function SparkLogo({ size = 20 }: { size?: number }) {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height={size}
      viewBox="0 0 24 28"
      width={Math.round((size * 24) / 28)}
    >
      <path d="M13.5 1.5L3 15h8.2L9.4 26.5L21 12.2h-8.3l.8-10.7Z" fill="currentColor" />
    </svg>
  );
}

export const Navbar = memo(function Navbar({
  theme,
  onToggleTheme,
  onOpenPalette,
}: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuToggleRef = useRef<HTMLButtonElement>(null);
  const closeMenuRef = useRef<HTMLButtonElement>(null);
  const activeSection = useScrollSpy(sectionIds);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, 'change', (latest) => {
    const isScrolled = latest > 24;
    setScrolled((prev) => (prev === isScrolled ? prev : isScrolled));
  });

  useEffect(() => {
    document.body.classList.toggle('menu-open', menuOpen);
    return () => {
      document.body.classList.remove('menu-open');
    };
  }, [menuOpen]);

  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (!menuOpen) return;
    closeMenuRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuOpen(false);
        menuToggleRef.current?.focus();
      }
    };
    const mq = window.matchMedia('(min-width: 768px)');
    const onViewportChange = (event: MediaQueryListEvent) => {
      if (event.matches) setMenuOpen(false);
    };

    window.addEventListener('keydown', onKeyDown);
    mq.addEventListener('change', onViewportChange);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      mq.removeEventListener('change', onViewportChange);
    };
  }, [menuOpen]);

  const handleThemeClick = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      if (event.clientX > 0 || event.clientY > 0) {
        onToggleTheme({ x: event.clientX, y: event.clientY });
      } else {
        const rect = event.currentTarget.getBoundingClientRect();
        onToggleTheme({
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
        });
      }
    },
    [onToggleTheme],
  );

  return (
    <>
      <ScrollProgress />
      <header
        className={`site-header ${scrolled ? 'site-header--scrolled' : ''}`}
        id="site-navigation"
      >
        <nav aria-label="Primary navigation" className="nav-shell">
          <a aria-label="Sumit Anand — Home" className="brand-mark" href="#hero">
            <span aria-hidden="true" className="brand-symbol">
              <SparkLogo size={20} />
            </span>
            <span className="brand-text">
              Sumit<span className="brand-surname"> Anand</span>
            </span>
          </a>

          <div className="desktop-nav">
            {links.map((link) => {
              const active = activeSection === link.href.slice(1);
              return (
                <a
                  aria-current={active ? 'location' : undefined}
                  className={`nav-link hover-underline-animation ${active ? 'nav-link--active' : ''}`}
                  href={link.href}
                  key={link.href}
                >
                  {link.label}
                </a>
              );
            })}
          </div>

          <button
            aria-controls="mobile-nav-overlay"
            aria-expanded={menuOpen}
            aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            className="menu-toggle"
            id="hamburger-btn"
            onClick={() => setMenuOpen((prev) => !prev)}
            ref={menuToggleRef}
            type="button"
          >
            <svg aria-hidden="true" className="hamburger-svg" viewBox="0 0 64 64">
              <line stroke="currentColor" strokeWidth="2.5" x1="14" x2="50" y1="22" y2="22" />
              <line stroke="currentColor" strokeWidth="2.5" x1="26" x2="50" y1="32" y2="32" />
              <line stroke="currentColor" strokeWidth="2.5" x1="34" x2="50" y1="42" y2="42" />
            </svg>
          </button>
        </nav>
      </header>

      <AnimatePresence>
        {menuOpen ? (
          <>
            <m.div
              animate={{ opacity: 1 }}
              aria-hidden="true"
              className="mobile-nav-backdrop"
              exit={{ opacity: 0 }}
              initial={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)}
              transition={{
                duration: prefersReducedMotion ? 0.01 : motionDurations.micro,
                ease: motionEasings.out,
              }}
            />
            <m.div
              animate={{ opacity: 1 }}
              aria-label="Mobile navigation overlay"
              aria-modal="true"
              className="mobile-nav-overlay"
              data-open="true"
              exit={{ opacity: 0 }}
              id="mobile-nav-overlay"
              initial={{ opacity: 0 }}
              role="dialog"
              transition={{
                duration: prefersReducedMotion ? 0.01 : motionDurations.fast,
                ease: motionEasings.out,
              }}
            >
              <div className="mobile-nav-head">
                <a
                  aria-label="Sumit Anand — Home"
                  className="brand-mark brand-mark--modal"
                  href="#hero"
                  onClick={() => setMenuOpen(false)}
                >
                  <span aria-hidden="true" className="brand-symbol">
                    <SparkLogo size={20} />
                  </span>
                  <span className="brand-text">Sumit Anand</span>
                </a>
                <button
                  aria-label="Close navigation menu"
                  className="mobile-nav-close-circle"
                  onClick={() => {
                    setMenuOpen(false);
                    menuToggleRef.current?.focus();
                  }}
                  ref={closeMenuRef}
                  type="button"
                >
                  <X aria-hidden="true" size={22} />
                </button>
              </div>

              <nav aria-label="Mobile sections" className="mobile-nav-links">
                {mobileLinks.map((link) => {
                  const active = activeSection === link.href.slice(1);
                  return (
                    <a
                      aria-current={active ? 'location' : undefined}
                      className="mobile-nav-link"
                      href={link.href}
                      key={link.href}
                      onClick={() => setMenuOpen(false)}
                    >
                      <span>{link.label}</span>
                    </a>
                  );
                })}
              </nav>

              <div className="mobile-nav-utilities">
                <Clock className="mobile-nav-clock" variant="nav" />
                <div className="mobile-nav-util-row">
                  <button
                    className="mobile-nav-util-btn"
                    onClick={() => {
                      setMenuOpen(false);
                      onOpenPalette();
                    }}
                    type="button"
                  >
                    <Command aria-hidden="true" size={14} />
                    Quick search
                  </button>
                  <button className="mobile-nav-util-btn" onClick={handleThemeClick} type="button">
                    {theme === 'dark' ? (
                      <Sun aria-hidden="true" size={14} />
                    ) : (
                      <Moon aria-hidden="true" size={14} />
                    )}
                    {theme === 'dark' ? 'Light theme' : 'Dark theme'}
                  </button>
                </div>
              </div>
            </m.div>
          </>
        ) : null}
      </AnimatePresence>
    </>
  );
});
