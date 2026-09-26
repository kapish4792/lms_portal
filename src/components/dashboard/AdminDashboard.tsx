import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LineChart } from "@/components/charts/LineChart";
import { DonutChart } from "@/components/charts/DonutChart";
import {
  portalActivity,
  overviewKpis,
  usersByRole,
  adminTimeline,
  quickActions,
} from "@/lib/mock/dashboard-data";
import { BookOpen } from "lucide-react";
import type { Role } from "@/lib/mock/users";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

export function AdminDashboard({ role, department }: { role: Role; department?: string }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Card className="lg:col-span-2 border-surface-border shadow-card">
        <CardHeader>
          <CardTitle className="text-base">Portal Activity</CardTitle>
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

      <Card className="border-surface-border shadow-card">
        <CardHeader>
          <CardTitle className="text-base">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-2">
          {quickActions.map((action) => (
            <Button
              key={action.href}
              variant="outline"
              size="sm"
              className="justify-start"
              render={<Link href={`/${role}/${action.href}`} />}
            >
              {action.label}
            </Button>
          ))}
        </CardContent>
      </Card>

      <Card className="lg:col-span-3 border-surface-border shadow-card">
        <CardHeader>
          <CardTitle className="text-base">
            Overview {department ? `— ${department}` : ""}
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          {overviewKpis.map((kpi) => (
            <div key={kpi.label} className="rounded-lg border border-surface-border bg-surface-sunken p-3">
              <div className="text-xl font-bold text-text-primary">{kpi.value}</div>
              <div className="text-xs text-text-tertiary mt-0.5">{kpi.label}</div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="border-surface-border shadow-card">
        <CardHeader>
          <CardTitle className="text-base">Users by Role</CardTitle>
        </CardHeader>
        <CardContent>
          <DonutChart
            data={usersByRole.map((u) => ({ label: u.label, value: u.value, color: `var(${u.colorVar})` }))}
          />
        </CardContent>
      </Card>

      <Card className="lg:col-span-2 border-surface-border shadow-card">
        <CardHeader>
          <CardTitle className="text-base">Timeline</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {adminTimeline.map((event, i) => (
            <div key={i} className="flex items-start gap-3 text-sm">
              <div className="w-1.5 h-1.5 rounded-full bg-brand-500 mt-1.5 shrink-0" />
              <p className="text-text-secondary">
                <span className="font-medium text-text-primary">{event.actor}</span> {event.action}{" "}
                <span className="font-medium text-text-primary">{event.target}</span>
                <span className="text-text-tertiary"> · {event.time}</span>
              </p>
            </div>
          ))}
        </CardContent>
      </Card>

      <ScrollReveal className="lg:col-span-3">
        <Card className="border-surface-border shadow-card">
          <CardHeader>
            <CardTitle className="text-base">Courses Progress</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center text-center py-10 gap-3">
            <div className="w-12 h-12 rounded-full bg-surface-sunken flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-text-tertiary" />
            </div>
            <p className="text-text-secondary">No stats to show — Create your first course now</p>
            <Button size="sm" render={<Link href={`/${role}/courses`} />}>
              Go to courses
            </Button>
          </CardContent>
        </Card>
      </ScrollReveal>
    </div>
  );
}
