/**
 * Navigation Item Configuration — Section 3.4 Role Visibility Matrix
 *
 * Single source of truth for every nav item and which roles see it.
 * ─────────────────────────────────────────────────────────────────────────────
 * API-ready architecture:
 *   Each nav item declaratively specifies the exact `roles: RoleSlug[]` permitted.
 *   When moving to a backend endpoint (`GET /api/nav?role=:slug`), `navService.getNavItemsForRole()`
 *   can swap its source directly without requiring conditional logic in client components.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import type { LucideIcon } from "lucide-react";
import {
  Home,
  GraduationCap,
  Store,
  BookOpen,
  Waypoints,
  ShoppingBag,
  UsersRound,
  Building2,
  Bell,
  BarChart3,
  Inbox,
  Calendar,
  FolderTree,
  Video,
  MessageSquare,
  Settings,
  CreditCard,
  HelpCircle,
  Users,
  Award,
  Library,
} from "lucide-react";
import type { RoleSlug, NavGroup } from "@/config/roles";

export interface NavItem {
  /** Stable ID used for module-gate lookups (§3.10.D). */
  id: string;
  /** Display label shown in the sidebar rail. */
  label: string;
  /** URL segment appended to `/${role}/` — keep consistent with the route folder name. */
  href: string;
  /** Lucide icon component rendered in the nav rail. */
  icon: LucideIcon;
  /** Exact role slugs permitted to access and see this module in navigation. */
  roles: RoleSlug[];
  /** Optional backward-compatible grouping. */
  groups?: NavGroup[];
  /** Optional annotation shown in admin module-enable/disable UI. */
  note?: string;
}

/**
 * Master navigation registry — Declarative Role Access Matrix
 *
 * Order here determines the order items appear in each role's sidebar rail.
 * The AppShell filters this list by:
 *   1. The user's role (`navItemsForRole(role)`)
 *   2. The organization's `enabledModules` list (§3.10.D)
 */
export const NAV_ITEMS: NavItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    href: "dashboard",
    icon: Home,
    roles: ["lms-admin", "super-admin", "org-admin", "dept-head", "instructor", "manager", "learner"],
    groups: ["admin", "instructor", "manager", "learner"],
  },
  {
    id: "users",
    label: "Users",
    href: "users",
    icon: Users,
    roles: ["lms-admin", "super-admin", "org-admin", "dept-head"],
    groups: ["admin"],
  },
  {
    id: "org-management",
    label: "Organization Management",
    href: "organization",
    icon: Building2,
    roles: ["lms-admin", "super-admin"],
    groups: ["admin"],
  },
  {
    id: "my-training",
    label: "My Training",
    href: "my-training",
    icon: GraduationCap,
    roles: ["learner"],
    groups: ["learner"],
  },
  {
    id: "catalog",
    label: "Catalog",
    href: "catalog",
    icon: Store,
    roles: ["learner"],
    groups: ["learner"],
  },
  {
    id: "courses",
    label: "Courses",
    href: "courses",
    icon: BookOpen,
    roles: ["org-admin", "dept-head", "instructor"],
    groups: ["admin", "instructor"],
  },
  {
    id: "learning-paths",
    label: "Learning Paths",
    href: "learning-paths",
    icon: Waypoints,
    roles: ["org-admin", "dept-head", "instructor"],
    groups: ["admin", "instructor"],
  },
  {
    id: "course-store",
    label: "Course Store",
    href: "course-store",
    icon: ShoppingBag,
    roles: ["org-admin"],
    groups: ["admin"],
  },
  {
    id: "groups",
    label: "Groups",
    href: "groups",
    icon: UsersRound,
    roles: ["org-admin", "dept-head", "instructor"],
    groups: ["admin", "instructor"],
  },
  {
    id: "notifications",
    label: "Notifications",
    href: "notifications",
    icon: Bell,
    roles: ["lms-admin", "super-admin", "org-admin", "dept-head"],
    groups: ["admin"],
  },
  {
    id: "reports",
    label: "Reports",
    href: "reports",
    icon: BarChart3,
    roles: ["lms-admin", "super-admin", "org-admin", "dept-head", "instructor", "manager"],
    groups: ["admin", "instructor", "manager"],
  },
  {
    id: "approval-inbox",
    label: "Approval Inbox",
    href: "approvals",
    icon: Inbox,
    roles: ["manager", "org-admin", "dept-head"],
    groups: ["manager"],
  },
  {
    id: "calendar",
    label: "Calendar",
    href: "calendar",
    icon: Calendar,
    roles: ["lms-admin", "super-admin", "org-admin", "dept-head", "instructor", "manager", "learner"],
    groups: ["admin", "instructor", "manager", "learner"],
  },
  {
    id: "certificates",
    label: "Certificates",
    href: "certificates",
    icon: Award,
    roles: ["lms-admin", "super-admin", "org-admin", "dept-head", "instructor", "manager", "learner"],
    groups: ["admin", "instructor", "manager", "learner"],
  },
  {
    id: "content-library",
    label: "Content Library",
    href: "content-library",
    icon: Library,
    // §3.20: Super Admin curates, Org Admin imports — not a general admin/instructor tool.
    roles: ["lms-admin", "super-admin", "org-admin"],
    groups: ["admin"],
  },
  {
    id: "course-categories",
    label: "Course Categories",
    href: "categories",
    icon: FolderTree,
    roles: ["org-admin", "dept-head", "instructor", "manager"],
    groups: ["admin", "instructor", "manager"],
  },
  {
    id: "conferences",
    label: "Conferences",
    href: "conferences",
    icon: Video,
    roles: ["instructor", "org-admin", "dept-head"],
    groups: ["instructor"],
  },
  {
    id: "discussions",
    label: "Discussions",
    href: "discussions",
    icon: MessageSquare,
    roles: ["instructor", "learner", "org-admin", "dept-head"],
    groups: ["instructor", "learner"],
  },
  {
    id: "account-settings",
    label: "Account & Settings",
    href: "settings",
    icon: Settings,
    roles: ["org-admin"],
    groups: ["admin"],
  },
  {
    id: "subscription",
    label: "Subscription",
    href: "subscription",
    icon: CreditCard,
    roles: ["lms-admin", "super-admin", "org-admin"],
    groups: ["admin"],
  },
  {
    id: "help-center",
    label: "Help Center",
    href: "help",
    icon: HelpCircle,
    roles: ["lms-admin", "super-admin", "org-admin", "dept-head", "instructor", "manager", "learner"],
    groups: ["admin", "instructor", "manager", "learner"],
  },
];

/**
 * Declarative role-based navigation resolver.
 * Replaces hardcoded conditionals with a single declarative array filter.
 */
export function navItemsForRole(role: RoleSlug): NavItem[] {
  return NAV_ITEMS.filter((item) => item.roles.includes(role));
}

/**
 * Returns the nav items visible to a given nav group (backward-compat helper).
 */
export function navItemsForGroup(group: NavGroup): NavItem[] {
  return NAV_ITEMS.filter((item) => item.groups?.includes(group));
}

/**
 * Returns a single nav item by its stable module ID.
 * Used by the Organization module-enable/disable matrix (§3.10.D).
 */
export function getNavItemById(id: string): NavItem | undefined {
  return NAV_ITEMS.find((item) => item.id === id);
}

/**
 * Returns all unique module IDs — used to seed the org module-access checklist
 * in the Super Admin Organization Management page (§3.10.D).
 */
export const ALL_MODULE_IDS: string[] = NAV_ITEMS.map((item) => item.id);
