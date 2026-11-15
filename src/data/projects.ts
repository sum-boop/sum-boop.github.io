import type { DeploymentBriefing } from '../types/portfolio';
import surveillanceWallImg from '@/assets/images/deployment_surveillance_wall_1794580052037.jpg';
import gateTerminalImg from '@/assets/images/deployment_gate_terminal_1794580054781.jpg';
import warehouseDockImg from '@/assets/images/deployment_warehouse_dock_1794580052470.jpg';
import forensicDeskImg from '@/assets/images/deployment_forensic_desk_1794580052641.jpg';

export const deployments = [
  {
    id: 'op1',
    cardTitle: 'XProtect VMS & Multi-Channel Wall',
    title: 'Milestone XProtect VMS & Multi-Channel Surveillance',
    eyebrow: 'Innovision Limited · Flipkart Kalash Mega Hub',
    site: 'Flipkart Kalash Mega Hub',
    cardPeriod: '2025–PRESENT',
    period: '2025 — Present',
    cardCameras: 32,
    cameras: 32,
    status: 'active',
    category: 'Surveillance',
    cardMetric: '32+',
    cardDescription:
      '24/7 perimeter coverage across 32 cameras via Milestone XProtect Smart Client and CP Plus arrays. Real-time monitoring, playback, and shrink prevention.',
    structuredBrief:
      '24/7 perimeter coverage across 32 cameras via Milestone XProtect Smart Client and CP Plus arrays. Real-time monitoring, footage playback and archiving, and shrink prevention across warehouse zones.',
    description:
      'Real-time monitoring across a 32-camera Milestone XProtect VMS and CP Plus array covering warehouse zones, dock areas, and perimeter. Responsible for Smart Client timeline investigation, footage archiving, and shrink prevention.',
    cardImage: surveillanceWallImg,
    image: surveillanceWallImg,
    imageAlt: 'Illustrative reference image of security monitoring displays in a warehouse',
    tags: ['Milestone XProtect VMS', 'CP Plus', 'Multi-Channel Monitoring', 'Loss Prevention'],
    gallery: [surveillanceWallImg, forensicDeskImg, warehouseDockImg],
  },
  {
    id: 'op2',
    cardTitle: 'Digital GIGO Gate Control',
    title: 'Digital GIGO Gate Control & Data Terminal',
    eyebrow: 'Innovision Limited · Flipkart Kalash Mega Hub',
    site: 'Flipkart Kalash Mega Hub',
    cardPeriod: '2025–PRESENT',
    period: '2025 — Present',
    cardCameras: 32,
    cameras: 4,
    status: 'active',
    category: 'Gate Control',
    cardMetric: '100%',
    cardDescription:
      'High-volume commercial fleet entry/exit logging with 100% data accuracy, credential checks, and synchronized Excel gate tracking.',
    structuredBrief:
      'High-volume commercial fleet entry/exit logging with 100% data accuracy, credential checks, and synchronized Excel gate tracking.',
    description:
      'High-density commercial vehicle logging for India’s largest Flipkart hub. Gate-in/gate-out entry synchronization, driver credential checks, and 100% accurate MS Excel logging.',
    cardImage: gateTerminalImg,
    image: gateTerminalImg,
    imageAlt: 'Illustrative reference image of a data logging workstation',
    tags: ['GIGO Gate Entry', 'MS Excel', 'Vehicle Logs', 'Badge Verification'],
    gallery: [gateTerminalImg, warehouseDockImg, surveillanceWallImg],
  },
  {
    id: 'op3',
    cardTitle: 'Loss Prevention & Shrink Control',
    title: 'Loss Prevention & Shrink Control',
    eyebrow: 'Innovision Limited · Flipkart Kalash Mega Hub',
    site: 'Flipkart Kalash Mega Hub',
    cardPeriod: '2025–PRESENT',
    period: '2025 — Present',
    cardCameras: 32,
    cameras: null,
    status: 'active',
    category: 'Loss Prevention',
    cardMetric: '24/7',
    cardDescription:
      'Badge-access enforcement, camera maintenance, and fire-safety drill coordination for an audited mega-hub facility.',
    structuredBrief:
      'Badge-access enforcement, camera maintenance, and fire-safety drill coordination for an audited mega-hub facility.',
    description:
      'Continuous monitoring of high-value inventory zones, anomaly flagging, and coordinated escalation to shift managers. Zero-incident operational accuracy maintained across the current posting.',
    cardImage: warehouseDockImg,
    image: warehouseDockImg,
    imageAlt: 'Illustrative reference image of a security access control system',
    tags: ['Loss Prevention', 'Incident Flagging', 'Escalation Protocols', 'Site Coordination'],
    gallery: [warehouseDockImg, surveillanceWallImg, gateTerminalImg],
  },
  {
    id: 'op4',
    cardTitle: 'Incident Forensic Review',
    title: 'Incident Forensic Review',
    eyebrow: 'Innovision Limited · Flipkart Kalash Mega Hub',
    site: 'Flipkart Kalash Mega Hub',
    cardPeriod: '2025–PRESENT',
    period: '2025 — Present',
    cardCameras: 32,
    cameras: 32,
    status: 'active',
    category: 'Forensics',
    cardDescription:
      'Time-stamped footage extraction and cross-camera playback to flag and document incidents for shift managers.',
    structuredBrief:
      'Time-stamped footage extraction and cross-camera playback to flag and document incidents for shift managers.',
    description:
      'Timestamped footage extraction, chain-of-custody documentation, and cross-camera timeline reconstruction for internal loss investigations.',
    cardImage: forensicDeskImg,
    image: forensicDeskImg,
    imageAlt: 'Illustrative reference image of an operator reviewing multiple screens',
    tags: ['Footage Playback', 'Forensic Review', 'Chain of Custody', 'Reporting'],
    gallery: [forensicDeskImg, surveillanceWallImg, warehouseDockImg],
  },
  {
    id: 'op5',
    cardTitle: 'Perimeter & Dock Security',
    title: 'Perimeter & Dock Security',
    eyebrow: 'A.P. Securitas Pvt. Ltd. · Ekart Logistics',
    site: 'Ekart Logistics',
    cardPeriod: '2023–2024',
    period: '2023 — 2024',
    cardCameras: 12,
    cameras: 12,
    status: 'past',
    category: 'Perimeter',
    cardDescription:
      'Dock-movement verification, patrol oversight, and multi-camera CCTV monitoring for facility perimeter security.',
    structuredBrief:
      'Dock-movement verification, patrol oversight, and multi-camera CCTV monitoring for facility perimeter security.',
    description:
      'Perimeter monitoring, dock-movement verification, and patrol oversight at an Ekart Logistics facility. Coordinated with shift supervisors on access control and visitor verification.',
    cardImage: warehouseDockImg,
    image: warehouseDockImg,
    imageAlt: 'Illustrative reference image of a warehouse loading dock',
    tags: ['Perimeter Monitoring', 'Dock Verification', 'Patrol Oversight', 'Visitor Access'],
    gallery: [warehouseDockImg, gateTerminalImg, forensicDeskImg],
  },
  {
    id: 'op6',
    cardTitle: 'Emergency Response Coordination',
    title: 'Emergency Response Coordination',
    eyebrow: 'A.P. Securitas Pvt. Ltd. · Ekart Logistics',
    site: 'Ekart Logistics',
    cardPeriod: '2023–2024',
    period: '2023 — 2024',
    cardCameras: 12,
    cameras: null,
    status: 'past',
    category: 'Emergency',
    cardDescription:
      'Fire-drill participation, emergency equipment operation, and daily shift-log maintenance under CCTV oversight.',
    structuredBrief:
      'Fire-drill participation, emergency equipment operation, and daily shift-log maintenance under CCTV oversight.',
    description:
      'Alarm-to-action dispatch, evacuation routing under live surveillance, fire safety inspections, and post-incident shift reporting.',
    cardImage: gateTerminalImg,
    image: gateTerminalImg,
    imageAlt: 'Illustrative reference image of an emergency coordination control station',
    tags: ['Fire Safety', 'First Aid', 'Emergency Escalation', 'Shift Reporting'],
    gallery: [gateTerminalImg, surveillanceWallImg, forensicDeskImg],
  },
] satisfies readonly DeploymentBriefing[];
