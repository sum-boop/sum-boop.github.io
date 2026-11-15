import { memo } from 'react';
import { ArrowUp, Mail, MessageCircle, Radio } from 'lucide-react';
import { contact } from '@/data/contact';
import { profile } from '@/data/profile';
import { ChoreoReveal } from '@/motion';
import { SocialLinks } from './SocialLinks';

const footerLinks = [
  { href: '#about', label: 'Expertise' },
  { href: '#footprint', label: 'Footprint' },
  { href: '#operations', label: 'Deployments' },
  { href: '#experience', label: 'Logbook' },
  { href: '#certifications', label: 'Credentials' },
  { href: '#contact', label: 'Contact' },
] as const;

export const Footer = memo(function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <ChoreoReveal direction="draw-x">
          <span aria-hidden="true" className="footer-top-rule" />
        </ChoreoReveal>
        <ChoreoReveal direction="up">
          <div className="footer-main">
            <a className="footer-signature" href="#hero">
              <span className="footer-symbol">
                <Radio aria-hidden="true" size={17} />
              </span>
              <span>
                <strong>{profile.name}</strong>
                <small>{profile.role}</small>
              </span>
            </a>
            <nav aria-label="Footer navigation" className="footer-nav">
              {footerLinks.map((link) => (
                <a href={link.href} key={link.href}>
                  {link.label}
                </a>
              ))}
            </nav>
            <div aria-label="Social and messaging shortcuts" className="footer-actions">
              <SocialLinks variant="footer" />
              <a
                aria-label="Message on WhatsApp"
                className="icon-button footer-social-btn"
                href={contact.whatsappUrl}
                rel="noopener noreferrer"
                target="_blank"
                title="WhatsApp"
              >
                <MessageCircle aria-hidden="true" size={16} />
              </a>
              <a
                aria-label="Send email"
                className="icon-button footer-social-btn"
                href={`mailto:${contact.email}`}
                title="Email"
              >
                <Mail aria-hidden="true" size={16} />
              </a>
            </div>
          </div>
          <div className="footer-bottom">
            <span>© 2026 {profile.name}. All rights reserved.</span>
            <span>Patli, Haryana, India</span>
            <a href="#hero">
              Back to top <ArrowUp aria-hidden="true" size={14} />
            </a>
          </div>
        </ChoreoReveal>
      </div>
    </footer>
  );
});
