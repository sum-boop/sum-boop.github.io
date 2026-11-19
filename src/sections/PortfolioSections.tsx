import { memo } from 'react';
import { About } from '@/components/About';
import { Contact } from '@/components/Contact';
import { Credentials } from '@/components/Credentials';
import { Deployments } from '@/components/Deployments';
import { Experience } from '@/components/Experience';
import { Footprint } from '@/components/Footprint';
import { Hero } from '@/components/Hero';
import { WorkstationBand } from '@/components/WorkstationBand';
import { Skills } from '@/components/Skills';
import type { ThemeMode } from '@/hooks/useTheme';
import { PageTransition } from '@/motion';
import type { DeploymentBriefing } from '@/types/portfolio';

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
        <About />
        <WorkstationBand onOpenPalette={onOpenPalette} theme={theme} />
        <Skills />
        <Footprint theme={theme} />
        <Deployments onOpen={onOpenDeployment} />
        <Experience />
        <Credentials />
        <Contact />
      </main>
    </PageTransition>
  );
});
