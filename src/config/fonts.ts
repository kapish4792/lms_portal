/**
 * §3.17.B — Dynamic Font-Selection Architecture
 *
 * This is the SINGLE source of truth for every typeface the LMS exposes.
 * - The branding settings page reads `AVAILABLE_FONTS` to render the selector.
 * - The application runtime applies the selected font via a CSS custom property
 *   (`--font-sans`) injected at the document root (no hard-coded imports needed).
 * - When migrating to a real API, replace the direct import of this file with a
 *   call to `fontService.getAvailableFonts()` in `src/lib/services/font-service.ts`.
 *
 * Adding a new font: add one entry to AVAILABLE_FONTS — zero UI code to change.
 */

export type FontCategory = "sans-serif" | "serif" | "monospace" | "display";

export interface FontConfig {
  /** Unique stable ID stored in org settings (`portal.fontId`). */
  id: string;
  /** Display name shown in the branding selector. */
  name: string;
  /** Short description shown as a sub-label in the selector. */
  description: string;
  /** CSS `font-family` value injected into `--font-sans`. */
  family: string;
  category: FontCategory;
  /** Google Fonts preload `<link>` href. `null` = system/variable font already loaded. */
  googleFontUrl: string | null;
  /** Available weights (used for future font-weight pickers). */
  weights: number[];
  /** Optional letter-spacing override (e.g. display fonts often need tighter tracking). */
  letterSpacing?: string;
  /**
   * Inline preview snippet displayed in the selector dropdown so admins can
   * see what the font looks like before committing.
   */
  preview: string;
}

/**
 * Platform-curated list of all available fonts.
 * The LMS Super Administrator can extend this list; Org Admins choose from it.
 */
export const AVAILABLE_FONTS: FontConfig[] = [
  {
    id: "geist",
    name: "Geist Sans",
    description: "Default modern sans-serif (variable)",
    family: "'Geist Sans', system-ui, sans-serif",
    category: "sans-serif",
    googleFontUrl: null, // bundled via next/font/google in layout.tsx
    weights: [400, 500, 600, 700],
    preview: "The quick brown fox jumps over the lazy dog",
  },
  {
    id: "inter",
    name: "Inter",
    description: "Clean & legible — popular SaaS default",
    family: "'Inter', system-ui, sans-serif",
    category: "sans-serif",
    googleFontUrl:
      "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap",
    weights: [400, 500, 600, 700],
    preview: "Precision-engineered for screen readability",
  },
  {
    id: "roboto",
    name: "Roboto",
    description: "Google's material standard",
    family: "'Roboto', system-ui, sans-serif",
    category: "sans-serif",
    googleFontUrl:
      "https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap",
    weights: [400, 500, 700],
    preview: "Familiar, neutral, and universally readable",
  },
  {
    id: "outfit",
    name: "Outfit",
    description: "Geometric & friendly — premium enterprise feel",
    family: "'Outfit', system-ui, sans-serif",
    category: "sans-serif",
    googleFontUrl:
      "https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&display=swap",
    weights: [400, 500, 600, 700],
    preview: "Modern geometry meets warm approachability",
  },
  {
    id: "plus-jakarta",
    name: "Plus Jakarta Sans",
    description: "Premium tech & startup aesthetic",
    family: "'Plus Jakarta Sans', system-ui, sans-serif",
    category: "sans-serif",
    googleFontUrl:
      "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap",
    weights: [400, 500, 600, 700],
    preview: "Refined, contemporary, and deeply professional",
  },
  {
    id: "poppins",
    name: "Poppins",
    description: "Contemporary rounded bold — great for headings",
    family: "'Poppins', system-ui, sans-serif",
    category: "sans-serif",
    googleFontUrl:
      "https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap",
    weights: [400, 500, 600, 700],
    preview: "Warm rounded geometry with strong presence",
  },
  {
    id: "lexend",
    name: "Lexend",
    description: "High readability — optimized for reading speed",
    family: "'Lexend', system-ui, sans-serif",
    category: "sans-serif",
    googleFontUrl:
      "https://fonts.googleapis.com/css2?family=Lexend:wght@400;500;600&display=swap",
    weights: [400, 500, 600],
    letterSpacing: "-0.01em",
    preview: "Scientifically optimized for maximum reading speed",
  },
  {
    id: "dm-sans",
    name: "DM Sans",
    description: "Low-contrast, optical-size — editorial & fintech",
    family: "'DM Sans', system-ui, sans-serif",
    category: "sans-serif",
    googleFontUrl:
      "https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&display=swap",
    weights: [400, 500, 700],
    preview: "Editorial clarity with low-contrast optical sizing",
  },
  {
    id: "nunito",
    name: "Nunito",
    description: "Friendly rounded — great for learner-facing portals",
    family: "'Nunito', system-ui, sans-serif",
    category: "sans-serif",
    googleFontUrl:
      "https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700&display=swap",
    weights: [400, 600, 700],
    preview: "Playful and approachable for learner engagement",
  },
  {
    id: "ibm-plex-sans",
    name: "IBM Plex Sans",
    description: "Enterprise & technical — IBM design language",
    family: "'IBM Plex Sans', system-ui, sans-serif",
    category: "sans-serif",
    googleFontUrl:
      "https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;700&display=swap",
    weights: [400, 500, 700],
    preview: "Technical precision in a clean enterprise voice",
  },
];

/** Find a font config by its stable ID. Returns `undefined` if not found. */
export function getFontById(id: string): FontConfig | undefined {
  return AVAILABLE_FONTS.find((f) => f.id === id);
}

/** Default font applied when no org-specific font is set. */
export const DEFAULT_FONT_ID = "geist";
export const DEFAULT_FONT = AVAILABLE_FONTS[0];
