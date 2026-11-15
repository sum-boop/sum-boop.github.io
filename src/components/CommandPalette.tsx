import { AnimatePresence, m } from 'framer-motion';
import {
  ArrowRight,
  Copy,
  ExternalLink,
  FileDown,
  FolderKanban,
  MessageCircle,
  Moon,
  Search,
  Send,
  Sun,
  X,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { VMS_WORKSPACE_PRESETS, useVms } from '@/context/VmsContext';
import { contact, socialLinks } from '@/data/contact';
import { deployments } from '@/data/projects';
import type { ThemeMode } from '@/hooks/useTheme';
import { motionDurations, motionEasings, motionSprings } from '@/motion';
import type { DeploymentBriefing } from '@/types/portfolio';
import { assetPath } from '@/utils/assets';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenDeployment: (deployment: DeploymentBriefing) => void;
  onCopyEmail: () => void;
  theme: ThemeMode;
  onToggleTheme: (origin?: { x: number; y: number }) => void;
}

interface PaletteItem {
  id: string;
  label: string;
  group: 'Navigation' | 'Deployments' | 'Actions' | 'Profiles';
  hint: string;
  run: () => void;
}

const FOCUSABLE_SELECTOR =
  'button:not([disabled]), input:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])';

function CommandPaletteDialog({
  onClose,
  onOpenDeployment,
  onCopyEmail,
  theme,
  onToggleTheme,
}: Omit<CommandPaletteProps, 'isOpen'>) {
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const dialogRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { setViewMode } = useVms();

  const items = useMemo<PaletteItem[]>(() => {
    const jumpTo = (hash: string) => {
      onClose();
      const target = document.getElementById(hash.replace('#', ''));
      target?.scrollIntoView({ behavior: 'smooth' });
      window.history.replaceState(null, '', hash);
    };

    const navItems: PaletteItem[] = [
      {
        id: 'nav-hero',
        label: 'Top / Hero Overview',
        group: 'Navigation',
        hint: '#hero',
        run: () => jumpTo('#hero'),
      },
      {
        id: 'nav-about',
        label: 'Expertise & Operating Profile',
        group: 'Navigation',
        hint: '#about',
        run: () => jumpTo('#about'),
      },
      {
        id: 'nav-skills',
        label: 'Capabilities & Signal Map',
        group: 'Navigation',
        hint: '#skills',
        run: () => jumpTo('#skills'),
      },
      {
        id: 'nav-footprint',
        label: 'Deployment Footprint',
        group: 'Navigation',
        hint: '#footprint',
        run: () => jumpTo('#footprint'),
      },
      {
        id: 'nav-ops',
        label: 'Camera Feed Deployments',
        group: 'Navigation',
        hint: '#operations',
        run: () => jumpTo('#operations'),
      },
      {
        id: 'nav-exp',
        label: 'Operational Logbook',
        group: 'Navigation',
        hint: '#experience',
        run: () => jumpTo('#experience'),
      },
      {
        id: 'nav-certs',
        label: 'Certifications & Education',
        group: 'Navigation',
        hint: '#certifications',
        run: () => jumpTo('#certifications'),
      },
      {
        id: 'nav-contact',
        label: 'Direct Messaging & Profiles',
        group: 'Navigation',
        hint: '#contact',
        run: () => jumpTo('#contact'),
      },
    ];

    const deploymentItems: PaletteItem[] = deployments.map((deployment) => ({
      id: `dep-${deployment.id}`,
      label: deployment.title,
      group: 'Deployments',
      hint: deployment.site,
      run: () => {
        onClose();
        onOpenDeployment(deployment);
      },
    }));

    const profileItems: PaletteItem[] = socialLinks.map((social) => ({
      id: `social-${social.id}`,
      label: `Open ${social.label} Profile`,
      group: 'Profiles',
      hint: social.handle,
      run: () => {
        const link = document.createElement('a');
        link.href = social.href;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        onClose();
      },
    }));

    const actionItems: PaletteItem[] = [
      {
        id: 'act-message',
        label: 'Compose Direct Message (WhatsApp / Email / SMS)',
        group: 'Actions',
        hint: '#contact',
        run: () => jumpTo('#contact'),
      },
      {
        id: 'act-whatsapp',
        label: 'Chat on WhatsApp',
        group: 'Actions',
        hint: contact.phone,
        run: () => {
          const link = document.createElement('a');
          link.href = contact.whatsappUrl;
          link.target = '_blank';
          link.rel = 'noopener noreferrer';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          onClose();
        },
      },
      {
        id: 'act-copy',
        label: `Copy Email (${contact.email})`,
        group: 'Actions',
        hint: 'Clipboard',
        run: () => {
          onCopyEmail();
          onClose();
        },
      },
      {
        id: 'act-resume',
        label: 'Download Résumé PDF',
        group: 'Actions',
        hint: 'PDF',
        run: () => {
          const link = document.createElement('a');
          link.href = assetPath(contact.resumePath);
          link.download = 'sumit-anand-resume.pdf';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          onClose();
        },
      },
      {
        id: 'act-theme',
        label: theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme',
        group: 'Actions',
        hint: 'Theme',
        run: () => {
          onToggleTheme();
          onClose();
        },
      },
    ];

    const vmsItems: PaletteItem[] = VMS_WORKSPACE_PRESETS.map((preset) => ({
      id: `vms-${preset.id}`,
      label: `XProtect VMS: Switch to ${preset.label}`,
      group: 'Actions',
      hint: preset.shortLabel,
      run: () => {
        onClose();
        setViewMode(preset.id, { scrollToSection: true });
      },
    }));

    return [...vmsItems, ...actionItems, ...profileItems, ...navItems, ...deploymentItems];
  }, [onClose, onCopyEmail, onOpenDeployment, onToggleTheme, setViewMode, theme]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (item) =>
        item.label.toLowerCase().includes(q) ||
        item.group.toLowerCase().includes(q) ||
        item.hint.toLowerCase().includes(q),
    );
  }, [items, query]);

  const safeActiveIndex = activeIndex < filtered.length ? activeIndex : 0;

  useEffect(() => {
    const previousFocus =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    document.body.classList.add('modal-open');
    const focusTimer = window.setTimeout(
      () => inputRef.current?.focus({ preventScroll: true }),
      10,
    );

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key === 'Tab' && dialogRef.current) {
        const focusable = Array.from(
          dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
        );
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (!first || !last) return;
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      window.clearTimeout(focusTimer);
      document.removeEventListener('keydown', onKeyDown);
      document.body.classList.remove('modal-open');
      previousFocus?.focus({ preventScroll: true });
    };
  }, [onClose]);

  const handleInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (!filtered.length) return;
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((idx) => (idx + 1) % filtered.length);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((idx) => (idx - 1 + filtered.length) % filtered.length);
    } else if (event.key === 'Enter') {
      event.preventDefault();
      filtered[safeActiveIndex]?.run();
    }
  };

  return (
    <m.div
      animate={{ opacity: 1 }}
      className="palette-backdrop"
      exit={{ opacity: 0 }}
      initial={{ opacity: 0 }}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      transition={{ duration: motionDurations.micro, ease: motionEasings.out }}
    >
      <m.div
        animate={{ opacity: 1, y: 0, scale: 1 }}
        aria-label="Command palette"
        aria-modal="true"
        className="palette-window"
        exit={{ opacity: 0, y: 8, scale: 0.99 }}
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        ref={dialogRef}
        role="dialog"
        transition={motionSprings.soft}
      >
        <div className="palette-search-row">
          <Search aria-hidden="true" className="palette-search-icon" size={17} />
          <input
            aria-activedescendant={filtered[safeActiveIndex]?.id}
            aria-autocomplete="list"
            aria-controls="command-palette-list"
            aria-expanded="true"
            aria-label="Search sections, deployments, profiles, or actions"
            className="palette-input"
            onChange={(event) => {
              setQuery(event.target.value);
              setActiveIndex(0);
            }}
            onKeyDown={handleInputKeyDown}
            placeholder="Jump to section, message on WhatsApp, open GitHub, toggle theme..."
            ref={inputRef}
            role="combobox"
            type="text"
            value={query}
          />
          <button
            aria-label="Close command palette"
            className="icon-button palette-close"
            onClick={onClose}
            type="button"
          >
            <X aria-hidden="true" size={16} />
          </button>
        </div>
        <div className="palette-results" id="command-palette-list" role="listbox">
          {filtered.length === 0 ? (
            <p className="palette-empty">No matching commands found.</p>
          ) : (
            filtered.map((item, idx) => {
              const active = idx === safeActiveIndex;
              const Icon =
                item.id === 'act-copy'
                  ? Copy
                  : item.id === 'act-resume'
                    ? FileDown
                    : item.id === 'act-whatsapp'
                      ? MessageCircle
                      : item.id === 'act-message'
                        ? Send
                        : item.id === 'act-theme'
                          ? theme === 'dark'
                            ? Sun
                            : Moon
                          : item.group === 'Profiles'
                            ? ExternalLink
                            : item.group === 'Deployments'
                              ? FolderKanban
                              : ArrowRight;

              return (
                <button
                  aria-selected={active}
                  className={`palette-item ${active ? 'palette-item--active' : ''}`}
                  id={item.id}
                  key={item.id}
                  onClick={item.run}
                  onMouseEnter={() => setActiveIndex(idx)}
                  role="option"
                  type="button"
                >
                  <Icon aria-hidden="true" size={15} />
                  <span className="palette-item-label">{item.label}</span>
                  <span className="palette-item-meta">{item.hint}</span>
                </button>
              );
            })
          )}
        </div>
        <div className="palette-footer">
          <span>Navigate with ↑ ↓</span>
          <span>Select with Enter</span>
          <span>Close with Esc</span>
        </div>
      </m.div>
    </m.div>
  );
}

export function CommandPalette({ isOpen, ...props }: CommandPaletteProps) {
  return (
    <AnimatePresence>
      {isOpen ? <CommandPaletteDialog key="command-palette-dialog" {...props} /> : null}
    </AnimatePresence>
  );
}
