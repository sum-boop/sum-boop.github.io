import { memo } from 'react';
import { About } from '@/components/About';
import { Contact } from '@/components/Contact';
import { Credentials } from '@/components/Credentials';
import { Deployments } from '@/components/Deployments';
import { Experience } from '@/components/Experience';
import { Footprint } from '@/components/Footprint';
import { Hero } from '@/components/Hero';
import { Skills } from '@/components/Skills';
import type { ThemeMode } from '@/hooks/useTheme';
import { PageTransition } from '@/motion';
import type { DeploymentBriefing } from '@/types/portfolio';

interface PortfolioSectionsProps {
  theme: ThemeMode;
  onOpenDeployment: (deployment: DeploymentBriefing) => void;
}

export const PortfolioSections = memo(function PortfolioSections({
  theme,
  onOpenDeployment,
}: PortfolioSectionsProps) {
  return (
    <PageTransition>
      <main id="main-content" tabIndex={-1}>
        <Hero theme={theme} />
        <About />
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
