import { m } from 'framer-motion';
import { ArrowUpRight, BriefcaseBusiness, Camera, GitBranch } from 'lucide-react';
import { socialLinks } from '@/data/contact';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { motionSprings, motionStaggers } from '@/motion/tokens';
import { useIsTouch } from '@/motion/useIsTouch';
import type { SocialPlatform } from '@/types/portfolio';

interface SocialLinksProps {
  variant?: 'hero' | 'footer';
  className?: string;
}

function getPlatformIcon(platform: SocialPlatform) {
  switch (platform) {
    case 'linkedin':
      return BriefcaseBusiness;
    case 'github':
      return GitBranch;
    case 'instagram':
    default:
      return Camera;
  }
}

export function SocialLinks({ variant = 'hero', className }: SocialLinksProps) {
  const prefersReducedMotion = useReducedMotion();
  const isTouch = useIsTouch();
  const interactive = !prefersReducedMotion && !isTouch;

  return (
    <div
      aria-label="Social media and developer profiles"
      className={`social-links social-links--${variant} ${className ?? ''}`.trim()}
    >
      {socialLinks.map((social, index) => {
        const Icon = getPlatformIcon(social.id);
        return (
          <m.a
            animate={{ opacity: 1, y: 0, scale: 1 }}
            aria-label={`${social.label} — ${social.handle}`}
            className={`social-links-item social-links-item--${social.id}`}
            href={social.href}
            initial={prefersReducedMotion ? false : { opacity: 0, y: 12, scale: 0.94 }}
            key={social.id}
            rel="noopener noreferrer"
            target="_blank"
            title={`${social.label} (${social.handle})`}
            transition={{
              ...motionSprings.snappy,
              delay: prefersReducedMotion ? 0 : index * motionStaggers.drawer,
            }}
            {...(interactive
              ? {
                  whileHover: { y: -3, scale: 1.04 },
                  whileTap: { scale: 0.95 },
                }
              : {})}
          >
            <span aria-hidden="true" className="social-links-icon">
              <Icon size={variant === 'footer' ? 15 : 16} strokeWidth={1.85} />
            </span>
            {variant === 'footer' ? (
              <span className="social-links-label">
                {social.label}
                <ArrowUpRight aria-hidden="true" size={12} />
              </span>
            ) : null}
          </m.a>
        );
      })}
    </div>
  );
}
