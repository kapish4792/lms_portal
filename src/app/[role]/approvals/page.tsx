"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { useRoleGuard } from "@/lib/hooks/use-role-guard";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useApprovalsStore } from "@/lib/store/approvals-store";
import { Inbox, Search, Ticket } from "lucide-react";

export default function ApprovalsPage() {
  const params = useParams<{ role: string }>();
  const user = useRoleGuard(params.role);
  const allRequests = useApprovalsStore((s) => s.requests);
  const approve = useApprovalsStore((s) => s.approve);
  const deny = useApprovalsStore((s) => s.deny);
  const [search, setSearch] = useState("");

  const scoped = useMemo(
    () =>
      (user ? allRequests.filter((r) => r.org === user.org) : []).filter(
        (r) =>
          !search.trim() ||
          r.requesterName.toLowerCase().includes(search.toLowerCase()) ||
          r.courseTitle.toLowerCase().includes(search.toLowerCase())
      ),
    [allRequests, user, search]
  );

  if (!user) return null;

  const pending = scoped.filter((r) => r.status === "pending");
  const resolved = scoped.filter((r) => r.status !== "pending");

  return (
    <AppShell user={user}>
      <div className="p-6 space-y-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Approval Inbox</h1>
          <p className="text-text-secondary mt-1">
            Enrollment requests from direct reports and pending seat assignments — {user.org}
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-tertiary" />
          <Input
            placeholder="Search requester or course..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>

        <Tabs defaultValue="pending">
          <TabsList>
            <TabsTrigger value="pending">Pending ({pending.length})</TabsTrigger>
            <TabsTrigger value="resolved">Resolved ({resolved.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-2 pt-4">
            {pending.length === 0 && (
              <p className="text-text-tertiary text-center py-10">No pending requests — inbox is clear.</p>
            )}
            {pending.map((r) => (
              <Card key={r.id} className="border-surface-border shadow-card">
                <CardContent className="p-4 flex items-center justify-between gap-4 flex-wrap">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-brand-100 dark:bg-brand-950 flex items-center justify-center shrink-0">
                      <Inbox className="w-4 h-4 text-brand-600" />
                    </div>
                    <div>
                      <p className="font-medium text-text-primary">Enrollment: {r.courseTitle}</p>
                      <p className="text-sm text-text-tertiary">
                        {r.requesterName} · requested {r.requestedAt}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button size="sm" variant="outline" onClick={() => approve(r.id)}>
                      Approve
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => deny(r.id)}>
                      Deny
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="resolved" className="space-y-2 pt-4">
            {resolved.length === 0 && <p className="text-text-tertiary text-center py-10">No resolved requests yet.</p>}
            {resolved.map((r) => (
              <Card key={r.id} className="border-surface-border shadow-card opacity-80">
                <CardContent className="p-4 flex items-center justify-between gap-4 flex-wrap">
                  <div className="flex items-start gap-3">
                    <Ticket className="w-4 h-4 text-text-tertiary mt-1 shrink-0" />
                    <div>
                      <p className="font-medium text-text-primary">{r.courseTitle}</p>
                      <p className="text-sm text-text-tertiary">
                        {r.requesterName} · requested {r.requestedAt}
                      </p>
                    </div>
                  </div>
                  <Badge variant={r.status === "approved" ? "default" : "outline"}>{r.status}</Badge>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
}
