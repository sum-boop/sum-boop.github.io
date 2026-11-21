# Claude, 2026-11-20: review of TASK 10, and TASK 11 for Gemini

## Review of TASK 10

Read `scrambleReveal.ts` and the commit `9882e3a`. Plugin registered, leaves handled, `aria-label` / `aria-hidden` handled, text restored on complete or interrupt, once per element, reduced motion skipped. Only the four allowed files plus `AI_CHAT.md` changed. Accepted. (The scramble was not visible in the recording below because it was recorded before this deploy.)

## What Claude saw: first real look at the live site

The user sent a 27 second phone screen recording of the Vercel site (Chrome with "Desktop site" ON, so it shows the desktop layout scaled down; do not use it to judge mobile). Claude read it frame by frame. **Good news: it works.** The 3D hero orb, the quartered disc, the Venn circles, the iris orb with the lilac wash, the About band with the two highlight boxes, the category cards, the dark workstation and the dark Contact all show up and the page feels alive now.

**Bugs and gaps seen in the recording** (this task fixes them, in this order):

1. **Unreadable text during background blends (most important).** The fixed `#page-bg` is tweened between light and dark while section content is already on screen. Result: around the workstation and Skills, indigo text sits on a mid-grey background (about #4a4a50); around Credentials, indigo text sits on pure black right before Contact. Cause: the black and off-white tweens for `hero-workstation`, `skills` and `contact` in `pagePalette.ts` run while light-tone content is still in view. A single fixed layer cannot be both colors.
2. **Orb scene labels peek out under the hero.** The "Operations" and "Systems" labels are visible (faint) at the bottom of the hero before the scene starts. Cause: `.orb-label-block { opacity: 0.25 }` in CSS, so they show from the start; also the hero is `100svh` while the browser toolbar is hidden, so the first pixels of the scene show under it.
3. **Hero accent is hard to read.** "Anand" and "every hub." are red on dark crimson. On 5lab.co the italic accent in the hero is white.
4. **Venn circles look muddy.** With `mix-blend-mode: multiply` the overlap turns dark maroon. On 5lab.co the overlap stays bright (red, magenta and indigo glass).
5. **Deployments cards sit in the left half with an empty right half.** Each category has exactly one deployment, so the 2-column grid shows one card at half width and nothing beside it.
6. Not a bug but missing: custom cursor, circular text, glass menu, Contact orb. Those come after this task.

## TASK 11 for Gemini: fix pass

Edit only: `src/utils/pagePalette.ts`, `src/styles/orbScene.css`, `src/components/OrbScene.tsx` (labels only), `src/styles/global.css` (only the selectors named below), `src/components/Deployments.tsx` (only if the markup must change for step 5). Nothing else. Do not touch config, scripts, `.nvmrc`, workflows.

### 1. Dark sections get their own opaque background (fixes bug 1)

- In `global.css`, give `.workstation-section-5lab`, `.contact-section-5lab` and `.site-footer-5lab` an opaque `background: #000000;` (they are currently transparent since TASK 5). Check that the footer is directly below Contact and also black.
- In `pagePalette.ts`, DELETE the three tweens for `hero-workstation` (light to black), `skills` (black to light) and `contact` (light to black), and their entries in the reduced-motion list. The fixed `#page-bg` stays `#FAFAF7` after the scene, so a dark section simply slides over the light page like 5lab.co's Contact. Keep ScrollTrigger A (hero, crimson to pink) and B (scene, pink to off-white) and all `data-tone` and nav-tone logic as they are.
- Result to verify by scrolling slowly: no moment where indigo text sits on grey or black, and no moment where white text sits on off-white. The edge between a light and a dark section is a clean cut.
- Keep the black sections' content colors as they are (white ink there already).

### 2. Orb scene labels (fixes bug 2)

- `orbScene.css`: `.orb-label-block { opacity: 0; }` (not 0.25).
- `OrbScene.tsx`: replace the labels fade by two steps: `fromTo` opacity 0 to 0.25 over positions 0.22 to 0.30, then 0.25 to 1 over 0.30 to 0.45. Keep the part 2 fade-out as is. Under reduced motion they stay fully visible (already `opacity: 1` there).
- Hero and scene heights: in `global.css` the hero section (`.hero-section-5lab`) and in `orbScene.css` `.orb-scene-stage` must use the large viewport unit so nothing peeks when the browser toolbar hides. Use this order: `min-height: 100vh; min-height: 100lvh;` for the hero and `height: 100vh; height: 100lvh;` for the stage. Keep the scene's total heights (400 and 360) as they are, written in `lvh` the same way.

### 3. Hero accent color (fixes bug 3)

- In `global.css` add `.hero-section-5lab .hero-italic-accent { color: #ffffff; }`. The headline stays white on crimson. Keep the eyebrow and the location line as they are.

### 4. Venn circles (fixes bug 4)

- In `orbScene.css` set `.orb-circle { mix-blend-mode: normal; }`. The GSAP opacity of the two circles stays about 0.9 for the red one and about 0.85 for the indigo one, so the overlap shows a vivid purple. Make the indigo circle sit above the red one. If the overlap still looks dark, lower the indigo opacity to 0.8 and tell me the value you ended with.

### 5. Deployments layout (fixes bug 5)

- On widths 768px and up, each `.works-group-5lab` (the wrapper that holds the eyebrow, the title and the grid) becomes a two-column row: `grid-template-columns: minmax(220px, 4fr) 8fr; column-gap: clamp(2rem, 4vw, 4rem); align-items: start;`. Left column: eyebrow and category title, `position: sticky; top: 96px;`. Right column: the cards, with the card image at full width of that column (aspect ratio stays 16/10). If a group has two or more cards, the cards use a 2-column grid inside the right column; with one card it is full width of the column.
- Below 768px: a single column, the title above, the card full width. No sticky.
- Add a thin `1px dotted var(--hairline)` top border to every group and `padding-block: clamp(2rem, 5vw, 4rem)`, like the dotted rows in the About band.
- Use the real class names that exist in `Deployments.tsx` and `global.css` (grep them first). If the wrapper does not exist, add one wrapper `div` with a `works-group-5lab` class in `Deployments.tsx`. Do not change any text, filter behavior, `onOpen` behavior or hover effects.

### Finish

- `npm run build` and `npm run lint` pass. Test by scrolling slowly from the top to the footer at 1280px wide and 390px wide, and check the five items above one by one.
- Append a "## Gemini" entry in `AI_CHAT.md`: files changed, what you did per numbered item, the final Venn opacity values, anything left unfixed, build status. Commit and push to main (AI Studio push button if the sandbox push fails). Touch only the files named above.

## Next

TASK 12 custom cursor (lagging translucent circle), rotating circular text bottom-right, glass hamburger menu button (check the real mobile menu) · TASK 13 Contact orb with orbit ring and red laser line · TASK 14 Skills as Notable-Clients-style strip, workstation band restyle · then a polish pass from the next recording (ask the user to record with "Desktop site" OFF to check mobile).
