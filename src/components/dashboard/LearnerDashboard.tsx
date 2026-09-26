import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { myCourses, upcomingDeadlines, achievements, resumeCourse } from "@/lib/mock/dashboard-data";
import { PlayCircle } from "lucide-react";
import type { Role } from "@/lib/mock/users";

function ProgressBar({ value }: { value: number }) {
  return (
    <div className="h-1.5 rounded-full bg-surface-sunken overflow-hidden">
      <div
        className="h-full rounded-full bg-brand-600"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}

export function LearnerDashboard({ role }: { role: Role }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Card className="lg:col-span-2 border-surface-border shadow-card bg-linear-to-br from-brand-600 to-brand-800 text-white">
        <CardContent className="flex items-center justify-between gap-4 py-6">
          <div>
            <p className="text-xs uppercase tracking-wide text-white/70">Quick resume</p>
            <h3 className="text-lg font-semibold mt-1">{resumeCourse.title}</h3>
            <p className="text-sm text-white/80 mt-1">{resumeCourse.lastPosition}</p>
            <div className="w-48 mt-3">
              <div className="h-1.5 rounded-full bg-white/20 overflow-hidden">
                <div className="h-full rounded-full bg-white" style={{ width: `${resumeCourse.progress}%` }} />
              </div>
            </div>
          </div>
          <Button variant="secondary" size="sm" className="gap-2 shrink-0">
            <PlayCircle className="w-4 h-4" />
            Resume learning
          </Button>
        </CardContent>
      </Card>

      <Card className="border-surface-border shadow-card">
        <CardHeader>
          <CardTitle className="text-base">Upcoming Deadlines</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {upcomingDeadlines.map((d) => (
            <div key={d.title} className="text-sm">
              <p className="font-medium text-text-primary">{d.title}</p>
              <p className="text-danger text-xs mt-0.5">{d.due}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="lg:col-span-2 border-surface-border shadow-card">
        <CardHeader>
          <CardTitle className="text-base">My Courses</CardTitle>
        </CardHeader>
        <CardContent className="grid sm:grid-cols-2 gap-3">
          {myCourses.map((c) => (
            <div key={c.title} className="rounded-lg border border-surface-border p-3 space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-surface-sunken flex items-center justify-center text-lg shrink-0">
                  {c.thumbnail}
                </div>
                <p className="text-sm font-medium text-text-primary leading-tight">{c.title}</p>
              </div>
              <ProgressBar value={c.progress} />
              <div className="flex items-center justify-between">
                <span className="text-xs text-text-tertiary">{c.progress}% complete</span>
                <Button
                  variant="ghost"
                  size="sm"
                  render={<Link href={`/${role}/my-training`} />}
                >
                  {c.progress === 100 ? "Review" : c.progress === 0 ? "Start" : "Resume"}
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="border-surface-border shadow-card">
        <CardHeader>
          <CardTitle className="text-base">Achievements</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {achievements.map((a) => (
            <div key={a.label} className="flex items-center gap-3 text-sm">
              <span className="text-xl">{a.icon}</span>
              <span className="text-text-secondary">{a.label}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
