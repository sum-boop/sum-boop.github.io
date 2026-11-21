import { memo } from 'react';
import { ArrowUp } from 'lucide-react';
import { profile } from '@/data/profile';

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
    <footer className="site-footer-5lab">
      <div className="footer-shell-5lab">
        <div className="footer-left-5lab">
          <span>© 2026 {profile.name}. All rights reserved.</span>
          <span aria-hidden="true" className="footer-sep-5lab">
            |
          </span>
          <span>Patli, Haryana, India</span>
        </div>

        <nav aria-label="Footer links" className="footer-nav-5lab">
          {footerLinks.map((link) => (
            <a className="footer-nav-link-5lab" href={link.href} key={link.href}>
              {link.label}
            </a>
          ))}
          <a className="footer-top-link-5lab" href="#hero">
            Back to top <ArrowUp aria-hidden="true" size={13} />
          </a>
        </nav>
      </div>
    </footer>
  );
});
