import type { SkillCategory } from '../types/portfolio';

export const skillCategories = [
  {
    name: 'Surveillance systems',
    accent: 'cyan',
    skills: [
      'Milestone XProtect VMS & Smart Client',
      'CP Plus CCTV & NVR / DVR Systems',
      'Live Multi-Channel Monitoring',
      'Footage Playback & Evidence Export',
      'Camera Installation & Maintenance',
    ],
  },
  {
    name: 'Network operations',
    accent: 'violet',
    skills: [
      'IP Networking (IPv4, Subnetting)',
      'TCP/IP & LAN Setup',
      'LAN Configuration',
      'Router / Switch Setup',
      'CLI Diagnostics (ping, ipconfig, tracert)',
    ],
  },
  {
    name: 'Gate & access control',
    accent: 'lime',
    skills: [
      'GIGO Gate Entry',
      'GIGO Data Logging',
      'Badge & Access Control',
      'Vehicle Log Management',
      'MS Excel / Google Sheets',
    ],
  },
  {
    name: 'Safety & response',
    accent: 'amber',
    skills: [
      'Loss Prevention Protocols',
      'Incident Flagging',
      'Fire Safety & First Aid',
      'Emergency Equipment Operation',
      'Shift Reporting',
    ],
  },
] satisfies readonly SkillCategory[];

export const skillTicker = skillCategories.flatMap((category) => category.skills);
