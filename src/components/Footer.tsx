import { memo } from 'react';
import { ArrowUp, Mail, MessageCircle } from 'lucide-react';
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
        <ChoreoReveal direction="up">
          <div className="footer-centered-links">
            {footerLinks.map((link, idx) => (
              <span className="footer-pipe-group" key={link.href}>
                {idx > 0 ? (
                  <span aria-hidden="true" className="footer-pipe">
                    |
                  </span>
                ) : null}
                <a className="footer-pipe-link" href={link.href}>
                  {link.label}
                </a>
              </span>
            ))}
          </div>

          <div className="footer-main">
            <a className="footer-signature" href="#hero">
              <span className="footer-symbol">
                <svg aria-hidden="true" fill="none" height="17" viewBox="0 0 24 28" width="15">
                  <path d="M13.5 1.5L3 15h8.2L9.4 26.5L21 12.2h-8.3l.8-10.7Z" fill="currentColor" />
                </svg>
              </span>
              <span>
                <strong>{profile.name}</strong>
                <small>{profile.role}</small>
              </span>
            </a>

            <div aria-label="Social and messaging shortcuts" className="footer-actions">
              <SocialLinks variant="footer" />
              <a
                aria-label="Message on WhatsApp (opens in new tab)"
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
            <span aria-hidden="true" className="footer-divider-bar">
              |
            </span>
            <span>Patli, Haryana, India</span>
            <span aria-hidden="true" className="footer-divider-bar">
              |
            </span>
            <a href="#hero">
              Back to top <ArrowUp aria-hidden="true" size={13} />
            </a>
          </div>
        </ChoreoReveal>
      </div>
    </footer>
  );
});
