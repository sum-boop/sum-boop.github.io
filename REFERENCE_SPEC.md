# Reference Extraction Spec — https://www.5lab.co/

Extracted directly from `https://www.5lab.co/` (`ref-1440-y0.png`, `ref-desktop-*.png`, `ref-tablet-768-*.png`, `ref-mobile-390-*.png`, `5lab-1.css`, `5lab-2.css`, and computed DOM styles at `1440×900`, `768×1024`, `390×844`).

---

## 1. Typography Tokens & Scale

| Role | Reference Font | Open / Repo Equivalent | Weight | Style | `1440×900` Size / LH | `768×1024` Size / LH | `390×844` Size / LH | Letter Spacing |
|---|---|---|---|---|---|---|---|---|
| **Display / Hero (`#scene-1 h1`)** | `gtInstrument` (`GT Walsheim Pro` / `Instrument Sans`) | `'Plus Jakarta Sans'`, `'Instrument Sans'`, sans-serif | `500` | Normal | `144px` (`10vw`) / `108px` (`0.75em`) | `76.8px` (`10vw`) / `57.6px` (`0.75em`) | `39px` (`10vw`) / `29.25px` (`0.75em`) | `normal` (`-0.02em` visual) |
| **Display Accent Word (`.spark-text`)** | `newsreader` (`Newsreader`) | `'Newsreader'`, Georgia, serif | `400` / `500` | `italic` | Matches parent `10vw` (`144px`) | `76.8px` | `39px` | `normal` |
| **Section Manifesto (`#designer-header h1`)** | `gtInstrument` | `'Plus Jakarta Sans'`, `'Instrument Sans'`, sans-serif | `500` | Normal | `144px` (`10vw`) / `165.6px` (`115%`) | `76.8px` (`10vw`) / `115%` | `58.5px` (`15vw`) / `115%` | `normal` |
| **Portfolio / Feature Heading (`h2`)** | `gtWalsheim` | `'Plus Jakarta Sans'`, sans-serif | `500` | Normal | `36px` (`2.25rem`) / `40px` (`2.5rem`) | `36px` / `40px` | `36px` / `40px` | `normal` |
| **Contact Heading (`#contact h2`)** | `gtWalsheim` + inline italic `newsreader` | `'Plus Jakarta Sans'` + `'Newsreader'` italic | `400` | Normal + italic span | `60px` (`3.75rem`) / `82.5px` | `60px` / `82.5px` | `36px` / `49.5px` | `normal` |
| **Navbar Links** | `gtWalsheim` | `'Plus Jakarta Sans'`, sans-serif | `400` | Normal | `16px` / `24px` | `16px` / `24px` | Drawer centered ~`28px` | `normal` |
| **Body Copy (`body`, paragraphs)** | `gtWalsheim` | `'Plus Jakarta Sans'`, sans-serif | `400` | Normal | `16px` (`1.05rem`) / `1.55–1.65` | `16px` / `1.55` | `15.68px` (`.98rem`) / `1.55` | `normal` |
| **Hero Prompt (`#control-bar-left-text`)** | `gtWalsheim` | `'Plus Jakarta Sans'`, monospace accent | `400` | Normal | `16px` / `24px` | `16px` / `24px` | Hidden below orb or stacked | `normal` |
| **Contact Channel Links** | `gtWalsheim` | `'Plus Jakarta Sans'`, `'JetBrains Mono'`, sans-serif | `300` | Uppercase | `16px` / `24px` | `16px` / `24px` | `14px–16px` / `24px` | `1.6px` (`0.1em`) |
| **Footer Legal & Links** | `gtWalsheim` | `'Plus Jakarta Sans'`, sans-serif | `400` | Uppercase | `12px` / `18px` | `12px` / `18px` | `12px` / `18px` | `0.06em` |

**Proprietary Font Disclosure**: `https://www.5lab.co/` bundles proprietary **GT Walsheim Pro** (`300`, `400`, `500`) alongside open **Instrument Sans** (`400`) and **Newsreader** (`400`, `700`). Because **GT Walsheim Pro** is commercial/proprietary, this repo pairs **Instrument Sans** + **Plus Jakarta Sans** (closest open geometric sans match for weights `300/400/500`) + **Newsreader** (`400`, `italic`, `700`).

---

## 2. Color & Surface Tokens

