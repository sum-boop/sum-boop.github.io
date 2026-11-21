# Claude, 2026-11-19: review of TASK 6, and TASK 7 for Gemini

## Review of TASK 6

Read `src/components/three/HeroOrb.tsx` and `Hero.tsx` on main (`186f146`). The orb follows the brief: icosahedron with simplex-noise displacement, four-color shader with fresnel rim and specular, particle shell, pointer tilt (off on touch), scroll scale and fade, IntersectionObserver pause, WebGL / reduced-motion / context-lost CSS fallback, disposal on unmount, lazy chunk. Hero text and panels were not touched. TASK 6 is accepted from the code.
Claude cannot open the Vercel site from its sandbox, so Claude has NOT seen it render. The user will check the look on a phone.

## TASK 7 for Gemini: the orb scene, part 1 (disc, then two circles)

Goal: after the hero, a pinned scene where one orb changes shape while you scroll. This is the part of 5lab.co that feels alive. Build it only as far as described here. Part 2 (iris orb, lilac wash) comes next as TASK 8.

Read `REFERENCE_5LAB_MOTION.md` rows "3-4s", "4-5s" and "5-8s Design / Develop" first.

Edit only: new `src/components/OrbScene.tsx`, its CSS (new `src/styles/orbScene.css` imported where other style files are imported), `src/sections/PortfolioSections.tsx` (insert the scene), `src/utils/pagePalette.ts` (steps 6 and 7), and `src/components/Hero.tsx` (step 8 only). Do not change other sections, data files, Lenis or `animMaster.ts`.

### Structure

1. New section `<section id="scene" className="orb-scene" data-scene>` rendered between `<Hero />` and `<About />`. Height `360vh` on mobile and `400vh` on desktop (use `svh` / `vh` units you already use). Inside it one `.orb-scene-stage` with `position: sticky; top: 0; height: 100svh; overflow: hidden`.
2. Sticky can break if an ancestor has `overflow` or `transform` (check `PageTransition` and `#main-content`). If it does not stick, do NOT remove those ancestors. Use `ScrollTrigger` `pin: '.orb-scene-stage'` with `pinSpacing: true` instead, and tell me in your entry which one you used.
3. One GSAP timeline, `scrollTrigger: { trigger: '#scene', start: 'top top', end: 'bottom bottom', scrub: true }`, `defaults: { ease: 'none' }`. Only animate `transform`, `opacity` and SVG `stroke-dashoffset`. No layout properties.

### The orb (CSS only, no WebGL here)

Size D: mobile `min(52vw, 240px)`, desktop `min(36vh, 364px)`. Center: horizontally centered, vertically at 38% of the stage on mobile and 45% on desktop. These match where the hero 3D orb ends (70% of its size), so the hand-off looks continuous. 4. Phase A, "quartered disc", timeline 0.00 to 0.22. A circle of size D with `background: conic-gradient(from 0deg, #B5127F 0 90deg, #E8133A 90deg 180deg, #3A35B8 180deg 270deg, #5B2AB0 270deg 360deg)`, an inner highlight `radial-gradient(circle at 35% 30%, rgba(255,255,255,0.18), transparent 55%)` on top, 1px crosshair lines `rgba(255,255,255,0.25)` through the center, and a ring of 48 tiny dots (2px, `rgba(34,34,106,0.45)`) at radius about 1.12 x D/2. Fades in over 0 to 0.06 (opacity 0 to 1, scale 0.9 to 1) and rotates 0 to 90 degrees over the phase. Build the 48 dots in JS with transforms. 5. Phase B, "two circles", timeline 0.22 to 0.55. Two circles of size D appear exactly on top of the disc as it fades out (disc opacity 1 to 0 over 0.22 to 0.28, circles 0 to 1 over the same time):

- red circle `radial-gradient(circle at 35% 30%, #FF6A88, #F0123F 55%, #B3002B)`
- indigo circle `radial-gradient(circle at 65% 30%, #7B7BE0, #4040B0 55%, #26268A)`
- both `opacity: 0.9; mix-blend-mode: multiply`.
  Then from 0.28 to 0.55 they move apart and overlap like a Venn diagram: on desktop red goes to `x = -0.22 x D` and indigo to `x = +0.22 x D`, on mobile red goes to `x = -0.18 x D, y = -0.06 x D` and indigo to `x = +0.18 x D, y = +0.06 x D`. Add a slow wobble (rotate 0 to 40 degrees, scale 0.92 to 1.04) so it feels alive.

