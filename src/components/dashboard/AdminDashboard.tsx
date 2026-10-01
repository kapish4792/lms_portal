"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LineChart } from "@/components/charts/LineChart";
import { DonutChart } from "@/components/charts/DonutChart";
import { portalActivity, adminTimeline } from "@/lib/mock/dashboard-data";
import { useUsersStore } from "@/lib/store/users-store";
import { useCoursesStore } from "@/lib/store/courses-store";
import { useEnrollmentsStore } from "@/lib/store/enrollments-store";
import { useCategoriesStore } from "@/lib/store/categories-store";
import {
  BookOpen,
  Users,
  Building2,
  FolderTree,
  ShieldCheck,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import type { Role } from "@/lib/mock/users";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

export function AdminDashboard({ role, department }: { role: Role; department?: string }) {
  const users = useUsersStore((s) => s.users);
  const courses = useCoursesStore((s) => s.courses);
  const enrollments = useEnrollmentsStore((s) => s.enrollments);
  const categories = useCategoriesStore((s) => s.categories);

  const kpis = useMemo(() => [
    { label: "Active Users", value: String(users.length || 42), icon: Users },
    { label: "Published Courses", value: String(courses.length || 18), icon: BookOpen },
    { label: "Total Enrollments", value: String(enrollments.length || 315), icon: TrendingUp },
    { label: "Taxonomy Categories", value: String(categories.length || 8), icon: FolderTree },
    { label: "Compliance Index", value: "96%", icon: ShieldCheck },
  ], [users, courses, enrollments, categories]);

  const quickActions = [
    { label: "Add New User", href: "users" },
    { label: "Course Studio", href: "courses" },
    { label: "Category Taxonomy", href: "categories" },
    { label: "Reports & Audit", href: "reports" },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Portal Activity Line Chart */}
      <Card className="lg:col-span-2 border-surface-border shadow-card">
        <CardHeader>
          <CardTitle className="text-base font-bold flex items-center justify-between">
            <span>Portal Activity</span>
            <span className="text-xs text-muted-foreground font-normal">Monthly Logins vs Course Completions</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <LineChart
            labels={portalActivity.map((d) => d.label)}
            series={[
              { label: "Logins", color: "var(--color-chart-1)", values: portalActivity.map((d) => d.logins) },
              { label: "Course completions", color: "var(--color-chart-2)", values: portalActivity.map((d) => d.completions) },
            ]}
          />
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="border-surface-border shadow-card">
        <CardHeader>
          <CardTitle className="text-base font-bold">Administrative Actions</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-2">
          {quickActions.map((action) => (
            <Button
              key={action.href}
              variant="outline"
              size="sm"
              className="justify-start text-xs font-semibold"
              render={<Link href={`/${role}/${action.href}`} />}
            >
              {action.label}
            </Button>
          ))}
        </CardContent>
      </Card>

      {/* Overview KPIs */}
      <Card className="lg:col-span-3 border-surface-border shadow-card">
        <CardHeader>
          <CardTitle className="text-base font-bold">
            Platform Overview {department ? `— ${department}` : ""}
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          {kpis.map((kpi) => {
            const Icon = kpi.icon;
            return (
              <div key={kpi.label} className="rounded-xl border border-surface-border bg-surface-sunken/40 p-3.5 space-y-1">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="text-xs">{kpi.label}</span>
                  <Icon className="w-3.5 h-3.5 text-primary" />
                </div>
                <div className="text-2xl font-black text-text-primary">{kpi.value}</div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Users by Role Donut Chart */}
      <Card className="border-surface-border shadow-card">
        <CardHeader>
          <CardTitle className="text-base font-bold">Users by Role</CardTitle>
        </CardHeader>
        <CardContent>
          <DonutChart
            data={[
              { label: "Learners", value: 65, color: "var(--color-chart-1)" },
              { label: "Instructors", value: 18, color: "var(--color-chart-2)" },
              { label: "Admins & Managers", value: 17, color: "var(--color-chart-3)" },
            ]}
          />
        </CardContent>
      </Card>

      {/* Timeline Stream */}
      <Card className="lg:col-span-2 border-surface-border shadow-card">
        <CardHeader>
          <CardTitle className="text-base font-bold">System Governance & Audit Timeline</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {adminTimeline.map((event, i) => (
            <div key={i} className="flex items-start gap-3 text-xs">
              <div className="w-2 h-2 rounded-full bg-primary mt-1 shrink-0" />
              <p className="text-text-secondary leading-relaxed">
                <span className="font-bold text-text-primary">{event.actor}</span> {event.action}{" "}
                <span className="font-medium text-text-primary font-mono">{event.target}</span>
                <span className="text-text-tertiary"> · {event.time}</span>
              </p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Courses Governance Preview */}
      <ScrollReveal className="lg:col-span-3">
        <Card className="border-surface-border shadow-card">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base font-bold">Published Courses & Curricula</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">Active tenant courses available for enrollment</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="text-xs font-semibold gap-1"
              render={<Link href={`/${role}/courses`} />}
            >
              Manage All Courses <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </CardHeader>
          <CardContent className="grid sm:grid-cols-3 gap-3">
            {courses.slice(0, 3).map((c) => (
              <div
                key={c.id}
                className="p-3.5 rounded-xl border border-border bg-card flex flex-col justify-between space-y-2 hover:border-primary/40 transition-colors shadow-xs"
              >
                <div>
                  <Badge variant="outline" className="text-[10px] mb-1.5 border-border">
                    {c.category}
                  </Badge>
                  <h4 className="font-bold text-xs text-foreground line-clamp-1">{c.title}</h4>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {c.enrolled} enrolled • {c.completionRate}% completion
                  </p>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-border/60">
                  <span className="text-[10px] text-muted-foreground font-mono">Status: {c.status}</span>
                  <Link
                    href={`/${role}/courses/${c.id}`}
                    className="text-xs font-semibold text-primary hover:underline"
                  >
                    Edit →
                  </Link>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </ScrollReveal>
    </div>
  );
}
