/**
 * @file permissions.ts — Backward-compatibility re-export bridge
 *
 * All role and nav data has been migrated to:
 *   src/config/roles.ts  — role slugs, labels, nav groups, scope tiers
 *   src/config/nav.ts    — navigation items and declarative visibility matrix (§3.4)
 *
 * Service layer (async / API-ready wrappers):
 *   src/lib/services/role-service.ts
 *   src/lib/services/nav-service.ts
 *
 * This file is kept ONLY for backward compatibility with existing imports of
 * `@/lib/permissions`. New code should import from the config or service layer
 * directly.
 */

// ── Role types & helpers ──────────────────────────────────────────────────────
export type { RoleSlug as Role, RoleConfig, NavGroup } from "@/config/roles";
export {
  ROLE_LABELS,
  ROLE_CONFIGS,
  ROLE_TO_NAV_GROUP,
  ROLE_SLUGS,
  getRoleConfig,
  isPlatformAdmin,
  isOrgAdmin,
  isDeptAdmin,
} from "@/config/roles";

// ── Nav types & helpers ───────────────────────────────────────────────────────
export type { NavItem } from "@/config/nav";
export {
  NAV_ITEMS,
  ALL_MODULE_IDS,
  navItemsForRole,
  navItemsForGroup,
  getNavItemById,
} from "@/config/nav";

// ── canEditDepartmentResource ────────────────────────────────────────────────
import { isPlatformAdmin, isOrgAdmin } from "@/config/roles";

/** @deprecated Use roleService.canEditDepartmentResource() instead. */
export function canEditDepartmentResource(
  user: { role: string; department?: string },
  resourceDepartment: string | undefined
): boolean {
  if (isPlatformAdmin(user.role) || isOrgAdmin(user.role)) return true;
  if (!resourceDepartment) return true;
  return user.department === resourceDepartment;
}
