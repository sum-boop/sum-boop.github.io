# 5lab.co motion and palette spec (from the user's screen recording)

Source: a 40 second phone screen recording of https://www.5lab.co/ (portrait, about 360x800 CSS px). The last 15 seconds switch to "Desktop site" view. Claude looked at one frame per second and sampled colors from the pixels.

**This file overrides `REFERENCE_SPEC.md` and `REFERENCE_5LAB_LIVE.md` on palette and motion.** The earlier claim "plain black page" was WRONG. 5lab.co is black only in the hero start and in the Contact section. Everything in between is a light page. The site is a scroll-driven scene: one hero object (an orb) stays on screen and changes shape while the background color changes.

NOT known from a recording: exact font files, exact easing curves, exact pixel sizes on desktop, the WebGL shader code. Values below marked ~ are estimates from pixels. Do not claim they are measured.

## 1. Palette (sampled from pixels)
| Use | Color |
|---|---|
| Hero bg top | #711127 (crimson, darker at edges) |
| Hero bg bottom | #170308 (almost black) |
| Hero bg while scrolling | #B0193C |
| Transition pink | #E47F97 |
| Main light page bg | #FAFAF7 (warm off-white) |
| Lilac wash panel (About) | #D4D2E7, fading to off-white to the right |
| Ink on light sections | #22226A (deep indigo). Statement highlight boxes ~#202068 |
| Red accent ("Design" label, logo) | ~#F83858 |
| Indigo accent ("Develop" label) | ~#4040B0 |
| Hero orb colors | magenta #A80486, red, indigo-violet, dark red patches |
| Contact bg | #000000 |
| Contact orb | pink-red ~#B72A5D with red glow |

## 2. Timeline, top to bottom (mobile)
| Time | What is on screen |
|---|---|
| 0-3s Hero | Crimson to near-black vertical gradient. Glossy 3D orb, about 75% of screen width, noisy blobby surface (magenta, red, violet, dark patches), a few tiny dust particles around it. Headline near the bottom, 3 centered lines: "We *spark* web / And Mobile / Experience". Only "spark" is italic serif, the rest is geometric sans, white. Logo (lightning bolt + "5Lab") top-left. Round glass hamburger button top-right. |
| 2s | On first scroll the headline letters SCRAMBLE (random glyphs flicker, letters drift apart) before the line disappears. |
| 3-4s | Background goes crimson to pink (#E47F97). Orb shrinks to about 55% width and turns into a disc split in four quadrants (indigo, magenta, blue, red) with thin crosshair lines and a ring of tiny tick dots around it. Small label "Our services" appears near the bottom. |
| 4-5s | Background becomes off-white #FAFAF7. Orb stays. |
| 5-8s Design / Develop | Orb splits into two overlapping translucent circles, red/pink on the left and indigo/blue on the right, offset like a Venn diagram. "Design" (red, ~36px, semi-bold) sits top-left, "Develop" (indigo) bottom-right. Under each, a small sub line: "Friendly / User Experience", then the word swaps to "Humanized" (the old word shows a small superscript "ly" while it glitches out). Labels start faded and become full color. Thin diagonal hairlines (pink top-left, indigo bottom-right) cross the screen. The circles slowly rotate and overlap more as you scroll. |
| 9-11s | Orb becomes a dark indigo circle with electric lightning texture and the white lightning-bolt logo in the middle. A lilac wash (#D4D2E7) wipes in from the left edge over the off-white. A faint dotted circle orbits the orb. Small link "About us" below. |
| 12s About | Orb moves up. Text centered: "Award-winning / Digital Product / *Design* + Development / Company". ~28px, medium weight. "Design" is italic serif. Each line is separated by a 1px DOTTED horizontal hairline in indigo. Lilac panel ends about 80% down, with a soft fade to the right. |
| 13s Statement | Small "A bunch of", then big (~44px) "Designers who code + Coders who design". The words "Designers" and "Coders" sit inside SOLID indigo boxes with white text, like selected text. Dotted hairlines above and below. |
| 14-19s Works | For each category: small "Experienced in" above, then the category name as an H2 ("Healthcare", "Education", "Finance", "Real Estate", "Art and Design"), ~36px, indigo. The category heading STICKS under the navbar while its cards scroll past, then the next heading pushes it out. Cards: large image (phone mockup on a colored or pastel background, sharp or very small corners), the project name BELOW the image in indigo with a short underline bar under it. Cards float in with a slight tilt/parallax. |
| 19-24s Contact | Pure black. "Ready to *spark* something?" white ~38px, "spark" italic serif. Under it, uppercase letter-spaced lines: HELLO@5LAB.CO, TEL. 02-109-9696, the address. A glossy pink-red orb (~95px) with the label "Let's chat", surrounded by a thin red elliptical orbit ring, and one long thin red diagonal "laser" line passing behind it from bottom-left. Faint dark ellipses around. Bottom: "CAREER | INTERNSHIP", then "COPYRIGHT © 2026 5LAB COMPANY / CRAFTED WITH ♥ AND ⚡ IN BANGKOK". |

## 3. Desktop frames (last 15s)
- Nav: tiny logo top-left, links "Works Services About Contact" top-right, small text.
- Hero: red gradient, a pink-violet jelly blob (not a clean sphere) behind the headline "We *spark* web and / mobile experience" (two lines, the second line indented to the right).
- Design / Develop: "Design" on the left, orb in the middle, "Develop" on the right, all on one horizontal line, with one thin diagonal hairline.
- Bottom-right corner on most light screens: a small circle of rotating text, "WITH LOVE FROM BANGKOK * DESIGNED & CODED BY 5LAB *".
- Notable Clients: client logos (DMS, Bangkok Hospital, Chula, Sasin, true digital, CEA) on a white card tilted about -8deg, floating in, with the heading "Trusted by / Notable Clients" in the center. The heading letters scramble while it animates in.
- Custom cursor everywhere: a small translucent grey circle (~22px, 1px lighter border) that follows the pointer with a lag.

## 4. Motion rules that repeat
1. One object (the orb) is the hero of the page. It stays fixed on screen and changes shape: blobby sphere, quartered disc, two overlapping circles, lightning orb, then a glowing red orb in Contact.
2. Background color is driven by scroll position, with smooth blends (crimson, pink, off-white, lilac wipe, off-white, black).
3. Text enters with scramble or line reveals, and words swap in place.
4. Hairlines (dotted or thin diagonal) are used as structure instead of boxes.
5. Smooth scroll (Lenis) with scrubbed timelines. Nothing important is static.

## 5. Mapping to Sumit's content
| 5lab scene | Sumit's version |
|---|---|
| Hero headline | "Sumit *Anand* / Eyes on *every hub.*" |
| Design / Develop split | "Operations" / "Systems" (the two hero panels, with sub lines that swap words) |
| Lightning orb + About text | About statement, orb carries the same lightning logo mark or a camera-lens mark |
| "Designers who code + Coders who design" highlight boxes | Same pattern on Sumit's own tagline words |
| Works by category | Deployments by category (already built in TASK 4) |
| Notable Clients | Skills / employers strip |
| Contact orb + laser | Contact CTA. The composer form stays below it |
| WorkstationBand, Footprint, Experience, Credentials | Keep, restyle with the same palette and reveals. WorkstationBand stays dark. |
