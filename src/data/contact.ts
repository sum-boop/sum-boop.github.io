import type { ContactDetails, SocialLink } from '../types/portfolio';

export const contact = {
  email: 'sa8518430@gmail.com',
  phone: '+91 72061 85384',
  whatsappNumber: '917206185384',
  whatsappUrl: 'https://wa.me/917206185384',
  smsUrl: 'sms:+917206185384',
  location: 'Patli, Haryana, IN',
  mapUrl: 'https://maps.app.goo.gl/brgxxLcyxQtzzsxT9',
  resumePath: 'assets/sumit-anand-resume.pdf',
  availability:
    'Available for CCTV operations, surveillance shifts, and gate-control roles across logistics, manufacturing, and industrial facilities. Direct lines below — no intermediaries.',
  hireAvailability:
    'Send a pre-filled message straight to WhatsApp, Email, or SMS in one tap — zero forms stuck in a database.',
  responseTime: 'I respond within 24 hours.',
} satisfies ContactDetails;

/**
 * Verified developer & portfolio profile link.
 */
export const socialLinks = [
  {
    id: 'github',
    label: 'GitHub',
    handle: '@sum-boop',
    href: 'https://github.com/sum-boop',
  },
] satisfies readonly SocialLink[];

