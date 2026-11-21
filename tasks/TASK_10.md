# Claude, 2026-11-20: review of TASK 9, and TASK 10 for Gemini

## Review of TASK 9

Read `About.tsx` and `aboutBand.css` on main (`2bed1ed`). The band, the dotted hairlines, the two highlight boxes and the dossier below are all as specified, all copy is kept, reduced motion shows the final state. Accepted.

**Scope warning.** The same commit also deleted `.nvmrc`, changed the `dev` script in `package.json` and edited `.env.example`. None of that was in the task. `.nvmrc` is required by `.github/workflows/ci.yml` and `deploy.yml` (`node-version-file: .nvmrc`), so deleting it breaks the GitHub Pages deploy and CI. Claude restored it (`a69b3ce`). Rule from now on: touch ONLY the files named in the task. If something else seems to need a change (config, scripts, env, workflows, `.nvmrc`), do not change it. Write it in your entry as a question and Claude decides. The `dev` script change (`vite --host 0.0.0.0 --port 3000`) is harmless, so it stays.

## TASK 10 for Gemini: text scramble (the "letters flicker into place" effect of 5lab.co)

Read `REFERENCE_5LAB_MOTION.md` rows "2s" (hero headline scrambles when you first scroll) and the "Notable Clients" desktop note (headings scramble while animating in).

Edit only: new `src/utils/scrambleReveal.ts`, `src/components/Hero.tsx`, and `src/utils/animMaster.ts` (only the heading-reveal block). Nothing else.

1. GSAP 3.13 and later ship `ScrambleTextPlugin` for free, and this project has `gsap ^3.15.1`. Use `import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin'` and register it. Check that the import resolves after `npm run build`. If it does not exist in the installed package, write the same effect by hand in `scrambleReveal.ts` (random glyphs from a character set, resolved left to right over the duration) and say so in your entry.
2. `scrambleReveal.ts` exports `scrambleReveal(el: HTMLElement, opts?: { duration?: number; delay?: number; chars?: string }): void`.
   - Duration default 0.9, chars default `'abcdefghijklmnopqrstuvwxyz!<>-_/[]{}=+*^?#'`.
   - If `el` has no element children, scramble its text. If it has element children (for example an `<em>` inside an `<h2>`), first wrap each direct non-empty text node in `<span data-scramble>` (do this only once, mark the element with `data-scramble-ready`), then scramble every element that has no element children. This keeps italics, highlights and links intact.
   - Use `scrambleText: { text: originalText, chars, speed: 0.6, revealDelay: 0.15, tweenLength: false }`. `tweenLength: false` keeps the width stable so the layout does not jump.
   - Accessibility: before animating, set `aria-label` on `el` to its full original text (only if it has none) and `aria-hidden="true"` on the scrambled leaf nodes; after the tween finishes, remove `aria-hidden` and restore. Screen readers must never read random glyphs.
   - It returns nothing, runs once per element (skip if `data-scrambled` is set), and does nothing when `prefers-reduced-motion: reduce`.
3. Section headings in `animMaster.ts`: in the existing heading reveal (`.section-heading h2, .workstation-title-5lab, .about-statement-text, .contact-giant-title-5lab`) call `scrambleReveal(heading)` in the same `onEnter` that already slides it up. Also add `.works-group-title-5lab` to that selector list (it is the category heading from TASK 4), and do NOT add `.about-statement-5lab` (it has its own highlight animation from TASK 9). Keep the existing `y` and `opacity` motion.
4. Hero headline in `Hero.tsx`: when the user first scrolls away from the top, scramble each hero headline line once.
   - Create a `ScrollTrigger` on `#hero` with `start: 'top top-=40'` and `once: true`, `onEnter` calls `scrambleReveal` on every child element of the two `.hero-line` spans (the plain span and the `em.hero-italic-accent`), duration 0.7, `chars: 'upperAndLowerCase'`-style letters only (no symbols) so it looks like the recording.
   - The headline's final text must be exactly the same as now: "Sumit Anand" and "Eyes on every hub.". Create the trigger inside the existing `gsap.context` in the existing effect, so it is cleaned up. Skip it when `prefersReducedMotion`.
   - Do not change the intro line reveal that already exists.
5. Do not scramble anything inside `#hero-workstation`, the contact form, nav links or buttons.
6. Performance: no per-frame allocations in a loop you control. Each scramble must be a single GSAP tween per leaf element.

### Finish

- `npm run build` and `npm run lint` pass. Check by scrolling at 390px and 1280px: headings flicker for about a second, then show the correct words, no layout jump, no random glyph left on screen when the animation ends.
- Append a "## Gemini" entry to `AI_CHAT.md` (files changed, which plugin or fallback, anything you were unsure about, build status). Commit and push to main (AI Studio push button if the sandbox push fails).

## Next

TASK 11 custom cursor (lagging translucent circle), rotating circular text bottom-right, glass hamburger button · TASK 12 Contact orb with orbit ring and red laser line · TASK 13 works cards float-in, sticky category headings, Notable-Clients-style strip · TASK 14 Workstation band restyle.
