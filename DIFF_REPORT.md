# Visual Replication & Verification Report

Target Site: `http://localhost:3000` (Sumit Anand Portfolio)
Reference Baseline: `https://www.5lab.co/` (screenshots & tokens in `/REFERENCE_SPEC.md` and `/reference-shots/`)

## 1. Typography & Font Disclosure

- **Proprietary Font Substitution**: `5lab.co` uses the commercial typeface `GT Walsheim Pro` alongside a display serif italic accent (`Newsreader` / Playfair family). Because `GT Walsheim Pro` is proprietary and not bundled under open licensing, this implementation substitutes:
  - **Primary Sans (`--font-body` / `--font-display`)**: `Plus Jakarta Sans` (with geometric metrics closely matching `GT Walsheim Pro`, weights 400–700).
  - **Editorial Italic Accent (`--font-serif-accent`)**: `Newsreader` italic (matching the serif emphasis in Hero, Statement, and Contact headlines).
  - **Technical / HUD Monospace (`--font-mono`)**: `JetBrains Mono` (used for camera timestamps, VMS readouts, and section indices).
- **Verified Loaded Families in Headless Chromium**: `Plus Jakarta Sans`, `Newsreader`, `JetBrains Mono`.

---

## 2. Side-by-Side Comparison (`5lab.co` vs Implementation)

### Desktop (`1440×900`)

- **Hero Curtain (`ref-1440-y0.png` vs `after-desktop-1440-hero.png`)**:
  - **Matched**: Deep crimson-to-obsidian radial canvas (`#060004` base with `#7a0c2e` / `#d5204a` interactive spotlight), centered glowing 3D crimson-indigo glass orb (`.hero-sphere-orb`), monumental staggered two-line H1 (`Sumit` + italic `Anand` / `Eyes on every hub.`), bottom-left terminal prompt (`> CCTV Operator & Surveillance Specialist · Patli, Haryana` with blinking block caret), bottom-center bounce chevron, and quarter-cropped rotating crimson corner stamp (`SUMIT ANAND • PATLI HARYANA • CCTV & VMS •` around `Contact`).
  - **Fixes Verified**: Resolved collapsed word gap (`SumitAnand` -> `Sumit Anand`), separated rotating ring text from `Contact` label, and removed the non-reference floating `SideSectionRail`.
- **Operations & Systems Venn (`ref-desktop-scene2.png` vs `after-desktop-1440-venn.png`)**:
  - **Matched**: Full-opacity overlapping conic crimson-to-indigo Venn circles with 45°/-45° hairline crosshairs flanked by `Operations / 24/7 Control Room` and `Systems / Milestone XProtect`.
- **Works / Deployments (`ref-desktop-works.png` vs `after-desktop-1440-works.png`)**:
  - **Matched**: Cream paper (`#FCFBF9`) with 3-column dashed grid lines, indigo headline with inverted indigo highlight block (`Camera feed deployments.`), category filters (`All deployments 6`, `Surveillance 1`, `Gate Control 1`, `Loss Prevention 1`, `Forensics 1`, `Perimeter 1`, `Emergency 1`), tilted `-12deg` deployment media cards on the left column synced with the sticky right readout (`DEPLOYMENT / 01 · Surveillance`, `32+`, `Expand briefing`).
  - **Fix Verified**: Removed `scroll-margin-top: 88px` / `scroll-padding-top: 88px` bleed and added a subtle scrolled gradient scrim on `.site-header--scrolled` so anchor navigation aligns flush without previous-section overlap behind navbar links.
- **Contact (`after-desktop-1440-contact.png`)**:
  - **Matched**: Stark `#000000` canvas with subtle noise grain and ambient crimson-indigo glow, `"Let's talk about a role."` with `Newsreader` italic accent, glowing crimson `"Let's chat"` orb, red monospace channel labels (`DIRECT LINE · NO INTERMEDIARIES`, `DIRECT CHANNELS`, `READY`), direct contact channels, and interactive Composer form.

### Tablet (`768×1024`)

