"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { useRoleGuard } from "@/lib/hooks/use-role-guard";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useUsersStore } from "@/lib/store/users-store";
import { useCoursesStore } from "@/lib/store/courses-store";
import { useGroupsStore } from "@/lib/store/groups-store";
import { useLearningPathsStore } from "@/lib/store/learning-paths-store";
import { useOrganizationsStore } from "@/lib/store/organizations-store";
import { useCategoriesStore } from "@/lib/store/categories-store";
import { useActivityLogStore } from "@/lib/store/activity-log-store";
import { ROLE_LABELS } from "@/lib/permissions";
import { matrixStatusFor } from "@/lib/mock/training-matrix";
import {
  MANDATORY_COURSE_IDS,
  ACTIVITY_LABELS,
  ACTIVITY_SERIES,
  estimatePathEnrolled,
  estimatePathCompletionRate,
  estimateGroupCompletionRate,
  estimateAvgTimeToComplete,
  estimateExpirationDate,
  TIMELINE_EVENTS,
  getHeatmapIntensity,
  DEVICE_USAGE,
  SURVEY_KPIS,
  MOCK_SURVEYS,
  simulateReportsFetch,
} from "@/lib/mock/reports-data";
import { LineChart } from "@/components/charts/LineChart";
import { DonutChart } from "@/components/charts/DonutChart";
import { cn } from "@/lib/utils";
import {
  Download,
  Search,
  CheckCircle2,
  Clock,
  Users,
  BookOpen,
  Layers,
  Building2,
  Calendar,
  Sparkles,
  Star,
  Laptop,
  Smartphone,
  Tablet,
  Check,
  Send,
  Loader2,
  SlidersHorizontal,
  X,
} from "lucide-react";

const DEVICE_ICONS = { laptop: Laptop, smartphone: Smartphone, tablet: Tablet } as const;

const STATUS_STYLES: Record<string, string> = {
  completed: "bg-success/15 text-success border-success/30",
  "in-progress": "bg-warning/15 text-warning border-warning/30",
  overdue: "bg-danger/15 text-danger border-danger/30",
  "not-started": "bg-surface-sunken text-text-tertiary border-surface-border",
};

const STATUS_LABELS: Record<string, string> = {
  completed: "Completed",
  "in-progress": "In Progress",
  overdue: "Overdue",
  "not-started": "Not Started",
};