| Token / Usage | Extracted Exact Value | Where Applied on `5lab.co` |
|---|---|---|
| **Paper Body Background** | `#FCFBF9` (`rgb(252, 251, 249)`) | Primary light body surface (`--intern-bg`), editorial sections |
| **Body Ink** | `#0E0E0E` / `#0E0E0EB3` (70% muted) / `#0E0E0E75` (`--abx-mute`) | Default dark body prose & muted notes |
| **Structural Dotted Grid & Hairlines** | `#0E0E0E1A` (`--abx-line`, `rgba(14,14,14,0.10)`) & `#00000014` | Dotted column guidelines & subtle dividers across cream sections |
| **Primary Indigo (`designer-ink`)** | `#28286E` | Section manifesto headings, knockout block fill (`.designer-ink-bg`), Venn text (`Develop`), portfolio section headers, contact stamp ring on light cream |
| **Secondary Indigo (`text-secondary`)** | `#3E3DB3` (`rgb(62, 61, 179)`) | Underlined action links (`Our Work`), active Venn circle gradient end |
| **Hero / Accent Crimson** | `#FF004D` / `#CE112C` (`--intern-accent`) / `#D5204A` / `#FF4E4E` | Hero radial spotlight (`#d5204a`), red brand lightning logo (`#eb194b`/`#ff223a`), rotating hero contact ring (`#FF4E4E`), conic Venn red circle (`#FF004D` -> transparent), scene-2 ink (`#FF3C58`) |
| **Hero Spotlight Backdrop (`#bg-b`)** | `#00000066` base + `radial-gradient(circle closest-side, #d5204a, #0000)` (`calc(80vh + 50vw)` at `top: 30%; left: 50%`) over deep `#160208` | Hero full-bleed crimson-black atmospheric gradient + cursor-tracking radial glow |
| **Hero Sphere (`--sphere-still`)** | `radial-gradient(circle at 72% 58%, #ff223aeb 0%, #ff223a00 27%), radial-gradient(circle at 31% 32%, #681edef2 0%, #681ede00 36%), radial-gradient(circle at 56% 60%, #ff1c8cbf 0%, #ff1c8c00 42%), radial-gradient(circle closest-side, #b8166a 0%, #83125c 58%, #45093c 92%, #45093c00 100%)` | Hero orb (`56vmin` desktop / `58vw` mobile) |
| **Obsidian Contact Surface** | `#000000` (`.bg-black`) | Closing Contact & Footer band with grainy dark overlay + diagonal beam + purple-magenta ambient glow (`#galaxy-gradient`) |
| **Contact Text & Hairlines** | `#FFFFFF`, `#F4F6FF` (`--contact-ink`), `#DCE4FF94` (`--contact-muted`), `#DCE4FF29` (`--contact-line`), `rgba(255,255,255,0.2)` underline | Contact display title (`#FFF`), `Let's chat` bottom underline (`rgba(255,255,255,0.2)`), uppercase channel info (`#FFF`), footer muted links (`#FFFFFF8C`) |
| **Nav Ink (Dark Surface vs Light Surface)** | `#FFFFFF` text + white bolt on Hero & Contact; `#0E0E0E` text + `#EB194B`/`#FF223A` red bolt on Cream sections | Fixed header (`background: transparent`) transitioning color smoothly |

---

## 3. Layout, Spacing, Radii & Navbar Specification

