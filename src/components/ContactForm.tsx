import { LayoutGroup, m } from 'framer-motion';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import {
  ArrowRight,
  Check,
  CheckCircle2,
  Copy,
  Loader2,
  Mail,
  MessageCircle,
  MessageSquare,
  Send,
} from 'lucide-react';
import { contact } from '@/data/contact';
import { motionDurations, motionEasings, motionSprings } from '@/motion';
import { useToast } from './ToastProvider';

type DeliveryChannel = 'whatsapp' | 'email' | 'sms';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const CHANNELS: readonly {
  id: DeliveryChannel;
  label: string;
  cta: string;
}[] = [
  { id: 'whatsapp', label: 'WhatsApp', cta: 'Send via WhatsApp' },
  { id: 'email', label: 'Email', cta: 'Open Email Draft' },
  { id: 'sms', label: 'SMS', cta: 'Send SMS Message' },
];

interface PreparedDispatch {
  channel: DeliveryChannel;
  whatsappUrl: string;
  mailtoUrl: string;
  smsUrl: string;
  plainText: string;
}

function buildDispatchLinks(fields: {
  name: string;
  email: string;
  organization: string;
  message: string;
}): Omit<PreparedDispatch, 'channel'> {
  const lines = [
    `Hello Sumit,`,
    '',
    fields.message,
    '',
    `From: ${fields.name}`,
    ...(fields.organization ? [`Organization: ${fields.organization}`] : []),
    ...(fields.email ? [`Reply Email: ${fields.email}`] : []),
  ];
  const plainText = lines.join('\n');
  const encodedText = encodeURIComponent(plainText);
  const subject = encodeURIComponent(
    `Opportunity inquiry from ${fields.name}${fields.organization ? ` (${fields.organization})` : ''}`,
  );

  return {
    whatsappUrl: `https://wa.me/${contact.whatsappNumber}?text=${encodedText}`,
    mailtoUrl: `mailto:${contact.email}?subject=${subject}&body=${encodedText}`,
    smsUrl: `sms:+${contact.whatsappNumber}?body=${encodedText}`,
    plainText,
  };
}

