import { memo, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowUpRight, Terminal } from 'lucide-react';
import { HeroOrb } from '@/components/three/HeroOrb';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import type { ThemeMode } from '@/hooks/useTheme';
import '@/styles/exact5lab.css';

gsap.registerPlugin(ScrollTrigger);

interface HeroProps {
  theme: ThemeMode;
  onToggleTheme: (origin?: { x: number; y: number }) => void;
  onOpenPalette: () => void;
}

export const Hero = memo(function Hero(props: HeroProps) {
  void props;
  const heroRef = useRef<HTMLElement>(null);
  const orbLayerRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const panelsRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const heroEl = heroRef.current;
    const orbLayerEl = orbLayerRef.current;
    if (!heroEl || !orbLayerEl) return;

    const sceneEl = document.getElementById('scene');
    const handoffTrigger = ScrollTrigger.create({
      trigger: sceneEl ?? heroEl,
      start: sceneEl ? 'top top' : 'bottom top',
      onEnter: () => gsap.set(orbLayerEl, { autoAlpha: 0 }),
      onLeaveBack: () => gsap.set(orbLayerEl, { autoAlpha: 1 }),
    });

    const syncInitial = () => {
      const targetRect = (sceneEl ?? heroEl).getBoundingClientRect();
      const hidden = sceneEl ? targetRect.top <= 0 : targetRect.bottom <= 0;
      gsap.set(orbLayerEl, { autoAlpha: hidden ? 0 : 1 });
    };
    syncInitial();

    return () => {
      handoffTrigger.kill();
    };
  }, []);

  useEffect(() => {
    if (prefersReducedMotion) return;
    const headlineEl = headlineRef.current;
    const panelsEl = panelsRef.current;
    const orbLayerEl = orbLayerRef.current;
    const heroEl = heroRef.current;
    if (!headlineEl || !heroEl) return;

    let mm: gsap.MatchMedia | null = null;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      tl.fromTo(
        headlineEl.querySelectorAll('.hero-line'),
        { y: 56, opacity: 0, rotateX: -15 },
        { y: 0, opacity: 1, rotateX: 0, duration: 1.05, stagger: 0.14 },
      );

      if (panelsEl) {
        tl.fromTo(
          panelsEl.children,
          { y: 40, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.9, stagger: 0.2 },
          '-=0.6',
        );
      }

      const sceneEl = document.getElementById('scene');

      gsap.fromTo(
        headlineEl.querySelectorAll('.hero-line'),
        { xPercent: 0, opacity: 1 },
        {
          xPercent: (index: number) => -115 - index * 45,
          opacity: 0,
          immediateRender: false,
          ease: 'none',
          scrollTrigger: {
            trigger: heroEl,
            start: 'top top',
            end: sceneEl ? 'top top' : 'bottom top',
            endTrigger: sceneEl ?? heroEl,
            scrub: 0.55,
          },
        },
      );

      const eyebrowEl = heroEl.querySelector('.hero-eyebrow-wrapper-5lab');
      if (eyebrowEl) {
        gsap.fromTo(
          eyebrowEl,
          { opacity: 1, y: 0 },
          {
            opacity: 0,
            y: -24,
            immediateRender: false,
            ease: 'none',
            scrollTrigger: {
              trigger: heroEl,
              start: 'top top',
              end: 'top+=45% top',
              scrub: true,
            },
          },
        );
      }

      if (orbLayerEl) {
        const rings = orbLayerEl.querySelectorAll('.hero-orb-ring');
        if (rings.length) {
          gsap.fromTo(
            rings,
            { opacity: 1, scale: 1 },
            {
              opacity: 0,
              scale: 0.8,
              immediateRender: false,
              ease: 'none',
              scrollTrigger: {
                trigger: heroEl,
                start: 'top top',
                end: 'top+=55% top',
                scrub: true,
              },
            },
          );
        }

        mm = gsap.matchMedia();
        mm.add('(max-width: 767px)', () => {
          gsap.fromTo(
            orbLayerEl,
            { y: '0vh' },
            {
              y: '10vh',
              immediateRender: false,
              ease: 'none',
              scrollTrigger: {
                trigger: heroEl,
                start: 'top top',
                endTrigger: sceneEl ?? heroEl,
                end: sceneEl ? 'top top' : 'bottom top',
                scrub: true,
              },
            },
          );
        });
      }
    }, heroRef);

    return () => {
      mm?.revert();
      ctx.revert();
    };
  }, [prefersReducedMotion]);

  return (
    <section aria-labelledby="hero-title" className="hero-section-5lab" id="hero" ref={heroRef}>
      <div className="hero-orb-layer" aria-hidden="true" ref={orbLayerRef}>
        <span className="hero-orb-ring hero-orb-ring--outer" />
        <span className="hero-orb-ring hero-orb-ring--inner" />
        <HeroOrb />
      </div>
      <div className="hero-noise-grain" aria-hidden="true" />
      <div className="hero-content-shell-5lab">
        {/* Role eyebrow */}
        <div className="hero-eyebrow-wrapper-5lab">
          <span className="hero-live-badge">
            <span className="status-pulse" />
            CCTV Operator &amp; Surveillance Specialist
          </span>
          <span className="hero-location-5lab">Patli, Haryana · NCR Logistics</span>
        </div>

        {/* Huge stacked split-line headline */}
        <h1 className="hero-title-5lab-exact" id="hero-title" ref={headlineRef}>
          <span className="hero-line">
            <span>Sumit </span>
            <em className="hero-italic-accent">Anand</em>
          </span>
          <span className="hero-line hero-line-indent-exact">
            <span>Eyes on </span>
            <em className="hero-italic-accent">every hub.</em>
          </span>
        </h1>

        {/* Two large side-by-side panels (Design & Develop equivalents) */}
        <div className="hero-panels-grid-5lab sr-only" ref={panelsRef}>
          <a className="hero-panel-card-5lab" href="#operations">
            <div className="hero-panel-meta">
              <span className="hero-panel-index">01</span>
              <span className="hero-panel-tag">OPERATIONS</span>
            </div>
            <div className="hero-panel-body">
              <h3>Deployments &amp; Cameras</h3>
              <p>
                32+ IP cameras across Patli-NCR logistics hubs, Milestone XProtect VMS &amp; GIGO
                gate control.
              </p>
            </div>
            <div className="hero-panel-action">
              <span>View live deployments</span>
              <ArrowUpRight aria-hidden="true" size={18} />
            </div>
          </a>

          <a className="hero-panel-card-5lab" href="#hero-workstation">
            <div className="hero-panel-meta">
              <span className="hero-panel-index">02</span>
              <span className="hero-panel-tag">SYSTEMS</span>
            </div>
            <div className="hero-panel-body">
              <h3>3D Command Workstation</h3>
              <p>
                Interactive 3D VMS control room simulator, BriefCam L4 video analytics &amp; alarm
                telemetry.
              </p>
            </div>
            <div className="hero-panel-action">
              <span>Launch workstation</span>
              <Terminal aria-hidden="true" size={18} />
            </div>
          </a>
        </div>
      </div>
    </section>
  );
});
