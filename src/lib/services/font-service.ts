/**
 * Font Service
 *
 * All font data flows through here. Currently backed by the static config;
 * replace the `Promise.resolve()` bodies with real `fetch` calls when the
 * `GET /api/platform/fonts` endpoint exists.
 */

import {
  AVAILABLE_FONTS,
  DEFAULT_FONT_ID,
  DEFAULT_FONT,
  getFontById,
  type FontConfig,
  type FontCategory,
} from "@/config/fonts";

export const fontService = {
  /**
   * Returns all fonts available for the given org.
   * Future: `GET /api/orgs/:orgId/fonts` — platform admin curates a per-org subset.
   */
  getAvailableFonts(_orgId?: string): Promise<FontConfig[]> {
    return Promise.resolve(AVAILABLE_FONTS);
  },

  /**
   * Returns a single font by its stable ID.
   * Future: `GET /api/platform/fonts/:id`
   */
  getFontById(id: string): Promise<FontConfig | undefined> {
    return Promise.resolve(getFontById(id));
  },

  /**
   * Returns fonts filtered by category.
   * Future: `GET /api/platform/fonts?category=sans-serif`
   */
  getFontsByCategory(category: FontCategory): Promise<FontConfig[]> {
    return Promise.resolve(AVAILABLE_FONTS.filter((f) => f.category === category));
  },

  /**
   * Resolves a font ID to a config, falling back to the platform default.
   * Safe to call from both server components and client hooks.
   */
  resolveFontOrDefault(id?: string | null): Promise<FontConfig> {
    const font = id ? getFontById(id) : undefined;
    return Promise.resolve(font ?? DEFAULT_FONT);
  },

  /** The platform default font. Constant — no async needed. */
  defaultFontId: DEFAULT_FONT_ID,
  defaultFont: DEFAULT_FONT,
};
