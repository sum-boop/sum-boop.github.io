# React Bits & MotionSites AI Integration Guide for AI Studio

Both **React Bits** (`reactbits.dev`) and **MotionSites AI** (`motionsites.ai` / `motionsites.org`) are now directly connected to your AI Studio environment.

---

## 1. React Bits (`reactbits.dev`)

### Connected Registry
Your project is configured with the official React Bits registry in `components.json`:
```json
{
  "registries": {
    "@react-bits": "https://reactbits.dev/r/{name}.json"
  }
}
```

### Ready-to-Use Components in `@/components/reactbits`
The following components are already installed and tested:
- **`SpotlightCard`**: Interactive glassmorphism cards with dynamic mouse spotlights and ambient glow.
- **`ShinyText`**: Shimmering metallic/neon animated headline and label text.
- **`Magnet`**: Physics-based magnetic attraction button and badge wrapper.

### Installing Any New Component from React Bits
You can pull and integrate any component from `reactbits.dev` at any time:
1. **Using npm script**:
   ```bash
   npm run add:bit <ComponentName>
   # e.g., npm run add:bit DecryptedText
   # e.g., npm run add:bit TrueFocus
   # e.g., npm run add:bit Squares
   ```
2. **Via AI Studio Chat**:
   Simply tell the assistant:
   > *"Add the DecryptedText component from reactbits.dev to the Hero briefing."*
   The assistant will automatically fetch, adapt, and insert the component into your website.

---

## 2. MotionSites AI (`motionsites.ai` / `motionsites.org`)

### Connected Configuration & Design Tokens
MotionSites design tokens and kinetic spring curves are configured in `src/config/motionsites.ts`:
- **Palette**: Void (`#05070B`), Graphite (`#0B1018`), Steel (`#1A2230`), Cyan (`#22D3EE`), Electric Blue (`#3B82F6`), Amber (`#FBBF24`), Alert Red (`#FF2B4A`), Holographic Text (`#E6F1FF`).
- **Motion Kinetics**: Easing curves (`cinematic`, `snappy`, `hover`), spring tension & friction presets, and Framer Motion / R3F variants.

### How to Use MotionSites Prompts with AI Studio
When you copy a prompt from **motionsites.ai** (e.g., hero layouts, 3D interactive canvases, telemetry grids, or dynamic pricing sections):
1. **Paste the prompt directly** into your AI Studio chat.
2. The AI Studio engineer interprets the MotionSites layout, camera rig, and shaders, matching them with your existing portfolio architecture (`Workstation3D`, `HolographicScreens`, `BriefCamEngine`).
3. You can also specify:
   > *"Apply MotionSites cinematic spring transitions to the Deployment Footprint section."*
