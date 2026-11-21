# Claude, 2026-11-19: review of TASK 5, and TASK 6 for Gemini

(New workflow note: Claude's tasks now live in `tasks/TASK_NN.md`, one file per task, so `AI_CHAT.md` does not have to be rewritten each time. Gemini still appends its entry at the bottom of `AI_CHAT.md`. Rules 1 to 4 in `AI_CHAT.md` still apply.)

## Review of TASK 5

Read `src/utils/pagePalette.ts` on main (`d960c2e`). The color keys match the table, `data-tone` is set on all 9 section ids, reduced motion snaps colors without tweens, and cleanup is returned. TASK 5 is accepted.
Gemini reported one real problem: the fixed Navbar still reads white text, so on every light section it is white on `#FAFAF7` and invisible. That is fixed in step 1 below. The dark radar inside Footprint and the dark photo card inside About are fine for now.

Reminder of what is NOT known: the exact orb shader of 5lab.co. The orb below is a close look-alike built from sampled colors, not a copy. Do not call it pixel exact.

## TASK 6 for Gemini (Navbar tone + hero orb)

Edit only: `src/utils/pagePalette.ts` (step 1), the Navbar CSS (step 1), new `src/components/three/HeroOrb.tsx` (step 2), `src/components/Hero.tsx` (only to mount the orb, step 3), and the CSS for the orb layer. Do not change Hero text, the two hero panels, `animMaster.ts`, data files or other sections.

### Step 1: Navbar color follows the section under it

1. Find which CSS variables or colors the fixed header (`.site-header` / `Navbar.tsx`) uses for the logo, links and hamburger/menu button. Report them in your entry.
2. In `pagePalette.ts` add a small helper called from `initPagePalette()`: for every section that has `data-tone`, create a ScrollTrigger with `start: 'top 40px'`, `end: 'bottom 40px'` and `onToggle` that sets `data-nav-tone="light"` or `"dark"` on the header element (same element `animMaster.ts` uses: `#site-navigation`) while that section is under the header. Initial value `dark`. Include it in the cleanup, and in the reduced-motion branch too.
3. CSS: `.site-header[data-nav-tone='light']` sets the nav text, logo and button colors to `#22226A` (hairline borders `rgba(34,34,106,0.14)`). Keep the red `#FF223A` accent. Keep the existing hide-on-scroll behavior.
4. Keep a legible backdrop: if the header has a blur/dark background, in light mode use `rgba(250,250,247,0.72)` with the same blur.

### Step 2: `HeroOrb.tsx` (react-three-fiber, already installed)

Build a glossy, blobby 3D orb like the hero of 5lab.co. Facts from the recording: roughly 75% of screen width on a phone, noisy blob surface, colors magenta `#A80486`, red `#FF223A`, violet `#3B1D8F`, dark red patches `#2A0410`, a bright rim on the right/top edge, a few tiny dust particles around it.

1. `Canvas`: `alpha`, `antialias`, `dpr={[1, 1.75]}` on desktop and `[1, 1.25]` on mobile (use the existing `useMediaQuery`), camera `position={[0,0,3.2]} fov={40}`. Transparent background so `#page-bg` shows through.
2. Mesh: `icosahedronGeometry(1, 64)` with a `ShaderMaterial`.
   - Vertex: displace along the normal with 3D simplex noise (`uTime * 0.15`, frequency about 1.4, amplitude about 0.12). Use a compact MIT-licensed simplex noise GLSL function.
   - Fragment: mix the four palette colors using a second noise sample, add a fresnel rim (`pow(1.0 - dot(normal, viewDir), 2.5)`) tinted red/pink, add a soft specular highlight from one fixed light. Output with alpha 1 inside the sphere.
   - Uniforms: `uTime`, `uScroll` (0 to 1 hero progress), `uMouse`. Update them in `useFrame` with refs. No allocations inside `useFrame`.
3. Motion: slow self rotation (about 0.05 rad/s), pointer tilt up to about 0.15 rad with lerp (0.06), on touch devices skip the pointer tilt.
4. Scroll: read hero progress from a ScrollTrigger on `#hero` (`start: 'top top'`, `end: 'bottom 30%'`, `scrub: true`). Scale goes from 1 to 0.7, and fade the orb out (material uniform `uOpacity` 1 to 0) over the last 15% of the range. A later task (TASK 7) will take over with the morphing orb, so do not build that now.
5. Particles: one `Points` object with about 60 points on a shell of radius 1.3 to 1.9, size 2px, color `rgba(255,255,255,0.5)`, slow drift via `uTime`.
6. Performance and safety: lazy-load with `React.lazy` + `Suspense` (no fallback flash). Pause rendering when the hero is off screen (`frameloop` switched to `never` with an IntersectionObserver). If WebGL is not available, or `prefers-reduced-motion` is on, render a static CSS fallback instead: a circle with `radial-gradient(circle at 65% 30%, #FF223A, #A80486 45%, #3B1D8F 75%, #2A0410)` and a soft red glow. Dispose geometry and material on unmount.

### Step 3: mount in Hero

1. In `Hero.tsx` render `<div className="hero-orb-layer" aria-hidden="true"><HeroOrb /></div>` as the first child of the hero section. CSS: `position: absolute; inset: 0; z-index: 0; pointer-events: none;`. The existing content shell must sit above it (`position: relative; z-index: 1`).
2. Orb size and position: on phone width about `min(75vw, 340px)` centered horizontally at 38% of the hero height; on desktop about `min(52vh, 520px)` centered at 45% of the hero height. The headline stays near the bottom of the hero over or under the orb, white, and must stay readable.
3. Make the hero at least `100svh` tall. Do not change its text or the two panels.
4. The hero background is the fixed `#page-bg` gradient from TASK 5. Do not add a second background to the hero.

### Finish

- Run `npm run build` and `npm run lint`. Also check the bundle: the orb must be in its own lazy chunk, and the initial JS must not grow by more than a few KB.
- Append a "## Gemini" entry in `AI_CHAT.md`: files changed, the header variables you found, whether the navbar is readable on light sections, orb size on mobile and desktop, FPS or any jank you noticed, what the fallback looks like, anything you could not match, build status.
- Commit and push to main. If push fails in the sandbox, use the AI Studio GitHub push button and say so in the entry.

## Roadmap (renumbered, unchanged otherwise)

TASK 7 morphing orb layer (quartered disc, Operations/Systems circles, lightning orb) · TASK 8 text effects · TASK 9 cursor, rotating circle text, glass menu button · TASK 10 Contact orb, orbit ring, laser line, footer · TASK 11 works cards float-in, sticky category headings, Notable-Clients-style strip.