function downloadCsv(filename: string, headers: string[], rows: (string | number)[][]) {
  const escapeCell = (v: string | number) => {
    const s = String(v ?? "");
    if (s.includes(",") || s.includes('"') || s.includes("\n")) {
      return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
  };
  const csv = [
    headers.map(escapeCell).join(","),
    ...rows.map((r) => r.map(escapeCell).join(",")),
  ].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function ReportsPage() {
  const params = useParams<{ role: string }>();
  const user = useRoleGuard(params.role);

  const directory = useUsersStore((s) => s.directory);
  const courses = useCoursesStore((s) => s.courses);
  const groups = useGroupsStore((s) => s.groups);
  const paths = useLearningPathsStore((s) => s.paths);
  const organizations = useOrganizationsStore((s) => s.organizations);
  const categories = useCategoriesStore((s) => s.categories);
  const activityLogs = useActivityLogStore((s) => s.logs);

  const [activeTab, setActiveTab] = useState("overview");

  // Filter states
  const [usersSearch, setUsersSearch] = useState("");
  const [coursesSearch, setCoursesSearch] = useState("");
  const [activitySearch, setActivitySearch] = useState("");
  const [activityFilter, setActivityFilter] = useState<string>("All Events");

  // Custom Reports state
  const [customSource, setCustomSource] = useState<"users" | "courses" | "groups" | "paths">("users");
  const [customFilterQuery, setCustomFilterQuery] = useState("");
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [scheduleFrequency, setScheduleFrequency] = useState("weekly");
  const [scheduleEmail, setScheduleEmail] = useState("");
  const [scheduleSaved, setScheduleSaved] = useState(false);

  // Simulates the network round-trip a real `/api/reports` call would incur —
  // the underlying data still comes from the zustand stores (there's no
  // backend), but the page now has a genuine loading state on first mount
  // instead of rendering store-derived numbers synchronously.
  const [reportsLoading, setReportsLoading] = useState(true);
  useEffect(() => {
    let cancelled = false;
    simulateReportsFetch(true).then(() => {
      if (!cancelled) setReportsLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const scopedUsers = useMemo(() => (user ? directory.filter((d) => d.org === user.org) : []), [directory, user]);
  const scopedCourses = useMemo(() => (user ? courses.filter((c) => c.org === user.org) : []), [courses, user]);
  const scopedGroups = useMemo(() => (user ? groups.filter((g) => g.org === user.org) : []), [groups, user]);
  const scopedPaths = useMemo(() => (user ? paths.filter((p) => p.org === user.org) : []), [paths, user]);
  const scopedCategories = useMemo(() => (user ? categories.filter((c) => c.org === user.org) : []), [categories, user]);
  const scopedActivities = useMemo(() => (user ? activityLogs.filter((l) => l.org === user.org) : []), [activityLogs, user]);

  const enrolledCountFor = (userId: string) =>
    scopedGroups.filter((g) => g.memberIds.includes(userId)).flatMap((g) => g.courseIds).length;

  if (!user) return null;

  if (reportsLoading) {
    return (
      <AppShell user={user}>
        <div className="p-6 flex flex-col items-center justify-center gap-3 min-h-[60vh] text-text-tertiary">
          <Loader2 className="w-6 h-6 animate-spin" />
          <p className="text-sm">Fetching reports for {user.org}...</p>
        </div>
      </AppShell>
    );
  }

  const neverLoggedIn = 0;
  const activeUsers = scopedUsers.filter((u) => u.status === "Active").length;
  const assignedCourses = scopedCourses.length;
  const completedCourses = scopedCourses.filter((c) => c.completionRate === 100).length;

  // Filtered lists
  const filteredUsers = scopedUsers.filter(
    (u) =>
      !usersSearch.trim() ||
      `${u.firstName} ${u.lastName}`.toLowerCase().includes(usersSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(usersSearch.toLowerCase())
  );

  const filteredCourses = scopedCourses.filter(
    (c) =>
      !coursesSearch.trim() ||
      c.title.toLowerCase().includes(coursesSearch.toLowerCase()) ||
      c.category.toLowerCase().includes(coursesSearch.toLowerCase())
  );

  const filteredActivities = scopedActivities.filter((a) => {
    const matchesSearch =
      !activitySearch.trim() ||
      a.learnerName.toLowerCase().includes(activitySearch.toLowerCase()) ||
      a.courseName.toLowerCase().includes(activitySearch.toLowerCase());
    const matchesAction = activityFilter === "All Events" || a.action === activityFilter;
    return matchesSearch && matchesAction;
  });

  // Export handlers
  const handleExportUsers = () => {
    downloadCsv(
      `${user.org}-users-report.csv`,
      ["First Name", "Last Name", "Email", "Role", "Department", "Status", "Enrolled Courses", "Total Training Time", "Last Login"],
      filteredUsers.map((u) => [
        u.firstName,
        u.lastName,
        u.email,
        ROLE_LABELS[u.role],
        u.department ?? "",
        u.status,
        enrolledCountFor(u.id),
        "N/A (no session tracking)",
        "N/A",
      ])
    );
  };

  const handleExportCourses = () => {
    downloadCsv(
      `${user.org}-courses-report.csv`,
      [
        "Title",
        "Category",
        "Department",
        "Status",
        "Enrolled",
        "Completion Rate (%)",
        "Avg Score",
        "Avg Time to Complete",
        "Expiration Date",
      ],
      filteredCourses.map((c) => [
        c.title,
        c.category,
        c.department ?? "",
        c.status,
        c.enrolled,
        c.completionRate,
        c.avgScore,
        estimateAvgTimeToComplete(c.id),
        estimateExpirationDate(c.id),
      ])
    );
  };

  const handleExportPaths = () => {
    downloadCsv(
      `${user.org}-learning-paths-report.csv`,
      ["Path Name", "Category", "Steps Count", "Enrolled Learners", "Completion Rate (%)", "Department"],
      scopedPaths.map((p) => [
        p.title,
        p.category,
        p.steps.length,
        estimatePathEnrolled(p.steps.length),
        estimatePathCompletionRate(p.steps.length),
        p.department ?? "All Departments",
      ])
    );
  };

  const handleExportOrganizations = () => {
    downloadCsv(
      `organizations-report.csv`,
      ["Organization Name", "Subdomain", "Sub-orgs Allowed", "Enabled Modules Count"],
      organizations.map((o) => [o.name, o.subdomain, o.allowSubOrgs ? "Yes" : "No", o.enabledModules.length])
    );
  };

  const handleExportGroups = () => {
    downloadCsv(
      `${user.org}-groups-report.csv`,
      ["Group Name", "Type", "Members Count", "Assigned Courses Count", "Avg Completion Rate (%)"],
      scopedGroups.map((g) => [
        g.name,
        g.rule ? `Rule: ${g.rule.field}=${g.rule.value}` : "Static",
        g.memberIds.length,
        g.courseIds.length,
        estimateGroupCompletionRate(g.id),
      ])
    );
  };

  const handleExportActivities = () => {
    downloadCsv(
      `${user.org}-learning-activities-audit.csv`,
      ["Timestamp", "Learner", "Action", "Course", "Lesson", "Score", "IP Address"],
      filteredActivities.map((a) => [
        new Date(a.timestamp).toLocaleString(),
        a.learnerName,
        a.action,
        a.courseName,
        a.lessonName ?? "",
        a.score ?? "",
        a.ipAddress,
      ])
    );
  };

  const handleExportMatrix = () => {
    const learners = scopedUsers.filter((u) => u.role === "learner");
    const mandatoryCourses = scopedCourses.filter((c) => MANDATORY_COURSE_IDS.includes(c.id));
    const headers = ["Learner", ...mandatoryCourses.map((c) => c.title)];
    const rows = learners.map((u) => {
      const rowData = [
        `${u.firstName} ${u.lastName}`,
        ...mandatoryCourses.map((c) => {
          const { status, percent } = matrixStatusFor(u.id, c.id);
          return status === "in-progress" ? `${STATUS_LABELS[status]} (${percent}%)` : STATUS_LABELS[status];
        }),
      ];
      return rowData;
    });
    downloadCsv(`${user.org}-training-matrix-compliance.csv`, headers, rows);
  };

  return (
    <AppShell user={user}>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-text-primary">MIS Reporting Center</h1>
              <Badge variant="outline" className="text-xs">
                12-Module Suite
              </Badge>
            </div>
            <p className="text-text-secondary mt-1">
              Enterprise training intelligence, compliance audits, and learner progress for {user.org}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => {
                if (activeTab === "users") handleExportUsers();
                else if (activeTab === "courses") handleExportCourses();
                else if (activeTab === "paths") handleExportPaths();
                else if (activeTab === "orgs") handleExportOrganizations();
                else if (activeTab === "groups") handleExportGroups();
                else if (activeTab === "activities") handleExportActivities();
                else if (activeTab === "matrix") handleExportMatrix();
                else {
                  // Overview fallback export
                  downloadCsv(
                    `${user.org}-training-progress-summary.csv`,
                    ["Metric", "Value"],
                    [
                      ["Active Users", activeUsers],
                      ["Never Logged In", neverLoggedIn],
                      ["Assigned Courses", assignedCourses],
                      ["Completed Courses", completedCourses],
                      ["Total Courses", scopedCourses.length],
                      ["Total Groups", scopedGroups.length],
                      ["Learning Paths", scopedPaths.length],
                      ["Course Categories", scopedCategories.length],
                    ]
                  );
                }
              }}
            >
              <Download className="w-4 h-4" />
              Export {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} (CSV)
            </Button>
          </div>
        </div>

        {/* 12-Section Tabs Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="border-b border-surface-border overflow-x-auto pb-1">
            <TabsList className="h-auto p-1 bg-surface-sunken/60 inline-flex flex-nowrap min-w-max gap-1">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="courses">Courses</TabsTrigger>
              <TabsTrigger value="paths">Learning Paths</TabsTrigger>
              <TabsTrigger value="orgs">Organizations</TabsTrigger>
              <TabsTrigger value="groups">Groups</TabsTrigger>
              <TabsTrigger value="activities">Learning Activities</TabsTrigger>
              <TabsTrigger value="matrix">Training Matrix</TabsTrigger>
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
              <TabsTrigger value="custom">Custom Reports</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="surveys">Surveys</TabsTrigger>
            </TabsList>
          </div>

          {/* 1. OVERVIEW TAB */}
          <TabsContent value="overview" className="space-y-6 pt-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: "Active Users", value: activeUsers, icon: Users, color: "text-brand-500" },
                { label: "Never Logged In", value: neverLoggedIn, icon: Clock, color: "text-text-tertiary" },
                { label: "Assigned Courses", value: assignedCourses, icon: BookOpen, color: "text-blue-500" },
                { label: "Completed Courses", value: completedCourses, icon: CheckCircle2, color: "text-success" },
              ].map((k) => {
                const Icon = k.icon;
                return (
                  <Card key={k.label} className="border-surface-border shadow-card">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div>
                        <div className="text-2xl font-bold text-text-primary">{k.value}</div>
                        <div className="text-xs text-text-tertiary mt-0.5">{k.label}</div>
                      </div>
                      <div className="p-2.5 rounded-lg bg-surface-sunken">
                        <Icon className={cn("w-5 h-5", k.color)} />
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: "Catalog Courses", value: scopedCourses.length, icon: BookOpen },
                { label: "Course Categories", value: scopedCategories.length, icon: Layers },
                { label: "Cohort Groups", value: scopedGroups.length, icon: Users },
                { label: "Learning Pathways", value: scopedPaths.length, icon: Sparkles },
              ].map((k) => (
                <Card key={k.label} className="border-surface-border shadow-card">
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-text-primary">{k.value}</div>
                    <div className="text-xs text-text-tertiary mt-0.5">{k.label}</div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2 border-surface-border shadow-card">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div>
                    <CardTitle className="text-base font-semibold">Activity Breakdown</CardTitle>
                    <CardDescription>Daily active user logins vs course completion velocity</CardDescription>
                  </div>
                  <Badge variant="outline">Past 7 Days</Badge>
                </CardHeader>
                <CardContent className="pt-4">
                  <LineChart labels={ACTIVITY_LABELS} series={ACTIVITY_SERIES} height={230} />
                </CardContent>
              </Card>

              <Card className="border-surface-border shadow-card flex flex-col justify-between">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-semibold">Courses Performance</CardTitle>
                  <CardDescription>Catalog completion distribution</CardDescription>
                </CardHeader>
                <CardContent className="pt-2 flex-1 flex flex-col items-center justify-center">
                  <DonutChart
                    data={[
                      { label: "Completed (100%)", value: completedCourses || 2, color: "var(--success)" },
                      {
                        label: "In Progress (>0%)",
                        value: Math.max(1, scopedCourses.length - completedCourses),
                        color: "var(--color-chart-1)",
                      },
                      { label: "Draft / Not Started", value: 1, color: "var(--surface-border)" },
                    ]}
                    size={170}
                  />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* 2. USERS TAB */}
          <TabsContent value="users" className="space-y-4 pt-4">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="relative w-full sm:w-64 flex items-center">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-tertiary" />
                <Input
                  placeholder="Search user name or email..."
                  value={usersSearch}
                  onChange={(e) => setUsersSearch(e.target.value)}
                  className="h-9 pl-9 pr-8 bg-surface-base"
                />
                {usersSearch && (
                  <button
                    onClick={() => setUsersSearch("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-primary"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <Button variant="outline" size="sm" className="gap-1.5" onClick={handleExportUsers}>
                <Download className="w-3.5 h-3.5" />
                Export CSV
              </Button>
            </div>

            <Card className="border-surface-border shadow-card">
              <CardContent className="p-0 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-surface-border text-left text-text-tertiary">
                      <th className="p-3 font-medium">Name</th>
                      <th className="p-3 font-medium">User Type</th>
                      <th className="p-3 font-medium">Status</th>
                      <th className="p-3 font-medium">Enrolled Courses</th>
                      <th className="p-3 font-medium">Total Training Time</th>
                      <th className="p-3 font-medium">Last Login</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-border">
                    {filteredUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-surface-sunken/40 transition-colors">
                        <td className="p-3 font-medium text-text-primary">
                          {u.firstName} {u.lastName}
                          <div className="text-xs text-text-tertiary font-normal">{u.email}</div>
                        </td>
                        <td className="p-3 text-text-secondary">{ROLE_LABELS[u.role]}</td>
                        <td className="p-3">
                          <Badge variant={u.status === "Active" ? "default" : "outline"}>{u.status}</Badge>
                        </td>
                        <td className="p-3 text-text-secondary">{enrolledCountFor(u.id)}</td>
                        <td className="p-3 text-text-tertiary text-xs">— (no session tracking yet)</td>
                        <td className="p-3 text-text-tertiary text-xs">— (no session tracking yet)</td>
                      </tr>
                    ))}
                    {filteredUsers.length === 0 && (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-text-tertiary">
                          No users found matching query.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 3. COURSES TAB */}
          <TabsContent value="courses" className="space-y-4 pt-4">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="relative w-full sm:w-64 flex items-center">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-tertiary" />
                <Input
                  placeholder="Search course title or category..."
                  value={coursesSearch}
                  onChange={(e) => setCoursesSearch(e.target.value)}
                  className="h-9 pl-9 pr-8 bg-surface-base"
                />
                {coursesSearch && (
                  <button
                    onClick={() => setCoursesSearch("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-primary"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <Button variant="outline" size="sm" className="gap-1.5" onClick={handleExportCourses}>
                <Download className="w-3.5 h-3.5" />
                Export CSV
              </Button>
            </div>

            <Card className="border-surface-border shadow-card">
              <CardContent className="p-0 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-surface-border text-left text-text-tertiary">
                      <th className="p-3 font-medium">Title</th>
                      <th className="p-3 font-medium">Category</th>
                      <th className="p-3 font-medium">Status</th>
                      <th className="p-3 font-medium">Enrolled</th>
                      <th className="p-3 font-medium">Completion Rate</th>
                      <th className="p-3 font-medium">Avg Score</th>
                      <th className="p-3 font-medium">Avg Time to Complete</th>
                      <th className="p-3 font-medium">Expiration Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-border">
                    {filteredCourses.map((c) => (
                      <tr key={c.id} className="hover:bg-surface-sunken/40 transition-colors">
                        <td className="p-3 font-medium text-text-primary">
                          {c.title}
                          <div className="text-xs text-text-tertiary font-normal">{c.department ?? "All Departments"}</div>
                        </td>
                        <td className="p-3 text-text-secondary">{c.category}</td>
                        <td className="p-3">
                          <Badge variant={c.status === "published" ? "default" : "outline"}>{c.status}</Badge>
                        </td>
                        <td className="p-3 text-text-secondary">{c.enrolled}</td>
                        <td className="p-3 text-text-secondary">{c.completionRate}%</td>
                        <td className="p-3 text-text-secondary">{c.avgScore}</td>
                        <td className="p-3 text-text-secondary">{estimateAvgTimeToComplete(c.id)}</td>
                        <td className="p-3 text-text-tertiary text-xs whitespace-nowrap">{estimateExpirationDate(c.id)}</td>
                      </tr>
                    ))}
                    {filteredCourses.length === 0 && (
                      <tr>
                        <td colSpan={8} className="p-8 text-center text-text-tertiary">
                          No courses found matching query.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 4. LEARNING PATHS TAB */}
          <TabsContent value="paths" className="space-y-4 pt-4">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <p className="text-sm text-text-secondary">
                Curricular sequence progress and milestone completion rates across {scopedPaths.length} pathway(s).
              </p>
              <Button variant="outline" size="sm" className="gap-1.5" onClick={handleExportPaths}>
                <Download className="w-3.5 h-3.5" />
                Export CSV
              </Button>
            </div>

            <Card className="border-surface-border shadow-card">
              <CardContent className="p-0 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-surface-border text-left text-text-tertiary">
                      <th className="p-3 font-medium">Learning Path Name</th>
                      <th className="p-3 font-medium">Category</th>
                      <th className="p-3 font-medium">Step Count</th>
                      <th className="p-3 font-medium">Enrolled Learners</th>
                      <th className="p-3 font-medium">Completion Rate</th>
                      <th className="p-3 font-medium">Target Role</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-border">
                    {scopedPaths.map((p) => (
                      <tr key={p.id} className="hover:bg-surface-sunken/40 transition-colors">
                        <td className="p-3 font-medium text-text-primary">{p.title}</td>
                        <td className="p-3 text-text-secondary">{p.category}</td>
                        <td className="p-3 text-text-secondary">{p.steps.length} step(s)</td>
                        <td className="p-3 text-text-secondary">{estimatePathEnrolled(p.steps.length)}</td>
                        <td className="p-3 text-text-secondary">{estimatePathCompletionRate(p.steps.length)}%</td>
                        <td className="p-3 text-text-secondary">
                          <span className="text-xs bg-surface-sunken px-2 py-0.5 rounded border border-surface-border">
                            {p.department ?? "All Departments"}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {scopedPaths.length === 0 && (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-text-tertiary">
                          No learning paths defined yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 5. ORGANIZATIONS TAB */}
          <TabsContent value="orgs" className="space-y-4 pt-4">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <p className="text-sm text-text-secondary">
                Multi-tenant comparative benchmarking and module entitlements across organizations.
              </p>
              <Button variant="outline" size="sm" className="gap-1.5" onClick={handleExportOrganizations}>
                <Download className="w-3.5 h-3.5" />
                Export CSV
              </Button>
            </div>

            <Card className="border-surface-border shadow-card">
              <CardContent className="p-0 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-surface-border text-left text-text-tertiary">
                      <th className="p-3 font-medium">Organization Name</th>
                      <th className="p-3 font-medium">Subdomain</th>
                      <th className="p-3 font-medium">Sub-Orgs Allowed</th>
                      <th className="p-3 font-medium">Enabled Modules</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-border">
                    {organizations.map((org) => (
                      <tr key={org.id} className="hover:bg-surface-sunken/40 transition-colors">
                        <td className="p-3 font-medium text-text-primary">
                          <div className="flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-brand-500" />
                            {org.name}
                          </div>
                        </td>
                        <td className="p-3 text-text-secondary font-mono text-xs">{org.subdomain}.lms.local</td>
                        <td className="p-3 text-text-secondary">
                          {org.allowSubOrgs ? (
                            <Badge variant="outline" className="text-success border-success/30">
                              Enabled
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-text-tertiary">
                              Disabled
                            </Badge>
                          )}
                        </td>
                        <td className="p-3 text-text-secondary">{org.enabledModules.length} module(s) active</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 6. GROUPS TAB */}
          <TabsContent value="groups" className="space-y-4 pt-4">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <p className="text-sm text-text-secondary">
                Cohort-level monitoring, membership rollups, and assigned course tracks.
              </p>
              <Button variant="outline" size="sm" className="gap-1.5" onClick={handleExportGroups}>
                <Download className="w-3.5 h-3.5" />
                Export CSV
              </Button>
            </div>

            <Card className="border-surface-border shadow-card">
              <CardContent className="p-0 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-surface-border text-left text-text-tertiary">
                      <th className="p-3 font-medium">Group Name</th>
                      <th className="p-3 font-medium">Type</th>
                      <th className="p-3 font-medium">Members Count</th>
                      <th className="p-3 font-medium">Assigned Courses</th>
                      <th className="p-3 font-medium">Cohort Completion Rate</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-border">
                    {scopedGroups.map((g) => (
                      <tr key={g.id} className="hover:bg-surface-sunken/40 transition-colors">
                        <td className="p-3 font-medium text-text-primary">{g.name}</td>
                        <td className="p-3 text-text-secondary">
                          {g.rule ? (
                            <span className="text-xs bg-surface-sunken px-2 py-0.5 rounded border border-surface-border">
                              Rule: {g.rule.field} = {g.rule.value}
                            </span>
                          ) : (
                            <span className="text-xs text-text-tertiary">Static Membership</span>
                          )}
                        </td>
                        <td className="p-3 text-text-secondary">{g.memberIds.length} member(s)</td>
                        <td className="p-3 text-text-secondary">{g.courseIds.length} course(s)</td>
                        <td className="p-3 text-text-secondary">{estimateGroupCompletionRate(g.id)}%</td>
                      </tr>
                    ))}
                    {scopedGroups.length === 0 && (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-text-tertiary">
                          No groups configured for this organization.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 7. LEARNING ACTIVITIES TAB */}
          <TabsContent value="activities" className="space-y-4 pt-4">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3 flex-wrap rounded-xl border border-surface-border bg-surface-sunken/40 p-3 flex-1 min-w-[280px]">
                <div className="relative flex-1 min-w-55 sm:max-w-xs">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-tertiary" />
                  <Input
                    placeholder="Search learner or course..."
                    value={activitySearch}
                    onChange={(e) => setActivitySearch(e.target.value)}
                    className="h-9 pl-9 bg-surface-base"
                  />
                </div>

                <div className="hidden sm:block h-6 w-px bg-surface-border" />

                <div className="flex items-center gap-2 flex-wrap">
                  <SlidersHorizontal className="hidden sm:block w-3.5 h-3.5 text-text-tertiary shrink-0" />
                  <Select value={activityFilter} onValueChange={(v) => setActivityFilter(v ?? "All Events")}>
                    <SelectTrigger size="sm" className="w-48 bg-surface-base">
                      <SelectValue placeholder="Event Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All Events">All Events</SelectItem>
                      <SelectItem value="Lesson Started">Lesson Started</SelectItem>
                      <SelectItem value="Lesson Completed">Lesson Completed</SelectItem>
                      <SelectItem value="Test Passed">Test Passed</SelectItem>
                      <SelectItem value="Test Failed">Test Failed</SelectItem>
                      <SelectItem value="Assignment Submitted">Assignment Submitted</SelectItem>
                      <SelectItem value="Certificate Issued">Certificate Issued</SelectItem>
                      <SelectItem value="User Registered">User Registered</SelectItem>
                    </SelectContent>
                  </Select>

                  {(activitySearch || activityFilter !== "All Events") && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-9 gap-1.5 text-text-tertiary hover:text-text-primary"
                      onClick={() => {
                        setActivitySearch("");
                        setActivityFilter("All Events");
                      }}
                    >
                      <X className="w-3.5 h-3.5" />
                      Clear
                    </Button>
                  )}
                </div>
              </div>

              <Button variant="outline" size="sm" className="gap-1.5 shrink-0" onClick={handleExportActivities}>
                <Download className="w-3.5 h-3.5" />
                Export Audit Log (CSV)
              </Button>
            </div>

            <Card className="border-surface-border shadow-card">
              <CardContent className="p-0 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-surface-border text-left text-text-tertiary">
                      <th className="p-3 font-medium">Timestamp</th>
                      <th className="p-3 font-medium">Learner</th>
                      <th className="p-3 font-medium">Action Event</th>
                      <th className="p-3 font-medium">Course & Lesson</th>
                      <th className="p-3 font-medium">Score / Result</th>
                      <th className="p-3 font-medium">IP Address</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-border">
                    {filteredActivities.map((log) => (
                      <tr key={log.id} className="hover:bg-surface-sunken/40 transition-colors">
                        <td className="p-3 text-text-tertiary text-xs whitespace-nowrap">
                          {new Date(log.timestamp).toLocaleString()}
                        </td>
                        <td className="p-3 font-medium text-text-primary">{log.learnerName}</td>
                        <td className="p-3">
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-xs font-normal",
                              log.action === "Test Passed" || log.action === "Certificate Issued"
                                ? "bg-success/10 text-success border-success/30"
                                : log.action === "Test Failed"
                                  ? "bg-danger/10 text-danger border-danger/30"
                                  : "bg-surface-sunken"
                            )}
                          >
                            {log.action}
                          </Badge>
                        </td>
                        <td className="p-3 text-text-primary">
                          <div className="font-medium">{log.courseName}</div>
                          {log.lessonName && <div className="text-xs text-text-tertiary">{log.lessonName}</div>}
                        </td>
                        <td className="p-3 text-text-secondary">
                          {log.score !== undefined ? `${log.score}%` : "—"}
                        </td>
                        <td className="p-3 text-text-tertiary font-mono text-xs">{log.ipAddress}</td>
                      </tr>
                    ))}
                    {filteredActivities.length === 0 && (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-text-tertiary">
                          No activity events found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 8. TRAINING MATRIX TAB */}
          <TabsContent value="matrix" className="pt-4 space-y-4">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <p className="text-xs text-text-tertiary">
                Learners × mandatory courses compliance grid (SOC 2, ISO 27001 regulatory audit view).
              </p>
              <Button variant="outline" size="sm" className="gap-1.5" onClick={handleExportMatrix}>
                <Download className="w-3.5 h-3.5" />
                Export Matrix CSV
              </Button>
            </div>

            <Card className="border-surface-border shadow-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Enterprise Compliance Grid</CardTitle>
              </CardHeader>
              <CardContent className="p-0 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-surface-border text-left text-text-tertiary">
                      <th className="p-3 font-medium sticky left-0 bg-surface-base">Learner</th>
                      {scopedCourses
                        .filter((c) => MANDATORY_COURSE_IDS.includes(c.id))
                        .map((c) => (
                          <th key={c.id} className="p-3 font-medium whitespace-nowrap">
                            {c.title}
                          </th>
                        ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-border">
                    {scopedUsers
                      .filter((u) => u.role === "learner")
                      .map((u) => (
                        <tr key={u.id} className="hover:bg-surface-sunken/40 transition-colors">
                          <td className="p-3 font-medium text-text-primary sticky left-0 bg-surface-base">
                            {u.firstName} {u.lastName}
                          </td>
                          {scopedCourses
                            .filter((c) => MANDATORY_COURSE_IDS.includes(c.id))
                            .map((c) => {
                              const { status, percent } = matrixStatusFor(u.id, c.id);
                              return (
                                <td key={c.id} className="p-3">
                                  <span
                                    className={cn(
                                      "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium",
                                      STATUS_STYLES[status]
                                    )}
                                  >
                                    {STATUS_LABELS[status]}
                                    {status === "in-progress" && ` ${percent}%`}
                                  </span>
                                </td>
                              );
                            })}
                        </tr>
                      ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 9. TIMELINE TAB */}
          <TabsContent value="timeline" className="pt-4 space-y-4">
            <Card className="border-surface-border shadow-card">
              <CardHeader>
                <CardTitle className="text-base font-semibold">Organizational Audit Timeline</CardTitle>
                <CardDescription>
                  Chronological event stream of administrative actions, user security, and course updates
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-surface-border">
                  {TIMELINE_EVENTS.map((event, idx) => {
                    const Icon = event.icon;
                    return (
                      <div key={idx} className="relative group">
                        <div
                          className={cn(
                            "absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-surface-base border-2 border-surface-border flex items-center justify-center",
                            event.color
                          )}
                        >
                          <Icon className="w-3 h-3" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-text-primary text-sm">{event.title}</span>
                            <span className="text-xs text-text-tertiary">· {event.time}</span>
                          </div>
                          <p className="text-sm text-text-secondary mt-0.5">{event.desc}</p>
                          <span className="inline-block mt-1 text-xs text-text-tertiary bg-surface-sunken px-2 py-0.5 rounded border border-surface-border">
                            Actor: {event.actor}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 10. CUSTOM REPORTS TAB */}
          <TabsContent value="custom" className="pt-4 space-y-6">
            <Card className="border-surface-border shadow-card">
              <CardHeader>
                <CardTitle className="text-base font-semibold">Custom Ad-Hoc Report Builder</CardTitle>
                <CardDescription>
                  Query business records, apply instant filters, export datasets, or schedule automated email deliveries
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-text-secondary">1. Select Data Source</label>
                    <Select
                      value={customSource}
                      onValueChange={(v) => {
                        if (v === "users" || v === "courses" || v === "groups" || v === "paths") {
                          setCustomSource(v);
                        }
                      }}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="users">Users Directory</SelectItem>
                        <SelectItem value="courses">Course Catalog</SelectItem>
                        <SelectItem value="groups">Cohort Groups</SelectItem>
                        <SelectItem value="paths">Learning Pathways</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-text-secondary">2. Filter Query</label>
                    <Input
                      placeholder="e.g. active, compliance..."
                      value={customFilterQuery}
                      onChange={(e) => setCustomFilterQuery(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1.5 flex items-end gap-2">
                    <Button
                      className="flex-1 gap-1.5"
                      onClick={() => {
                        if (customSource === "users") handleExportUsers();
                        else if (customSource === "courses") handleExportCourses();
                        else if (customSource === "groups") handleExportGroups();
                        else handleExportPaths();
                      }}
                    >
                      <Download className="w-4 h-4" />
                      Run & Export
                    </Button>
                    <Button variant="outline" onClick={() => setScheduleModalOpen(true)}>
                      <Calendar className="w-4 h-4 mr-1.5" />
                      Schedule
                    </Button>
                  </div>
                </div>

                {/* Query preview summary */}
                <div className="rounded-lg border border-surface-border bg-surface-sunken p-4 mt-2">
                  <div className="flex items-center justify-between text-xs text-text-secondary font-medium">
                    <span>Active Query Source: {customSource.toUpperCase()}</span>
                    <span>
                      Matching Records:{" "}
                      {customSource === "users"
                        ? scopedUsers.length
                        : customSource === "courses"
                          ? scopedCourses.length
                          : customSource === "groups"
                            ? scopedGroups.length
                            : scopedPaths.length}
                    </span>
                  </div>
                  <p className="text-xs text-text-tertiary mt-1">
                    Columns mapped: ID, Name/Title, Scope, Categorization, Status/Entitlements, Timestamp.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Schedule Delivery Modal */}
            <Dialog open={scheduleModalOpen} onOpenChange={setScheduleModalOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Schedule Automated Report Delivery</DialogTitle>
                  <DialogDescription>
                    Configure recurring delivery of this report to stakeholder email lists.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-2">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Frequency</label>
                    <Select value={scheduleFrequency} onValueChange={(v) => setScheduleFrequency(v ?? "weekly")}>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily at 08:00 UTC</SelectItem>
                        <SelectItem value="weekly">Weekly on Mondays</SelectItem>
                        <SelectItem value="monthly">Monthly on 1st</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Recipient Email(s)</label>
                    <Input
                      placeholder="compliance@acme.com, auditteam@acme.com"
                      value={scheduleEmail}
                      onChange={(e) => setScheduleEmail(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    onClick={() => {
                      setScheduleSaved(true);
                      setTimeout(() => {
                        setScheduleModalOpen(false);
                        setScheduleSaved(false);
                      }, 1200);
                    }}
                    disabled={!scheduleEmail.trim()}
                  >
                    {scheduleSaved ? (
                      <>
                        <Check className="w-4 h-4 mr-1.5" /> Schedule Active
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-1.5" /> Save & Enable Schedule
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </TabsContent>

          {/* 11. ANALYTICS TAB */}
          <TabsContent value="analytics" className="pt-4 space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Heatmap */}
              <Card className="border-surface-border shadow-card">
                <CardHeader>
                  <CardTitle className="text-base font-semibold">Peak Learning Hours Heatmap</CardTitle>
                  <CardDescription>Activity concentration by day of week and working hours</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, dIdx) => (
                    <div key={day} className="flex items-center gap-2">
                      <span className="w-8 text-xs font-medium text-text-tertiary">{day}</span>
                      <div className="grid grid-cols-8 gap-1.5 flex-1">
                        {[0, 1, 2, 3, 4, 5, 6, 7].map((hour) => {
                          const intensity = getHeatmapIntensity(dIdx, hour);
                          const bg =
                            intensity > 0.6
                              ? "bg-brand-500"
                              : intensity > 0.3
                                ? "bg-brand-500/50"
                                : "bg-surface-sunken";
                          return (
                            <div
                              key={hour}
                              className={cn("h-6 rounded transition-colors hover:ring-1 hover:ring-brand-500", bg)}
                              title={`${day} Slot ${hour + 9}:00 - Activity: ${Math.round(intensity * 100)}%`}
                            />
                          );
                        })}
                      </div>
                    </div>
                  ))}
                  <div className="flex justify-between text-xs text-text-tertiary pt-2 px-10">
                    <span>09:00</span>
                    <span>12:00</span>
                    <span>15:00</span>
                    <span>17:00</span>
                  </div>
                </CardContent>
              </Card>

              {/* Device Usage */}
              <Card className="border-surface-border shadow-card flex flex-col justify-between">
                <CardHeader>
                  <CardTitle className="text-base font-semibold">Device & Platform Telemetry</CardTitle>
                  <CardDescription>Learner consumption channel breakdown</CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  {DEVICE_USAGE.map((device) => {
                    const Icon = DEVICE_ICONS[device.iconKey];
                    return (
                      <div key={device.label} className="space-y-1.5">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2 text-text-primary">
                            <Icon className="w-4 h-4 text-text-tertiary" />
                            <span>{device.label}</span>
                          </div>
                          <span className="font-semibold text-text-primary">{device.percent}%</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-surface-sunken overflow-hidden">
                          <div className={cn("h-full rounded-full", device.color)} style={{ width: `${device.percent}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* 12. POST-TRAINING SURVEYS TAB (PROPOSED) */}
          <TabsContent value="surveys" className="pt-4 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card className="border-surface-border shadow-card">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold text-text-primary">{SURVEY_KPIS.csat.toFixed(1)} / 5.0</div>
                      <div className="text-xs text-text-tertiary mt-0.5">Average CSAT Rating</div>
                    </div>
                    <div className="flex text-amber-500">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Star key={i} className="w-4 h-4 fill-amber-500" />
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-surface-border shadow-card">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-text-primary">+{SURVEY_KPIS.nps}</div>
                  <div className="text-xs text-text-tertiary mt-0.5">Net Promoter Score (NPS)</div>
                </CardContent>
              </Card>

              <Card className="border-surface-border shadow-card">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-text-primary">{SURVEY_KPIS.retentionIndex}%</div>
                  <div className="text-xs text-text-tertiary mt-0.5">Knowledge Retention Index</div>
                </CardContent>
              </Card>
            </div>

            <Card className="border-surface-border shadow-card">
              <CardHeader>
                <CardTitle className="text-base font-semibold">Learner Evaluations & Comments</CardTitle>
                <CardDescription>Qualitative sentiment analysis from course exit evaluations</CardDescription>
              </CardHeader>
              <CardContent className="p-0 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-surface-border text-left text-text-tertiary">
                      <th className="p-3 font-medium">Learner</th>
                      <th className="p-3 font-medium">Course Evaluated</th>
                      <th className="p-3 font-medium">Rating</th>
                      <th className="p-3 font-medium">Learner Feedback</th>
                      <th className="p-3 font-medium">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-border">
                    {MOCK_SURVEYS.map((s) => (
                      <tr key={s.id} className="hover:bg-surface-sunken/40 transition-colors">
                        <td className="p-3 font-medium text-text-primary">{s.learnerName}</td>
                        <td className="p-3 text-text-secondary">{s.courseTitle}</td>
                        <td className="p-3">
                          <div className="flex text-amber-500">
                            {Array.from({ length: s.rating }).map((_, i) => (
                              <Star key={i} className="w-3.5 h-3.5 fill-amber-500" />
                            ))}
                          </div>
                        </td>
                        <td className="p-3 text-text-primary max-w-md italic">&quot;{s.comment}&quot;</td>
                        <td className="p-3 text-text-tertiary text-xs whitespace-nowrap">{s.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
}
