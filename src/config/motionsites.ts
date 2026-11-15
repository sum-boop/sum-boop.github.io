/**
 * MotionSites AI (motionsites.ai) - Design System & Motion Configuration
 * Provides unified motion kinetics, color tokens, and animation presets
 * for cinematic, control-room, and high-performance WebGL/3D web applications.
 */

export const motionSitesTheme = {
  palette: {
    void: '#05070B',
    graphite: '#0B1018',
    steel: '#1A2230',
    cyan: '#22D3EE',
    electricBlue: '#3B82F6',
    amber: '#FBBF24',
    alertRed: '#FF2B4A',
    text: '#E6F1FF',
    textDim: '#8892B0',
    borderGlass: 'rgba(255, 255, 255, 0.08)',
    cyanGlow: 'rgba(34, 211, 238, 0.25)',
  },
  typography: {
    display: 'font-mono uppercase tracking-[0.2em]',
    body: 'font-sans tracking-normal',
    mono: 'font-mono tracking-wider',
  },
  transitions: {
    cinematic: {
      duration: 0.65,
      ease: [0.16, 1, 0.3, 1], // fluid decelerate
    },
    snappy: {
      duration: 0.25,
      ease: [0.34, 1.56, 0.64, 1], // overshoot spring
    },
    hover: {
      duration: 0.2,
      ease: 'easeOut',
    },
  },
  springs: {
    stiff: { tension: 300, friction: 20 },
    gentle: { tension: 180, friction: 24 },
    wobbly: { tension: 180, friction: 12 },
  },
} as const;

export const motionVariants = {
  fadeIn: {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: motionSitesTheme.transitions.cinematic },
  },
  hudSlide: {
    hidden: { opacity: 0, x: -24 },
    visible: { opacity: 1, x: 0, transition: motionSitesTheme.transitions.cinematic },
  },
  glassCardHover: {
    rest: { scale: 1, borderColor: 'rgba(255,255,255,0.08)' },
    hover: {
      scale: 1.02,
      borderColor: 'rgba(34,211,238,0.4)',
      boxShadow: '0 0 25px rgba(34,211,238,0.15)',
      transition: { duration: 0.2 },
    },
  },
} as const;

export default motionSitesTheme;
