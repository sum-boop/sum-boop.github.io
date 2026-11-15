import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';
import { startSafeViewTransition } from '@/utils/viewTransition';
import { resolveVmsModeForCategory } from '@/utils/vmsLogic';

export type VmsViewMode = 'live' | 'playback' | 'smart-map' | 'alarms';
export type VmsSiteFocus = 'flipkart' | 'ekart';

export interface VmsWorkspacePreset {
  id: VmsViewMode;
  label: string;
  shortLabel: string;
  sectionId: string;
  deploymentCategory: string;
  siteFocus: VmsSiteFocus;
  statusNote: string;
}

export const VMS_WORKSPACE_PRESETS: readonly VmsWorkspacePreset[] = [
  {
    id: 'live',
    label: 'Live View',
    shortLabel: 'LIVE',
    sectionId: 'operations',
    deploymentCategory: 'All deployments',
    siteFocus: 'flipkart',
    statusNote: '32+ feeds active · XProtect Smart Client matrix',
  },
  {
    id: 'playback',
    label: 'Playback',
    shortLabel: 'PLAYBACK',
    sectionId: 'operations',
    deploymentCategory: 'Forensics',
    siteFocus: 'flipkart',
    statusNote: 'Timeline scrub & evidence export ready',
  },
  {
    id: 'smart-map',
    label: 'Smart Map',
    shortLabel: 'MAP',
    sectionId: 'footprint',
    deploymentCategory: 'All deployments',
    siteFocus: 'flipkart',
    statusNote: 'Patli–NCR corridor GIS overlay active',
  },
  {
    id: 'alarms',
    label: 'Alarm Manager',
    shortLabel: 'ALARMS',
    sectionId: 'experience',
    deploymentCategory: 'Loss Prevention',
    siteFocus: 'ekart',
    statusNote: 'Gate GIGO & loss prevention rules armed',
  },
] as const;

interface VmsContextValue {
  viewMode: VmsViewMode;
  activeSiteId: VmsSiteFocus;
  deploymentFilter: string;
  selectedFeedId: string;
  statusNote: string;
  setViewMode: (mode: VmsViewMode, options?: { scrollToSection?: boolean }) => void;
  setActiveSiteId: (siteId: VmsSiteFocus) => void;
  setDeploymentFilter: (category: string) => void;
  setSelectedFeedId: (feedId: string) => void;
  focusSectionFromVms: (sectionId: string, mode?: VmsViewMode) => void;
}

const VmsContext = createContext<VmsContextValue | null>(null);

export function VmsProvider({ children }: PropsWithChildren) {
  const [viewMode, setViewModeState] = useState<VmsViewMode>('live');
  const [activeSiteId, setActiveSiteId] = useState<VmsSiteFocus>('flipkart');
  const [deploymentFilter, setDeploymentFilterState] = useState<string>('All deployments');
  const [selectedFeedId, setSelectedFeedId] = useState<string>('op1');

  const scrollToElement = useCallback((sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (!el) return;
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    el.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
  }, []);

  const setViewMode = useCallback(
    (mode: VmsViewMode, options?: { scrollToSection?: boolean }) => {
      const preset = VMS_WORKSPACE_PRESETS.find((item) => item.id === mode);
      startSafeViewTransition(
        () => {
          setViewModeState(mode);
          if (preset) {
            setDeploymentFilterState(preset.deploymentCategory);
            setActiveSiteId(preset.siteFocus);
          }
          if (mode === 'playback') setSelectedFeedId('op4');
          else if (mode === 'alarms') setSelectedFeedId('op3');
          else if (mode === 'smart-map') setSelectedFeedId('op5');
          else setSelectedFeedId('op1');
        },
        { kind: 'layout' },
      );

      if (options?.scrollToSection && preset) {
        window.setTimeout(() => scrollToElement(preset.sectionId), 60);
      }
    },
    [scrollToElement],
  );

  const setDeploymentFilter = useCallback((category: string) => {
    startSafeViewTransition(
      () => {
        setDeploymentFilterState(category);
        setViewModeState(resolveVmsModeForCategory(category));
      },
      { kind: 'layout' },
    );
  }, []);

  const focusSectionFromVms = useCallback(
    (sectionId: string, mode?: VmsViewMode) => {
      if (mode) {
        setViewMode(mode, { scrollToSection: false });
      }
      scrollToElement(sectionId);
    },
    [scrollToElement, setViewMode],
  );

  const statusNote = useMemo(() => {
    return (
      VMS_WORKSPACE_PRESETS.find((preset) => preset.id === viewMode)?.statusNote ??
      'XProtect VMS ready'
    );
  }, [viewMode]);

  const value = useMemo<VmsContextValue>(
    () => ({
      viewMode,
      activeSiteId,
      deploymentFilter,
      selectedFeedId,
      statusNote,
      setViewMode,
      setActiveSiteId,
      setDeploymentFilter,
      setSelectedFeedId,
      focusSectionFromVms,
    }),
    [
      activeSiteId,
      deploymentFilter,
      focusSectionFromVms,
      selectedFeedId,
      setDeploymentFilter,
      setViewMode,
      statusNote,
      viewMode,
    ],
  );

  return <VmsContext.Provider value={value}>{children}</VmsContext.Provider>;
}

export function useVms(): VmsContextValue {
  const ctx = useContext(VmsContext);
  if (!ctx) throw new Error('useVms must be used inside VmsProvider');
  return ctx;
}
