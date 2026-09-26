"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useParams } from "next/navigation";
import { useRoleGuard } from "@/lib/hooks/use-role-guard";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useGroupsStore } from "@/lib/store/groups-store";
import { useUsersStore } from "@/lib/store/users-store";
import { useCoursesStore } from "@/lib/store/courses-store";
import { Plus, UsersRound } from "lucide-react";

export default function GroupsListPage() {
  const params = useParams<{ role: string }>();
  const user = useRoleGuard(params.role);
  const groups = useGroupsStore((s) => s.groups);
  const directory = useUsersStore((s) => s.directory);
  const courses = useCoursesStore((s) => s.courses);

  const scoped = useMemo(() => (user ? groups.filter((g) => g.org === user.org) : []), [groups, user]);

  if (!user) return null;

  const memberCount = (g: (typeof groups)[number]) =>
    g.rule
      ? directory.filter((d) => d.org === g.org && (g.rule!.field === "role" ? d.role === g.rule!.value : d.department === g.rule!.value)).length
      : g.memberIds.length;

  const avgCompletion = (g: (typeof groups)[number]) => {
    const assigned = courses.filter((c) => g.courseIds.includes(c.id));
    if (assigned.length === 0) return null;
    return Math.round(assigned.reduce((sum, c) => sum + c.completionRate, 0) / assigned.length);
  };

  return (
    <AppShell user={user}>
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Groups</h1>
            <p className="text-text-secondary mt-1">
              {scoped.length} group{scoped.length === 1 ? "" : "s"} at {user.org}
            </p>
          </div>
          <Button className="gap-2" render={<Link href={`/${user.role}/groups/new`} />}>
            <Plus className="w-4 h-4" />
            Create group
          </Button>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {scoped.map((g) => {
            const completion = avgCompletion(g);
            return (
              <Card key={g.id} className="border-surface-border shadow-card">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="w-10 h-10 rounded-lg bg-brand-100 dark:bg-brand-950 flex items-center justify-center">
                      <UsersRound className="w-5 h-5 text-brand-600" />
                    </div>
                    {g.rule && <Badge variant="outline">Rule-based</Badge>}
                  </div>
                  <div>
                    <h3 className="font-semibold text-text-primary leading-tight">{g.name}</h3>
                    <p className="text-xs text-text-tertiary mt-1">{g.department ?? "No department"}</p>
                  </div>
                  <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-text-tertiary">
                    <span>{memberCount(g)} members</span>
                    <span>{g.courseIds.length} course{g.courseIds.length === 1 ? "" : "s"} auto-enrolled</span>
                    {completion !== null && <span>{completion}% avg completion</span>}
                  </div>
                  <Button size="sm" variant="outline" className="w-full" render={<Link href={`/${user.role}/groups/${g.id}`} />}>
                    Manage
                  </Button>
                </CardContent>
              </Card>
            );
          })}
          {scoped.length === 0 && (
            <p className="text-text-tertiary col-span-full text-center py-10">No groups yet — create your first one.</p>
          )}
        </div>
      </div>
    </AppShell>
  );
}
