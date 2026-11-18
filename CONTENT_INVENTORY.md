# Content Inventory — Sumit Anand Portfolio (`/app/applet`)

Complete inventory of every file, section, copy string, visual asset, interactive feature, link, and control that MUST be preserved 100% verbatim in the replication.

---

## 1. Repository File Map
- **HTML & Entry**: `index.html`, `src/main.tsx`, `src/App.tsx`, `src/sections/PortfolioSections.tsx`
- **Data Modules (`src/data/`)**: `profile.ts`, `projects.ts`, `skills.ts`, `experience.ts`, `certifications.ts`, `contact.ts`
- **Styles (`src/styles/`, `src/motion/`)**: `src/styles/tokens.css`, `src/styles/global.css`, `src/motion/motion.css`, `src/motion/tokens.ts`, `src/motion/variants.ts`, `src/motion/primitives.tsx`, `src/motion/ScrollProgress.tsx`, `src/motion/SideSectionRail.tsx`, `src/motion/BackToTop.tsx`
- **Components (`src/components/`)**:
  - `Navbar.tsx`, `Hero.tsx`, `About.tsx`, `Skills.tsx`, `Footprint.tsx`, `FootprintMap.tsx`, `EarthGlobe.tsx`, `Deployments.tsx`, `CameraFeedCard.tsx`, `Experience.tsx`, `Credentials.tsx`, `Contact.tsx`, `ContactForm.tsx`, `Footer.tsx`, `Modal.tsx`, `CommandPalette.tsx`, `Boot.tsx`, `Cursor.tsx`, `Clock.tsx`, `SectionHeading.tsx`, `SocialLinks.tsx`, `SocialIcon.tsx`, `StageSkeleton.tsx`, `ToastProvider.tsx`, `ErrorBoundary.tsx`, `NotFound.tsx`
- **3D Workstation & BriefCam (`src/components/three/`, `src/components/workstation/`, `src/utils/`)**:
  - `SurveillanceStage3D.tsx`, `surveillanceModel.ts`, `materials.ts`, `BriefCamModules.tsx`, `Workstation3D.jsx`, `WorkstationSceneContent.jsx`, `WorkstationConsole.jsx`, `HolographicScreens.jsx`, `CameraRig.jsx`, `BriefCamEngine.jsx`
  - Pure logic & tests: `stagePhysics.ts` (+ `.test.ts`), `themeSceneConfig.ts` (+ `.test.ts`), `vmsLogic.ts` (+ `.test.ts`), `animMaster.ts`, `heroSplitText.ts`, `microInteractions.ts`, `scrollStory.ts`, `viewTransition.ts`, `assets.ts`, `yieldToMain.ts`
- **Images & Media (`public/`, `src/assets/images/`)**:
  - `public/assets/sumit-monitoring-station.jpg`, `public/assets/sumit-anand-resume.pdf`, `public/assets/earth-globe.mp4`, `public/assets/earth-globe-poster.png`, `public/assets/og-cover.jpg`, `public/images/workstation-fallback.jpg`
  - `src/assets/images/workstation_command_hero_1794781430131.jpg`, `deployment_surveillance_wall_1794580052037.jpg`, `deployment_gate_terminal_1794580054781.jpg`, `loss_prevention_aisle_1794781428399.jpg`, `deployment_forensic_desk_1794580052641.jpg`, `deployment_warehouse_dock_1794580052470.jpg`, `emergency_response_desk_1794781429407.jpg`

---

## 2. Verbatim Content Checklist (Must All Remain Visible & Working)

1. **Identity & Hero (`profile.ts`)**:
   - Name: `Sumit Anand`
   - Kicker: `SA / MILESTONE XPROTECT VMS · CCTV OPERATIONS`
   - Status / Location: `Available for logistics & industrial security roles` · `Patli, Haryana, India`
   - Headline: `Sumit Anand` — `Eyes on every hub.`
   - Role: `CCTV Operator & Surveillance Specialist`
   - Summary: `CCTV Operator & Surveillance Specialist commanding Milestone XProtect VMS Smart Client consoles, multi-channel CP Plus arrays, and high-throughput GIGO gate control across India's largest logistics hubs.`
   - Hero Actions & Socials: `Message Directly` (`#contact`), `View Deployments` (`#operations`), GitHub `@sum-boop` (`https://github.com/sum-boop`), WhatsApp (`https://wa.me/917206185384`)
   - Rotating Stamp: `SUMIT ANAND • PATLI HARYANA • CCTV & VMS • Contact`
   - Scroll prompt & IST live Clock (`Clock.tsx`)
