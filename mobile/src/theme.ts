/**
 * Design tokens for Nursing Coach.
 *
 * Every visual value in the app should come from this file — colors, spacing,
 * font sizes, corner radii. Components import these instead of hardcoding
 * numbers and hex codes.
 *
 * Why: change a value here and it updates everywhere at once. This is the file
 * to edit when reskinning the app.
 *
 * OWNERSHIP: this is the design layer. Safe to change freely — nothing here
 * affects how the app fetches data or manages state.
 */

/**
 * Palette. Deliberately calm and low-saturation — users are stressed nursing
 * students, often studying late. Avoid alarm-red and high-energy colors except
 * where something genuinely needs attention.
 */
export const colors = {
  // surfaces
  background: '#e684d5',   // page background, very slightly warm off-white
  surface: '#ffffff',      // cards sitting on the background
  border: '#dfe5e5',       // hairlines, input outlines

  // text
  text: '#1a2423',         // primary body text
  textMuted: '#5d6b6a',    // secondary text, answers, hints
  textInverse: '#ffffff',  // text on top of accent colors

  // brand / interaction
  accent: '#2e7d6f',       // teal-green: buttons, links, focus. medical but calm
  accentPressed: '#25655a',// darker accent for pressed/active states

  // feedback states
  error: '#a8443c',        // muted brick, not fire-engine red
  errorSurface: '#fdf2f1', // tinted background behind error messages
} as const;

/**
 * Spacing scale. Use these instead of arbitrary numbers so rhythm stays
 * consistent. Steps roughly double, which keeps proportions readable.
 */
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

/** Type scale. Sizes step up clearly so hierarchy is obvious at a glance. */
export const fontSize = {
  sm: 13,   // captions, hints
  md: 16,   // body — minimum comfortable size on a phone
  lg: 20,   // question text, section headers
  xl: 28,   // screen titles
} as const;

/** Corner radii. */
export const radius = {
  sm: 6,
  md: 12,
  pill: 999,
} as const;

/**
 * Elevation. React Native needs different properties per platform, so bundling
 * them into one object keeps call sites clean.
 */
export const shadow = {
  card: {
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2, // Android reads this one
  },
} as const;