- **Hero (`after-tablet-768-hero.png`)**:
  - **Matched**: Full-bleed edge-to-edge curtain, single-row top navigation (`Sumit Anand` left, 5 nav links right), centered orb & H1, constrained bottom-left prompt width (`max-width: calc(50vw - 56px)`) clear of the center chevron, and `.back-to-top` suppressed on the Hero viewport (`backToTopOnHeroTablet: 0`) so it never overlaps the bottom-right `Contact` stamp.
- **Works & Contact (`after-tablet-768-works.png`, `after-tablet-768-contact.png`)**:
  - **Matched**: Clean top navbar separation, glowing circular `#d63360` `"Let's chat"` CTA orb, and `0px` horizontal overflow.

### Mobile (`390×844`)

- **Hero & Menu Modal (`after-mobile-390-hero.png`, `after-mobile-390-menu.png`)**:
  - **Fix Verified**: Removed `scrollbar-gutter: stable;` from `html`, eliminating the 15px `#FCFBF9` right-edge white gutter so dark Hero, full-screen `#000000` Menu Modal (with orbital dotted rings & close circle button), and `#000000` Contact render cleanly to `390px` edge-to-edge (`scrollWidth === 390`).
  - **Matched**: Elevated glowing crimson orb above stacked 3-line H1 with dashed dividers (`Sumit Anand` / `Eyes on` / `every hub.`) and frosted circular hamburger button.
- **Works & Contact (`after-mobile-390-works.png`, `after-mobile-390-contact.png`)**:
  - **Fix Verified**: Scoped `.feed-card--vms-active` transform strictly to desktop `button.feed-card` and reset `.feed-card-article` + `.feed-card` at `< 768px` so mobile deployment cards render completely upright (`0deg`) with top eyebrows/titles and bottom `Expand briefing` links.

---

## 3. Preserved Domain Content & Interactive Features

All portfolio identity, text, imagery, projects, skills, experience records, credentials, and interactive subsystems were preserved verbatim:

- **3D XProtect Smart Client Workstation (`#hero-workstation`)**: Theme-aware Three.js command desk with orbit/pan controls, monitor focus zoom, Live / Playback / Smart Map / Alarms workspace tabs, BriefCam L4 analytics overlay, Clock, Theme switcher (`Light` / `Dark`), and `Ctrl+K` Command Palette.
- **Security Profile & Skills (`#about`, `#skills`)**: Full bio, `Innovision Limited` & `A.P. Securitas Pvt. Ltd.` employer highlights, and all 4 skill clusters (20 skills).
- **Regional Footprint (`#footprint`)**: Interactive Patli–NCR logistics corridor radar over orbital globe backdrop synced with XProtect Smart Map sites (`01`, `02`, `03 Corridor`).
- **Deployments (`#operations`)**: All 6 deployments (`op1`–`op6`) with category filters and accessible briefing `Modal` (`Escape`, backdrop click, prev/next keyboard navigation).
- **Experience & Credentials (`#experience`, `#certifications`)**: Accordion career entries, `B.S.A.M. Panchitthri Sr. Sec. School`, and all 4 certifications.
- **Contact (`#contact`)**: Direct channels (`Email`, `WhatsApp`, `SMS`, `Phone`), clipboard copy, résumé PDF action, and message composer form.

---

## 4. Automated Verification Telemetry (Post-Fix)

- **Horizontal Overflow (`scrollWidth - clientWidth`)**:
  - `1440×900`: `0px`
  - `768×1024`: `0px`
  - `390×844`: `0px`
- **Interactive Browser Checks (Chromium)**:
  - Forensics filter count: `1` | All deployments count: `6`
  - Deployment briefing modal open & `Escape` dismiss: `modalVisible: true`, `modalClosed: true`
  - XProtect VMS Playback tab activation: `aria-pressed="true"`
  - Theme toggle round-trip (`light` -> `dark` -> `light`): verified with synchronous WebGL-safe transition bypass in `startSafeViewTransition`
  - Command Palette (`Control+k`): `paletteVisible: true`
  - `"Let's chat"` focus transfer: `activeElement.id === "contact-name"`
- **Runtime Diagnostics**:
  - `consoleErrors`: `[]`
  - `pageErrors`: `[]`