2. **Interactive 3D Workstation (`#hero-workstation`, `Hero.tsx`, `SurveillanceStage3D.tsx`, `BriefCamModules.tsx`)**:
   - Heading: `3D XProtect Smart Client Workstation` (`00 / LIVE COMMAND WORKSTATION`)
   - Drag/scroll/click-to-zoom controls, `VIEWS / EXPORTS / SEARCH / ALARMS / MONITOR` tabs, `BriefCam Video Content Analytics Plugin` overlay (`Review (Synopsis)`, `Respond (Alerts)`, `Research (Insights)`), Camera Feed Inspection drawer
   - Operator Dossier Readout: `2+` Years Ops, `32+` Cameras Monitored, `100%` Log Accuracy
   - XProtect Smart Client Console bar: `Live View`, `Playback`, `Smart Map`, `Alarm Manager`, `Jump to view`
3. **Security Profile / About (`#about`, `About.tsx`)**:
   - Eyebrow / Heading: `01 / Security profile` — `Calm eyes. Clear records.`
   - Venn Motif: `Operations` (`24/7 Control Room`) & `Systems` (`Milestone XProtect`)
   - Photo (`sumit-monitoring-station.jpg`, illustrative note) + Operating Profile (`Precision Monitoring & Asset Protection`), both verbatim `aboutParagraphs`, both career site anchors (`Innovision Limited — Flipkart Kalash Mega Hub · 2025 – Present`, `A.P. Securitas Pvt. Ltd. — Ekart Logistics · 2023 – 2024`), and 3 career metrics (`2+ Years Active`, `100% Log Accuracy`, `24/7 Video Uptime`)
4. **Capabilities / Skills (`#skills`, `Skills.tsx`)**:
   - `02 / Capabilities / signal map` — `Systems in sync.`
   - 4 interactive skill groups (`Surveillance systems`, `Network operations`, `Gate & access control`, `Safety & response`) with all 20 skills + VMS workstation sync + dual-track marquee ticker
5. **Deployment Footprint (`#footprint`, `Footprint.tsx`, `FootprintMap.tsx`, `EarthGlobe.tsx`)**:
   - `03 / Deployment footprint` — `Where I watch from.`
   - `PATLI LOGISTICS CORRIDOR · HARYANA, INDIA`
   - `Open Base in Google Maps` (`https://maps.app.goo.gl/brgxxLcyxQtzzsxT9`)
   - Interactive Corridor Radar + orbital Earth globe toggle (`Flipkart Kalash Mega Hub` 32 cam, `Ekart Logistics` 12 cam)
6. **Deployments (`#operations`, `Deployments.tsx`, `projects.ts`, `Modal.tsx`)**:
   - `04 / Key deployments` — `Camera feed deployments.`
   - Category filter bar synced with VMS (`All deployments 6`, `Surveillance 1`, `Gate Control 1`, `Loss Prevention 1`, `Forensics 1`, `Perimeter 1`, `Emergency 1`)
   - All 6 deployment records (`op1`..`op6`) with full copy, camera counts, site tags, gallery images, and keyboard-accessible `Modal` briefing dialog (`Prev` / `Next` / gallery thumbnails / `Close` / `Message directly`)
7. **Duty History / Experience (`#experience`, `Experience.tsx`)**:
   - `05 / Duty history` — `Operational logbook.`
   - Progression index (`Flipkart Kalash Mega Hub`, `Ekart Logistics`) + expandable duty accordions for `Security Systems & Gate Control Operator` (`Innovision Limited`, 2025–Present, 5 duties + 4 skill pills) and `Security Guard & Surveillance Operator` (`A.P. Securitas Pvt. Ltd.`, 2023–2024, 5 duties + 3 skill pills)
8. **Credentials (`#certifications`, `Credentials.tsx`)**:
   - `06 / Certifications & training` — `Verified credentials.`
   - Education: `B.S.A.M. Panchitthri Sr. Sec. School` (`Educational organization`)
   - All 4 certifications (`Networking & IP Surveillance Fundamentals`, `CCTV & Technical Systems Training`, `Fire Safety & First Aid (CPR)`, `Computer & Version Control Fundamentals`)
9. **Contact & Footer (`#contact`, `Contact.tsx`, `ContactForm.tsx`, `Footer.tsx`)**:
   - `07 / Open a channel` — `Let's talk about a role.` + `Let's chat` button focusing `#contact-name`
   - Verbatim availability & hireAvailability prose
   - Direct channels: `sa8518430@gmail.com` (`mailto:` + Copy email), `https://wa.me/917206185384`, `sms:+917206185384`, `+91 72061 85384`, `assets/sumit-anand-resume.pdf`, GitHub `@sum-boop`, `Patli, Haryana, IN` Google Maps
   - Interactive `ContactForm` (`WhatsApp` / `Email` / `SMS` channel switch + name/email/company/details + native validation)
   - Footer navigation, shortcuts, copyright `© 2026 Sumit Anand. All rights reserved. | Patli, Haryana, India | Back to top`
10. **Global Interactive Utilities**: Command Palette (`Ctrl+K`/`⌘K` in `CommandPalette.tsx`), Theme Switcher (`light`/`dark` in `useTheme.ts`), Toast notifications (`ToastProvider.tsx`), `404` page (`NotFound.tsx`).
