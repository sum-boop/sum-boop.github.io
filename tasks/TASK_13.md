# Claude, 2026-11-20: TASK 13 for Gemini

Reviewed the user's new MOBILE recording (390px, Desktop site OFF) next to the 5lab.co mobile recording. Hero blob, disc, Venn, iris, About band, highlight boxes and the dark Contact all work on mobile. Three problems and one big missing piece:

## Findings

1. Circular badge text is about 5px on screen (9 SVG units in a 136 viewBox shown at 64-76px) and the string is longer than the circle (~364 vs ~339 units), so it overlaps itself.
2. In the Deployments section, many lines (eyebrow, card subtitle, body text such as "Sub<npa=t", "~bg-<uff<x") were caught mid-scramble, and the card images were grey boxes. Scramble must only run on headings.
3. Contact: the "Let's chat" button is a small red pill. 5lab.co shows a glossy pink-red orb (~#B72A5D) with an elliptical orbit ring and a diagonal red laser line on black.

## TASK 13 (touch ONLY these files)

`src/components/CircularBadge.tsx`, `src/styles/chrome.css`, `src/utils/animMaster.ts`, `src/utils/scrambleReveal.ts` (only if needed), `src/components/Contact.tsx`, NEW `src/styles/contactOrb.css` (import from Contact.tsx), `src/components/Deployments.tsx` and `src/components/CameraFeedCard.tsx` (only for item B).

### A. Badge

- Keep the viewBox 136. Set font-size to 15 units (renders ~8-9px), letter-spacing 0.12em.
- Add `textLength="335"` and `lengthAdjust="spacing"` on the `<textPath>` so the text fits the circle exactly once. Text: `SUMIT ANAND · CCTV OPERATOR · PATLI, HARYANA · ` (unchanged). If it is cramped, shorten to `SUMIT ANAND · CCTV OPERATOR · HARYANA · `.
- Badge size 84px desktop, 72px mobile.

### B. Scramble scope and card images

- In `animMaster.ts`, scramble ONLY `h1, h2` and `.works-group-title-5lab`. Never eyebrows, `h3`, `p`, card subtitles, labels or body copy. Remove any other selector that calls `scrambleReveal`.
- Scramble duration max 0.9s per heading; content must be fully restored on complete AND on interrupt AND when the element leaves the viewport mid-animation (kill + restore).
- Camera feed card images: give the image wrapper a fixed `aspect-ratio: 16 / 10`, `background: #E4E3EE`, and `loading="eager"` for the first 2 cards, `decoding="async"` for the rest, so there is no grey flash and no layout jump. Do not change card text or links.

### C. Contact orb (keep ALL Contact content: headline, email, phone, WhatsApp, location, terminal, social pills, composer, form)

Replace the look of `.contact-lets-chat-btn-5lab` (keep it a real `<button>` calling `focusComposer`, with the same aria-label) inside the hero block of the Contact section:

- Orb: 120px circle (96px under 480px), `background: radial-gradient(circle at 32% 28%, #FF7A9C 0%, #E83E75 32%, #B72A5D 62%, #6E1038 100%)`, `box-shadow: 0 0 60px 8px rgba(232,62,117,.45), inset -8px -10px 22px rgba(60,0,30,.55), inset 6px 8px 16px rgba(255,200,215,.35)`. Label "Let's chat" in white, 13px, centered. Hover: scale 1.06, glow stronger. Idle: slow float (translateY ±6px, 5s ease-in-out infinite).
- Orbit ring: an absolutely-positioned SVG ellipse around the orb (rx 1.9x orb radius, ry 0.6x), stroke `rgba(248,56,88,.55)` 1px, rotated -18deg, with one 4px dot animating along it (SVG `animateMotion` or CSS offset-path, 9s linear infinite). `pointer-events: none`, `aria-hidden`.
- Laser line: a 1.5px line from the orb toward the lower-left, 38vh long, rotated ~ -62deg, `linear-gradient(90deg, rgba(248,56,88,0), #F83858 55%, rgba(248,56,88,0))`, with soft glow `filter: drop-shadow(0 0 6px #F83858)`. It draws in (scaleX 0 -> 1, transform-origin at the orb) once when the Contact section enters the viewport (GSAP ScrollTrigger, once). `pointer-events: none`, `aria-hidden`.
- The orb block must not push the email/phone/WhatsApp links off-screen on 390px: stack it above the links with 24px spacing, and make sure the laser line is clipped by the section (`overflow: hidden` on the wrapper, not on the section).
- `prefers-reduced-motion`: no float, no dot motion, laser fully drawn.

### Finish

`npm run build` and `npm run lint` must pass. Check 390px and 1280px. Append a `## Gemini` entry to the bottom of `AI_CHAT.md` (files changed, per item what you did, anything not matched). Commit and push to main. Do not touch any other file, never delete or rename `.nvmrc`.

## Next (Claude's plan, not part of this task)

TASK 14: Skills as the 5lab "Notable Clients" style strip plus a Services-style dark card block for Systems; TASK 15: Footprint / Experience / Credentials polish. No framework migration: the Vite + React + GSAP stack already delivers every effect above and is deployed.
