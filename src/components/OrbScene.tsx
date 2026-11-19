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
        const redX = isDesktop ? -22 : -18;
        const redY = isDesktop ? 0 : -6;
        const indigoX = isDesktop ? 22 : 18;
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

        // ==========================================
        // PART 1 (0.00 -> 0.55) - Unchanged flow
        // ==========================================

        // Phase A (0.00 -> 0.22): Quartered disc fades/scales in over 0..0.06, rotates 0 -> 90deg
        tl.fromTo(
          discEl,
          { opacity: 0, scale: 0.9, rotation: 0 },
          { opacity: 1, scale: 1, duration: 0.06 },
          0,
        ).to(discEl, { rotation: 90, duration: 0.22 }, 0);

        // Stage bottom caption: fades in at 0.06 and out at 0.28
        tl.fromTo(captionEl, { opacity: 0 }, { opacity: 1, duration: 0.06 }, 0.06).to(
          captionEl,
          { opacity: 0, duration: 0.06 },
          0.22,
        );

        // Phase B transition (0.22 -> 0.28): Disc fades out, red & indigo circles fade in on top
        tl.to(discEl, { opacity: 0, duration: 0.06 }, 0.22).fromTo(
          [redCircleEl, indigoCircleEl],
          { opacity: 0, xPercent: 0, yPercent: 0, rotation: 0, scale: 1 },
          { opacity: 0.9, duration: 0.06 },
          0.22,
        );

        // Diagonal hairlines draw on with stroke-dashoffset between 0.22 and 0.50
        tl.fromTo(
          [redLineEl, indigoLineEl],
          { strokeDashoffset: 1 },
          { strokeDashoffset: 0, duration: 0.28 },
          0.22,
        );

        // Two circles separate into Venn overlap with slow wobble & rotation (0.28 -> 0.55)
        tl.to(
          redCircleEl,
          {
            xPercent: redX,
            yPercent: redY,
            rotation: 40,
            duration: 0.27,
          },
          0.28,
        )
          .to(
            redCircleEl,
            {
              keyframes: [
                { scale: 0.92, duration: 0.09 },
                { scale: 1.04, duration: 0.09 },
                { scale: 1, duration: 0.09 },
              ],
            },
            0.28,
          )
          .to(
            indigoCircleEl,
            {
              xPercent: indigoX,
              yPercent: indigoY,
              rotation: 40,
              duration: 0.27,
            },
            0.28,
          )
          .to(
            indigoCircleEl,
            {
              keyframes: [
                { scale: 1.04, duration: 0.09 },
                { scale: 0.92, duration: 0.09 },
                { scale: 1, duration: 0.09 },
              ],
            },
            0.28,
          );

        // Labels start at opacity 0.25 and become 1 from 0.30 to 0.45, then stay
        tl.fromTo(
          [opsLabelEl, sysLabelEl],
          { opacity: 0.25 },
          { opacity: 1, duration: 0.15 },
          0.3,
        );

        // ==========================================
        // PART 2 (0.55 -> 1.00) - TASK 8 Hand-off
        // ==========================================

        // 1. 0.55 to 0.68, "leave":
        // - Labels fade 1 to 0 and move up 12px
        // - Hairlines fade out (strokeOpacity to 0)
        // - Two circles move back together (xPercent: 0, yPercent: 0, rotation 40 -> 90)
        tl.to(
          [opsLabelEl, sysLabelEl],
          { opacity: 0, y: -12, duration: 0.13 },
          0.55,
        )
          .to(
            [redLineEl, indigoLineEl],
            { strokeOpacity: 0, duration: 0.13 },
            0.55,
          )
          .to(
            redCircleEl,
            { xPercent: 0, yPercent: 0, rotation: 90, duration: 0.13 },
            0.55,
          )
          .to(
            indigoCircleEl,
            { xPercent: 0, yPercent: 0, rotation: 90, duration: 0.13 },
            0.55,
          );

        // 2. 0.62 to 0.72, "merge":
        // - New element .orb-iris fades 0 to 1
        // - Two circles fade from 0.9 to 0 over 0.66 to 0.72
        tl.fromTo(
          irisEl,
          { opacity: 0 },
          { opacity: 1, duration: 0.1 },
          0.62,
        ).to(
          [redCircleEl, indigoCircleEl],
          { opacity: 0, duration: 0.06 },
          0.66,
        );

        // 3. Mark in the middle (camera-iris aperture):
        // - Fades in over 0.68 to 0.76 (opacity 0 to 1)
        // - Rotates 0 to 60 degrees from 0.68 to 1.00
        tl.fromTo(
          irisMarkEl,
          { opacity: 0 },
          { opacity: 1, duration: 0.08 },
          0.68,
        ).fromTo(
          irisMarkEl,
          { rotation: 0 },
          { rotation: 60, duration: 0.32 },
          0.68,
        );

        // 4. 0.70 to 0.80, "orbit ring":
        // - Size 1.35 x D around the orb with small 6px dot
        // - Fades 0 to 1 over 0.70 to 0.80
        // - Rotates 0 to 180 degrees from 0.70 to 1.00
        tl.fromTo(
          orbitRingEl,
          { opacity: 0 },
          { opacity: 1, duration: 0.1 },
          0.7,
        ).fromTo(
          orbitRingEl,
          { rotation: 0 },
          { rotation: 180, duration: 0.3 },
          0.7,
        );

        // 5. 0.72 to 0.88, "lilac wash":
        // - Full-stage element behind the orb
        // - Wipes left to right with clip-path: inset(0 100% 0 0) -> inset(0 0% 0 0)
        tl.fromTo(
          lilacEl,
          { clipPath: 'inset(0 100% 0 0)' },
          { clipPath: 'inset(0 0% 0 0)', duration: 0.16 },
          0.72,
        );

        // 6. 0.78 to 0.88:
        // - Small link "About me" at bottom center of stage fades 0 to 1 and stays
        tl.fromTo(
          aboutLinkEl,
          { opacity: 0 },
          { opacity: 1, duration: 0.1 },
          0.78,
        );

        // 7. 0.90 to 1.00: hold
        // - Orb scales 1 to 0.85 and moves up by 6% of stage height (-6vh)
        tl.to(
          orbScalerEl,
          { scale: 0.85, y: '-6vh', duration: 0.1 },
          0.9,
        );

        // Anchor timeline duration to 1.0 so normalized times map 1:1 to section scroll progress
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
        {/* Step 5: Lilac wash panel wiping in behind the orb */}
        <div aria-hidden="true" className="orb-lilac" ref={lilacRef} />

        {/* Step 6 in part 1: Hairlines SVG */}
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
            strokeOpacity={0.4}
            strokeWidth={1}
            vectorEffect="non-scaling-stroke"
            x1={920}
            x2={60}
            y1={80}
            y2={560}
          />
          <line
            pathLength={1}
            ref={indigoLineRef}
            stroke="#4040B0"
            strokeDasharray={1}
            strokeDashoffset={prefersReducedMotion ? 0 : 1}
            strokeOpacity={0.35}
            strokeWidth={1}
            vectorEffect="non-scaling-stroke"
            x1={80}
            x2={940}
            y1={920}
            y2={440}
          />
        </svg>

        {/* Central Orb Anchor */}
        <div aria-hidden="true" className="orb-anchor">
          {/* Inner scaler that scales to 0.85 and moves up 6% of stage height during 0.90-1.00 */}
          <div className="orb-scaler" ref={orbScalerRef}>
            {/* Step 4: Orbit ring with indigo tracking dot */}
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

            {/* Phase B: Venn circles */}
            <div className="orb-circle orb-circle--red" ref={redCircleRef} />
            <div className="orb-circle orb-circle--indigo" ref={indigoCircleRef} />

            {/* Phase C / Step 2: Iris orb with rotating streaks & aperture mark */}
            <div className="orb-iris" ref={irisRef}>
              <div className="orb-iris-highlight" />
              <div className="orb-iris-streak orb-iris-streak--1" />
              <div className="orb-iris-streak orb-iris-streak--2" />
              <div className="orb-iris-streak orb-iris-streak--3" />
              <div className="orb-iris-mark-wrap" ref={irisMarkRef}>
                <Aperture
                  aria-hidden="true"
                  className="orb-iris-mark"
                  strokeWidth={1.8}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Clickable labels */}
        <div className="orb-label-block orb-label-block--operations" ref={opsLabelRef}>
          <a className="orb-label-link orb-label-link--red" href="#operations">
            Operations
          </a>
          <p className="orb-label-sub">Deployments &amp; Cameras</p>
          <p className="orb-label-copy">
            32+ IP cameras across Patli-NCR logistics hubs, Milestone XProtect VMS &amp; GIGO gate
            control.
          </p>
        </div>

        <div className="orb-label-block orb-label-block--systems" ref={sysLabelRef}>
          <a className="orb-label-link orb-label-link--indigo" href="#hero-workstation">
            Systems
          </a>
          <p className="orb-label-sub">3D Command Workstation</p>
          <p className="orb-label-copy">
            Interactive 3D VMS control room simulator, BriefCam L4 video analytics &amp; alarm
            telemetry.
          </p>
        </div>

        {/* Phase A caption */}
        <p aria-hidden="true" className="orb-stage-caption" ref={captionRef}>
          Operations &amp; Systems
        </p>

        {/* Step 6: "About me" link at bottom center */}
        <div className="orb-about-link-wrap" ref={aboutLinkRef}>
          <a className="orb-about-link" href="#about">
            About me
          </a>
        </div>
      </div>
    </section>
  );
});
