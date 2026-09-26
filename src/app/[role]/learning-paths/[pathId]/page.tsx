"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";
import { useRoleGuard } from "@/lib/hooks/use-role-guard";
import { AppShell } from "@/components/layout/AppShell";
import { PathForm } from "@/components/learning-paths/PathForm";
import { useLearningPathsStore } from "@/lib/store/learning-paths-store";
import { useCoursesStore } from "@/lib/store/courses-store";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, ClipboardCheck, Lock, Check } from "lucide-react";
import { cn } from "@/lib/utils";

function LearnerPathView({ pathId }: { pathId: string }) {
  const paths = useLearningPathsStore((s) => s.paths);
  const path = useMemo(() => paths.find((p) => p.id === pathId), [paths, pathId]);
  const allCompletedSteps = useLearningPathsStore((s) => s.completedSteps);
  const completed = useMemo(() => allCompletedSteps[pathId] ?? [], [allCompletedSteps, pathId]);
  const markStepComplete = useLearningPathsStore((s) => s.markStepComplete);
  const courses = useCoursesStore((s) => s.courses);

  if (!path) return <p className="text-text-secondary p-6">Path not found.</p>;

  const progress = path.steps.length ? Math.round((completed.length / path.steps.length) * 100) : 0;

  return (
    <div className="p-6 space-y-4 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">{path.title}</h1>
        <p className="text-text-secondary mt-1">{path.description}</p>
        <div className="h-1.5 rounded-full bg-surface-sunken overflow-hidden mt-3 max-w-sm">
          <div className="h-full rounded-full bg-brand-600" style={{ width: `${progress}%` }} />
        </div>
        <p className="text-xs text-text-tertiary mt-1">{progress}% complete</p>
      </div>

      <div className="space-y-2">
        {path.steps.map((step, index) => {
          const done = completed.includes(step.id);
          const prevDone = index === 0 || completed.includes(path.steps[index - 1].id);
          const locked = !done && !prevDone;
          const course = step.type === "course" ? courses.find((c) => c.id === step.courseId) : undefined;

          return (
            <Card key={step.id} className={cn("border-surface-border", locked && "opacity-60")}>
              <CardContent className="p-3 flex items-center gap-3">
                <span
                  className={cn(
                    "w-7 h-7 rounded-full flex items-center justify-center shrink-0",
                    done ? "bg-success text-success-foreground" : "bg-surface-sunken border border-surface-border"
                  )}
                >
                  {done ? <Check className="w-4 h-4" /> : locked ? <Lock className="w-3.5 h-3.5 text-text-tertiary" /> : index + 1}
                </span>
                {step.type === "course" ? <BookOpen className="w-4 h-4 text-brand-600 shrink-0" /> : <ClipboardCheck className="w-4 h-4 text-accent-600 shrink-0" />}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary truncate">
                    {step.type === "course" ? course?.title ?? "Unknown course" : step.title}
                  </p>
                  {step.type === "task" && (
                    <p className="text-xs text-text-tertiary">Due day {step.dueDayFromEnrollment} · {step.assignee}</p>
                  )}
                </div>
                {!done && !locked && (
                  <Button size="sm" variant="outline" onClick={() => markStepComplete(path.id, step.id)}>
                    Mark complete
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

export default function LearningPathDetailPage() {
  const params = useParams<{ role: string; pathId: string }>();
  const user = useRoleGuard(params.role);
  const paths = useLearningPathsStore((s) => s.paths);
  const path = useMemo(() => paths.find((p) => p.id === params.pathId), [paths, params.pathId]);

  if (!user) return null;

  const canEdit = user.role !== "learner" && user.role !== "manager";

  return (
    <AppShell user={user}>
      {canEdit ? (
        <div className="p-6 space-y-4">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">{path?.title ?? "Edit path"}</h1>
          </div>
          {path ? <PathForm user={user} existing={path} /> : <p className="text-text-secondary">Path not found.</p>}
        </div>
      ) : (
        <LearnerPathView pathId={params.pathId} />
      )}
    </AppShell>
  );
}
