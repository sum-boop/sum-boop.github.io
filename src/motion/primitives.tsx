import {
  animate,
  m,
  useAnimationFrame,
  useInView,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
} from 'framer-motion';
import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type PropsWithChildren,
} from 'react';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { motionDurations, motionEasings, motionSprings, motionStaggers } from './tokens';
import { useMotionTier } from './useMotionTier';
import {
  heroStaggerVariants,
  revealVariants,
  staggerContainerVariants,
  staggerItemVariants,
} from './variants';
import { useIsTouch } from './useIsTouch';

export type RevealDirection = 'up' | 'left' | 'right';
export type ChoreoDirection =
  'up' | 'down' | 'left' | 'right' | 'scale' | 'clip' | 'draw-x' | 'draw-y';

interface RevealProps extends PropsWithChildren {
  className?: string;
  direction?: RevealDirection;
}

export function Reveal({ children, className, direction = 'up' }: RevealProps) {
  const isTouch = useIsTouch();
  const prefersReducedMotion = useReducedMotion();
  const reduce = isTouch || prefersReducedMotion;

  const initial = reduce
    ? { opacity: 1, x: 0, y: 0 }
    : direction === 'left'
      ? { opacity: 0, x: -24, y: 0 }
      : direction === 'right'
        ? { opacity: 0, x: 24, y: 0 }
        : { opacity: 0, x: 0, y: 24 };

  return (
    <m.div
      className={className ? `motion-reveal ${className}` : 'motion-reveal'}
      initial={initial}
      transition={{ duration: reduce ? 0.01 : motionDurations.base, ease: motionEasings.out }}
      viewport={{ once: true, amount: 0.12 }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      {...(!reduce ? { variants: revealVariants } : {})}
    >
      {children}
    </m.div>
  );
}

interface ChoreoRevealProps extends PropsWithChildren {
  className?: string;
  direction?: ChoreoDirection;
  delay?: number;
  distance?: number;
  range?: string;
  as?: 'div' | 'article' | 'header' | 'li' | 'p';
  'data-testid'?: string;
}

function getFramerInitial(direction: ChoreoDirection, distance: number) {
  switch (direction) {
    case 'down':
      return { opacity: 0, y: -distance };
    case 'left':
      return { opacity: 0, x: -distance };
    case 'right':
      return { opacity: 0, x: distance };
    case 'scale':
      return { opacity: 0, scale: 0.96, y: 12 };
    case 'clip':
      return { opacity: 0, y: 14 };
    case 'draw-x':
      return { opacity: 0, scaleX: 0 };
    case 'draw-y':
      return { opacity: 0, scaleY: 0 };
    case 'up':
    default:
      return { opacity: 0, y: distance };
  }
}

function getFramerTarget(direction: ChoreoDirection) {
  switch (direction) {
    case 'left':
    case 'right':
      return { opacity: 1, x: 0 };
    case 'scale':
      return { opacity: 1, scale: 1, y: 0 };
    case 'clip':
      return { opacity: 1, y: 0 };
    case 'draw-x':
      return { opacity: 1, scaleX: 1 };
    case 'draw-y':
      return { opacity: 1, scaleY: 1 };
    case 'down':
    case 'up':
    default:
      return { opacity: 1, y: 0 };
  }
}

export function ChoreoReveal({
  children,
  className,
  direction = 'up',
  delay = 0,
  distance = 20,
  range = 'entry 0% cover 26%',
  as = 'div',
  'data-testid': dataTestId,
}: ChoreoRevealProps) {
  const tier = useMotionTier();

  if (tier === 'reduced') {
    const StaticTag = as;
    return (
      <StaticTag className={className ?? ''} data-testid={dataTestId}>
        {children}
      </StaticTag>
    );
  }

  if (tier === 'native') {
    const NativeTag = as;
    const nativeStyle: CSSProperties & Record<string, string> = {
      '--reveal-distance': `${distance}px`,
      '--reveal-range': range,
      animationDelay: delay > 0 ? `${delay}s` : '0s',
    };
    return (
      <NativeTag
        className={`choreo-native reveal-${direction} ${className ?? ''}`.trim()}
        data-testid={dataTestId}
        style={nativeStyle}
      >
        {children}
      </NativeTag>
    );
  }

  const MotionTag =
    as === 'article'
      ? m.article
      : as === 'header'
        ? m.header
        : as === 'li'
          ? m.li
          : as === 'p'
            ? m.p
            : m.div;

  const transformOrigin =
    direction === 'draw-x' ? 'left center' : direction === 'draw-y' ? 'top center' : undefined;
  const clampedDistance = Math.min(distance, 20);

  return (
    <MotionTag
      className={className ?? ''}
      data-testid={dataTestId}
      initial={getFramerInitial(direction, clampedDistance)}
      {...(transformOrigin ? { style: { transformOrigin } } : {})}
      transition={{
        duration: motionDurations.fast,
        delay: Math.min(delay, 0.14),
        ease: motionEasings.out,
      }}
      viewport={{ once: true, amount: 'some' }}
      whileInView={getFramerTarget(direction)}
    >
      {children}
    </MotionTag>
  );
}

interface StaggerGroupProps extends PropsWithChildren {
  className?: string;
  immediate?: boolean;
}

export function StaggerGroup({ children, className, immediate = false }: StaggerGroupProps) {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return <div className={className ?? ''}>{children}</div>;
  }

  return (
    <m.div
      className={className ?? ''}
      initial="hidden"
      variants={immediate ? heroStaggerVariants : staggerContainerVariants}
      {...(immediate
        ? { animate: 'visible' }
        : { whileInView: 'visible', viewport: { once: true, amount: 0.15 } })}
    >
      {children}
    </m.div>
  );
}

