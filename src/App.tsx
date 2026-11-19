import { Suspense, lazy, useCallback, useEffect, useState } from 'react';
import { AnimatePresence, m } from 'framer-motion';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Footer } from '@/components/Footer';
import { Modal } from '@/components/Modal';
import { Navbar } from '@/components/Navbar';
import { NotFound } from '@/components/NotFound';
import { ToastProvider, useToast } from '@/components/ToastProvider';

const CommandPalette = lazy(() =>
  import('@/components/CommandPalette').then((module) => ({
    default: module.CommandPalette,
  })),
);
import { VmsProvider, useVms } from '@/context/VmsContext';
import { contact } from '@/data/contact';
import { deployments } from '@/data/projects';
import { useTheme } from '@/hooks/useTheme';
import { BackToTop } from '@/motion';
import { PortfolioSections } from '@/sections/PortfolioSections';
import type { DeploymentBriefing } from '@/types/portfolio';
import { assetPath } from '@/utils/assets';
import { resolveSiteFromName } from '@/utils/vmsLogic';
import { initSmoothScroll } from '@/utils/animMaster';
import { initPagePalette } from '@/utils/pagePalette';
import { useMicroInteractions } from '@/utils/microInteractions';
import { scheduleIdle } from '@/utils/yieldToMain';

const NORMALIZED_BASE_PATH = (import.meta.env.BASE_URL || '/').replace(/\/+$/, '') || '/';

const VALID_PATHS = new Set([
  '',
  '/',
  '/index.html',
  NORMALIZED_BASE_PATH,
  `${NORMALIZED_BASE_PATH === '/' ? '' : NORMALIZED_BASE_PATH}/index.html`,
  '/sum-boob.github.io',
  '/sum-boob.github.io/',
  '/sum-boob.github.io/index.html',
]);

function isNotFoundRoute(): boolean {
  if (typeof window === 'undefined') return false;
  const params = new URLSearchParams(window.location.search);
  if (params.has('404')) return true;
  const normalized = window.location.pathname.replace(/\/+$/, '') || '/';
  return !VALID_PATHS.has(normalized);
}

