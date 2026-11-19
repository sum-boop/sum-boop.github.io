import { memo, useEffect, useMemo, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useReducedMotion } from '@/hooks/useReducedMotion';

gsap.registerPlugin(ScrollTrigger);

const DOT_COUNT = 48;

export const OrbScene = memo(function OrbScene() {
  const sceneRef = useRef<HTMLElement>(null);
  const discRef = useRef<HTMLDivElement>(null);
  const redCircleRef = useRef<HTMLDivElement>(null);
  const indigoCircleRef = useRef<HTMLDivElement>(null);
  const redLineRef = useRef<SVGLineElement>(null);
  const indigoLineRef = useRef<SVGLineElement>(null);
  const opsLabelRef = useRef<HTMLDivElement>(null);
  const sysLabelRef = useRef<HTMLDivElement>(null);
  const captionRef = useRef<HTMLParagraphElement>(null);
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
    const discEl = discRef.current;
    const redCircleEl = redCircleRef.current;
    const indigoCircleEl = indigoCircleRef.current;
    const redLineEl = redLineRef.current;
    const indigoLineEl = indigoLineRef.current;
    const opsLabelEl = opsLabelRef.current;
    const sysLabelEl = sysLabelRef.current;
    const captionEl = captionRef.current;

    if (
      !sceneEl ||
      !discEl ||
      !redCircleEl ||
      !indigoCircleEl ||
      !redLineEl ||
      !indigoLineEl ||
      !opsLabelEl ||
      !sysLabelEl ||
      !captionEl
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
          },
          defaults: { ease: 'none' },
        });

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

        <div aria-hidden="true" className="orb-anchor">
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

          <div className="orb-circle orb-circle--red" ref={redCircleRef} />
          <div className="orb-circle orb-circle--indigo" ref={indigoCircleRef} />
        </div>

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

        <p aria-hidden="true" className="orb-stage-caption" ref={captionRef}>
          Operations &amp; Systems
        </p>
      </div>
    </section>
  );
});
