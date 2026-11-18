import { AnimatePresence, LayoutGroup, m, useMotionValueEvent, useScroll } from 'framer-motion';
import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { ArrowUpRight, Command, Moon, Sun, X } from 'lucide-react';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useScrollSpy } from '@/hooks/useScrollSpy';
import type { ThemeMode } from '@/hooks/useTheme';
import { ScrollProgress, motionDurations, motionEasings, motionSprings } from '@/motion';
import { Clock } from './Clock';

interface NavbarProps {
  theme: ThemeMode;
  onToggleTheme: (origin?: { x: number; y: number }) => void;
  onOpenPalette: () => void;
}

const links = [
  { href: '#about', label: 'Expertise' },
  { href: '#footprint', label: 'Footprint' },
  { href: '#operations', label: 'Deployments' },
  { href: '#experience', label: 'Logbook' },
  { href: '#contact', label: 'Contact' },
] as const;

const sectionIds = ['hero', 'about', 'footprint', 'operations', 'experience', 'contact'] as const;

function SparkLogo({ size = 18 }: { size?: number }) {
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
  const [navTone, setNavTone] = useState<'dark' | 'light'>('dark');
  const [menuOpen, setMenuOpen] = useState(false);
  const menuToggleRef = useRef<HTMLButtonElement>(null);
  const closeMenuRef = useRef<HTMLButtonElement>(null);
  const activeSection = useScrollSpy(sectionIds);
  const { scrollY } = useScroll();

  const updateNavTone = useCallback(() => {
    const headerSampleY = 36;
    const curtainEl = document.querySelector<HTMLElement>('.hero-curtain');
    const contactEl = document.getElementById('contact');

    if (theme === 'dark') {
      setNavTone('dark');
      return;
    }

    if (curtainEl) {
      const curtainRect = curtainEl.getBoundingClientRect();
      if (curtainRect.bottom > headerSampleY) {
        setNavTone('dark');
        return;
      }
    }

    if (contactEl) {
      const contactRect = contactEl.getBoundingClientRect();
      if (contactRect.top <= headerSampleY) {
        setNavTone('dark');
        return;
      }
    }

    setNavTone('light');
  }, [theme]);

  useMotionValueEvent(scrollY, 'change', (latest) => {
    const isScrolled = latest > 24;
    setScrolled((prev) => (prev === isScrolled ? prev : isScrolled));
    updateNavTone();
  });

  useEffect(() => {
    const syncScrollState = () => {
      const isScrolled = window.scrollY > 24;
      setScrolled((prev) => (prev === isScrolled ? prev : isScrolled));
      updateNavTone();
    };
    const rafId = window.requestAnimationFrame(syncScrollState);
    window.addEventListener('scroll', syncScrollState, { passive: true, capture: true });
    window.addEventListener('scrollend', syncScrollState, { passive: true });
    window.addEventListener('resize', syncScrollState, { passive: true });
    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener('scroll', syncScrollState, { capture: true });
      window.removeEventListener('scrollend', syncScrollState);
      window.removeEventListener('resize', syncScrollState);
    };
  }, [updateNavTone]);

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
    const mq = window.matchMedia('(min-width: 900px)');
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

  const scrollToContact = useCallback(() => {
    setMenuOpen(false);
    const contactEl = document.getElementById('contact');
    if (contactEl) {
      contactEl.scrollIntoView({ behavior: 'smooth' });
      const heading = document.getElementById('contact-title');
      heading?.setAttribute('tabindex', '-1');
      heading?.focus({ preventScroll: true });
    }
  }, []);

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
        data-nav-tone={navTone}
      >
        <nav aria-label="Primary navigation" className="nav-shell">
          <a aria-label="Sumit Anand — Home" className="brand-mark" href="#hero">
            <span aria-hidden="true" className="brand-symbol">
              <SparkLogo size={17} />
            </span>
            <span>
              Sumit<span className="brand-surname"> Anand</span>
            </span>
          </a>

          <LayoutGroup id="primary-navbar">
            <div className="desktop-nav">
              {links.map((link) => {
                const active = activeSection === link.href.slice(1);
                return (
                  <a
                    aria-current={active ? 'location' : undefined}
                    className="nav-link"
                    href={link.href}
                    key={link.href}
                  >
                    {link.label}
                    {active ? (
                      <m.span
                        aria-hidden="true"
                        className="nav-active-indicator"
                        layoutId="active-nav-indicator"
                        transition={motionSprings.snappy}
                      />
                    ) : null}
                  </a>
                );
              })}
            </div>
          </LayoutGroup>

          <div className="nav-actions">
            <Clock variant="nav" />
            <button
              aria-label="Open command palette (Ctrl+K)"
              className="icon-button nav-utility-btn nav-palette-btn"
              onClick={onOpenPalette}
              title="Command palette (Ctrl+K / ⌘K)"
              type="button"
            >
              <Command aria-hidden="true" size={16} />
            </button>
            <button
              aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
              className="icon-button nav-theme-btn"
              onClick={handleThemeClick}
              title={theme === 'dark' ? 'Light theme' : 'Dark theme'}
              type="button"
            >
              {theme === 'dark' ? (
                <Sun aria-hidden="true" size={16} />
              ) : (
                <Moon aria-hidden="true" size={16} />
              )}
            </button>
            <button
              aria-label="Let's talk — jump to contact section"
              className="nav-cta"
              onClick={scrollToContact}
              type="button"
            >
              Let&apos;s talk <ArrowUpRight aria-hidden="true" size={14} />
            </button>
            <button
              aria-controls="mobile-nav-overlay"
              aria-expanded={menuOpen}
              aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              className="menu-toggle"
              onClick={() => setMenuOpen((prev) => !prev)}
              ref={menuToggleRef}
              type="button"
            >
              <span aria-hidden="true" className="hamburger-lines">
                <span className="hamburger-line" />
                <span className="hamburger-line" />
                <span className="hamburger-line" />
              </span>
            </button>
          </div>
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
              animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, x: 0 }}
              aria-label="Mobile navigation overlay"
              aria-modal="true"
              className="mobile-nav-overlay"
              data-open="true"
              exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, x: '100%' }}
              id="mobile-nav-overlay"
              initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, x: '100%' }}
              role="dialog"
              transition={{
                duration: prefersReducedMotion ? 0.01 : motionDurations.fast,
                ease: motionEasings.out,
              }}
            >
              <div className="mobile-nav-head">
                <a
                  aria-label="Sumit Anand — Home"
                  className="brand-mark"
                  href="#hero"
                  onClick={() => setMenuOpen(false)}
                >
                  <span aria-hidden="true" className="brand-symbol">
                    <SparkLogo size={16} />
                  </span>
                  <span>
                    Sumit<span className="brand-surname"> Anand</span>
                  </span>
                </a>
                <div className="mobile-nav-head-actions">
                  <Clock className="mobile-nav-clock" variant="nav" />
                  <button
                    aria-label="Close navigation menu"
                    className="icon-button mobile-nav-close"
                    onClick={() => {
                      setMenuOpen(false);
                      menuToggleRef.current?.focus();
                    }}
                    ref={closeMenuRef}
                    type="button"
                  >
                    <X aria-hidden="true" size={18} />
                  </button>
                </div>
              </div>

              <nav aria-label="Mobile sections" className="mobile-nav-links">
                {links.map((link, index) => {
                  const active = activeSection === link.href.slice(1);
                  return (
                    <a
                      aria-current={active ? 'location' : undefined}
                      className="mobile-nav-link"
                      href={link.href}
                      key={link.href}
                      onClick={() => setMenuOpen(false)}
                    >
                      <span className="mobile-nav-link-main">
                        <span className="mobile-nav-index">0{index + 1}</span>
                        <span>{link.label}</span>
                      </span>
                      <ArrowUpRight aria-hidden="true" size={15} />
                    </a>
                  );
                })}
              </nav>

              <div className="mobile-nav-utilities">
                <button
                  className="button button--primary mobile-nav-util-btn"
                  onClick={scrollToContact}
                  type="button"
                >
                  Let&apos;s talk <ArrowUpRight aria-hidden="true" size={15} />
                </button>
                <button
                  className="button button--quiet mobile-nav-util-btn"
                  onClick={() => {
                    setMenuOpen(false);
                    onOpenPalette();
                  }}
                  type="button"
                >
                  <Command aria-hidden="true" size={15} />
                  Quick search
                </button>
                <button
                  className="button button--quiet mobile-nav-util-btn"
                  onClick={handleThemeClick}
                  type="button"
                >
                  {theme === 'dark' ? (
                    <Sun aria-hidden="true" size={15} />
                  ) : (
                    <Moon aria-hidden="true" size={15} />
                  )}
                  {theme === 'dark' ? 'Light theme' : 'Dark theme'}
                </button>
              </div>
            </m.div>
          </>
        ) : null}
      </AnimatePresence>
    </>
  );
});
