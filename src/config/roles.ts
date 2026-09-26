/**
 * Role & Nav-Group Configuration
 *
 * Single source of truth for every role the platform recognises, their display
 * labels, and the nav-group each maps to. This file is the migration target for
 * a future `GET /api/roles` endpoint — replace the static export below with a
 * call to `roleService.getRoles()` in `src/lib/services/role-service.ts` and the
 * rest of the codebase stays unchanged.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * Adding a custom role (Component-Level Access Control Builder §3.15):
 *   1. Add an entry to ROLE_CONFIGS.
 *   2. Map it to a NavGroup in ROLE_TO_NAV_GROUP.
 *   3. No other files need changing.
 * ─────────────────────────────────────────────────────────────────────────────
 */

/** All built-in platform role slugs (§3.3.A). */
export type RoleSlug =
  | "super-admin"
  | "lms-admin"
  | "org-admin"
  | "dept-head"
  | "instructor"
  | "learner"
  | "manager";

/**
 * Navigation group — determines which subset of NAV_ITEMS a role sees.
 * Section 3.4 collapses the 6 archetypes into 4 nav rails to keep the
 * sidebar matrix manageable; the Component-Level RBAC Builder (§3.15) then
 * applies per-role component-level gates within each rail.
 */
export type NavGroup = "admin" | "instructor" | "manager" | "learner";

export interface RoleConfig {
  /** Stable slug used in URL segments and Zustand stores. */
  slug: RoleSlug;
  /** Display label shown in the UI (overridable via Glossary §3.17.A). */
  label: string;
  /** Short description for the RBAC builder and admin screens. */
  description: string;
  /** Nav group this role uses. */
  navGroup: NavGroup;
  /**
   * Permission scope tier — used by helper functions like
   * `canEditDepartmentResource()` to avoid repeating role-slug string comparisons
   * everywhere.
   *   "platform" → Super Admin cross-tenant authority
   *   "org"      → Organisation-scoped authority
   *   "dept"     → Department-scoped authority
   *   "personal" → Own resources only (Instructor, Learner, Manager)
   */
  scope: "platform" | "org" | "dept" | "personal";
}

/** Complete registry of all built-in platform roles. */
export const ROLE_CONFIGS: Record<RoleSlug, RoleConfig> = {
  "super-admin": {
    slug: "super-admin",
    label: "Super Administrator",
    description:
      "Platform-level governance: creates orgs, manages SaaS billing, enables/disables modules per org.",
    navGroup: "admin",
    scope: "platform",
  },
  "lms-admin": {
    slug: "lms-admin",
    label: "LMS Administrator",
    description:
      "Global platform administration: manages all organizations, users, and platform-wide settings. Only one LMS Admin can exist.",
    navGroup: "admin",
    scope: "platform",
  },
  "org-admin": {
    slug: "org-admin",
    label: "Organization Administrator",
    description:
      "Tenant-level control: full CRUD within their org, configures RBAC, branding, and integrations.",
    navGroup: "admin",
    scope: "org",
  },
  "dept-head": {
    slug: "dept-head",
    label: "Department Head",
    description:
      "Department-scoped authority: manages courses & users in their department, reads org-wide reports.",
    navGroup: "admin",
    scope: "dept",
  },
  instructor: {
    slug: "instructor",
    label: "Instructor",
    description:
      "Creates and manages courses owned by their department; cannot cross-department edit.",
    navGroup: "instructor",
    scope: "personal",
  },
  learner: {
    slug: "learner",
    label: "Learner",
    description: "Enrolls in and completes training; views own progress and certificates.",
    navGroup: "learner",
    scope: "personal",
  },
  manager: {
    slug: "manager",
    label: "Manager",
    description:
      "Approves enrollment requests; monitors direct-reports' compliance; no admin rights.",
    navGroup: "manager",
    scope: "personal",
  },
};

/** Ordered list of role slugs as displayed in admin tables / RBAC builder. */
export const ROLE_SLUGS: RoleSlug[] = [
  "super-admin",
  "lms-admin",
  "org-admin",
  "dept-head",
  "instructor",
  "manager",
  "learner",
];

/** Map role slug → display label (backward-compat export for legacy callers).
 * Typed as Record<string, string> so aliased Role/RoleSlug types from any import
 * path can index it without TS7053 errors.
 */
export const ROLE_LABELS: Record<string, string> = Object.fromEntries(
  ROLE_SLUGS.map((s) => [s, ROLE_CONFIGS[s].label])
);

/** Map role slug → NavGroup. */
export const ROLE_TO_NAV_GROUP: Record<RoleSlug, NavGroup> = Object.fromEntries(
  ROLE_SLUGS.map((s) => [s, ROLE_CONFIGS[s].navGroup])
) as Record<RoleSlug, NavGroup>;

/**
 * Returns the RoleConfig for a slug, or `undefined` for unknown custom slugs.
 * Custom roles created via the RBAC builder will eventually be served by
 * `roleService.getRoleConfig(slug)`.
 */
export function getRoleConfig(slug: string): RoleConfig | undefined {
  return ROLE_CONFIGS[slug as RoleSlug];
}

/**
 * Permission scope helpers — replaces repeated `role === "super-admin"` checks.
 */
export function isPlatformAdmin(slug: string): boolean {
  return getRoleConfig(slug)?.scope === "platform";
}
export function isOrgAdmin(slug: string): boolean {
  const s = getRoleConfig(slug)?.scope;
  return s === "platform" || s === "org";
}
export function isDeptAdmin(slug: string): boolean {
  const s = getRoleConfig(slug)?.scope;
  return s === "platform" || s === "org" || s === "dept";
}
