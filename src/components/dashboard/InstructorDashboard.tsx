import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { authoredCourses } from "@/lib/mock/dashboard-data";
import { Plus } from "lucide-react";
import type { Role } from "@/lib/mock/users";

export function InstructorDashboard({ role }: { role: Role }) {
  return (
    <div className="space-y-4">
      <Card className="border-surface-border shadow-card">
        <CardContent className="flex items-center justify-between py-4">
          <div>
            <h3 className="font-semibold text-text-primary">Ready to teach something new?</h3>
            <p className="text-sm text-text-secondary mt-0.5">
              Create a course on a single page — no multi-step wizard.
            </p>
          </div>
          <Button className="gap-2" render={<Link href={`/${role}/courses`} />}>
            <Plus className="w-4 h-4" />
            Create course
          </Button>
        </CardContent>
      </Card>

      <Card className="border-surface-border shadow-card">
        <CardHeader>
          <CardTitle className="text-base">My Courses</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {authoredCourses.map((c) => (
            <div
              key={c.title}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg border border-surface-border p-3"
            >
              <div>
                <p className="font-medium text-text-primary">{c.title}</p>
                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-xs text-text-tertiary">
                  <span>{c.enrolled} enrolled</span>
                  <span>{c.completionRate}% completion</span>
                  <span>Avg score {c.avgScore}</span>
                  {c.pendingReviews > 0 && (
                    <Badge variant="outline" className="text-warning border-warning/40">
                      {c.pendingReviews} pending reviews
                    </Badge>
                  )}
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <Button variant="outline" size="sm" render={<Link href={`/${role}/courses`} />}>
                  Edit
                </Button>
                <Button variant="ghost" size="sm" render={<Link href={`/${role}/groups`} />}>
                  Manage enrollments
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
