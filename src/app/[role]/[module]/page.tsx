"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useRoleGuard } from "@/lib/hooks/use-role-guard";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { navItemsForRole } from "@/lib/permissions";
import { Construction } from "lucide-react";

export default function ModulePlaceholderPage() {
  const params = useParams<{ role: string; module: string }>();
  const router = useRouter();
  const user = useRoleGuard(params.role);

  const navItem = user ? navItemsForRole(user.role).find((item) => item.href === params.module) : undefined;

  useEffect(() => {
    if (user && !navItem) router.replace(`/${user.role}/dashboard`);
  }, [user, navItem, router]);

  if (!user || !navItem) return null;
  const Icon = navItem.icon;

  return (
    <AppShell user={user}>
      <div className="p-6">
        <Card className="border-surface-border shadow-card max-w-xl">
          <CardHeader className="flex flex-row items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-100 dark:bg-brand-950 flex items-center justify-center shrink-0">
              <Icon className="w-5 h-5 text-brand-600" />
            </div>
            <CardTitle className="text-lg">{navItem.label}</CardTitle>
          </CardHeader>
          <CardContent className="flex items-start gap-2 text-sm text-text-secondary">
            <Construction className="w-4 h-4 mt-0.5 shrink-0 text-text-tertiary" />
            <p>
              This module is on the build roadmap and isn&apos;t implemented yet. See{" "}
              <code className="text-xs bg-surface-sunken px-1.5 py-0.5 rounded">AGENTS.md</code>{" "}
              for progress tracking.
            </p>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
