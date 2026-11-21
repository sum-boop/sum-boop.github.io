# 5Lab Reference Specification (5lab.co)

## 1. Color Palette

| Token / Element      | Hex Value                   | Description                |
| -------------------- | --------------------------- | -------------------------- |
| Page Background      | `#000000`                   | Deep obsidian black base   |
| Primary Text         | `#FFFFFF`                   | Pure white primary ink     |
| Secondary Text       | `#888888`                   | Muted grey text / metadata |
| Accent / Red         | `#FF223A`                   | Vibrant crimson accent     |
| Borders & Dividers   | `rgba(255, 255, 255, 0.12)` | Subtle hairline borders    |
| Button / Interactive | `#FFFFFF` / `#FF223A`       | Foreground & hover states  |

## 2. Typography & Font Disclosure

| Element          | Font Family                                                   | Size        | Weight      | Line-Height | Letter-Spacing |
| ---------------- | ------------------------------------------------------------- | ----------- | ----------- | ----------- | -------------- |
| Hero Heading     | Plus Jakarta Sans (GT Walsheim Pro proxy) / Newsreader italic | 64px - 88px | 700 / 400it | 1.05        | -0.03em        |
| Section Headings | Plus Jakarta Sans                                             | 36px - 48px | 600         | 1.15        | -0.02em        |
| Body Text        | Plus Jakarta Sans                                             | 16px - 18px | 400         | 1.5         | 0              |
| Nav Links        | Plus Jakarta Sans                                             | 14px - 15px | 500         | 1.2         | 0.01em         |
| Buttons          | Plus Jakarta Sans / JetBrains Mono                            | 14px        | 600         | 1.0         | 0.02em         |

- **Commercial Font**: `GT Walsheim Pro` (Sans) & custom editorial serif.
- **Google Font Proxy**: **Plus Jakarta Sans** (Primary Sans), **Newsreader** (Editorial Italic Serif), **JetBrains Mono** (Technical Monospace).

## 3. Layout & Grid Metrics

| Metric                   | Value                              |
| ------------------------ | ---------------------------------- |
| Container Max-Width      | `1400px`                           |
| Side Padding             | `32px` (desktop), `20px` (mobile)  |
| Section Vertical Spacing | `120px` - `160px`                  |
| Grid Columns             | 12-column fluid grid with 24px gap |
| Header Height            | `80px`                             |

## 4. Header & Navigation

| Property        | Specification                                                                                           |
| --------------- | ------------------------------------------------------------------------------------------------------- |
| Layout          | Left-aligned brand logo, right-aligned nav links (Works, Services, About, Contact)                      |
| Link Style      | Clean uppercase/capitalized sans links with underline or opacity hover transition                       |
| Scroll Behavior | Sticky backdrop-blur header (`backdrop-filter: blur(12px)`), hides on scroll down, reveals on scroll up |

## 5. Hero Section Structure

| Property       | Specification                                                                                          |
| -------------- | ------------------------------------------------------------------------------------------------------ |
| Headline Split | Huge stacked two-line split headline ("We spark web and mobile experience") with italic serif accent   |
| Panels Layout  | Two side-by-side service preview panels ("Design" and "Develop"), each with a small label and subtitle |

## 6. Motion & Animation

| Property            | Specification                                     |
| ------------------- | ------------------------------------------------- |
| Scroll & Smoothness | Lenis smooth scroll                               |
| Animations          | GSAP ScrollTrigger timeline                       |
| Text Reveal         | Staggered translateY reveal with opacity fade     |
| Image Reveal        | Scale-up clip-path / parallax image scaling       |
| Hover Effects       | Magnetic cursor / scale transforms / color shifts |
| Easing & Duration   | `power3.out`, duration `0.8s` - `1.2s`            |

## 7. Section Order (Top to Bottom)

1. Sticky Header / Navigation
2. Hero Section (Headline & Design/Develop Panels)
3. Intro Statement & Tagline ("A bunch of Designers who code + Coders who design.")
4. Showcase Blocks by Category (Healthcare, Education, Finance, Real Estate, Art & Design)
5. Client Logo Grid
6. Contact Call-to-Action ("Ready to spark something?")
7. Minimal Footer & Copyright
