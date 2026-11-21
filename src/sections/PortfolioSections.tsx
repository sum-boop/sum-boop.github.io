import { Suspense, lazy, memo } from 'react';
import { About } from '@/components/About';
import { Hero } from '@/components/Hero';
import { OrbScene } from '@/components/OrbScene';
import type { ThemeMode } from '@/hooks/useTheme';
import { PageTransition } from '@/motion';
import type { DeploymentBriefing } from '@/types/portfolio';

const WorkstationBand = lazy(() =>
  import('@/components/WorkstationBand').then((m) => ({ default: m.WorkstationBand })),
);
const Skills = lazy(() =>
  import('@/components/Skills').then((m) => ({ default: m.Skills })),
);
const Footprint = lazy(() =>
  import('@/components/Footprint').then((m) => ({ default: m.Footprint })),
);
const Deployments = lazy(() =>
  import('@/components/Deployments').then((m) => ({ default: m.Deployments })),
);
const Experience = lazy(() =>
  import('@/components/Experience').then((m) => ({ default: m.Experience })),
);
const Credentials = lazy(() =>
  import('@/components/Credentials').then((m) => ({ default: m.Credentials })),
);
const Contact = lazy(() =>
  import('@/components/Contact').then((m) => ({ default: m.Contact })),
);

interface PortfolioSectionsProps {
  theme: ThemeMode;
  onOpenDeployment: (deployment: DeploymentBriefing) => void;
  onToggleTheme: (origin?: { x: number; y: number }) => void;
  onOpenPalette: () => void;
}

export const PortfolioSections = memo(function PortfolioSections({
  theme,
  onOpenDeployment,
  onToggleTheme,
  onOpenPalette,
}: PortfolioSectionsProps) {
  return (
    <PageTransition>
      <main id="main-content" tabIndex={-1}>
        <Hero onOpenPalette={onOpenPalette} onToggleTheme={onToggleTheme} theme={theme} />
        <OrbScene />
        <About />
        <Suspense fallback={<div className="min-h-[50vh] bg-transparent" aria-hidden="true" />}>
          <WorkstationBand onOpenPalette={onOpenPalette} theme={theme} />
          <Skills />
          <Footprint theme={theme} />
          <Deployments onOpen={onOpenDeployment} />
          <Experience />
          <Credentials />
          <Contact />
        </Suspense>
      </main>
    </PageTransition>
  );
});
