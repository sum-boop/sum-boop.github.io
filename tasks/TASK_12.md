# Claude, 2026-11-20: review of TASK 11, and TASK 12 for Gemini

## Review of TASK 11

Commit `dec02da`. Only the allowed files changed (`OrbScene.tsx`, `orbScene.css`, `global.css`, `pagePalette.ts`, `AI_CHAT.md`). Read `pagePalette.ts`: the black and off-white tweens for workstation, skills and contact are gone, hero (crimson to pink) and scene (pink to off-white) remain, nav tone logic intact. `Deployments.tsx` already has the `works-group-5lab` wrapper with a header and a grid, so the new row layout can apply. Accepted from the code. The visual result (no grey blends, hero accent white, Venn colors, deployments row layout) will be checked in the user's next recording.

## What Claude found in `Navbar.tsx` (the reason for this task)

1. `SparkLogo` is a lightning bolt, which is 5Lab's brand mark. Sumit's site must not carry it. The orb already uses a camera-iris mark, so the logo should match.
2. The desktop and mobile link targets are wrong: `Services` points to `#about`, `About` points to `#footprint`. Visitors land in the wrong section.
3. The cursor (soft translucent circle) already exists and looks right in the recording. Do not touch it.

## TASK 12 for Gemini: nav chrome

Edit only: `src/components/Navbar.tsx`, a NEW `src/styles/chrome.css` (import it from `Navbar.tsx`), a NEW `src/components/CircularBadge.tsx`, and `src/App.tsx` (only to mount the badge once). Do not touch `global.css`, the cursor, or anything else. If an existing `global.css` rule fights your new rule, win with more specific selectors in `chrome.css`; do not edit `global.css`.

### 1. Logo

- Replace `SparkLogo` with the lucide `Aperture` icon (same size 20, `strokeWidth` 1.8, color stays as the current brand color, red `#FF223A`). Use it in both places (header and mobile overlay). Delete the bolt SVG. Keep the text "Sumit Anand" and the aria-labels.

### 2. Link targets (keep 5lab-style labels, fix the destinations)

- Desktop `links` become: Works `#operations`, Services `#skills`, About `#about`, Contact `#contact`.
- Mobile primary links: Home `#hero`, Works `#operations`, Services `#skills`, About `#about`, Contact `#contact`.
- Mobile secondary links: add `Footprint` (`#footprint`) in front of Logbook, Credentials, Workstation, so every section is still reachable.
- `sectionIds` already contains all of these ids, so `useScrollSpy` keeps working. Make sure the active underline follows the right link.

### 3. Glass menu button (mobile, below 768px)

Copy the 5lab.co look: a round glass button holding three lines of decreasing length (the SVG already has them).

- `.site-header .menu-toggle`: 44px circle, `background: rgba(255,255,255,0.12); border: 1px solid rgba(255,255,255,0.2); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); color: #fff;` transition 300ms.
- When the header has `data-nav-tone="light"` (set by `pagePalette.ts`): `background: rgba(34,34,106,0.08); border-color: rgba(34,34,106,0.18); color: #22226A;`.
- Hover/focus-visible: slightly stronger background and a 2px `#FF223A` focus ring. Keep the existing open/close behavior and aria attributes.
- Desktop (768px and up): the button stays hidden as it is now.
- Check the mobile overlay (`.mobile-nav-overlay`): it must stay readable and not show any bolt. It has its own dark look, leave it dark.

### 4. Rotating circular text badge

- New `CircularBadge.tsx`: a decorative round badge, `aria-hidden="true"`, `pointer-events: none`, fixed at the bottom-LEFT of the viewport (`left: clamp(12px, 2vw, 28px); bottom: clamp(12px, 2vw, 28px)`), 76px on desktop and 64px on mobile. (5lab.co puts it bottom-right, but our back-to-top button is there.)
- Content: an SVG with a circular `textPath` repeating `SUMIT ANAND · CCTV OPERATOR · PATLI, HARYANA ·`, uppercase, 9px, letter-spacing 0.18em, plus a tiny center dot. Do not write anything that claims Sumit designed or coded the site.
- Color: white text with `mix-blend-mode: difference` so it reads dark on the off-white page and white on the black sections without any JS.
- Motion: rotates one full turn in 22s, linear, infinite, using CSS `animation` on the SVG (transform only). Under `prefers-reduced-motion: reduce`: no rotation.
- Visibility: hide it (`opacity: 0`, transition 200ms) while `body` has the class `menu-open`, and while the 3D workstation is being dragged is not needed. Mount it once in `App.tsx` after the main content, `z-index` below the header but above content.

### Finish

- `npm run build` and `npm run lint` pass. Check at 390px and 1280px: logo is the iris in header and overlay, all four desktop links go to the right sections, the glass button reads well on pink, off-white and black backgrounds, the badge never covers the "back to top" button or any link or form field.
- Append a "## Gemini" entry to `AI_CHAT.md`: files changed, per numbered item what you did, build status, anything you could not match. Commit and push to main (AI Studio push button if the sandbox push fails). Touch only the files named above.

## Next

TASK 13 Contact orb: the "Let's chat" button becomes a glossy red orb with an elliptical orbit ring and a thin red laser line (like 5lab.co), the form and all channels stay · TASK 14 Skills as a Notable-Clients-style strip and the workstation band restyle · then a polish pass from the next recording (Desktop site OFF).
