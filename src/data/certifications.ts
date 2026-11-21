import type { Certification } from '../types/portfolio';

export const education = 'B.S.A.M. Panchtirthi Sr. Sec. School';

export const educationRecords = [
  {
    title: 'Bachelor of Commerce (B.Com)',
    detail: 'Distance Education · Pursuing, final year · Accounting & Business Data Management',
  },
  {
    title: 'Senior Secondary (12th), CBSE',
    detail: 'B.S.A.M. Panchtirthi Sr. Sec. School · 2020 · 79%',
  },
] as const;

export const certifications = [
  {
    title: 'Networking & IP Surveillance Fundamentals',
    description:
      'Practical training in IPv4 addressing, subnetting, router/switch setup, NVR/DVR integration, TCP/IP and CLI diagnostics.',
  },
  {
    title: 'CCTV & Technical Systems Training',
    description:
      'Hands-on CP Plus equipment configuration, camera installation, playback analysis and maintenance.',
  },
  {
    title: 'Fire Safety & First Aid',
    description: 'Emergency evacuation, fire extinguisher operation and workplace CPR certification.',
  },
  {
    title: 'Computer & Version Control Fundamentals',
    description: 'Command Prompt and terminal basics, Git version tracking, and cloud collaboration via Google Sheets.',
  },
  {
    title: 'Computer Basics & Office Automation',
    description: 'MS Office Suite (Excel formulas, Word, email correspondence) and web productivity tools.',
  },
] satisfies readonly Certification[];
