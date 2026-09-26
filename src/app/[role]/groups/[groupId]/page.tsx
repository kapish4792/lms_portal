"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";
import { useRoleGuard } from "@/lib/hooks/use-role-guard";
import { AppShell } from "@/components/layout/AppShell";
import { GroupForm } from "@/components/groups/GroupForm";
import { useGroupsStore } from "@/lib/store/groups-store";

export default function GroupEditPage() {
  const params = useParams<{ role: string; groupId: string }>();
  const user = useRoleGuard(params.role);
  const groups = useGroupsStore((s) => s.groups);
  const group = useMemo(() => groups.find((g) => g.id === params.groupId), [groups, params.groupId]);

  if (!user) return null;

  return (
    <AppShell user={user}>
      <div className="p-6 space-y-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">{group?.name ?? "Edit group"}</h1>
        </div>
        {group ? <GroupForm user={user} existing={group} /> : <p className="text-text-secondary">Group not found.</p>}
      </div>
    </AppShell>
  );
}