| Pattern | Exact Specification |
|---|---|
| **Container & Horizontal Gutter** | `max-width: 1440px` (`2xl:container`), `--abx-pad: clamp(16px, 3.4vw, 56px)`, dotted vertical architectural lines along column tracks (`3` vertical tracks on desktop) |
| **Border Radii** | Editorial cards, knockout blocks (`.text-hider`), hero work frames, and grid tiles are **`0px` sharp square corners** (`rounded-none`). Only the Venn circles (`#double-circle`), sphere orb, bottom-right stamp SVG, and mobile `#hamburger-btn` are circular (`9999px` / `50%`). |
| **Navbar Desktop & Tablet (`>= 768px`)** | `position: fixed; top: 0; left: 0; width: 100%; height: 96px; padding: 24px 0; background: transparent; backdrop-filter: none; border-bottom: none;` Left: Spark SVG + wordmark (`w-20 md:w-24 h-12`). Right: bare inline text links (`Works  Services  About  Contact`, spacing `gap: ~2.5rem`), **no backdrop bar, no boxed CTA button, no utility chips/clocks cluttering header**. |
| **Navbar Mobile (`< 768px`)** | Fixed top header `py-4` (`16px`). Right: single `48px × 48px` circular button `#hamburger-btn` (`rounded-full backdrop-blur-lg bg-white/5 border border-white/5`) containing 3 asymmetric horizontal lines (`#b3: x1=14..50 y=22`, `#b2: x1=26..50 y=32`, `#b1: x1=34..50 y=42`). Clicking toggles full-viewport `#000000` `#menu-modal` with subtle concentric dotted rings and centered vertical list (`Home`, section anchors) + close (`✕`). |
| **Hero Layout (`#scene-1`)** | `height: 100vh`. Desktop: Sphere centered behind monumental two-row staggered headline (`h1-1` shifted `-10%`, `h1-2` shifted `+10%`); bottom-left `> ...▌` prompt (`hidden md:block`), bottom-center `animate-bounce` thin chevron SVG, bottom-right quarter-cropped rotating circular stamp (`203×206`, `animation: spin 30s linear infinite`, `Contact` centered inside corner). Mobile (`390px`): Sphere sits above (`top ~20%`), centered stacked 3-line H1 below sphere (`text-[10vw] leading-[0.85em]`) with dotted horizontal divider lines behind lines, single bottom-center bounce chevron. |
| **Double-Circle Section (`#scene-2`)** | Left heading (`#FF3C58` -> `#28286E`), center overlapping `#red-cir` (conic crimson) + `#blue-cir` (conic indigo) with thin rotating hairline crosshairs (`mix-blend-multiply`), right heading (`#3E3DB3` -> `#28286E`), bottom underlined CTA link (`Our services`). |
| **Knockout Statement (`#designer-header`)** | Small indigo eyebrow (`text-xl mb-6 #28286E`), giant `10vw` (`15vw` mobile) indigo headline where key phrase is inverted white text over `#28286E` sharp-corner rectangular highlight (`.text-hider`). |
| **Featured Portfolio / Deployments (`#highlight-scroller`)** | Desktop (`>= 768px`): Asymmetric split: Left column tilted `-12deg` (`md:-rotate-12`, `md:w-[30vw]` cards, zero border radius, zero card borders, full-bleed imagery); Right column sticky minimal block (`Eyebrow`, `36px #28286E` Title, underlined `#3E3DB3` action link `Our Work` / `Expand briefing`). Mobile (`< 768px`): Vertical upright flow: `Eyebrow` + `36px #28286E` title above full-width un-tilted card image, underlined `border-b-4 border-gray-200` caption link underneath. |
| **Contact (`#contact-content`) & Footer** | Full viewport dark `#000000` band with textured grain + diagonal SVG light line + glowing `#galaxy-gradient`. Top row: `60px` desktop (`36px` mobile) left H2 (`font-weight: 400`, italic `Newsreader` accent word) paired with right `Let's chat` (subtle `border-b border-white/20` on desktop; wrapped inside soft rose-crimson circle `#d63360` with orbit arcs on mobile). Below: uppercase single-row `MAIL | PHONE` (`tracking-[0.1em] font-light`) + address pin line. Footer centered at bottom: links separated by `|` (`border-white/20` underline) + centered copyright row. |

---

## 4. Animation & Interaction Mechanics Extracted

1. **Smooth Scroll & Scroll Choreography**: Uses **Lenis** + **GSAP ScrollTrigger** + Web Animations / Framer Motion.
2. **Hero Spotlight Tracking**: `.mouse-cursor-gradient-tracking` tracks cursor coordinates (`--x`, `--y`) softly over radial `#d5204a`.
3. **Scroll Line Reveal (`.line-reveal`)**: `clip-path: inset(0 100% 0 0); transform: translate(-1.5rem)` -> reveals over `0.9s cubic-bezier(.2,.8,.2,1)` with `0.18s` / `0.36s` stagger.
4. **Hero Typewriter Prompt**: Typewriter text prompt bottom-left with blinking `▌` block cursor (`> ...`).
5. **Rotating Stamp Badge (`#spin-circle`)**: Continuous `spin 30s linear infinite`.
6. **Tilted Works Parallax & Link Hover**: `group-hover:tracking-widest duration-150` on mobile titles, `.spark-text` subtle scale on hover (`group-hover:scale-110 duration-300`), `.hover-underline-animation` expanding hairline underlines.
