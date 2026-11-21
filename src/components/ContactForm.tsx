import { LayoutGroup, m } from 'framer-motion';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { ArrowRight, Check, Copy, Mail, MessageCircle, MessageSquare, Send } from 'lucide-react';
import { contact } from '@/data/contact';
import { motionDurations, motionEasings, motionSprings } from '@/motion';
import { useToast } from './ToastProvider';

type DeliveryChannel = 'whatsapp' | 'email' | 'sms';
type SubmitPhase = 'idle' | 'loading' | 'success';

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
    smsUrl: `sms:+${contact.whatsappNumber}?&body=${encodedText}`,
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

type FieldKey = 'name' | 'email' | 'organization' | 'message';
type FieldErrors = Partial<Record<FieldKey, string>>;

const FIELD_DOM_IDS: Record<FieldKey, string> = {
  name: '#contact-name',
  email: '#contact-email',
  organization: '#contact-org',
  message: '#contact-message',
};

export function ContactForm() {
  const [channel, setChannel] = useState<DeliveryChannel>('whatsapp');
  const [errorMessage, setErrorMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [submitPhase, setSubmitPhase] = useState<SubmitPhase>('idle');
  const [lastDispatch, setLastDispatch] = useState<PreparedDispatch | null>(null);
  const [copiedMessage, setCopiedMessage] = useState(false);
  const prepareTimerRef = useRef<number | null>(null);
  const redirectTimerRef = useRef<number | null>(null);
  const resetTimerRef = useRef<number | null>(null);
  const showToast = useToast();

  const submitting = submitPhase === 'loading';
  const succeeded = submitPhase === 'success';
  const busy = submitPhase !== 'idle';

  function clearFieldError(field: FieldKey) {
    setFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }

  function clearDispatchTimers() {
    if (prepareTimerRef.current !== null) {
      window.clearTimeout(prepareTimerRef.current);
      prepareTimerRef.current = null;
    }
    if (redirectTimerRef.current !== null) {
      window.clearTimeout(redirectTimerRef.current);
      redirectTimerRef.current = null;
    }
    if (resetTimerRef.current !== null) {
      window.clearTimeout(resetTimerRef.current);
      resetTimerRef.current = null;
    }
  }

  useEffect(() => {
    return () => {
      clearDispatchTimers();
    };
  }, []);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;

    const form = event.currentTarget;
    const formData = new FormData(form);
    const fields = {
      name: String(formData.get('name') ?? '').trim(),
      email: String(formData.get('email') ?? '').trim(),
      organization: String(formData.get('organization') ?? '').trim(),
      message: String(formData.get('message') ?? '').trim(),
    };

    const nextErrors: FieldErrors = {};
    let firstInvalidField: FieldKey | null = null;

    if (fields.name.length < 2 || fields.name.length > 120) {
      nextErrors.name = 'Enter your name (2–120 characters).';
      firstInvalidField ??= 'name';
    }

    if (channel === 'email' && (!fields.email || !EMAIL_PATTERN.test(fields.email))) {
      nextErrors.email = 'Enter a valid reply email address for Email delivery.';
      firstInvalidField ??= 'email';
    } else if (fields.email && (fields.email.length > 254 || !EMAIL_PATTERN.test(fields.email))) {
      nextErrors.email = 'Enter a valid email address (254 characters or fewer).';
      firstInvalidField ??= 'email';
    }

    if (fields.organization.length > 120) {
      nextErrors.organization = 'Keep the organization name to 120 characters or fewer.';
      firstInvalidField ??= 'organization';
    }

    if (fields.message.length < 10 || fields.message.length > 5000) {
      nextErrors.message = 'Enter a message between 10 and 5,000 characters.';
      firstInvalidField ??= 'message';
    }

    if (firstInvalidField) {
      const firstMsg = nextErrors[firstInvalidField] ?? 'Please check the highlighted fields.';
      setErrorMessage(firstMsg);
      setFieldErrors(nextErrors);
      form.querySelector<HTMLElement>(FIELD_DOM_IDS[firstInvalidField])?.focus();
      return;
    }

    setErrorMessage('');
    setFieldErrors({});
    clearDispatchTimers();

    try {
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

      setSubmitPhase('loading');

      // Dispatch quickly so the browser still treats it as part of the click (popup blockers).
      prepareTimerRef.current = window.setTimeout(() => {
        prepareTimerRef.current = null;
        setSubmitPhase('success');
        setLastDispatch(prepared);

        try {
          triggerAnchorDispatch(targetHref, channel === 'whatsapp');
          showToast({
            type: 'success',
            title: 'TRANSMITTED',
            message: `${channelLabel} opened with your message.`,
          });
        } catch {
          showToast({
            type: 'error',
            title: 'Launch blocked',
            message: `Use the ${channelLabel} link below to open manually.`,
          });
        }

        resetTimerRef.current = window.setTimeout(() => {
          resetTimerRef.current = null;
          setSubmitPhase('idle');
        }, 2200);
      }, 450);
    } catch {
      clearDispatchTimers();
      setSubmitPhase('idle');
      showToast({
        type: 'error',
        title: 'Transmission failed',
        message: 'Could not prepare message links. Please try again.',
      });
    }
  }

  async function copyFormattedMessage() {
    if (!lastDispatch) return;
    try {
      await navigator.clipboard.writeText(lastDispatch.plainText);
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

  return (
    <form
      aria-busy={submitting}
      className="contact-form contact-form--page"
      noValidate
      onSubmit={handleSubmit}
    >
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
                disabled={busy}
                key={item.id}
                onClick={() => {
                  setChannel(item.id);
                  setErrorMessage('');
                  setFieldErrors({});
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
        <legend className="sr-only">Direct message composer fields</legend>
        <div className="form-field-row">
          <div className={`form-field ${fieldErrors.name ? 'form-field--invalid' : ''}`}>
            <input
              aria-describedby={fieldErrors.name ? 'contact-name-error' : undefined}
              aria-invalid={Boolean(fieldErrors.name)}
              autoComplete="name"
              id="contact-name"
              maxLength={120}
              minLength={2}
              name="name"
              onChange={() => clearFieldError('name')}
              placeholder=" "
              required
              type="text"
            />
            <label htmlFor="contact-name">Your Name</label>
            {fieldErrors.name ? (
              <span className="form-field-error field-error" id="contact-name-error" role="alert">
                {fieldErrors.name}
              </span>
            ) : null}
          </div>
          <div className={`form-field ${fieldErrors.email ? 'form-field--invalid' : ''}`}>
            <input
              aria-describedby={
                fieldErrors.email ? 'contact-email-error contact-email-help' : 'contact-email-help'
              }
              aria-invalid={Boolean(fieldErrors.email)}
              autoComplete="email"
              id="contact-email"
              maxLength={254}
              name="email"
              onChange={() => clearFieldError('email')}
              placeholder=" "
              required={channel === 'email'}
              type="email"
            />
            <label htmlFor="contact-email">
              {channel === 'email' ? 'Reply Email' : 'Reply Email (optional)'}
            </label>
            {fieldErrors.email ? (
              <span className="form-field-error field-error" id="contact-email-error" role="alert">
                {fieldErrors.email}
              </span>
            ) : null}
          </div>
        </div>
        <p className="form-help" id="contact-email-help">
          No database storage — opens straight into {activeChannelMeta?.label} with your message
          pre-filled.
        </p>
        <div className={`form-field ${fieldErrors.organization ? 'form-field--invalid' : ''}`}>
          <input
            aria-describedby={fieldErrors.organization ? 'contact-org-error' : undefined}
            aria-invalid={Boolean(fieldErrors.organization)}
            autoComplete="organization"
            id="contact-org"
            maxLength={120}
            name="organization"
            onChange={() => clearFieldError('organization')}
            placeholder=" "
            type="text"
          />
          <label htmlFor="contact-org">Company / Site (optional)</label>
          {fieldErrors.organization ? (
            <span className="form-field-error field-error" id="contact-org-error" role="alert">
              {fieldErrors.organization}
            </span>
          ) : null}
        </div>
        <div className={`form-field ${fieldErrors.message ? 'form-field--invalid' : ''}`}>
          <textarea
            aria-describedby={fieldErrors.message ? 'contact-message-error' : undefined}
            aria-invalid={Boolean(fieldErrors.message)}
            id="contact-message"
            maxLength={5000}
            minLength={10}
            name="message"
            onChange={() => clearFieldError('message')}
            placeholder=" "
            required
            rows={4}
          />
          <label htmlFor="contact-message">Role, shift timing, or site details</label>
          {fieldErrors.message ? (
            <span className="form-field-error field-error" id="contact-message-error" role="alert">
              {fieldErrors.message}
            </span>
          ) : null}
        </div>
        <button
          aria-busy={submitting}
          aria-live="polite"
          className={`button button--primary form-submit ${
            submitting ? 'form-submit--loading is-loading' : ''
          } ${succeeded ? 'is-success' : ''}`}
          disabled={busy}
          type="submit"
        >
          {submitting ? (
            <>
              <span aria-hidden="true" className="mi-spinner" />
              <span>TRANSMITTING...</span>
            </>
          ) : succeeded ? (
            <>
              <svg aria-hidden="true" className="mi-check-svg" viewBox="0 0 24 24">
                <path className="mi-check-path" d="M5 13l4 4L19 7" />
              </svg>
              <span>TRANSMITTED</span>
            </>
          ) : (
            <>
              <Send aria-hidden="true" size={16} />
              <span>{activeChannelMeta?.cta}</span>
              <ArrowRight aria-hidden="true" size={16} />
            </>
          )}
        </button>

        {lastDispatch ? (
          <div className="fallback-actions" data-testid="contact-form-confirmation">
            <a
              className="email-draft-link"
              href={lastDispatch.whatsappUrl}
              rel="noopener noreferrer"
              target="_blank"
            >
              <MessageCircle aria-hidden="true" size={15} /> Open WhatsApp
              <span className="sr-only"> (opens in new tab)</span>
            </a>
            <a className="button button--quiet" href={lastDispatch.mailtoUrl}>
              <Mail aria-hidden="true" size={15} /> Open Email
            </a>
            <a className="button button--quiet" href={lastDispatch.smsUrl}>
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
        ) : null}
      </fieldset>
    </form>
  );
}
