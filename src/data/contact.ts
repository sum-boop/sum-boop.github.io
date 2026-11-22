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
    'Available for CCTV operations, surveillance shifts and gate-control roles across logistics, manufacturing and industrial facilities. Reach me directly below, with no intermediaries.',
  hireAvailability:
    'Send a pre-filled message to WhatsApp, Email or SMS in one tap. Nothing is stored on a server.',
  responseTime: 'I reply within 24 hours.',
} satisfies ContactDetails;

/** Public profiles. */
export const socialLinks = [
  {
    id: 'linkedin',
    label: 'LinkedIn',
    handle: 'sumit-anand',
    href: 'https://www.linkedin.com/in/sumit-anand-109526297',
  },
  {
    id: 'github',
    label: 'GitHub',
    handle: '@sum-boop',
    href: 'https://github.com/sum-boop',
  },
  {
    id: 'instagram',
    label: 'Instagram',
    handle: '@iykyk_1.7',
    href: 'https://www.instagram.com/iykyk_1.7/',
  },
] satisfies readonly SocialLink[];
