import { useState } from 'react';
import {
  ArrowUpRight,
  Check,
  Copy,
  FileDown,
  Mail,
  MapPin,
  MessageCircle,
  MessageSquare,
  Phone,
  Radio,
} from 'lucide-react';
import { contact, socialLinks } from '@/data/contact';
import { ChoreoReveal } from '@/motion';
import { assetPath } from '@/utils/assets';
import { ContactForm } from './ContactForm';
import { SectionHeading } from './SectionHeading';
import { SocialIcon } from './SocialIcon';

export function Contact() {
  const [copied, setCopied] = useState(false);

  function markCopied() {
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  function focusComposer() {
    const nameInput = document.getElementById('contact-name') as HTMLInputElement | null;
    if (nameInput) {
      nameInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
      window.setTimeout(() => nameInput.focus(), 220);
    }
  }

  return (
    <section
      aria-labelledby="contact-title"
      className="content-section contact-section contact-section--obsidian"
      id="contact"
    >
      {/* 5Lab Signature Diagonal Light Beam + Ambient Galaxy Gradient */}
      <svg aria-hidden="true" className="contact-galaxy-beam" viewBox="0 0 1200 1000">
        <defs>
          <linearGradient id="beam-grad" x1="0%" x2="100%" y1="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(255,255,255,0)" />
            <stop offset="50%" stopColor="rgba(255,255,255,0.28)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </linearGradient>
        </defs>
        <line stroke="url(#beam-grad)" strokeWidth="1" x1="1080" x2="120" y1="180" y2="920" />
      </svg>
      <div aria-hidden="true" className="contact-galaxy-gradient" id="galaxy-gradient" />

      <div className="section-inner">
        <div className="contact-hero-bar">
          <div className="contact-hero-heading">
            <SectionHeading
              eyebrow="Open a channel"
              id="contact-title"
              italicAccent="talk"
              number="07"
              title="Let's talk about a role."
              tone="cyan"
            />
          </div>
          <button className="contact-lets-chat-link" onClick={focusComposer} type="button">
            <span>Let&apos;s chat</span>
          </button>
        </div>

        {/* 5Lab Signature Uppercase Wide-Tracked Direct Line Strip */}
        <div className="contact-inline-strip">
          <a className="contact-inline-item" href={`mailto:${contact.email}`}>
            <Mail aria-hidden="true" size={16} />
            <span>{contact.email.toUpperCase()}</span>
          </a>
          <span aria-hidden="true" className="contact-inline-sep">
            |
          </span>
          <a className="contact-inline-item" href={`tel:${contact.phone.replace(/\s+/g, '')}`}>
            <Phone aria-hidden="true" size={16} />
            <span>{contact.phone}</span>
          </a>
        </div>
        <a
          className="contact-location"
          href={contact.mapUrl}
          rel="noopener noreferrer"
          target="_blank"
        >
          <MapPin aria-hidden="true" size={15} /> {contact.location.toUpperCase()} · OPEN ON GOOGLE
          MAPS
          <span className="sr-only"> (opens in new tab)</span>
          <ArrowUpRight aria-hidden="true" size={13} />
        </a>

        <div className="contact-layout">
          <ChoreoReveal className="contact-copy" direction="left" distance={24}>
            <p className="eyebrow-line">Direct line · No intermediaries</p>
            <p className="contact-intro">{contact.availability}</p>
            <div className="contact-terminal">
              <div className="terminal-heading">
                <span>
                  <Radio aria-hidden="true" size={15} /> DIRECT CHANNELS
                </span>
                <span>READY</span>
              </div>
              <a href={`mailto:${contact.email}`}>
                <Mail aria-hidden="true" size={17} />
                <span>
                  <small>EMAIL</small>
                  {contact.email}
                </span>
                <ArrowUpRight aria-hidden="true" size={15} />
              </a>
              <a href={contact.whatsappUrl} rel="noopener noreferrer" target="_blank">
                <MessageCircle aria-hidden="true" size={17} />
                <span>
                  <small>WHATSAPP</small>Chat directly on WhatsApp
                  <span className="sr-only"> (opens in new tab)</span>
                </span>
                <ArrowUpRight aria-hidden="true" size={15} />
              </a>
              <a href={contact.smsUrl}>
                <MessageSquare aria-hidden="true" size={17} />
                <span>
                  <small>SMS / TEXT MESSAGE</small>Send a quick text
                </span>
                <ArrowUpRight aria-hidden="true" size={15} />
              </a>
              <a href={`tel:${contact.phone.replace(/\s+/g, '')}`}>
                <Phone aria-hidden="true" size={17} />
                <span>
                  <small>PHONE</small>
                  {contact.phone}
                </span>
                <ArrowUpRight aria-hidden="true" size={15} />
              </a>
              <div className="terminal-actions">
                <button
                  className="copy-email"
                  data-copy={contact.email}
                  onClick={markCopied}
                  type="button"
                >
                  {copied ? (
                    <Check aria-hidden="true" size={15} />
                  ) : (
                    <Copy aria-hidden="true" size={15} />
                  )}
                  {copied ? 'Copied email' : 'Copy email'}
                </button>
                <a className="resume-link" download href={assetPath(contact.resumePath)}>
                  <FileDown aria-hidden="true" size={15} /> Download Résumé PDF
                </a>
              </div>
            </div>

            <div aria-label="Developer and direct profiles" className="social-profiles-block">
              <p className="eyebrow-line social-heading">Verified profile &amp; instant chat</p>
              <div className="social-grid">
                {socialLinks.map((social) => (
                  <a
                    className="social-card"
                    href={social.href}
                    key={social.id}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    <span className="social-card-icon">
                      <SocialIcon platform={social.id} size={17} />
                    </span>
                    <span className="social-card-meta">
                      <strong>
                        {social.label}
                        <span className="sr-only"> (opens in new tab)</span>
                      </strong>
                      <small>{social.handle}</small>
                    </span>
                    <ArrowUpRight aria-hidden="true" className="social-card-arrow" size={14} />
                  </a>
                ))}
                <a
                  className="social-card"
                  href={contact.whatsappUrl}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  <span className="social-card-icon">
                    <MessageCircle aria-hidden="true" size={17} />
                  </span>
                  <span className="social-card-meta">
                    <strong>
                      WhatsApp
                      <span className="sr-only"> (opens in new tab)</span>
                    </strong>
                    <small>{contact.phone}</small>
                  </span>
                  <ArrowUpRight aria-hidden="true" className="social-card-arrow" size={14} />
                </a>
              </div>
            </div>
          </ChoreoReveal>

          <ChoreoReveal
            className="contact-form-panel sweep-border-panel"
            delay={0.08}
            direction="scale"
          >
            <div className="contact-form-heading">
              <span className="mono-label">DIRECT MESSAGE COMPOSER</span>
              <span className="availability-chip">
                <i aria-hidden="true" /> AVAILABLE
              </span>
            </div>
            <p>{contact.hireAvailability}</p>
            <ContactForm />
          </ChoreoReveal>
        </div>
      </div>
    </section>
  );
}
