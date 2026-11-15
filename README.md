# Sumit Anand — CCTV Operator & Surveillance Specialist

![CCTV command-center portfolio cover](https://sum-boob-github-io.vercel.app/assets/og-cover.jpg)

[![React](https://img.shields.io/badge/React-18.3-149eca?logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-3178c6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8-646cff?logo=vite&logoColor=white)](https://vite.dev/)
[![Framer Motion](https://img.shields.io/badge/Framer%20Motion-14-0055ff?logo=framer&logoColor=white)](https://motion.dev/)
[![CI](https://github.com/sum-boop/sum-boob.github.io/actions/workflows/ci.yml/badge.svg)](https://github.com/sum-boop/sum-boob.github.io/actions/workflows/ci.yml)
[![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?logo=vercel)](https://sum-boob-github-io.vercel.app/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

**Live portfolio:** [sum-boob-github-io.vercel.app](https://sum-boob-github-io.vercel.app/)

**GitHub Pages:** [sum-boop.github.io/sum-boob.github.io](https://sum-boop.github.io/sum-boob.github.io/)

A surveillance operations portfolio for **Sumit Anand**, presenting CCTV multi-channel monitoring, GIGO gate control, logistics deployments, work history, technical capabilities, credentials, and direct messaging channels in an accessible, responsive React + TypeScript application. Illustrative feed and monitoring imagery is not footage from listed client sites or a personal photograph.

## Features

- **3D Interactive Earth Centerpiece**: Custom DPR-aware Canvas 2D orthographic Earth globe with atmospheric Fresnel rim lighting, spotlight halo, world landmass dot matrix highlighting India and Patli (`28.45° N, 76.85° E`), `IntersectionObserver` + `visibilitychange` loop pausing, `prefers-reduced-motion` static drift fallback, and static image fallback.
- **Enterprise Motion System (`src/motion/`)**: `LazyMotion` (`domAnimation`) + `MotionConfig reducedMotion="user"`, masked `SplitText` reveals, `once: true` viewport entrances, tactile spring interactions, shared-layout active indicators, scroll-drawn timeline rails, hover-pausing capabilities marquee, and compositor-only animations.
- **Command Palette (`Ctrl+K` / `⌘K`)**: Keyboard-accessible quick launcher for section navigation, deployment briefing modals, social profiles, WhatsApp, email copy, résumé PDF download, and theme switching.
- **Dark & Light Themes**: Respects OS preference by default with persistent toggle (`localStorage`), no-flash inline initialization, and WCAG AA contrast tokens across both themes.
- **Direct Messaging Composer & Social Profiles**: Zero-backend direct message composer supporting **WhatsApp**, **Email (`mailto:`)**, and **SMS (`sms:`)** with one-click fallback/copy links, plus configurable **GitHub**, **LinkedIn**, and **Instagram** profile links in `src/data/contact.ts`.
- **Filterable Deployment Bento Grid & Modals**: Filter by category (`Surveillance`, `Gate Control`, `Loss Prevention`, `Forensics`, `Perimeter`, `Emergency`), navigate briefings with `ArrowLeft`/`ArrowRight` keys, and deep-link directly via `#deployment-op1`…`#deployment-op6`.

## Technology

| Area      | Stack                                                          |
| --------- | -------------------------------------------------------------- |
| UI        | React 18.3.1, TypeScript 6 (Strict), Vite 8                    |
| Motion    | Framer Motion (`LazyMotion` + `domAnimation`)                  |
| Styling   | CSS design tokens (Dark + Light), responsive Bento & print CSS |
| Icons     | Lucide React + custom SVG social icons                         |
| Quality   | ESLint, typescript-eslint, Prettier                            |
| Messaging | Direct WhatsApp, Email (`mailto:`), and SMS (`sms:`) links     |
| Hosting   | Vercel and GitHub Pages                                        |

## Project structure

```text
.
├── .github/
│   ├── ISSUE_TEMPLATE/       # Bug and feature forms
│   ├── workflows/            # CI and Pages deployment
│   ├── CODEOWNERS
│   ├── dependabot.yml
│   └── pull_request_template.md
├── public/
│   ├── assets/               # Monitoring station imagery, footprint video, and résumé PDF
│   ├── 404.html              # GitHub Pages 404 fallback page
│   ├── apple-touch-icon.png
│   ├── favicon.ico
│   ├── favicon.svg
│   ├── icon-192.png
│   ├── icon-512.png
│   ├── manifest.webmanifest
│   ├── robots.txt
│   └── sitemap.xml
├── src/
│   ├── assets/images/        # Bundled illustrative deployment photography
│   ├── components/           # EarthGlobe, CommandPalette, Navbar, ContactForm, SocialIcon, etc.
│   ├── data/                 # Typed profile, experience, skills, projects, credentials, contact
│   ├── hooks/                # Clock, theme, media query, reduced motion, and scroll spy hooks
│   ├── motion/               # Tokens, variants, primitives, ScrollProgress, BackToTop, motion CSS
│   ├── sections/             # Lazy-loaded single-page section composition
│   ├── styles/               # Dual-theme design tokens and responsive application stylesheet
│   ├── types/                # Shared portfolio interfaces
│   └── utils/                # Public asset URL helper
├── index.html                # No-flash theme script, SEO metadata, JSON-LD, and Vite entry
├── vite.config.ts            # Vite config with @/ alias and vendor chunk splitting
└── vercel.json               # Static output and response security headers
```

## Updating Social & Contact Links

Edit `src/data/contact.ts` to add or update your **GitHub**, **LinkedIn**, **Instagram**, **Email**, **Phone**, or **WhatsApp** URLs:

```ts
export const socialLinks = [
  { id: 'github', label: 'GitHub', handle: '@sum-boop', href: 'https://github.com/sum-boop' },
  {
    id: 'linkedin',
    label: 'LinkedIn',
    handle: 'Your LinkedIn',
    href: 'https://www.linkedin.com/in/your-handle/',
  },
  {
    id: 'instagram',
    label: 'Instagram',
    handle: '@your-handle',
    href: 'https://www.instagram.com/your-handle/',
  },
] satisfies readonly SocialLink[];
```

## Local development

Use Node.js `20.19.0` (see `.nvmrc`) and npm.

```bash
npm ci
npm run dev
```

The Vite development server serves the portfolio at `http://localhost:3000`.

### Scripts

| Script                 | Purpose                                             |
| ---------------------- | --------------------------------------------------- |
| `npm run dev`          | Start the Vite development server on port 3000      |
| `npm run build`        | Type-check with `tsc --noEmit`, then create `dist/` |
| `npm run preview`      | Preview the built static site on port 3000          |
| `npm run lint`         | Run ESLint                                          |
| `npm run typecheck`    | Run strict TypeScript checking                      |
| `npm run format`       | Format supported source files with Prettier         |
| `npm run format:check` | Check formatting                                    |

## License

MIT. See [LICENSE](LICENSE). Copyright © 2026 Sumit Anand.
