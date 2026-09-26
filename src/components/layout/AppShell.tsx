"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/theme-toggle";
import { NotificationBell } from "@/components/layout/NotificationBell";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { navItemsForRole } from "@/lib/permissions";
import { useAuthStore } from "@/lib/store/auth-store";
import { useOrganizationsStore } from "@/lib/store/organizations-store";
import { useCoursesStore } from "@/lib/store/courses-store";
import type { MockUser } from "@/lib/mock/users";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  LogOut,
  HelpCircle,
  User,
  Settings,
  PanelLeftClose,
  PanelRightClose,
  Menu,
  X,
  Home,
} from "lucide-react";
import { cn } from "@/lib/utils";

function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((prev: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === "undefined") return initialValue;
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = (value: T | ((prev: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      if (typeof window !== "undefined") {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue];
}

export function AppShell({
  user,
  children,
}: {
  user?: MockUser | null;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const logout = useAuthStore((s) => s.logout);
  const organizations = useOrganizationsStore((s) => s.organizations);
  const allCourses = useCoursesStore((s) => s.courses);
  const userOrg = user?.org;
  const userRole = user?.role;
  const myOrg = useMemo(() => (userOrg ? organizations.find((o) => o.name === userOrg) : undefined), [organizations, userOrg]);
  // Section 3.10.D — layered access: an org's enabled-modules gate applies before
  // role-based nav visibility. Unset (no matching org record) fails open so a
  // missing seed doesn't lock every role out of every module.
  const roleNav = useMemo(() => (userRole ? navItemsForRole(userRole) : []), [userRole]);
  const orgScopedNav = useMemo(
    () => (myOrg ? roleNav.filter((item) => myOrg.enabledModules.includes(item.id)) : roleNav),
    [myOrg, roleNav]
  );
  const navItems = useMemo(() => orgScopedNav.filter((item) => item.id !== "help-center"), [orgScopedNav]);
  const helpItem = useMemo(() => orgScopedNav.find((item) => item.id === "help-center"), [orgScopedNav]);

  // Generate dynamic breadcrumbs based on current pathname & role route
  const breadcrumbItems = useMemo(() => {
    if (!pathname || !user) return [];
    const segments = pathname.split("/").filter(Boolean);
    // skip the role segment (index 0)
    const pageSegments = segments.slice(1);
    if (pageSegments.length === 0) {
      return [{ label: "Dashboard", href: `/${user.role}/dashboard`, isLast: true }];
    }

    const ROUTE_LABELS: Record<string, string> = {
      dashboard: "Dashboard",
      courses: "Courses",
      new: "New Course",
      "course-store": "Course Store",
      catalog: "Course Catalog",
      "my-training": "My Training",
      "content-library": "Content Library",
      "learning-paths": "Learning Paths",
      certificates: "Certificates",
      categories: "Categories",
      calendar: "Training Calendar",
      conferences: "Virtual Conferences",
      discussions: "Discussions",
      users: "Users",
      groups: "User Groups",
      reports: "Reports & Analytics",
      notifications: "Notifications",
      organization: "Organization",
      subscription: "Subscription",
      approvals: "Approvals",
      settings: "Settings",
      profile: "Profile & Security",
      player: "Lesson Player",
      edit: "Edit",
    };

    return pageSegments.map((segment, index) => {
      const isLast = index === pageSegments.length - 1;
      const href = `/${user.role}/${pageSegments.slice(0, index + 1).join("/")}`;

      // Check if it's a known route label
      let label = ROUTE_LABELS[segment.toLowerCase()];

      // If not, check if it's a course id
      if (!label) {
        const foundCourse = allCourses.find((c) => c.id === segment);
        if (foundCourse) {
          label = foundCourse.title;
        }
      }

      // Fallback: capitalize words
      if (!label) {
        label = segment
          .split("-")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ");
      }

      return { label, href, isLast };
    });
  }, [pathname, user, allCourses]);

  const isDashboard = useMemo(() => {
    if (!pathname || !user) return false;
    const segments = pathname.split("/").filter(Boolean);
    const pageSegments = segments.slice(1);
    return pageSegments.length === 0 || (pageSegments.length === 1 && pageSegments[0].toLowerCase() === "dashboard");
  }, [pathname, user]);

  const initials = (user?.name || "User")
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const [isCollapsed, setIsCollapsed] = useLocalStorage("lms:sidenav:collapsed", false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const desktopNavRef = useRef<HTMLElement | null>(null);

  // Restore scroll position immediately when nav mounts or pathname changes
  useEffect(() => {
    const saved = sessionStorage.getItem("lms:sidebar:scroll");
    if (saved && desktopNavRef.current) {
      desktopNavRef.current.scrollTop = Number(saved);
    }
  }, [pathname]);

  const handleNavScroll = (e: React.UIEvent<HTMLElement>) => {
    sessionStorage.setItem("lms:sidebar:scroll", String(e.currentTarget.scrollTop));
  };

  // Auto-close mobile drawer on route change without cascading renders
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setMobileOpen(false);
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-sunken">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-surface-sunken">
      {/* 1. Mobile Drawer Backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs md:hidden transition-opacity duration-300"
          aria-hidden="true"
        />
      )}

      {/* 2. Mobile Responsive Slide-in Drawer */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col w-72 bg-sidebar text-sidebar-foreground border-r border-sidebar-border shadow-2xl transition-transform duration-300 ease-in-out md:hidden",
          "bg-linear-to-b from-sidebar via-[color-mix(in_oklch,var(--sidebar)_95%,var(--sidebar-primary)_5%)] to-sidebar",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between px-4 h-16 border-b border-sidebar-border/80">
          <Link
            href={`/${user.role}/dashboard`}
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-2.5 min-w-0"
          >
            <div className="w-9 h-9 rounded-xl bg-linear-to-br from-primary to-[color-mix(in_oklch,var(--primary)_80%,black_20%)] flex items-center justify-center shrink-0 shadow-md text-primary-foreground">
              <svg className="w-5 h-5 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div className="min-w-0">
              <span className="text-sm font-bold tracking-tight text-sidebar-foreground block truncate">
                LMS Portal
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-primary block truncate">
                Enterprise
              </span>
            </div>
          </Link>
          <button
            onClick={() => setMobileOpen(false)}
            className="p-2 rounded-lg hover:bg-sidebar-accent text-sidebar-foreground/70 hover:text-sidebar-foreground cursor-pointer"
            aria-label="Close navigation drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mobile Org / Role Badge */}
        <div className="px-3 pt-3 pb-1">
          <div className="p-2.5 rounded-xl bg-sidebar-accent/60 dark:bg-sidebar-accent/30 border border-sidebar-border/70 flex items-center justify-between gap-2 shadow-2xs">
            <div className="min-w-0">
              <p className="text-[11px] font-bold text-sidebar-foreground truncate uppercase tracking-wider">
                {myOrg?.name || user.org || "Acme Corp"}
              </p>
              <p className="text-[10px] text-muted-foreground truncate capitalize">
                {user.role.replace("-", " ")} {user.department ? `· ${user.department}` : ""}
              </p>
            </div>
            <div className="w-2 h-2 rounded-full bg-emerald-500 ring-4 ring-emerald-500/20 shrink-0" />
          </div>
        </div>

        {/* Mobile Navigation List */}
        <nav className="flex-1 sidebar-scrollbar py-3 px-3 space-y-1">
          {navItems.map((item) => {
            const href = `/${user.role}/${item.href}`;
            const active = pathname === href || pathname.startsWith(`${href}/`);
            const Icon = item.icon;
            return (
              <Link
                key={item.id}
                href={href}
                scroll={false}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold transition-all duration-200",
                  active
                    ? "bg-primary text-primary-foreground shadow-sm shadow-primary/30 font-bold"
                    : "text-sidebar-foreground/75 hover:text-sidebar-foreground hover:bg-sidebar-accent/80"
                )}
              >
                <Icon className={cn("w-4 h-4 shrink-0", active ? "text-primary-foreground" : "text-sidebar-foreground/60")} />
                <span className="truncate">{item.label}</span>
                {item.note && (
                  <span
                    className={cn(
                      "ml-auto text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md",
                      active
                        ? "bg-primary-foreground/20 text-primary-foreground"
                        : "bg-sidebar-accent text-sidebar-foreground/60 border border-sidebar-border/50"
                    )}
                  >
                    {item.note}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Mobile Help Support */}
        {helpItem && (
          <div className="px-3 py-3 border-t border-sidebar-border/70">
            {(() => {
              const helpHref = `/${user.role}/${helpItem.href}`;
              const helpActive = pathname === helpHref || pathname.startsWith(`${helpHref}/`);
              return (
                <Link
                  href={helpHref}
                  scroll={false}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-semibold text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/80 transition-colors",
                    helpActive && "bg-sidebar-accent text-sidebar-foreground font-bold"
                  )}
                >
                  <HelpCircle className="w-4 h-4 shrink-0 text-sidebar-foreground/60" />
                  <span className="truncate">Help & Support</span>
                </Link>
              );
            })()}
          </div>
        )}
      </aside>

      {/* 3. Desktop Navigation Rail */}
      <aside
        className={cn(
          "group/sidebar hidden md:flex flex-col shrink-0 fixed inset-y-0 left-0 z-30 transition-all duration-300 ease-in-out select-none",
          "bg-sidebar text-sidebar-foreground border-r border-sidebar-border shadow-xs",
          "bg-linear-to-b from-sidebar via-[color-mix(in_oklch,var(--sidebar)_95%,var(--sidebar-primary)_5%)] to-sidebar",
          isCollapsed ? "w-16" : "w-64"
        )}
      >
        {/* Sidebar Brand Header */}
        <div className={cn("flex items-center h-16 border-b border-sidebar-border/80", isCollapsed ? "justify-center px-0" : "justify-between px-3.5")}>
          <Link href={`/${user.role}/dashboard`} className={cn("flex items-center min-w-0 group/brand", isCollapsed ? "justify-center" : "gap-2.5")}>
            <div className="w-9 h-9 rounded-xl bg-linear-to-br from-primary to-[color-mix(in_oklch,var(--primary)_80%,black_20%)] flex items-center justify-center shrink-0 shadow-md shadow-primary/25 ring-1 ring-white/20 dark:ring-white/10 group-hover/brand:scale-105 transition-transform duration-200">
              <svg className="w-5 h-5 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            {!isCollapsed && (
              <div className="min-w-0">
                <span className="text-sm font-bold tracking-tight text-sidebar-foreground block truncate">
                  LMS Portal
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-primary block truncate">
                  Enterprise
                </span>
              </div>
            )}
          </Link>
        </div>

        {/* Organization / Role Context Chip (Expanded mode) */}
        {!isCollapsed && (
          <div className="px-3 pt-3 pb-1">
            <div className="p-2.5 rounded-xl bg-sidebar-accent/60 dark:bg-sidebar-accent/30 border border-sidebar-border/70 flex items-center justify-between gap-2 shadow-2xs">
              <div className="min-w-0">
                <p className="text-[11px] font-bold text-sidebar-foreground truncate uppercase tracking-wider">
                  {myOrg?.name || user.org || "Acme Corp"}
                </p>
                <p className="text-[10px] text-muted-foreground truncate capitalize">
                  {user.role.replace("-", " ")} {user.department ? `· ${user.department}` : ""}
                </p>
              </div>
              <div className="w-2 h-2 rounded-full bg-emerald-500 ring-4 ring-emerald-500/20 shrink-0" title="Active Session" />
            </div>
          </div>
        )}

        {/* Nav Links with Hover-Only Smooth Scrollbar & Collapsed Centering */}
        <nav
          ref={desktopNavRef}
          onScroll={handleNavScroll}
          className={cn("flex-1 sidebar-scrollbar py-3 space-y-1", isCollapsed ? "px-1.5" : "px-2.5")}
        >
          {navItems.map((item) => {
            const href = `/${user.role}/${item.href}`;
            const active = pathname === href || pathname.startsWith(`${href}/`);
            const Icon = item.icon;
            return (
              <Link
                key={item.id}
                href={href}
                scroll={false}
                className={cn(
                  "relative flex items-center rounded-xl text-xs font-semibold transition-all duration-200 group/navitem",
                  isCollapsed
                    ? "w-10 h-10 mx-auto justify-center p-0"
                    : "gap-3 px-3 py-2.5",
                  active
                    ? "bg-primary text-primary-foreground shadow-sm shadow-primary/30 dark:shadow-primary/20 font-bold"
                    : "text-sidebar-foreground/75 hover:text-sidebar-foreground hover:bg-sidebar-accent/80 dark:hover:bg-sidebar-accent/50 active:scale-[0.99]"
                )}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon
                  className={cn(
                    "w-4 h-4 shrink-0 transition-transform duration-200 group-hover/navitem:scale-110",
                    active
                      ? "text-primary-foreground"
                      : "text-sidebar-foreground/60 group-hover/navitem:text-sidebar-foreground"
                  )}
                />
                {!isCollapsed && <span className="truncate">{item.label}</span>}
                {!isCollapsed && item.note && (
                  <span
                    className={cn(
                      "ml-auto text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md",
                      active
                        ? "bg-primary-foreground/20 text-primary-foreground"
                        : "bg-sidebar-accent text-sidebar-foreground/60 border border-sidebar-border/50"
                    )}
                  >
                    {item.note}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Help Section (Expanded or Centered when Collapsed) */}
        {helpItem && (
          <div className={cn("py-3 border-t border-sidebar-border/70", isCollapsed ? "px-1.5 flex justify-center" : "px-2.5")}>
            {(() => {
              const helpHref = `/${user.role}/${helpItem.href}`;
              const helpActive = pathname === helpHref || pathname.startsWith(`${helpHref}/`);
              return (
                <Link
                  href={helpHref}
                  scroll={false}
                  className={cn(
                    "flex items-center rounded-xl text-xs font-semibold text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/80 transition-colors",
                    isCollapsed
                      ? "w-10 h-10 justify-center p-0"
                      : "gap-3 px-3 py-2",
                    helpActive && "bg-sidebar-accent text-sidebar-foreground font-bold"
                  )}
                  title={isCollapsed ? "Help & Support" : undefined}
                >
                  <HelpCircle className="w-4 h-4 shrink-0 text-sidebar-foreground/60" />
                  {!isCollapsed && <span className="truncate">Help & Support</span>}
                </Link>
              );
            })()}
          </div>
        )}
      </aside>

      {/* 4. Main column */}
      <div className={cn("flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out", isCollapsed ? "md:ml-16" : "md:ml-64")}>
        <header className="h-16 flex items-center justify-between gap-4 px-4 sm:px-6 border-b border-surface-border bg-surface-base sticky top-0 z-20">
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden p-2 rounded-lg hover:bg-surface-sunken transition-colors text-text-secondary hover:text-text-primary cursor-pointer"
              aria-label="Open navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Desktop collapse toggle */}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden md:flex p-2 rounded-lg hover:bg-surface-sunken transition-colors text-text-secondary hover:text-text-primary cursor-pointer"
              aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {isCollapsed ? <PanelRightClose className="w-5 h-5" /> : <PanelLeftClose className="w-5 h-5" />}
            </button>

            <div className="hidden sm:block w-full max-w-sm">
              <Input placeholder="Search for anything..." className="bg-surface-sunken border-surface-border" />
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <NotificationBell user={user} />
            <ThemeToggle />
            {/* User Profile Dropdown Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <button
                    type="button"
                    className="flex items-center gap-2.5 p-2 rounded-full hover:bg-surface-sunken transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer group"
                    aria-label="User account menu"
                  >
                    {/* <span className="hidden sm:inline text-sm font-medium text-text-primary group-hover:text-primary transition-colors mr-1">{user.name}</span> */}
                    <Avatar className="w-8 h-8 border border-surface-border group-hover:border-primary/50 transition-colors">
                      <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                }
              />
              <DropdownMenuContent align="end" className="w-60">
                <div className="px-3 py-2.5">
                  <p className="text-sm font-semibold text-text-primary leading-tight">{user.name}</p>
                  <p className="text-xs text-text-tertiary truncate mt-0.5">{user.role}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  render={
                    <Link
                      href={`/${user.role}/profile`}
                      className="flex items-center gap-2 w-full text-xs font-medium cursor-pointer"
                    >
                      <User className="w-4 h-4 text-text-tertiary" />
                      <span>Profile & Security</span>
                    </Link>
                  }
                />
                <DropdownMenuItem
                  render={
                    <Link
                      href={`/${user.role}/settings`}
                      className="flex items-center gap-2 w-full text-xs font-medium cursor-pointer"
                    >
                      <Settings className="w-4 h-4 text-text-tertiary" />
                      <span>Account Settings</span>
                    </Link>
                  }
                />
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => {
                    logout();
                    router.replace("/auth/login");
                  }}
                  className="gap-2 text-xs font-medium cursor-pointer text-danger focus:text-danger"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Dynamic Breadcrumbs Bar (Hidden on Dashboard) */}
        {!isDashboard && (
          <div className="px-4 sm:px-6 py-2.5 bg-surface-base/60 backdrop-blur-xs border-b border-surface-border/60 flex items-center overflow-x-auto select-none">
            <Breadcrumb>
              <BreadcrumbList className="text-xs">
                <BreadcrumbItem>
                  <BreadcrumbLink render={<Link href={`/${user.role}/dashboard`} />} className="flex items-center gap-1.5 text-text-tertiary hover:text-text-primary transition-colors">
                    <Home className="w-3.5 h-3.5" />
                    <span>Dashboard</span>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                {breadcrumbItems.map((crumb) => (
                  <span key={crumb.href} className="inline-flex items-center gap-1.5">
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      {crumb.isLast ? (
                        <BreadcrumbPage className="font-semibold text-text-primary truncate max-w-xs sm:max-w-md">
                          {crumb.label}
                        </BreadcrumbPage>
                      ) : (
                        <BreadcrumbLink render={<Link href={crumb.href} />} className="text-text-tertiary hover:text-text-primary transition-colors truncate max-w-[150px]">
                          {crumb.label}
                        </BreadcrumbLink>
                      )}
                    </BreadcrumbItem>
                  </span>
                ))}
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        )}

        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}
