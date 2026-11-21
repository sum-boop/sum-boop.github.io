import type { SkillCategory } from '../types/portfolio';

export const skillCategories = [
  {
    name: 'Surveillance systems',
    accent: 'cyan',
    skills: [
      'Milestone XProtect VMS & Smart Client',
      'CP Plus Equipment Setup',
      'NVR / DVR Network Integration',
      'Live Multi-Channel Monitoring',
      'Footage Playback & Archiving',
      'Camera Maintenance & Incident Flagging',
    ],
  },
  {
    name: 'Network operations',
    accent: 'violet',
    skills: [
      'IPv4 Addressing & Subnetting',
      'TCP/IP & LAN Setup',
      'Router & Switch Configuration',
      'Port Forwarding',
      'Static & Dynamic IP Configuration',
      'Diagnostics (ping, ipconfig, tracert)',
    ],
  },
  {
    name: 'Gate & access control',
    accent: 'lime',
    skills: [
      'GIGO Gate Entry & Data Logging',
      'High-Volume Vehicle Log Management',
      'Material & Dock Verification',
      'Visitor Access Authorization',
      'Badge Inspection',
      'MS Excel / Google Sheets',
    ],
  },
  {
    name: 'Safety & response',
    accent: 'amber',
    skills: [
      'Loss Prevention Protocols',
      'Fire Safety & Evacuation Drills',
      'Industrial Security Guidelines',
      'Emergency Escalation Procedures',
      'Shift Reporting',
    ],
  },
] satisfies readonly SkillCategory[];

export const skillTicker = skillCategories.flatMap((category) => category.skills);
