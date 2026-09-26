/**
 * Role Service
 *
 * All role data flows through here. Currently backed by the static config;
 * replace the `Promise.resolve()` bodies with real `fetch` calls when the
 * `GET /api/platform/roles` endpoint exists.
 *
 * Custom roles (§3.15 RBAC Builder) will extend `ROLE_CONFIGS` server-side;
 * this service will transparently serve both built-in and custom roles.
 */

import {
  ROLE_CONFIGS,
  ROLE_SLUGS,
  ROLE_LABELS,
  ROLE_TO_NAV_GROUP,
  getRoleConfig,
  isPlatformAdmin,
  isOrgAdmin,
  isDeptAdmin,
  type RoleSlug,
  type RoleConfig,
  type NavGroup,
} from "@/config/roles";

export const roleService = {
  /**
   * Returns all roles available on the platform.
   * Future: `GET /api/platform/roles` (includes custom org-level roles).
   */
  getAllRoles(): Promise<RoleConfig[]> {
    return Promise.resolve(ROLE_SLUGS.map((s) => ROLE_CONFIGS[s]));
  },

  /**
   * Returns a single role config by slug.
   * Future: `GET /api/platform/roles/:slug`
   */
  getRoleConfig(slug: string): Promise<RoleConfig | undefined> {
    return Promise.resolve(getRoleConfig(slug));
  },

  /**
   * Returns the display label for a role slug.
   * Future: supports glossary overrides from the org settings store.
   */
  getRoleLabel(slug: RoleSlug): string {
    return ROLE_LABELS[slug] ?? slug;
  },

  /**
   * Returns all role labels as a flat Record.
   * Future: `GET /api/orgs/:orgId/role-labels` — includes glossary overrides §3.17.A.
   */
  getRoleLabels(): Promise<Record<RoleSlug, string>> {
    return Promise.resolve(ROLE_LABELS);
  },

  /**
   * Returns the NavGroup for a given role slug.
   * Used by AppShell and navItemsForRole() to filter sidebar items.
   */
  getNavGroup(slug: RoleSlug): NavGroup {
    return ROLE_TO_NAV_GROUP[slug];
  },

  // ── Permission scope helpers ──────────────────────────────────────────────
  isPlatformAdmin,
  isOrgAdmin,
  isDeptAdmin,

  /**
   * Returns whether a user can edit a department-scoped resource.
   * Future: policy checked server-side via `POST /api/authz/check`.
   */
  canEditDepartmentResource(
    user: { role: string; department?: string },
    resourceDepartment: string | undefined
  ): boolean {
    if (isPlatformAdmin(user.role) || isOrgAdmin(user.role)) return true;
    if (!resourceDepartment) return true;
    return user.department === resourceDepartment;
  },
};
