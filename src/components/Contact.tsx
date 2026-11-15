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
import { useToast } from './ToastProvider';

export function Contact() {
  const [copied, setCopied] = useState(false);
  const showToast = useToast();

  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(contact.email);
      setCopied(true);
      showToast({ type: 'success', title: 'Email copied', message: contact.email });
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      showToast({
        type: 'info',
        title: 'Direct email',
        message: contact.email,
      });
    }
  }

  return (
    <section
      aria-labelledby="contact-title"
      className="content-section contact-section"
      id="contact"
    >
      <div className="section-inner">
        <SectionHeading
          eyebrow="Open a channel"
          id="contact-title"
          number="07"
          title="Let's talk about a role."
          tone="cyan"
        />
        <div className="contact-layout">
          <ChoreoReveal className="contact-copy" direction="left" distance={30}>
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
                <button className="copy-email" onClick={copyEmail} type="button">
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
                      <strong>{social.label}</strong>
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
                    <strong>WhatsApp</strong>
                    <small>{contact.phone}</small>
                  </span>
                  <ArrowUpRight aria-hidden="true" className="social-card-arrow" size={14} />
                </a>
              </div>
            </div>

            <a
              className="contact-location"
              href={contact.mapUrl}
              rel="noopener noreferrer"
              target="_blank"
            >
              <MapPin aria-hidden="true" size={15} /> {contact.location} · Open on Google Maps
              <ArrowUpRight aria-hidden="true" size={13} />
            </a>
          </ChoreoReveal>
          <ChoreoReveal
            className="contact-form-panel sweep-border-panel"
            delay={0.08}
            direction="scale"
          >
            <div className="contact-form-heading">
              <span className="mono-label">DIRECT MESSAGE COMPOSER</span>
              <span aria-label="Available" className="availability-chip">
                <i /> AVAILABLE
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
