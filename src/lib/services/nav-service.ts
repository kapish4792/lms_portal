/**
 * Nav Service
 *
 * All navigation items flow through here. Currently backed by declarative static config;
 * ready for direct drop-in replacement with `fetch('/api/platform/nav?role=' + slug)`
 * when connecting to a backend REST API.
 *
 * The org-level module gate (§3.10.D) is applied *after* this service returns
 * items — AppShell intersects results with `org.enabledModules`.
 */

import {
  NAV_ITEMS,
  ALL_MODULE_IDS,
  navItemsForRole,
  navItemsForGroup,
  getNavItemById,
  type NavItem,
} from "@/config/nav";
import type { RoleSlug, NavGroup } from "@/config/roles";

export const navService = {
  /**
   * Returns every nav item registered on the platform.
   * Future: `GET /api/platform/nav-items`
   */
  getAllNavItems(): Promise<NavItem[]> {
    return Promise.resolve(NAV_ITEMS);
  },

  /**
   * Returns nav items visible to a given role slug.
   * Future API integration: `GET /api/nav?role=:slug&orgId=:orgId`
   */
  getNavItemsForRole(slug: RoleSlug): Promise<NavItem[]> {
    return Promise.resolve(navItemsForRole(slug));
  },

  /**
   * Returns nav items visible to a given nav group.
   * (Synchronous convenience for AppShell SSR path.)
   */
  getNavItemsForGroup(group: NavGroup): NavItem[] {
    return navItemsForGroup(group);
  },

  /**
   * Returns a single nav item by its stable module ID.
   * Future: `GET /api/platform/nav-items/:id`
   */
  getNavItemById(id: string): Promise<NavItem | undefined> {
    return Promise.resolve(getNavItemById(id));
  },

  /**
   * Returns all module IDs.
   * Used by the org module-enable/disable matrix (§3.10.D).
   * Future: `GET /api/platform/modules` — returns modules with metadata.
   */
  getAllModuleIds(): Promise<string[]> {
    return Promise.resolve(ALL_MODULE_IDS);
  },
};