function triggerAnchorDispatch(href: string, external: boolean) {
  const link = document.createElement('a');
  link.href = href;
  if (external) {
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
  }
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function ContactForm() {
  const [channel, setChannel] = useState<DeliveryChannel>('whatsapp');
  const [errorMessage, setErrorMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [dispatched, setDispatched] = useState<PreparedDispatch | null>(null);
  const [copiedMessage, setCopiedMessage] = useState(false);
  const prepareTimerRef = useRef<number | null>(null);
  const redirectTimerRef = useRef<number | null>(null);
  const showToast = useToast();

  useEffect(() => {
    return () => {
      if (prepareTimerRef.current !== null) window.clearTimeout(prepareTimerRef.current);
      if (redirectTimerRef.current !== null) window.clearTimeout(redirectTimerRef.current);
    };
  }, []);

  function clearDispatchTimers() {
    if (prepareTimerRef.current !== null) {
      window.clearTimeout(prepareTimerRef.current);
      prepareTimerRef.current = null;
    }
    if (redirectTimerRef.current !== null) {
      window.clearTimeout(redirectTimerRef.current);
      redirectTimerRef.current = null;
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;
    const form = event.currentTarget;
    const formData = new FormData(form);
    const fields = {
      name: String(formData.get('name') ?? '').trim(),
      email: String(formData.get('email') ?? '').trim(),
      organization: String(formData.get('organization') ?? '').trim(),
      message: String(formData.get('message') ?? '').trim(),
    };

    if (fields.name.length < 2 || fields.name.length > 120) {
      setErrorMessage('Enter your name (2–120 characters).');
      form.querySelector<HTMLInputElement>('#contact-name')?.focus();
      return;
    }

    if (channel === 'email' && (!fields.email || !EMAIL_PATTERN.test(fields.email))) {
      setErrorMessage('Enter a valid reply email address for Email delivery.');
      form.querySelector<HTMLInputElement>('#contact-email')?.focus();
      return;
    }

    if (fields.email && (fields.email.length > 254 || !EMAIL_PATTERN.test(fields.email))) {
      setErrorMessage('Enter a valid email address (254 characters or fewer).');
      form.querySelector<HTMLInputElement>('#contact-email')?.focus();
      return;
    }

    if (fields.organization.length > 120) {
      setErrorMessage('Keep the organization name to 120 characters or fewer.');
      form.querySelector<HTMLInputElement>('#contact-org')?.focus();
      return;
    }

    if (fields.message.length < 10 || fields.message.length > 5000) {
      setErrorMessage('Enter a message between 10 and 5,000 characters.');
      form.querySelector<HTMLTextAreaElement>('#contact-message')?.focus();
      return;
    }

    setErrorMessage('');
    clearDispatchTimers();
    setSubmitting(true);

    const links = buildDispatchLinks(fields);
    const prepared: PreparedDispatch = { channel, ...links };
    const targetHref =
      channel === 'whatsapp'
        ? links.whatsappUrl
        : channel === 'email'
          ? links.mailtoUrl
          : links.smsUrl;
    const channelLabel =
      channel === 'whatsapp' ? 'WhatsApp' : channel === 'email' ? 'Email draft' : 'SMS app';

    // Step 1: brief visible loading state -> Step 2: visual success confirmation -> Step 3: redirect
    prepareTimerRef.current = window.setTimeout(() => {
      setSubmitting(false);
      setDispatched(prepared);
      setRedirecting(true);
      showToast({
        type: 'success',
        title: `${channelLabel} verified`,
        message: `Opening ${channelLabel} with your pre-filled message…`,
      });

      redirectTimerRef.current = window.setTimeout(() => {
        setRedirecting(false);
        triggerAnchorDispatch(targetHref, channel === 'whatsapp');
      }, 900);
    }, 520);
  }

  async function copyFormattedMessage() {
    if (!dispatched) return;
    try {
      await navigator.clipboard.writeText(dispatched.plainText);
      setCopiedMessage(true);
      showToast({
        type: 'success',
        title: 'Message copied',
        message: 'Paste anywhere to reach Sumit.',
      });
      window.setTimeout(() => setCopiedMessage(false), 1800);
    } catch {
      showToast({
        type: 'info',
        title: 'Copy unavailable',
        message: 'Use the WhatsApp, Email, or SMS buttons directly.',
      });
    }
  }

  const activeChannelMeta = CHANNELS.find((item) => item.id === channel) ?? CHANNELS[0];

  if (dispatched) {
    const channelTitle =
      dispatched.channel === 'whatsapp'
        ? 'WhatsApp'
        : dispatched.channel === 'email'
          ? 'Email'
          : 'SMS';
    return (
      <m.div
        animate={{ opacity: 1, y: 0 }}
        className="form-result form-result--success"
        data-testid="contact-form-confirmation"
        initial={{ opacity: 0, y: 8 }}
        role="status"
        transition={{ duration: motionDurations.fast, ease: motionEasings.out }}
      >
        <span className="result-indicator">
          <CheckCircle2 aria-hidden="true" size={15} />
          {redirecting ? `SUCCESS · OPENING ${channelTitle.toUpperCase()}…` : 'MESSAGE CONFIRMED'}
        </span>
        <strong>
          {redirecting
            ? `Message verified! Redirecting to ${channelTitle}…`
            : `${channelTitle} launch triggered — ready to send directly.`}
        </strong>
        <p>
          If your messaging app didn&apos;t open automatically, tap any channel below or copy your
          formatted message:
        </p>
        <div className="fallback-actions">
          <a
            className="email-draft-link"
            href={dispatched.whatsappUrl}
            rel="noopener noreferrer"
            target="_blank"
          >
            <MessageCircle aria-hidden="true" size={15} /> Open WhatsApp
          </a>
          <a className="button button--quiet" href={dispatched.mailtoUrl}>
            <Mail aria-hidden="true" size={15} /> Open Email
          </a>
          <a className="button button--quiet" href={dispatched.smsUrl}>
            <MessageSquare aria-hidden="true" size={15} /> Send SMS
          </a>
          <button className="button button--quiet" onClick={copyFormattedMessage} type="button">
            {copiedMessage ? (
              <Check aria-hidden="true" size={15} />
            ) : (
              <Copy aria-hidden="true" size={15} />
            )}
            {copiedMessage ? 'Copied' : 'Copy text'}
          </button>
        </div>
        <button
          className="composer-reset-btn"
          onClick={() => {
            clearDispatchTimers();
            setRedirecting(false);
            setDispatched(null);
          }}
          type="button"
        >
          Compose another message
        </button>
      </m.div>
    );
  }

  return (
    <form className="contact-form contact-form--page" noValidate onSubmit={handleSubmit}>
      <LayoutGroup id="contact-delivery-channel">
        <div aria-label="Choose direct delivery channel" className="channel-switcher" role="group">
          {CHANNELS.map((item) => {
            const active = channel === item.id;
            const ChannelIcon =
              item.id === 'whatsapp' ? MessageCircle : item.id === 'email' ? Mail : MessageSquare;
            return (
              <button
                aria-pressed={active}
                className={`channel-tab ${active ? 'channel-tab--active' : ''}`}
                key={item.id}
                onClick={() => {
                  setChannel(item.id);
                  setErrorMessage('');
                }}
                type="button"
              >
                {active ? (
                  <m.span
                    aria-hidden="true"
                    className="channel-tab-pill"
                    layoutId="active-delivery-channel"
                    transition={motionSprings.snappy}
                  />
                ) : null}
                <span className="channel-tab-content">
                  <ChannelIcon aria-hidden="true" size={14} />
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </LayoutGroup>

      {errorMessage ? (
        <m.p
          animate={{ opacity: 1, y: 0 }}
          className="form-error"
          initial={{ opacity: 0, y: 6 }}
          role="alert"
          transition={{ duration: motionDurations.micro, ease: motionEasings.out }}
        >
          {errorMessage}
        </m.p>
      ) : null}

      <fieldset className="form-fields">
        <div className="form-field-row">
          <div className="form-field">
            <input
              autoComplete="name"
              id="contact-name"
              maxLength={120}
              minLength={2}
              name="name"
              placeholder=" "
              required
              type="text"
            />
            <label htmlFor="contact-name">Your Name</label>
          </div>
          <div className="form-field">
            <input
              aria-describedby="contact-email-help"
              autoComplete="email"
              id="contact-email"
              maxLength={254}
              name="email"
              placeholder=" "
              required={channel === 'email'}
              type="email"
            />
            <label htmlFor="contact-email">
              {channel === 'email' ? 'Reply Email' : 'Reply Email (optional)'}
            </label>
          </div>
        </div>
        <p className="form-help" id="contact-email-help">
          No database storage — opens straight into {activeChannelMeta?.label} with your message
          pre-filled.
        </p>
        <div className="form-field">
          <input
            autoComplete="organization"
            id="contact-org"
            maxLength={120}
            name="organization"
            placeholder=" "
            type="text"
          />
          <label htmlFor="contact-org">Company / Site (optional)</label>
        </div>
        <div className="form-field">
          <textarea
            id="contact-message"
            maxLength={5000}
            minLength={10}
            name="message"
            placeholder=" "
            required
            rows={4}
          />
          <label htmlFor="contact-message">Role, shift timing, or site details</label>
        </div>
        <m.button
          aria-busy={submitting}
          className={`button button--primary form-submit ${submitting ? 'form-submit--loading' : ''}`}
          disabled={submitting}
          type="submit"
          {...(!submitting ? { whileTap: { scale: 0.97 } } : {})}
        >
          {submitting ? (
            <>
              <Loader2 aria-hidden="true" className="spin-icon" size={16} />
              Preparing {activeChannelMeta?.label}…
            </>
          ) : (
            <>
              <Send aria-hidden="true" size={16} />
              {activeChannelMeta?.cta}
              <ArrowRight aria-hidden="true" size={16} />
            </>
          )}
        </m.button>
      </fieldset>
    </form>
  );
}
