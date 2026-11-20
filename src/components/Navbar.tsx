import { AnimatePresence, m, useMotionValueEvent, useScroll } from 'framer-motion';
import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { Aperture, Command, Moon, Sun, X } from 'lucide-react';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useScrollSpy } from '@/hooks/useScrollSpy';
import type { ThemeMode } from '@/hooks/useTheme';
import { ScrollProgress, motionDurations, motionEasings } from '@/motion';
import '@/styles/chrome.css';
import { Clock } from './Clock';

interface NavbarProps {
  theme: ThemeMode;
  onToggleTheme: (origin?: { x: number; y: number }) => void;
  onOpenPalette: () => void;
}

const links = [
  { href: '#operations', label: 'Works' },
  { href: '#skills', label: 'Services' },
  { href: '#about', label: 'About' },
  { href: '#contact', label: 'Contact' },
] as const;

const primaryMobileLinks = [
  { href: '#hero', label: 'Home' },
  { href: '#operations', label: 'Works' },
  { href: '#skills', label: 'Services' },
  { href: '#about', label: 'About' },
  { href: '#contact', label: 'Contact' },
] as const;

const secondaryMobileLinks = [
  { href: '#footprint', label: 'Footprint' },
  { href: '#experience', label: 'Logbook' },
  { href: '#certifications', label: 'Credentials' },
  { href: '#hero-workstation', label: 'Workstation' },
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

function ConcentricDotArcs() {
  const radii = [90, 120, 150, 180, 210, 240, 270, 300, 330];
  const ringColors = [
    'rgba(255, 34, 58, 0.5)', // 5Lab red accent
    'rgba(168, 85, 247, 0.35)', // subtle violet
    'rgba(255, 255, 255, 0.28)', // white dot
  ];
  return (
    <svg
      aria-hidden="true"
      className="mobile-modal-rings"
      fill="none"
      viewBox="0 0 360 360"
      xmlns="http://www.w3.org/2000/svg"
    >
      {radii.map((r, i) => (
        <circle
          cx="360"
          cy="0"
          key={r}
          r={r}
          stroke={ringColors[i % ringColors.length]}
          strokeDasharray="2.5 8"
          strokeLinecap="round"
          strokeWidth="1.5"
        />
      ))}
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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: prefersReducedMotion ? 0 : 0.05,
        delayChildren: prefersReducedMotion ? 0 : 0.06,
      },
    },
    exit: {
      opacity: 0,
      transition: {
        staggerChildren: prefersReducedMotion ? 0 : 0.02,
        staggerDirection: -1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: prefersReducedMotion ? 0 : 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: prefersReducedMotion ? 0.01 : 0.35,
        ease: motionEasings.out,
      },
    },
    exit: {
      opacity: 0,
      y: prefersReducedMotion ? 0 : 10,
      transition: {
        duration: prefersReducedMotion ? 0.01 : 0.2,
        ease: motionEasings.out,
      },
    },
  };

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
              <Aperture aria-hidden="true" size={20} strokeWidth={1.8} />
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
            <svg aria-hidden="true" className="hamburger-svg" viewBox="0 0 32 32">
              <line stroke="currentColor" strokeLinecap="round" strokeWidth="2" x1="6" x2="26" y1="11" y2="11" />
              <line stroke="currentColor" strokeLinecap="round" strokeWidth="2" x1="12" x2="26" y1="16" y2="16" />
              <line stroke="currentColor" strokeLinecap="round" strokeWidth="2" x1="18" x2="26" y1="21" y2="21" />
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
              <ConcentricDotArcs />

              <div className="mobile-nav-head">
                <a
                  aria-label="Sumit Anand — Home"
                  className="brand-mark brand-mark--modal"
                  href="#hero"
                  onClick={() => setMenuOpen(false)}
                >
                  <span aria-hidden="true" className="brand-symbol">
                    <Aperture aria-hidden="true" size={20} strokeWidth={1.8} />
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
                  <X aria-hidden="true" size={20} strokeWidth={1.75} />
                </button>
              </div>

              <m.nav
                animate="visible"
                aria-label="Mobile sections"
                className="mobile-nav-links"
                exit="exit"
                initial="hidden"
                variants={containerVariants}
              >
                {primaryMobileLinks.map((link) => {
                  const active = activeSection === link.href.slice(1);
                  return (
                    <m.a
                      aria-current={active ? 'location' : undefined}
                      className="mobile-nav-link"
                      href={link.href}
                      key={link.href}
                      onClick={() => setMenuOpen(false)}
                      variants={itemVariants}
                    >
                      <span>{link.label}</span>
                    </m.a>
                  );
                })}

                <m.div className="mobile-nav-sublinks" variants={itemVariants}>
                  {secondaryMobileLinks.map((link) => (
                    <a
                      className="mobile-nav-sublink"
                      href={link.href}
                      key={link.href}
                      onClick={() => setMenuOpen(false)}
                    >
                      {link.label}
                    </a>
                  ))}
                </m.div>
              </m.nav>

              <div className="mobile-nav-footer">
                <div className="mobile-nav-footer-meta">
                  <span>PATLI, HARYANA</span>
                  <Clock className="mobile-nav-clock" variant="nav" />
                </div>
                <div className="mobile-nav-util-row">
                  <button
                    aria-label="Quick search"
                    className="mobile-nav-util-btn"
                    onClick={() => {
                      setMenuOpen(false);
                      onOpenPalette();
                    }}
                    type="button"
                  >
                    <Command aria-hidden="true" size={13} />
                    Search
                  </button>
                  <button
                    aria-label="Toggle theme"
                    className="mobile-nav-util-btn"
                    onClick={handleThemeClick}
                    type="button"
                  >
                    {theme === 'dark' ? (
                      <Sun aria-hidden="true" size={13} />
                    ) : (
                      <Moon aria-hidden="true" size={13} />
                    )}
                    {theme === 'dark' ? 'Light' : 'Dark'}
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
