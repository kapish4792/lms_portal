"use client";

import { useParams } from "next/navigation";
import { useRoleGuard } from "@/lib/hooks/use-role-guard";
import { AppShell } from "@/components/layout/AppShell";
import { PathForm } from "@/components/learning-paths/PathForm";

export default function NewLearningPathPage() {
  const params = useParams<{ role: string }>();
  const user = useRoleGuard(params.role);
  if (!user) return null;

  return (
    <AppShell user={user}>
      <div className="p-6 space-y-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Create learning path</h1>
          <p className="text-text-secondary mt-1">Sequence courses and tasks into a guided curriculum.</p>
        </div>
        <PathForm user={user} />
      </div>
    </AppShell>
  );
}
