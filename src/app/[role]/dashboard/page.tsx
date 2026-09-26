"use client";

import { useParams } from "next/navigation";
import { useRoleGuard } from "@/lib/hooks/use-role-guard";
import { AppShell } from "@/components/layout/AppShell";
import { ROLE_LABELS } from "@/lib/permissions";
import { dashboardGreeting } from "@/lib/mock/dashboard-data";
import { AdminDashboard } from "@/components/dashboard/AdminDashboard";
import { LearnerDashboard } from "@/components/dashboard/LearnerDashboard";
import { InstructorDashboard } from "@/components/dashboard/InstructorDashboard";
import { ManagerDashboard } from "@/components/dashboard/ManagerDashboard";

export default function RoleDashboardPage() {
  const params = useParams<{ role: string }>();
  const user = useRoleGuard(params.role);

  if (!user) return null;

  return (
    <AppShell user={user}>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">
            {dashboardGreeting(user.role)}, {user.name.split(" ")[0]}
          </h1>
          <p className="text-text-secondary mt-1">
            {ROLE_LABELS[user.role]} at {user.org}
            {user.department ? ` · ${user.department}` : ""}
          </p>
        </div>

        {(user.role === "super-admin" || user.role === "lms-admin" || user.role === "org-admin" || user.role === "dept-head") && (
          <AdminDashboard role={user.role} department={user.role === "dept-head" ? user.department : undefined} />
        )}
        {user.role === "learner" && <LearnerDashboard role={user.role} />}
        {user.role === "instructor" && <InstructorDashboard role={user.role} />}
        {user.role === "manager" && <ManagerDashboard user={user} />}
      </div>
    </AppShell>
  );
}
