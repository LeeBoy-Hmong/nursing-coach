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
  // Main brand colors
  navy: '#071B32',       // Deep navy blue — header background and primary text
  blue: '#168BFF',       // Bright blue — login button and blue portion of the logo
  emerald: '#00C896',    // Vibrant emerald green — green portion of the logo

  // Backgrounds
  background: '#EFF5FA', // Very pale blue-gray — main login form background
  white: '#FFFFFF',      // Pure white — optional input or card backgrounds

  // Text
  lightText: '#F1F7FC',  // Almost-white with a blue tint — app name on navy
  subtitle: '#85B6E6',   // Soft sky blue — tagline beneath the app name
  mutedText: '#607891',  // Muted slate blue-gray — secondary text and icons
  placeholder: '#7A91AB', // Softer blue-gray — example text inside empty inputs

  // Borders and links
  border: '#BED3E5',     // Light blue-gray — input borders and divider lines
  blueLink: '#07539B',   // Deep blue — “Forgot password?” link
  greenLink: '#007F63',  // Dark emerald green — “Create an account” link

  // feedback states
  error: '#a8443c',        // muted brick, not fire-engine red
  errorSurface: '#fdf2f1', // tinted background behind error messages
} as const;

/**
 * Spacing scale. Use these instead of arbitrary numbers so rhythm stays
 * consistent. Steps roughly double, which keeps proportions readable.
 */
export const spacing = {
  none: 0,    // No spacing
  xs: 4,      // Tiny gaps — between closely related elements
  sm: 8,      // Small gaps — between an icon and its label
  md: 12,     // Medium gaps — between related controls
  lg: 16,     // Standard spacing — input padding and content gaps
  xl: 24,     // Screen padding and spacing between form fields
  xxl: 32,    // Separation between sections
  xxxl: 48,   // Large separation — between branding and the form
} as const;

/** Type scale. Sizes step up clearly so hierarchy is obvious at a glance. */
export const fontSize = {
  caption: 12,   // Small supporting text
  label: 14,     // Field labels and secondary links
  body: 16,      // Input text and regular paragraphs
  button: 16,    // Button labels
  subtitle: 18,  // Supporting text below a heading
  title: 24,     // Section headings
  heading: 32,   // Main heading — “Welcome back”
  brand: 36,     // App name — “NurseSpace”
} as const;

/** Corner radii. */
export const radius = {
  none: 0,    // Square corners
  sm: 8,      // Small badges and compact elements
  md: 12,     // Inputs and buttons
  lg: 16,     // Small cards
  xl: 24,     // Large cards and dialogs
  xxl: 32,    // Rounded top corners of the login form panel
  pill: 999,  // Fully rounded pill-shaped buttons
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
