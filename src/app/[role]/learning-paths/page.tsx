"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useParams } from "next/navigation";
import { useRoleGuard } from "@/lib/hooks/use-role-guard";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLearningPathsStore } from "@/lib/store/learning-paths-store";
import { Plus, Waypoints } from "lucide-react";

export default function LearningPathsListPage() {
  const params = useParams<{ role: string }>();
  const user = useRoleGuard(params.role);
  const paths = useLearningPathsStore((s) => s.paths);

  const scoped = useMemo(() => (user ? paths.filter((p) => p.org === user.org) : []), [paths, user]);

  if (!user) return null;

  return (
    <AppShell user={user}>
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Learning Paths</h1>
            <p className="text-text-secondary mt-1">
              {scoped.length} path{scoped.length === 1 ? "" : "s"} at {user.org}
            </p>
          </div>
          <Button className="gap-2" render={<Link href={`/${user.role}/learning-paths/new`} />}>
            <Plus className="w-4 h-4" />
            Create path
          </Button>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {scoped.map((path) => {
            const courseSteps = path.steps.filter((s) => s.type === "course").length;
            const taskSteps = path.steps.filter((s) => s.type === "task").length;
            return (
              <Card key={path.id} className="border-surface-border shadow-card">
                <CardContent className="p-4 space-y-3">
                  <div className="w-10 h-10 rounded-lg bg-brand-100 dark:bg-brand-950 flex items-center justify-center">
                    <Waypoints className="w-5 h-5 text-brand-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-text-primary leading-tight">{path.title}</h3>
                    <p className="text-xs text-text-tertiary mt-1">{path.category}</p>
                  </div>
                  <p className="text-sm text-text-secondary line-clamp-2">{path.description}</p>
                  <p className="text-xs text-text-tertiary">
                    {courseSteps} course{courseSteps === 1 ? "" : "s"}
                    {taskSteps > 0 ? ` · ${taskSteps} task${taskSteps === 1 ? "" : "s"}` : ""}
                  </p>
                  <div className="flex gap-2 pt-1">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      render={<Link href={`/${user.role}/learning-paths/${path.id}`} />}
                    >
                      Edit
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
          {scoped.length === 0 && (
            <p className="text-text-tertiary col-span-full text-center py-10">
              No learning paths yet — create your first one.
            </p>
          )}
        </div>
      </div>
    </AppShell>
  );
}
