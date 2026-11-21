import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
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
import { useReducedMotion } from '@/hooks/useReducedMotion';
import '@/styles/contactOrb.css';
import { assetPath } from '@/utils/assets';
import { ContactForm } from './ContactForm';
import { SocialIcon } from './SocialIcon';

gsap.registerPlugin(ScrollTrigger);

const ORBIT_RING_PATH = 'M 6 120 A 114 36 0 1 0 234 120 A 114 36 0 1 0 6 120';

export function Contact() {
  const [copied, setCopied] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const laserRef = useRef<HTMLSpanElement>(null);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) return;
    const sectionEl = sectionRef.current;
    const laserEl = laserRef.current;
    if (!sectionEl || !laserEl) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        laserEl,
        { scaleX: 0 },
        {
          scaleX: 1,
          duration: 0.9,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionEl,
            start: 'top 78%',
            once: true,
          },
        },
      );
    }, sectionRef);

    return () => ctx.revert();
  }, [prefersReducedMotion]);

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
      className="content-section-5lab contact-section-5lab"
      id="contact"
      ref={sectionRef}
    >
      <div className="section-inner">
        {/* 5Lab Closing CTA Hero Area ("Ready to spark something?" equivalent) */}
        <div className="contact-cta-hero-5lab">
          <p className="section-eyebrow">
            <span>07</span> / OPEN A CHANNEL
          </p>

          <div className="contact-headline-row-5lab">
            <h2 className="contact-giant-title-5lab" id="contact-title">
              <span>Let&apos;s </span>
              <em className="hero-italic-accent">talk</em>
              <br />
              <span>about a role.</span>
            </h2>

            <div className="contact-orb-block">
              <div aria-hidden="true" className="contact-orb-laser-wrap">
                <span className="contact-orb-laser" ref={laserRef} />
              </div>

              <div className="contact-orb-float">
                <button
                  aria-label="Scroll to message composer form"
                  className="contact-lets-chat-btn-5lab"
                  onClick={focusComposer}
                  type="button"
                >
                  <span>Let&apos;s chat</span>
                </button>

                <svg
                  aria-hidden="true"
                  className="contact-orb-ring"
                  fill="none"
                  viewBox="0 0 240 240"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <defs>
                    <filter id="contact-orb-dot-glow" height="300%" width="300%" x="-100%" y="-100%">
                      <feGaussianBlur result="blur" stdDeviation="2.5" />
                      <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>
                  <path
                    d={ORBIT_RING_PATH}
                    stroke="rgba(255, 76, 114, 0.78)"
                    strokeWidth="1.25"
                    vectorEffect="non-scaling-stroke"
                  />
                  {prefersReducedMotion ? (
                    <circle
                      cx="234"
                      cy="120"
                      fill="#ff6b8b"
                      filter="url(#contact-orb-dot-glow)"
                      r="3.4"
                    />
                  ) : (
                    <circle cx="0" cy="0" fill="#ff6b8b" filter="url(#contact-orb-dot-glow)" r="3.4">
                      <animateMotion dur="9s" path={ORBIT_RING_PATH} repeatCount="indefinite" />
                    </circle>
                  )}
                </svg>
              </div>
            </div>
          </div>

          {/* Large underlined direct communication links with red hover */}
          <div className="contact-big-links-5lab">
            <a className="contact-big-link" href={`mailto:${contact.email}`}>
              <Mail aria-hidden="true" size={20} />
              <span>{contact.email.toUpperCase()}</span>
            </a>
            <span aria-hidden="true" className="contact-link-sep">|</span>
            <a className="contact-big-link" href={`tel:${contact.phone.replace(/\s+/g, '')}`}>
              <Phone aria-hidden="true" size={20} />
              <span>{contact.phone}</span>
            </a>
            <span aria-hidden="true" className="contact-link-sep">|</span>
            <a
              className="contact-big-link"
              href={contact.whatsappUrl}
              rel="noopener noreferrer"
              target="_blank"
            >
              <MessageCircle aria-hidden="true" size={20} />
              <span>WHATSAPP CHAT</span>
              <ArrowUpRight aria-hidden="true" size={16} />
            </a>
          </div>

          <a
            className="contact-location-link-5lab"
            href={contact.mapUrl}
            rel="noopener noreferrer"
            target="_blank"
          >
            <MapPin aria-hidden="true" size={14} />
            <span>{contact.location.toUpperCase()} · OPEN ON GOOGLE MAPS</span>
            <ArrowUpRight aria-hidden="true" size={13} />
          </a>
        </div>

        {/* Direct Channels & Message Composer */}
        <div className="contact-layout-5lab">
          <div className="contact-channels-column-5lab">
            <p className="eyebrow-line">Direct line · No intermediaries</p>
            <p className="contact-intro-5lab">{contact.availability}</p>

            <div className="contact-terminal-5lab">
              <div className="terminal-heading-5lab">
                <span>
                  <Radio aria-hidden="true" size={14} /> DIRECT CHANNELS
                </span>
                <span className="terminal-ready-badge">READY</span>
              </div>

              <div className="terminal-links-list-5lab">
                <a className="terminal-row-link" href={`mailto:${contact.email}`}>
                  <Mail aria-hidden="true" size={16} />
                  <span>
                    <small>EMAIL</small>
                    {contact.email}
                  </span>
                  <ArrowUpRight aria-hidden="true" size={15} />
                </a>

                <a
                  className="terminal-row-link"
                  href={contact.whatsappUrl}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  <MessageCircle aria-hidden="true" size={16} />
                  <span>
                    <small>WHATSAPP</small>Chat directly on WhatsApp
                  </span>
                  <ArrowUpRight aria-hidden="true" size={15} />
                </a>

                <a className="terminal-row-link" href={contact.smsUrl}>
                  <MessageSquare aria-hidden="true" size={16} />
                  <span>
                    <small>SMS / TEXT MESSAGE</small>Send a quick text
                  </span>
                  <ArrowUpRight aria-hidden="true" size={15} />
                </a>

                <a className="terminal-row-link" href={`tel:${contact.phone.replace(/\s+/g, '')}`}>
                  <Phone aria-hidden="true" size={16} />
                  <span>
                    <small>PHONE</small>
                    {contact.phone}
                  </span>
                  <ArrowUpRight aria-hidden="true" size={15} />
                </a>
              </div>

              <div className="terminal-actions-5lab">
                <button
                  className="copy-email-btn-5lab"
                  onClick={markCopied}
                  type="button"
                >
                  {copied ? <Check aria-hidden="true" size={14} /> : <Copy aria-hidden="true" size={14} />}
                  <span>{copied ? 'Copied email' : 'Copy email'}</span>
                </button>
                <a className="resume-download-btn-5lab" download href={assetPath(contact.resumePath)}>
                  <FileDown aria-hidden="true" size={14} />
                  <span>Download Résumé PDF</span>
                </a>
              </div>
            </div>

            <div aria-label="Developer and direct profiles" className="social-profiles-5lab">
              <p className="eyebrow-line">Verified profile &amp; instant chat</p>
              <div className="social-links-grid-5lab">
                {socialLinks.map((social) => (
                  <a
                    className="social-pill-5lab"
                    href={social.href}
                    key={social.id}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    <SocialIcon platform={social.id} size={15} />
                    <span>
                      <strong>{social.label}</strong>
                      <small>{social.handle}</small>
                    </span>
                    <ArrowUpRight aria-hidden="true" size={13} />
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div className="contact-composer-column-5lab">
            <div className="composer-card-5lab">
              <div className="composer-card-header-5lab">
                <span className="composer-mono-label">DIRECT MESSAGE COMPOSER</span>
                <span className="composer-live-status">
                  <span className="status-pulse" /> AVAILABLE
                </span>
              </div>
              <p className="composer-note-5lab">{contact.hireAvailability}</p>
              <ContactForm />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
