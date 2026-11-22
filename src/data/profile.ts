import type { PortfolioProfile } from '../types/portfolio';

export const profile = {
  name: 'Sumit Anand',
  role: 'CCTV Operator & Networked Security Systems Specialist',
  headline: 'Sumit Anand — eyes on every hub.',
  location: 'Patli, Haryana, India',
  heroSummary:
    "CCTV Operator with 2+ years in large-scale logistics hubs. I run Milestone XProtect consoles and CP Plus camera networks, and keep high-volume gate entry and exit accurate, logged and secure.",
  aboutHeading: 'Precision Monitoring & Asset Protection',
  aboutParagraphs: [
    'I watch over some of India\'s busiest logistics sites, including the Flipkart Kalash Mega Hub and Ekart Logistics. My work covers live multi-camera monitoring, footage playback and incident flagging, plus accurate vehicle and personnel logging at the gate.',
    'I am comfortable on both sides of the system: operating Milestone XProtect and CP Plus NVR/DVR consoles, and keeping the IP network behind them healthy with IPv4 addressing, switch and router setup, and ping/ipconfig diagnostics. The result is high video uptime, zero-incident accuracy and fast escalation when something is off.',
  ],
  heroMetrics: [
    { value: '2+', label: 'Years Ops' },
    { value: '24/7', label: 'Video Uptime' },
    { value: '100%', label: 'Log Accuracy' },
  ],
  careerMetrics: [
    { value: '2+', label: 'Years Active' },
    { value: '100%', label: 'Log Accuracy' },
    { value: '24/7', label: 'Video Uptime' },
  ],
  metadata: ['India', 'Logistics Security', 'Milestone XProtect VMS · CP Plus · IP'],
} satisfies PortfolioProfile;
