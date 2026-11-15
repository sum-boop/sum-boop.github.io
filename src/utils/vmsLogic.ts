import type { VmsSiteFocus, VmsViewMode } from '@/context/VmsContext';

export interface CorridorNodeCoord {
  id: VmsSiteFocus;
  xPercent: number;
  yPercent: number;
}

export const CORRIDOR_COORDS: Record<VmsSiteFocus, CorridorNodeCoord> = {
  flipkart: { id: 'flipkart', xPercent: 34, yPercent: 44 },
  ekart: { id: 'ekart', xPercent: 68, yPercent: 64 },
};

export function resolveVmsModeForCategory(category: string): VmsViewMode {
  if (category === 'Forensics') return 'playback';
  if (category === 'Loss Prevention' || category === 'Emergency') return 'alarms';
  if (category === 'Perimeter') return 'smart-map';
  return 'live';
}

export function resolveSiteFromName(siteName: string): VmsSiteFocus {
  return siteName.toLowerCase().includes('ekart') ? 'ekart' : 'flipkart';
}

export function computeNodeSeparation(a: CorridorNodeCoord, b: CorridorNodeCoord): number {
  return Math.hypot(a.xPercent - b.xPercent, a.yPercent - b.yPercent);
}
