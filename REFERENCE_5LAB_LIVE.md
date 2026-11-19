# 5lab.co live structure (fetched by Claude, 2026-11-19)

> CORRECTION (2026-11-19): the line "Plain black page" in the first version of this file was wrong. 5lab.co is a scroll-driven scene. The page is black only at the hero start and in Contact, and light (#FAFAF7 with indigo ink #22226A) in between. See `REFERENCE_5LAB_MOTION.md`, which wins on palette and motion.

Source of truth for page structure and copy. It is read from the live HTML of https://www.5lab.co/.
NOT known from this fetch: exact font files, pixel sizes, easing, hover values. Do not invent them.

Meta: theme-color #000000. Title "5Lab ⚡️ Design + Technology".

## Section order on 5lab.co (top to bottom)
1. **Header.** Logo (white and red logo variants, swaps on hover) left. Links right: Works, Services, About, Contact. Mobile menu repeats them with a Home link first.
2. **Hero headline.** "We spark web and / mobile experience". Large, two lines.
3. **Hero panels.** Two panels side by side.
   - Left: "Design", sub "Effective User Experience".
   - Right: "Develop", sub "Effective Technology".
   - A small logo mark sits between them. "Effective" is rendered twice in the markup (a duplicated text layer, used for the word swap).
4. **Services band.** Link "Our services". Text "We craft / Websites & / Mobile Apps".
5. **About band.** Link "About us". Heading "Award-winning / Digital Product / Design + Development / Company". Small line "to make sense to users". Link "Contact".
6. **Identity statement.** "A bunch of / Designers who code + / + Coders who design".
7. **Work showcase, grouped by category.** Each group has a small label "Experienced in" and an H2 category name, then 1 to 2 cards. A card is an image on top and the title as a link below it.
   - Healthcare: Bangkok Hospital Official Website, Phyathai Hospital
   - Education: Sasin School of Management, True Digital Academy
   - Finance: Beacon VC, ASEAN Exchanges
   - Real Estate: Bhiraj Buri Group
   - Art and Design: D1839, CEA Design Week
8. **Notable Clients.** Small label "Trusted by", H2 "Notable Clients", then ONE image of the logo grid, linking to Works. It is a single image, not a grid of text cells.
9. **Contact CTA.** Small label "Let's chat". H2 "Ready to spark something?". Then email, phone and address links.
10. **Footer.** Links "Career | Internship". Line "COPYRIGHT © 2026 5LAB COMPANY |" and "CRAFTED WITH [icons] AND [icons] IN BANGKOK".

## Pattern to copy
- Small "eyebrow" label above every H2 ("Experienced in", "Trusted by", "Let's chat").
- Very large headlines broken over several short lines.
- Almost no boxes or borders. Content is images + big type + hairlines.
- Work cards: clean image first, title under it. No text on top of the image.

## Mapping to Sumit's site (content stays Sumit's, only the look and motion copy 5lab)
| 5lab.co | Sumit's site |
|---|---|
| Header | Navbar |
| Headline + Design/Develop panels | Hero |
| Services, About, Identity statement | About (statement on top) |
| Work showcase by category | Deployments |
| Notable Clients | Skills |
| Let's chat CTA | Contact |
| Footer | Footer |
| (no equivalent) | WorkstationBand, Footprint, Experience, Credentials: keep, restyle in the same visual language |
