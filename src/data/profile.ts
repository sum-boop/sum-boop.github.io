import type { PortfolioProfile } from '../types/portfolio';

export const profile = {
  name: 'Sumit Anand',
  role: 'CCTV Operator & Surveillance Specialist',
  headline: 'Sumit Anand — eyes on every hub.',
  location: 'Patli, Haryana, India',
  heroSummary:
    "CCTV Operator and Surveillance Specialist running Milestone XProtect Smart Client consoles, multi-channel CP Plus camera arrays and high-throughput GIGO gate control across India's largest logistics hubs.",
  aboutHeading: 'Precision Monitoring & Asset Protection',
  aboutParagraphs: [
    'Specialist in real-time multi-camera monitoring, Milestone XProtect playback investigations, accurate vehicle and driver data logging, and incident review across mega logistics operations, including the Flipkart Kalash Mega Hub and Ekart Logistics.',
    'Expert operator of multi-screen Milestone XProtect Smart Client consoles, CP Plus CCTV arrays and digital GIGO gate-entry systems, keeping zero-error Excel logs. Consistent enforcer of loss-prevention protocols and fire-safety procedures across high-volume warehouse zones.',
  ],
  heroMetrics: [
    { value: '2+', label: 'Years Ops' },
    { value: '32+', label: 'Cameras Monitored' },
    { value: '100%', label: 'Log Accuracy' },
  ],
  careerMetrics: [
    { value: '2+', label: 'Years Active' },
    { value: '100%', label: 'Log Accuracy' },
    { value: '24/7', label: 'Video Uptime' },
  ],
  metadata: ['India', 'Logistics Security', 'Milestone XProtect VMS · CP Plus · IP'],
} satisfies PortfolioProfile;