export function StaggerItem({ children, className }: PropsWithChildren<{ className?: string }>) {
  const prefersReducedMotion = useReducedMotion();
  if (prefersReducedMotion) {
    return <div className={className ?? ''}>{children}</div>;
  }

  return (
    <m.div className={className ?? ''} variants={staggerItemVariants}>
      {children}
    </m.div>
  );
}

interface SplitTextProps {
  text: string;
  className?: string;
  delay?: number;
}

export function SplitText({ text, className, delay = 0 }: SplitTextProps) {
  const prefersReducedMotion = useReducedMotion();
  const words = text.split(' ');

  return (
    <span aria-hidden="true" className={className ? `split-text ${className}` : 'split-text'}>
      {words.map((word, index) => {
        const wordDelay = Math.min(delay + index * motionStaggers.words, motionStaggers.maxGroup);
        return (
          <span className="split-word-mask" key={`${word}-${index}`}>
            <m.span
              animate={{ opacity: 1, y: 0 }}
              className="split-word"
              initial={prefersReducedMotion ? false : { opacity: 0, y: 24 }}
              transition={{
                duration: prefersReducedMotion ? 0.01 : motionDurations.base,
                delay: prefersReducedMotion ? 0 : wordDelay,
                ease: motionEasings.out,
              }}
            >
              {word}
            </m.span>
          </span>
        );
      })}
    </span>
  );
}

interface CounterProps {
  value: string;
  className?: string;
}

export function Counter({ value, className }: CounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.05 });
  const prefersReducedMotion = useReducedMotion();
  const match = /^(\d+)([+%]?)$/.exec(value);
  const target = match ? Number(match[1]) : null;
  const suffix = match?.[2] ?? '';
  const [animatedValue, setAnimatedValue] = useState<string | null>(null);

  useEffect(() => {
    if (!isInView || prefersReducedMotion || target === null) return;

    const controls = animate(0, target, {
      duration: 0.3,
      ease: motionEasings.out,
      onUpdate: (latest) => setAnimatedValue(`${Math.round(latest)}${suffix}`),
      onComplete: () => setAnimatedValue(value),
    });

    return () => controls.stop();
  }, [isInView, prefersReducedMotion, suffix, target, value]);

  const renderedValue = prefersReducedMotion || target === null ? value : (animatedValue ?? value);

  return (
    <span className={className ? `tabular-nums ${className}` : 'tabular-nums'} ref={ref}>
      {renderedValue}
    </span>
  );
}

interface ParallaxProps extends PropsWithChildren {
  className?: string;
  depth?: number;
  scale?: number;
}

export function Parallax({ children, className, depth = 18, scale = 0.015 }: ParallaxProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isTouch = useIsTouch();
  const prefersReducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });
  const y = useTransform(scrollYProgress, [0, 1], [-depth, depth]);
  const scaleValue = useTransform(scrollYProgress, [0, 1], [1 + scale, 1 - scale]);
  const reduce = isTouch || prefersReducedMotion;

  return (
    <m.div
      className={className ?? ''}
      ref={ref}
      {...(!reduce ? { style: { y, scale: scaleValue } } : {})}
    >
      {children}
    </m.div>
  );
}

interface MagneticProps extends PropsWithChildren {
  className?: string;
}

export function Magnetic({ children, className }: MagneticProps) {
  const isTouch = useIsTouch();
  const prefersReducedMotion = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, motionSprings.soft);
  const springY = useSpring(y, motionSprings.soft);
  const enabled = !isTouch && !prefersReducedMotion;

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!enabled || event.pointerType === 'touch') return;
    const bounds = event.currentTarget.getBoundingClientRect();
    x.set((event.clientX - bounds.left - bounds.width / 2) * 0.08);
    y.set((event.clientY - bounds.top - bounds.height / 2) * 0.08);
  };

  const reset = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <m.div
      className={className ? `magnetic-wrap ${className}` : 'magnetic-wrap'}
      onPointerLeave={reset}
      onPointerMove={onPointerMove}
      {...(enabled ? { style: { x: springX, y: springY } } : {})}
    >
      {children}
    </m.div>
  );
}

interface MarqueeProps {
  items: readonly string[];
  className?: string;
}