function findDeploymentFromHash(hash: string): DeploymentBriefing | undefined {
  const clean = hash.replace(/^#/, '').toLowerCase();
  if (!clean) return undefined;
  const normalized = clean.startsWith('deployment-') ? clean.slice('deployment-'.length) : clean;
  return deployments.find((item) => item.id.toLowerCase() === normalized);
}

function AppContent() {
  const [activeDeployment, setActiveDeployment] = useState<DeploymentBriefing | null>(() => {
    if (typeof window === 'undefined') return null;
    return findDeploymentFromHash(window.location.hash) ?? null;
  });
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [imageFailed, setImageFailed] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [is404, setIs404] = useState(() => isNotFoundRoute());

  const { theme, toggleTheme } = useTheme();
  const { setActiveSiteId, setSelectedFeedId } = useVms();
  const showToast = useToast();
  useMicroInteractions(showToast);

  const openDeployment = useCallback(
    (deployment: DeploymentBriefing) => {
      setSelectedFeedId(deployment.id);
      setActiveSiteId(resolveSiteFromName(deployment.site));
      setGalleryIndex(0);
      setImageFailed(false);
      setActiveDeployment(deployment);
      const nextHash = `#deployment-${deployment.id}`;
      if (window.location.hash !== nextHash) {
        window.history.replaceState(null, '', nextHash);
      }
    },
    [setActiveSiteId, setSelectedFeedId],
  );

  const closeDialog = useCallback(() => {
    setActiveDeployment((current) => {
      if (current && window.location.hash.startsWith('#deployment-')) {
        window.history.replaceState(
          null,
          '',
          `${window.location.pathname}${window.location.search}`,
        );
      }
      return null;
    });
  }, []);

  const navigateDeployment = useCallback((direction: 'prev' | 'next') => {
    setActiveDeployment((current) => {
      if (!current) return current;
      const currentIndex = deployments.findIndex((d) => d.id === current.id);
      if (currentIndex === -1) return current;
      const delta = direction === 'prev' ? -1 : 1;
      const nextIndex = (currentIndex + delta + deployments.length) % deployments.length;
      const nextDeployment = deployments[nextIndex];
      if (!nextDeployment) return current;
      setGalleryIndex(0);
      setImageFailed(false);
      window.history.replaceState(null, '', `#deployment-${nextDeployment.id}`);
      return nextDeployment;
    });
  }, []);

  const handleCopyEmail = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(contact.email);
      showToast({ type: 'success', title: 'Email copied', message: contact.email });
    } catch {
      showToast({
        type: 'info',
        title: 'Direct email',
        message: contact.email,
      });
    }
  }, [showToast]);

  useEffect(() => {
    const onHashChange = () => {
      const matched = findDeploymentFromHash(window.location.hash);
      if (matched) {
        setGalleryIndex(0);
        setImageFailed(false);
        setActiveDeployment(matched);
      }
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setPaletteOpen((open) => !open);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const returnHome = useCallback(() => {
    const envBase = import.meta.env.BASE_URL || '/';
    const base =
      envBase !== '/'
        ? envBase
        : window.location.pathname.startsWith('/sum-boob.github.io')
          ? '/sum-boob.github.io/'
          : '/';
    window.history.replaceState(null, '', base);
    setIs404(false);
  }, []);

  useEffect(() => {
    let lenis: ReturnType<typeof initSmoothScroll> = null;
    let cleanupPalette: (() => void) | null = null;
    const cancelIdle = scheduleIdle(() => {
      lenis = initSmoothScroll();
      cleanupPalette = initPagePalette();
    }, 350);
    return () => {
      cancelIdle();
      cleanupPalette?.();
      lenis?.destroy();
    };
  }, []);

  const openPalette = useCallback(() => setPaletteOpen(true), []);
  const closePalette = useCallback(() => setPaletteOpen(false), []);
  const copyEmailFromPalette = useCallback(() => {
    void handleCopyEmail();
  }, [handleCopyEmail]);

  const galleryImage = activeDeployment?.gallery[galleryIndex] ?? activeDeployment?.image ?? '';
  const fallbackAsset = assetPath('assets/sumit-monitoring-station.jpg');

  return (
    <>
      <div aria-hidden="true" id="page-bg" />
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>
      <Navbar onOpenPalette={openPalette} onToggleTheme={toggleTheme} theme={theme} />
      
      <AnimatePresence mode="wait">
        <m.div
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          initial={{ opacity: 0 }}
          key={is404 ? '404' : 'portfolio'}
          transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
        >
          {is404 ? (
            <NotFound onReturn={returnHome} />
          ) : (
            <PortfolioSections
              onOpenDeployment={openDeployment}
              onOpenPalette={openPalette}
              onToggleTheme={toggleTheme}
              theme={theme}
            />
          )}
        </m.div>
      </AnimatePresence>

      <Footer />
      <BackToTop />
      {paletteOpen ? (
        <Suspense fallback={null}>
          <CommandPalette
            isOpen={paletteOpen}
            onClose={closePalette}
            onCopyEmail={copyEmailFromPalette}
            onOpenDeployment={openDeployment}
            onToggleTheme={toggleTheme}
            theme={theme}
          />
        </Suspense>
      ) : null}
      <Modal
        className="modal-window--briefing"
        descriptionId="dialog-description"
        isOpen={activeDeployment !== null}
        onClose={closeDialog}
        onNavigate={navigateDeployment}
        titleId="dialog-title"
      >
        {activeDeployment ? (
          <>
            <div className="modal-heading">
              <div>
                <p className="mono-label">{activeDeployment.eyebrow}</p>
                <h2 id="dialog-title">{activeDeployment.title}</h2>
              </div>
              <span className="modal-index">BRIEFING / {activeDeployment.id.toUpperCase()}</span>
            </div>
            <img
              alt={`${activeDeployment.title} — ${activeDeployment.site}`}
              className="modal-image"
              decoding="async"
              height="600"
              loading="lazy"
              onError={() => setImageFailed(true)}
              src={imageFailed ? fallbackAsset : galleryImage}
              width="1200"
            />
            {activeDeployment.gallery.length ? (
              <div aria-label="Briefing image gallery" className="modal-gallery">
                {activeDeployment.gallery.map((image, index) => (
                  <button
                    aria-label={`View frame ${index + 1} of ${activeDeployment.title}`}
                    aria-pressed={galleryIndex === index}
                    className={
                      galleryIndex === index
                        ? 'gallery-thumb gallery-thumb--active'
                        : 'gallery-thumb'
                    }
                    key={`${activeDeployment.id}-frame-${index}`}
                    onClick={() => {
                      setImageFailed(false);
                      setGalleryIndex(index);
                    }}
                    type="button"
                  >
                    <img
                      alt=""
                      decoding="async"
                      height="48"
                      loading="lazy"
                      onError={(event) => {
                        event.currentTarget.src = fallbackAsset;
                      }}
                      src={image}
                      width="78"
                    />
                  </button>
                ))}
              </div>
            ) : null}
            <div className="modal-readouts">
              <div>
                <small>SITE</small>
                <strong>{activeDeployment.site}</strong>
              </div>
              <div>
                <small>DURATION</small>
                <strong>{activeDeployment.period}</strong>
              </div>
              <div>
                <small>CAMERAS</small>
                <strong>
                  {activeDeployment.cameras === null ? '—' : activeDeployment.cameras}
                </strong>
              </div>
            </div>
            <p className="modal-description" id="dialog-description">
              {activeDeployment.description}
            </p>
            <ul aria-label="Skills used in deployment" className="modal-tags">
              {activeDeployment.tags.map((tag) => (
                <li key={tag}>{tag}</li>
              ))}
            </ul>
            <div className="modal-actions">
              <div className="modal-nav-group">
                <button
                  aria-label="Previous deployment briefing"
                  className="button button--quiet"
                  onClick={() => navigateDeployment('prev')}
                  type="button"
                >
                  <ArrowLeft aria-hidden="true" size={15} /> Prev
                </button>
                <button
                  aria-label="Next deployment briefing"
                  className="button button--quiet"
                  onClick={() => navigateDeployment('next')}
                  type="button"
                >
                  Next <ArrowRight aria-hidden="true" size={15} />
                </button>
              </div>
              <div className="modal-actions-primary">
                <button className="button button--quiet" onClick={closeDialog} type="button">
                  Close
                </button>
                <a className="button button--primary" href="#contact" onClick={closeDialog}>
                  Message directly <ArrowRight aria-hidden="true" size={16} />
                </a>
              </div>
            </div>
          </>
        ) : null}
      </Modal>
    </>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <VmsProvider>
          <AppContent />
        </VmsProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
}
