import type { CareerSite, ExperienceEntry } from '../types/portfolio';

export const careerSites = [
  {
    id: 'flipkart',
    name: 'Flipkart Kalash Mega Hub',
    client: 'Innovision Limited',
    location: 'Patli, Haryana',
    role: 'Security Systems & Gate Control Operator',
    period: '2025 – Present',
    status: 'active',
    cameras: 32,
    type: 'Mega Hub',
  },
  {
    id: 'ekart',
    name: 'Ekart Logistics Pvt. Ltd.',
    client: 'A.P. Securitas Pvt. Ltd.',
    location: 'Haryana, India',
    role: 'Security Guard & Surveillance Operator',
    period: '2023 – 2024',
    status: 'past',
    cameras: 12,
    type: 'Logistics',
  },
] satisfies readonly CareerSite[];

export const experience = [
  {
    id: 'innovision',
    company: 'Innovision Limited',
    role: 'Security Systems & Gate Control Operator',
    site: 'Flipkart Kalash Mega Hub',
    startYear: '2025',
    endYear: 'Present',
    status: 'active',
    responsibilities: [
      "Run end-to-end gate security, digital GIGO and IP surveillance feeds at India's largest Flipkart hub, processing high-density vehicle and personnel logs every day.",
      'Keep CCTV cameras, NVRs and surveillance switches connected, configuring IP addressing, subnet parameters and router links across warehouse security zones.',
      'Log every inbound and outbound commercial vehicle, delivery fleet and inventory transfer in real time (MS Excel, Google Sheets) with 100% data accuracy.',
      'Run active surveillance and diagnostic checks (ping, ipconfig, link troubleshooting) to hold 24/7 video uptime, prevent stock shrinkage and enforce safety compliance.',
      'Work directly with shift managers, IT support and safety officers to clear gate queue bottlenecks, connectivity issues and security anomalies immediately.',
    ],
    skills: ['CP Plus CCTV', 'IP Networking', 'GIGO Gate Entry', 'Excel Logging'],
  },
  {
    id: 'ap-securitas',
    company: 'A.P. Securitas Pvt. Ltd.',
    role: 'Security Guard & Surveillance Operator',
    site: 'Ekart Logistics Pvt. Ltd.',
    startYear: '2023',
    endYear: '2024',
    status: 'past',
    responsibilities: [
      'Monitored multi-camera CCTV feeds and managed DVR/NVR recording channels, enforcing facility safety standards in line with industrial security regulations.',
      'Used CLI diagnostics (cmd, ipconfig) and router interface tools to keep surveillance workstations connected.',
      'Used Google Sheets and Excel for visitor verification and digital shift reporting.',
      'Carried out floor patrols, inventory spot checks and fire safety inspections to protect company assets and personnel.',
      'Operated emergency response equipment, took part in scheduled fire drills and kept concise daily shift logs for management review.',
    ],
    skills: ['CCTV Monitoring', 'CLI Diagnostics', 'Fire Safety'],
  },
] satisfies readonly ExperienceEntry[];
