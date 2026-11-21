# Claude, 2026-11-20: review of TASK 8, and TASK 9 for Gemini

Gemini keeps the coding. Same rules as `AI_CHAT.md` and `tasks/TASK_06.md` (free hand on existing content, but never lose meaning, never invent facts about Sumit). Gemini appends its entry at the bottom of `AI_CHAT.md` as `## Gemini, <date> (TASK 9)` with files changed, what was done, build status, problems. Never edit older entries. Commit and push to main (AI Studio GitHub push button if the sandbox push fails, and say so in the entry).

Before coding, read: `AI_CHAT.md`, `REFERENCE_5LAB_MOTION.md` (palette and motion, wins over older reference files), and this file. Project facts: React 18 + TypeScript + Vite, GSAP 3 + ScrollTrigger, Lenis, react-three-fiber, section roots carry `data-tone="light"` or `"dark"` (set by `src/utils/pagePalette.ts`), page background is the fixed `#page-bg` layer, CSS variables `--ink`, `--ink-muted`, `--hairline` exist on light sections. `npm run build` and `npm run lint` must pass with 0 errors.

## Review of TASK 8

Read `src/components/OrbScene.tsx` on main (`a494dda`). Part 2 is in: labels and hairlines leave, circles merge, `.orb-iris` fades in with three rotating streaks and a lucide `Aperture` mark (not 5Lab's bolt), orbit ring with a dot, lilac clip-path wipe, "About me" link to `#about`, settle (scale 0.85, up 6vh) at the end, `orb-scene--active` toggled for `will-change`. Accepted from the code. Claude still has not seen the live render, so the first visual check will come from the user.

## TASK 9 for Gemini: About band and highlight statement

Goal: the top of the About section should look like 5lab.co right after the orb: a centered stack of short lines separated by dotted hairlines, then a huge statement with two phrases inside solid indigo boxes (5lab.co does this with "Designers" and "Coders" in "Designers who code + Coders who design"). The existing copy already fits: "Calm eyes. Clear records." becomes the two highlighted phrases. The operator dossier below (photo card, paragraphs, buttons, employers, metrics) stays with all its content.

Edit only: `src/components/About.tsx`, a NEW file `src/styles/aboutBand.css`. Do not touch other sections, data files, `animMaster.ts`, `pagePalette.ts`, Lenis.

### About.tsx

1. Add imports: `gsap`, `ScrollTrigger` from `gsap/ScrollTrigger` (call `gsap.registerPlugin(ScrollTrigger)` once at module level), `useEffect`, `useReducedMotion` from `@/hooks/useReducedMotion`, and `import '@/styles/aboutBand.css';`.
2. Replace ONLY the current `<header className="about-statement-header" id="designer-header">` block. Keep the existing eyebrow (`ChoreoReveal as="p" className="section-eyebrow"`) exactly. New structure:

```
<header className="about-band-5lab" id="designer-header" ref={bandRef}>
  {/* existing eyebrow, unchanged */}
  <p className="about-band-lines">
    <span className="about-band-line"><span className="about-band-line-inner">Precision monitoring,</span></span>
    <span className="about-band-line"><span className="about-band-line-inner"><em className="hero-italic-accent">gate control,</em> and</span></span>
    <span className="about-band-line"><span className="about-band-line-inner">loss prevention across</span></span>
    <span className="about-band-line"><span className="about-band-line-inner">India&apos;s largest logistics hubs.</span></span>
  </p>
  <h2 className="about-statement-5lab" id="about-title">
    <span className="about-hl"><span className="about-hl-text">Calm eyes</span></span>
    <span className="about-plus" aria-hidden="true"> + </span>
    <span className="about-hl"><span className="about-hl-text">Clear records</span></span><span>.</span>
  </h2>
</header>
<p className="about-dossier-eyebrow">Operator dossier</p>
```

The old sentence is only split and rearranged, no words lost. The `<h2>` keeps `id="about-title"` so `aria-labelledby` still works. Use the class name `about-statement-5lab` (NOT `about-statement-text`) so `animMaster.ts` does not animate the h2 a second time. 3. Everything after the header (`about-layout` and below) stays verbatim. 4. Motion (skip it entirely when `useReducedMotion()` is true: the default CSS state is the final visible state):

- Inside `gsap.context(..., bandRef)`, reverted on cleanup.
- `.about-band-line-inner`: `gsap.set({ yPercent: 110 })`, then `gsap.to({ yPercent: 0, duration: 0.9, ease: 'power3.out', stagger: 0.12 })` with `scrollTrigger: { trigger: '.about-band-lines', start: 'top 85%', once: true }`.
- `.about-band-line`: animate the custom property `--line` from 0 to 1 (hairline draws left to right), duration 0.8, same stagger and trigger.
- `.about-hl`: animate `--hl` from 0 to 1 (box wipes in from the left), duration 0.7, stagger 0.2, trigger `.about-statement-5lab` at `top 80%`, `once: true`.
- The h2 text must never be hidden with `opacity: 0`, so the words are always readable even if JS fails.

### aboutBand.css (plain CSS)

Values to use:

- `@property --line` and `@property --hl`: `syntax: '<number>'; inherits: false; initial-value: 1;`.
- `.about-band-5lab`: `text-align: center; padding-block: clamp(4rem, 10vw, 8rem) clamp(2rem, 5vw, 4rem); color: var(--ink);`
- `.about-band-lines`: `max-width: 900px; margin: 2rem auto 0; font-size: clamp(1.6rem, 4.2vw, 3.2rem); font-weight: 500; line-height: 1.2; letter-spacing: -0.02em;`
- `.about-band-line`: `display: block; position: relative; padding-block: 0.45em; --line: 1;` with `::before` as a top hairline `border-top: 1px dotted rgba(34,34,106,0.35); transform: scaleX(var(--line)); transform-origin: left center;` (absolute, left 0, right 0, top 0). The last line also gets a `::after` bottom hairline. The text mask (overflow hidden) goes on a wrapper around `.about-band-line-inner` so the hairlines are not clipped. Simplest way: `.about-band-line-inner { display: inline-block; }` and put `overflow: hidden` on `.about-band-line` while the hairline pseudo-elements sit at `top: 0` / `bottom: 0` inside its box (they are 1px and visible). If you see clipping, use `clip-path: inset(0 0 -2px 0)` instead of overflow.
- `.about-statement-5lab`: `margin: clamp(2.5rem, 6vw, 5rem) auto 0; max-width: 1100px; font-size: clamp(2.4rem, 7vw, 5.5rem); font-weight: 600; line-height: 1.08; letter-spacing: -0.03em; padding-block: 0.5em; border-block: 1px dotted rgba(34,34,106,0.35); color: var(--ink);`
- `.about-hl`: `display: inline; --hl: 1; padding: 0 0.18em; background: linear-gradient(#202068, #202068) no-repeat left center; background-size: calc(var(--hl) * 100%) 100%; box-decoration-break: clone; -webkit-box-decoration-break: clone; border-radius: 2px;`
- `.about-hl-text`: `color: color-mix(in srgb, #FAFAF7 calc(var(--hl) * 100%), var(--ink));` (so the text is readable while the box is still wiping in).
- `.about-plus`: `color: var(--ink-muted); font-weight: 400;`
- `.about-dossier-eyebrow`: `margin: clamp(3rem, 8vw, 6rem) 0 1.5rem; padding-top: 1rem; border-top: 1px dotted rgba(34,34,106,0.35); font-size: 13px; letter-spacing: 0.14em; text-transform: uppercase; color: var(--ink-muted);`
- Mobile `max-width: 767px`: `.about-band-lines { font-size: 1.5rem; }` and `.about-statement-5lab { font-size: clamp(2rem, 10vw, 3rem); }`
- `@media (prefers-reduced-motion: reduce)`: no transitions or animations, final state shown.

### Checks

- `npm run build` and `npm run lint` pass. Check at 390px and 1280px wide: no horizontal scroll, the statement wraps nicely, highlight boxes do not break in an ugly way across lines (`box-decoration-break: clone`), no white text on the off-white page.
- Old selectors `.about-statement-header`, `.about-statement-text`, `.about-dimmed-text` in `global.css` may stay for now. Only remove them if nothing else uses them (grep first) and say so in your entry.
- Append your `## Gemini` entry to `AI_CHAT.md`. Commit and push to main.

## Next (for later, one at a time)

TASK 10 text effects (scramble on headings, word swap) · TASK 11 custom cursor, rotating circular text, glass menu button · TASK 12 Contact orb with orbit ring and red laser line · TASK 13 works cards float-in, sticky category headings, Notable-Clients-style strip · TASK 14 Workstation band restyle.
