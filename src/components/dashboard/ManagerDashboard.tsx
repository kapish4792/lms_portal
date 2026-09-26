import { useMemo } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { teamCompliance, overdueTraining, skillCoverage } from "@/lib/mock/dashboard-data";
import { useApprovalsStore } from "@/lib/store/approvals-store";
import type { MockUser } from "@/lib/mock/users";
import { AlertTriangle } from "lucide-react";

export function ManagerDashboard({ user }: { user: MockUser }) {
  const compliancePct = Math.round((teamCompliance.compliant / teamCompliance.total) * 100);
  const allRequests = useApprovalsStore((s) => s.requests);
  const requests = useMemo(() => allRequests.filter((r) => r.org === user.org), [allRequests, user.org]);
  const approve = useApprovalsStore((s) => s.approve);
  const deny = useApprovalsStore((s) => s.deny);
  const pending = useMemo(() => requests.filter((r) => r.status === "pending"), [requests]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Card className="border-surface-border shadow-card">
        <CardHeader>
          <CardTitle className="text-base">Team Compliance Health</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center gap-4">
          <div className="text-3xl font-bold text-success">{compliancePct}%</div>
          <p className="text-sm text-text-secondary">
            {teamCompliance.compliant} of {teamCompliance.total} direct reports are current on
            mandatory training.
          </p>
        </CardContent>
      </Card>

      <Card className="border-surface-border shadow-card">
        <CardHeader>
          <CardTitle className="text-base">Overdue Training Alerts</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {overdueTraining.map((o) => (
            <div key={`${o.name}-${o.course}`} className="flex items-start gap-2 text-sm">
              <AlertTriangle className="w-4 h-4 text-danger mt-0.5 shrink-0" />
              <p className="text-text-secondary">
                <span className="font-medium text-text-primary">{o.name}</span> — {o.course}{" "}
                <span className="text-danger">({o.daysOverdue}d overdue)</span>
              </p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="border-surface-border shadow-card">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Approval Inbox</CardTitle>
          <Button variant="ghost" size="sm" render={<Link href={`/${user.role}/approvals`} />}>
            View all
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {pending.length === 0 && <p className="text-sm text-text-tertiary">No pending requests.</p>}
          {pending.map((r) => (
            <div key={r.id} className="flex items-center justify-between gap-2 text-sm">
              <div>
                <p className="text-text-primary font-medium">Enrollment: {r.courseTitle}</p>
                <p className="text-text-tertiary text-xs">
                  {r.requesterName} · {r.requestedAt}
                </p>
              </div>
              <div className="flex gap-1.5 shrink-0">
                <Button size="sm" variant="outline" onClick={() => approve(r.id)}>
                  Approve
                </Button>
                <Button size="sm" variant="ghost" onClick={() => deny(r.id)}>
                  Deny
                </Button>
              </div>
            </div>
          ))}
          {requests
            .filter((r) => r.status !== "pending")
            .slice(0, 3)
            .map((r) => (
              <div key={r.id} className="flex items-center justify-between gap-2 text-sm opacity-60">
                <p className="text-text-secondary">{r.courseTitle}</p>
                <Badge variant={r.status === "approved" ? "default" : "outline"}>{r.status}</Badge>
              </div>
            ))}
        </CardContent>
      </Card>

      <Card className="lg:col-span-3 border-surface-border shadow-card">
        <CardHeader>
          <CardTitle className="text-base">Team Skill Coverage</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {skillCoverage.map((s) => (
            <div key={s.category}>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-text-primary font-medium">{s.category}</span>
                <span className="text-text-tertiary">{s.coverage}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-surface-sunken overflow-hidden">
                <div className="h-full rounded-full bg-accent-600" style={{ width: `${s.coverage}%` }} />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
