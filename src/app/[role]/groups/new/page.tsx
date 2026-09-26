"use client";

import { useParams } from "next/navigation";
import { useRoleGuard } from "@/lib/hooks/use-role-guard";
import { AppShell } from "@/components/layout/AppShell";
import { GroupForm } from "@/components/groups/GroupForm";

export default function NewGroupPage() {
  const params = useParams<{ role: string }>();
  const user = useRoleGuard(params.role);
  if (!user) return null;

  return (
    <AppShell user={user}>
      <div className="p-6 space-y-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Create group</h1>
          <p className="text-text-secondary mt-1">Organize learners into a cohort and auto-enroll them in courses.</p>
        </div>
        <GroupForm user={user} />
      </div>
    </AppShell>
  );
}