export function Marquee({ items, className }: MarqueeProps) {
  const prefersReducedMotion = useReducedMotion();
  const trackRef = useRef<HTMLDivElement>(null);
  const cycleWidth = useRef(0);
  const offset = useRef(0);
  const pausedRef = useRef(false);
  const x = useMotionValue(0);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const measure = () => {
      cycleWidth.current = track.scrollWidth / 2;
    };
    const observer = new ResizeObserver(measure);
    observer.observe(track);
    measure();

    if (prefersReducedMotion) return () => observer.disconnect();

    let frame = 0;
    let previousTime = 0;
    const speedPxPerSec = -38;

    const tick = (time: number) => {
      const delta = previousTime === 0 ? 0 : Math.min(time - previousTime, 64);
      previousTime = time;
      const width = cycleWidth.current;
      if (!pausedRef.current && document.visibilityState !== 'hidden' && width > 0 && delta > 0) {
        let nextOffset = offset.current + (speedPxPerSec * delta) / 1000;
        if (nextOffset <= -width) nextOffset += width;
        if (nextOffset > 0) nextOffset -= width;
        offset.current = nextOffset;
        x.set(nextOffset);
      }
      frame = window.requestAnimationFrame(tick);
    };
    frame = window.requestAnimationFrame(tick);

    return () => {
      observer.disconnect();
      window.cancelAnimationFrame(frame);
    };
  }, [items, prefersReducedMotion, x]);

  const repeatedItems = [...items, ...items];

  return (
    <m.div
      className={className ?? ''}
      onMouseEnter={() => {
        pausedRef.current = true;
      }}
      onMouseLeave={() => {
        pausedRef.current = false;
      }}
      ref={trackRef}
      style={{ x }}
    >
      {repeatedItems.map((item, index) => (
        <span aria-hidden={index >= items.length} key={`${item}-${index}`}>
          {item}
          <i aria-hidden="true" />
        </span>
      ))}
    </m.div>
  );
}

interface VelocityRowProps {
  items: readonly string[];
  baseVelocity: number;
  pausedRef: { current: boolean };
  className?: string;
}

function VelocityRow({ items, baseVelocity, pausedRef, className }: VelocityRowProps) {
  const prefersReducedMotion = useReducedMotion();
  const trackRef = useRef<HTMLDivElement>(null);
  const cycleWidth = useRef(0);
  const offset = useRef(0);
  const x = useMotionValue(0);
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(scrollVelocity, { damping: 48, stiffness: 320 });
  const velocityFactor = useTransform(smoothVelocity, [-1800, 0, 1800], [-3.2, 0, 3.2]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const measure = () => {
      cycleWidth.current = track.scrollWidth / 2;
      if (baseVelocity > 0 && offset.current === 0 && cycleWidth.current > 0) {
        offset.current = -cycleWidth.current / 2;
        x.set(offset.current);
      }
    };
    const observer = new ResizeObserver(measure);
    observer.observe(track);
    measure();
    return () => observer.disconnect();
  }, [baseVelocity, items, x]);

  useAnimationFrame((_, delta) => {
    if (prefersReducedMotion || pausedRef.current || document.visibilityState === 'hidden') return;
    const width = cycleWidth.current;
    if (width <= 0) return;

    const clampedDelta = Math.min(delta, 48);
    const boost = velocityFactor.get();
    const direction = baseVelocity < 0 ? -1 : 1;
    const moveBy = ((baseVelocity + direction * Math.abs(boost) * 28) * clampedDelta) / 1000;

    let next = offset.current + moveBy;
    if (next <= -width) next += width;
    if (next > 0) next -= width;
    offset.current = next;
    x.set(next);
  });

  if (prefersReducedMotion) {
    return (
      <div className={`velocity-marquee-row ${className ?? ''}`.trim()}>
        {items.map((item) => (
          <span className="velocity-marquee-chip" key={item}>
            {item}
            <i aria-hidden="true" />
          </span>
        ))}
      </div>
    );
  }

  const repeated = [...items, ...items];

  return (
    <m.div
      className={`velocity-marquee-row ${className ?? ''}`.trim()}
      ref={trackRef}
      style={{ x }}
    >
      {repeated.map((item, index) => (
        <span
          aria-hidden={index >= items.length}
          className="velocity-marquee-chip"
          key={`${item}-${index}`}
        >
          {item}
          <i aria-hidden="true" />
        </span>
      ))}
    </m.div>
  );
}

export function VelocityMarquee({ items, className }: MarqueeProps) {
  const pausedRef = useRef(false);
  const reverseItems = [...items].reverse();

  return (
    <div
      aria-hidden="true"
      className={`velocity-marquee ${className ?? ''}`.trim()}
      onMouseEnter={() => {
        pausedRef.current = true;
      }}
      onMouseLeave={() => {
        pausedRef.current = false;
      }}
    >
      <VelocityRow baseVelocity={-36} items={items} pausedRef={pausedRef} />
      <VelocityRow
        baseVelocity={28}
        className="velocity-marquee-row--secondary"
        items={reverseItems}
        pausedRef={pausedRef}
      />
    </div>
  );
}

export function PageTransition({ children, className }: PropsWithChildren<{ className?: string }>) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <m.div
      animate={{ opacity: 1, y: 0 }}
      className={className ? `page-transition ${className}` : 'page-transition'}
      initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
      transition={{ duration: motionDurations.base, ease: motionEasings.inOut }}
    >
      {children}
    </m.div>
  );
}
