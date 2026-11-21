# Claude, 2026-11-20: TASK 14 for Gemini (Skills band)

## Review of TASK 13 (commit 290477e)

Passed from the code: scramble is heading-only with restore on leave, first deployment cards load eager, Contact orb + ring + laser exist in `contactOrb.css`, only task files touched. Visual check is pending on the user's side.

## Why this task

`Skills.tsx` is already a 4-cell grid plus a ticker, but it still reads as a generic card grid. 5lab.co's "Services" band is calmer and more editorial: big statement, dotted hairlines, small mono labels, cells that react on hover. Goal: same calm editorial feel on the light (#FAFAF7 / ink #22226A) section. Keep every skill, category name, the VMS sync button behavior (`setViewMode`, `aria-pressed`, active class) and the ticker unchanged in content.

## Touch ONLY

`src/components/Skills.tsx`, NEW `src/styles/skillsBand.css` (import it from `Skills.tsx`). Do not edit `global.css`, `animMaster.ts`, `pagePalette.ts`. If an old `.skills-grid-5lab` / `.skill-cell-5lab` rule in global.css fights you, win with higher specificity: `#skills .skills-grid-5lab ...`.

## Spec

1. Layout, desktop (>=1024px): two columns. Left (36%): the existing `SectionHeading` stays, made `position: sticky; top: 120px`. Right (64%): the 4 cells as a 2x2 grid with NO card boxes: each cell separated only by 1px dotted hairlines (`border-top: 1px dotted var(--hairline)` and a vertical dotted divider between columns), padding 28px 24px. Tablet and mobile: one column, heading first, cells stacked, same dotted separators.
2. Cell content order: mono label (`0N / CATEGORY`, 11px, letter-spacing .14em, color `#4040B0`), icon + `h3` (clamp 22-28px, weight 500, ink), then the skills list as compact lines with a small 4px dot bullet (red `#F83858`), 14-15px, `--ink-muted`.
3. Hover/focus-within on desktop: the cell background wipes to solid indigo `#22226A` from the bottom (pseudo-element `scaleY` 0 -> 1, 420ms cubic-bezier(.22,1,.36,1)), text turns white, bullets stay red, the arrow button turns white. On touch (no hover) no wipe. The VMS-synced active cell (`skill-cell-5lab--active`) shows a 2px `#F83858` top border instead of the wipe.
4. Reveal: reuse the existing fade-and-rise already applied by `animMaster` to `.skill-cell-5lab`; do not add new ScrollTriggers. Add a CSS stagger only if possible without JS (`:nth-child` transition-delay on hover wipe is fine, not required).
5. Ticker: keep `VelocityMarquee`; style `.skill-ticker-wrap-5lab` as a strip with dotted top and bottom hairlines, mono 12px uppercase, ink-muted, separators as small `+` marks in `#F83858`. No fills.
6. Accessibility: arrow button keeps its aria-label and `aria-pressed`; focus-visible ring 2px `#F83858`; text contrast on the indigo wipe >= 4.5:1; `prefers-reduced-motion`: no wipe animation, instant background change.
7. Do not invent skills or facts. Content comes only from `@/data/skills`.

## Finish

`npm run build` and `npm run lint` pass. Check at 390px and 1280px. Append a `## Gemini` entry at the bottom of `AI_CHAT.md` (files, per item, unmatched). Commit and push to main. Never delete or rename `.nvmrc` or any other file.

## Next

TASK 15: Footprint, Experience and Credentials polish with the same dotted-hairline editorial language; TASK 16: final polish pass from a new mobile recording.