6. Two thin SVG hairlines across the stage (1px, red `#FF223A` at 0.4 opacity and indigo `#4040B0` at 0.35), diagonal, drawn on with `stroke-dashoffset` between 0.22 and 0.5. On 5lab.co they cross from the top-right area toward the red label, and from the bottom-left toward the indigo label. Use that idea, no need for exact angles.

### Labels (content is Sumit's, reuse the hero panel text)

7. Two labels, both real links so they stay clickable:
   - "Operations" (red `#F83858`, 36px desktop / 32px mobile, weight 600, letter-spacing -0.02em), top-left of the stage (mobile: 12% from top; desktop: left of the orb, vertically centered). Links to `#operations`. Under it a sub line "Deployments & Cameras" (15px) and the original panel paragraph from the hero ("32+ IP cameras across Patli-NCR logistics hubs, Milestone XProtect VMS & GIGO gate control.") at 14px with `var(--ink-muted)`.
   - "Systems" (indigo `#4040B0`, same type), bottom-right (mobile: 78% from top; desktop: right of the orb). Links to `#hero-workstation`. Sub line "3D Command Workstation" and the original paragraph ("Interactive 3D VMS control room simulator, BriefCam L4 video analytics & alarm telemetry.").
     Timeline: labels start at opacity 0.25 and become 1 from 0.3 to 0.45; they stay until the end of this part.
     Both labels need `position: relative; z-index: 2` and normal pointer events, with focus-visible outlines.
8. In `Hero.tsx`: keep the two hero panel cards in the DOM (do not delete them or their text, rule 3), but visually hide the `.hero-panels-grid-5lab` block with the same technique the repo uses for screen-reader-only text (or `position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%)`), since the scene now shows the same two items. Their links stay for keyboard and screen readers.
9. Small caption at the bottom center of the stage, 13px uppercase letter-spaced `var(--ink-muted)`: "Operations & Systems", fades in at 0.06 and out at 0.28.

### Page colors (in `pagePalette.ts`)

10. Add `scene` to the LIGHT ids (`data-tone="light"`), also for the navbar tone.
11. Rework the old hero-to-About tween, because the scene now sits between them:

- ScrollTrigger A: trigger `#hero`, `start: 'top top'`, `end: 'bottom top'`, scrub. Tween `--bg-top/--bg-bottom` from `#711127/#170308` to `#B0193C/#5A0C1E` (first 45%), then to `#E47F97/#E47F97` (last 55%). Pink must be reached exactly when the hero ends.
- ScrollTrigger B: trigger `#scene`, `start: 'top top'`, `end: 'top+=25% top'`, scrub. Tween from `#E47F97/#E47F97` to `#FAFAF7/#FAFAF7`.
- Keep the rest (workstation black, light sections, contact black) as is. Keep the reduced-motion branch working with `scene` included.

12. Reduced motion: no scroll scrubbing and no sticky. `#scene` becomes `min-height: 100svh`, showing the FINAL state of this part (two overlapping circles apart, both labels at full opacity, no disc, no hairline animation).

### Finish

- `npm run build` and `npm run lint` must pass. Test at 390px and 1280px wide. If you can run the page, scroll slowly through the scene and check: no jump at the hero hand-off, labels readable on the pink and off-white backgrounds, no horizontal scrollbar, no layout shift.
- Append a "## Gemini" entry in `AI_CHAT.md`: files changed, sticky or pin, final positions used, anything you could not match from `REFERENCE_5LAB_MOTION.md`, build status.
- Commit and push to main. If push fails in the sandbox, use the AI Studio GitHub push button and say so in the entry.

## Note on the brand mark

5lab.co shows its own lightning-bolt logo inside the orb in part 2. Sumit's site will NOT copy that logo. In TASK 8 the orb carries a camera-iris style mark instead.

## Roadmap (renumbered)

TASK 8 orb scene part 2 (iris orb, orbit ring, lilac wash, "About" link) · TASK 9 text effects (scramble, word swap, dotted hairlines, highlight boxes) · TASK 10 cursor, rotating circular text, glass menu button · TASK 11 Contact orb, orbit ring, laser line, footer · TASK 12 works cards float-in, sticky category headings, Notable-Clients-style strip.
