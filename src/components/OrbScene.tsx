import { memo, useEffect, useMemo, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Aperture } from 'lucide-react';
import { useReducedMotion } from '@/hooks/useReducedMotion';

gsap.registerPlugin(ScrollTrigger);

const DOT_COUNT = 48;

export const OrbScene = memo(function OrbScene() {
  const sceneRef = useRef<HTMLElement>(null);
  const lilacRef = useRef<HTMLDivElement>(null);
  const orbScalerRef = useRef<HTMLDivElement>(null);
  const orbitRingRef = useRef<HTMLDivElement>(null);
  const discRef = useRef<HTMLDivElement>(null);
  const redCircleRef = useRef<HTMLDivElement>(null);
  const indigoCircleRef = useRef<HTMLDivElement>(null);
  const irisRef = useRef<HTMLDivElement>(null);
  const irisMarkRef = useRef<HTMLDivElement>(null);
  const redLineRef = useRef<SVGLineElement>(null);
  const indigoLineRef = useRef<SVGLineElement>(null);
  const opsLabelRef = useRef<HTMLDivElement>(null);
  const sysLabelRef = useRef<HTMLDivElement>(null);
  const captionRef = useRef<HTMLParagraphElement>(null);
  const aboutLinkRef = useRef<HTMLDivElement>(null);
  const lilacEditorialRef = useRef<HTMLDivElement>(null);
  const opsSubARef = useRef<HTMLSpanElement>(null);
  const opsSubBRef = useRef<HTMLSpanElement>(null);
  const sysSubARef = useRef<HTMLSpanElement>(null);
  const sysSubBRef = useRef<HTMLSpanElement>(null);
  const prefersReducedMotion = useReducedMotion();

  const dotTransforms = useMemo(
    () =>
      Array.from({ length: DOT_COUNT }, (_, index) => {
        const angleDeg = (index * 360) / DOT_COUNT;
        return `translate(-50%, -50%) rotate(${angleDeg}deg) translateY(calc(var(--orb-d) * -0.56))`;
      }),
    [],
  );

  useEffect(() => {
    if (prefersReducedMotion) return;

    const sceneEl = sceneRef.current;
    const lilacEl = lilacRef.current;
    const orbScalerEl = orbScalerRef.current;
    const orbitRingEl = orbitRingRef.current;
    const discEl = discRef.current;
    const redCircleEl = redCircleRef.current;
    const indigoCircleEl = indigoCircleRef.current;
    const irisEl = irisRef.current;
    const irisMarkEl = irisMarkRef.current;
    const redLineEl = redLineRef.current;
    const indigoLineEl = indigoLineRef.current;
    const opsLabelEl = opsLabelRef.current;
    const sysLabelEl = sysLabelRef.current;
    const captionEl = captionRef.current;
    const aboutLinkEl = aboutLinkRef.current;
    const lilacEditorialEl = lilacEditorialRef.current;

    if (
      !sceneEl ||
      !lilacEl ||
      !orbScalerEl ||
      !orbitRingEl ||
      !discEl ||
      !redCircleEl ||
      !indigoCircleEl ||
      !irisEl ||
      !irisMarkEl ||
      !redLineEl ||
      !indigoLineEl ||
      !opsLabelEl ||
      !sysLabelEl ||
      !captionEl ||
      !aboutLinkEl
    ) {
      return;
    }

    const mm = gsap.matchMedia();

    mm.add(
      {
        isDesktop: '(min-width: 768px)',
        isMobile: '(max-width: 767px)',
      },
      (context) => {
        const { isDesktop } = context.conditions as { isDesktop: boolean };
        const redX = isDesktop ? -34 : -24;
        const redY = isDesktop ? 0 : -6;
        const indigoX = isDesktop ? 34 : 24;
        const indigoY = isDesktop ? 0 : 6;

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: sceneEl,
            start: 'top top',
            end: 'bottom bottom',
            scrub: true,
            onToggle: (self) => {
              sceneEl.classList.toggle('orb-scene--active', self.isActive);
            },
          },
          defaults: { ease: 'none' },
        });

        // Phase A (0.00 -> 0.22): Seamless handoff from HeroOrb -> quartered disc
        tl.fromTo(
          discEl,
          { opacity: 0, scale: 0.96, rotation: 0 },
          { opacity: 1, scale: 1, duration: 0.025 },
          0,
        ).to(discEl, { rotation: 90, duration: 0.22 }, 0);

        tl.fromTo(captionEl, { opacity: 0 }, { opacity: 1, duration: 0.06 }, 0.05).to(
          captionEl,
          { opacity: 0, duration: 0.06 },
          0.21,
        );

        // Phase B (0.22 -> 0.55): Disc -> luminous Venn circles
        tl.to(discEl, { opacity: 0, duration: 0.05 }, 0.22)
          .fromTo(
            redCircleEl,
            { opacity: 0, xPercent: 0, yPercent: 0, rotation: 0, scale: 1 },
            { opacity: 0.92, duration: 0.06 },
            0.22,
          )
          .fromTo(
            indigoCircleEl,
            { opacity: 0, xPercent: 0, yPercent: 0, rotation: 0, scale: 1 },
            { opacity: 0.88, duration: 0.06 },
            0.22,
          );

        tl.fromTo(
          [redLineEl, indigoLineEl],
          { strokeDashoffset: 1 },
          { strokeDashoffset: 0, duration: 0.24 },
          0.22,
        );

        tl.to(redCircleEl, { xPercent: redX, yPercent: redY, rotation: 40, duration: 0.27 }, 0.26)
          .to(
            redCircleEl,
            {
              keyframes: [
                { scale: 0.94, duration: 0.09 },
                { scale: 1.04, duration: 0.09 },
                { scale: 1, duration: 0.09 },
              ],
            },
            0.26,
          )
          .to(
            indigoCircleEl,
            { xPercent: indigoX, yPercent: indigoY, rotation: 40, duration: 0.27 },
            0.26,
          )
          .to(
            indigoCircleEl,
            {
              keyframes: [
                { scale: 1.04, duration: 0.09 },
                { scale: 0.94, duration: 0.09 },
                { scale: 1, duration: 0.09 },
              ],
            },
            0.26,
          );

        tl.fromTo(
          [opsLabelEl, sysLabelEl],
          { opacity: 0 },
          { opacity: 0.3, duration: 0.06 },
          0.22,
        ).to([opsLabelEl, sysLabelEl], { opacity: 1, duration: 0.09 }, 0.28);

        // In-place sub-label word swap during Venn hold
        if (opsSubARef.current && opsSubBRef.current) {
          tl.to(opsSubARef.current, { opacity: 0, y: -6, duration: 0.04 }, 0.39).fromTo(
            opsSubBRef.current,
            { opacity: 0, y: 6 },
            { opacity: 1, y: 0, duration: 0.05 },
            0.41,
          );
        }
        if (sysSubARef.current && sysSubBRef.current) {
          tl.to(sysSubARef.current, { opacity: 0, y: -6, duration: 0.04 }, 0.39).fromTo(
            sysSubBRef.current,
            { opacity: 0, y: 6 },
            { opacity: 1, y: 0, duration: 0.05 },
            0.41,
          );
        }

        // Part 2 (0.55 -> 1.00): Converge into Iris orb + Lilac wash + editorial teaser
        tl.to([opsLabelEl, sysLabelEl], { opacity: 0, y: -12, duration: 0.12 }, 0.55)
          .to([redLineEl, indigoLineEl], { strokeOpacity: 0, duration: 0.12 }, 0.55)
          .to(redCircleEl, { xPercent: 0, yPercent: 0, rotation: 90, duration: 0.13 }, 0.55)
          .to(indigoCircleEl, { xPercent: 0, yPercent: 0, rotation: 90, duration: 0.13 }, 0.55);

        tl.fromTo(irisEl, { opacity: 0 }, { opacity: 1, duration: 0.1 }, 0.62).to(
          [redCircleEl, indigoCircleEl],
          { opacity: 0, duration: 0.06 },
          0.66,
        );

        tl.fromTo(irisMarkEl, { opacity: 0 }, { opacity: 1, duration: 0.08 }, 0.68).fromTo(
          irisMarkEl,
          { rotation: 0 },
          { rotation: 60, duration: 0.32 },
          0.68,
        );

        tl.fromTo(orbitRingEl, { opacity: 0 }, { opacity: 1, duration: 0.1 }, 0.7).fromTo(
          orbitRingEl,
          { rotation: 0 },
          { rotation: 180, duration: 0.3 },
          0.7,
        );

        // Full-width left-to-right lilac wash wipe
        tl.fromTo(
          lilacEl,
          { clipPath: 'inset(0 100% 0 0)' },
          { clipPath: 'inset(0 0% 0 0)', duration: 0.14 },
          0.68,
        );

        if (isDesktop) {
          tl.to(orbScalerEl, { x: '-18vw', scale: 0.94, duration: 0.16 }, 0.66);
          if (lilacEditorialEl) {
            tl.fromTo(
              lilacEditorialEl,
              { opacity: 0, y: 18 },
              { opacity: 1, y: 0, duration: 0.1 },
              0.74,
            );
          }
        }

        tl.fromTo(aboutLinkEl, { opacity: 0 }, { opacity: 1, duration: 0.1 }, 0.78);

        tl.to(orbScalerEl, { scale: 0.85, y: '-6vh', duration: 0.1 }, 0.9);

        tl.set({}, {}, 1);
      },
    );

    return () => {
      mm.revert();
    };
  }, [prefersReducedMotion]);

  return (
    <section
      aria-label="Operations and Systems overview"
      className="orb-scene"
      data-scene
      id="scene"
      ref={sceneRef}
    >
      <div className="orb-scene-stage">
        {/* Lilac wash panel wiping cleanly left-to-right */}
        <div aria-hidden="true" className="orb-lilac" ref={lilacRef} />

        {/* Hairlines SVG */}
        <svg
          aria-hidden="true"
          className="orb-hairlines-svg"
          preserveAspectRatio="none"
          viewBox="0 0 1000 1000"
        >
          <line
            pathLength={1}
            ref={redLineRef}
            stroke="#FF223A"
            strokeDasharray={1}
            strokeDashoffset={prefersReducedMotion ? 0 : 1}
            strokeOpacity={0.22}
            strokeWidth={1}
            vectorEffect="non-scaling-stroke"
            x1={840}
            x2={160}
            y1={120}
            y2={540}
          />
          <line
            pathLength={1}
            ref={indigoLineRef}
            stroke="#4040B0"
            strokeDasharray={1}
            strokeDashoffset={prefersReducedMotion ? 0 : 1}
            strokeOpacity={0.2}
            strokeWidth={1}
            vectorEffect="non-scaling-stroke"
            x1={160}
            x2={840}
            y1={880}
            y2={460}
          />
        </svg>

        {/* Central Orb Anchor */}
        <div aria-hidden="true" className="orb-anchor">
          <div className="orb-scaler" ref={orbScalerRef}>
            <div className="orb-orbit-ring" ref={orbitRingRef}>
              <span className="orb-orbit-dot" />
            </div>

            {/* Phase A: Quartered disc */}
            <div className="orb-disc" ref={discRef}>
              <span className="orb-disc-highlight" />
              <span className="orb-disc-crosshair orb-disc-crosshair--v" />
              <span className="orb-disc-crosshair orb-disc-crosshair--h" />
              <div className="orb-disc-ring">
                {dotTransforms.map((transformValue, index) => (
                  <span
                    className="orb-disc-dot"
                    key={index}
                    style={{ transform: transformValue }}
                  />
                ))}
              </div>
            </div>

            {/* Phase B: Overlapping Venn circles */}
            <div className="orb-circle orb-circle--red" ref={redCircleRef} />
            <div className="orb-circle orb-circle--indigo" ref={indigoCircleRef} />

            {/* Phase C: Iris orb with camera-iris aperture mark */}
            <div className="orb-iris" ref={irisRef}>
              <div className="orb-iris-highlight" />
              <div className="orb-iris-streak orb-iris-streak--1" />
              <div className="orb-iris-streak orb-iris-streak--2" />
              <div className="orb-iris-streak orb-iris-streak--3" />
              <div className="orb-iris-mark-wrap" ref={irisMarkRef}>
                <Aperture aria-hidden="true" className="orb-iris-mark" strokeWidth={1.8} />
              </div>
            </div>
          </div>
        </div>

        {/* Clickable Venn Labels */}
        <div className="orb-label-block orb-label-block--operations" ref={opsLabelRef}>
          <a className="orb-label-link orb-label-link--red" href="#operations">
            Operations
          </a>
          <p className="orb-label-sub orb-label-sub--swap">
            <span className="orb-sub-slot" ref={opsSubARef}>
              Deployments &amp; Cameras
            </span>
            <span aria-hidden="true" className="orb-sub-slot orb-sub-slot--alt" ref={opsSubBRef}>
              32+ Live Feeds · NCR
            </span>
          </p>
          <p className="orb-label-copy">
            32+ IP cameras across Patli-NCR logistics hubs, Milestone XProtect VMS &amp; GIGO gate
            control.
          </p>
        </div>

        <div className="orb-label-block orb-label-block--systems" ref={sysLabelRef}>
          <a className="orb-label-link orb-label-link--indigo" href="#hero-workstation">
            Systems
          </a>
          <p className="orb-label-sub orb-label-sub--swap">
            <span className="orb-sub-slot" ref={sysSubARef}>
              3D Command Workstation
            </span>
            <span aria-hidden="true" className="orb-sub-slot orb-sub-slot--alt" ref={sysSubBRef}>
              XProtect VMS · BriefCam L4
            </span>
          </p>
          <p className="orb-label-copy">
            Interactive 3D VMS control room simulator, BriefCam L4 video analytics &amp; alarm
            telemetry.
          </p>
        </div>

        {/* Desktop Lilac phase editorial summary beside left-drifted Iris */}
        <div className="orb-lilac-editorial" ref={lilacEditorialRef}>
          <p className="orb-lilac-eyebrow">00 / SURVEILLANCE DOCTRINE</p>
          <p className="orb-lilac-quote">
            Live dock oversight meets rapid forensic reconstruction across Milestone XProtect &amp;
            BriefCam.
          </p>
          <a className="orb-lilac-cta" href="#about">
            Explore operator dossier →
          </a>
        </div>

        {/* Phase A caption */}
        <p aria-hidden="true" className="orb-stage-caption" ref={captionRef}>
          Operations &amp; Systems
        </p>

        {/* Bottom "About me" link */}
        <div className="orb-about-link-wrap" ref={aboutLinkRef}>
          <a className="orb-about-link" href="#about">
            About me
          </a>
        </div>
      </div>
    </section>
  );
});
