"use client";

import { useParams } from "next/navigation";
import { useRoleGuard } from "@/lib/hooks/use-role-guard";
import { AppShell } from "@/components/layout/AppShell";
import { CourseForm } from "@/components/courses/CourseForm";

export default function NewCoursePage() {
  const params = useParams<{ role: string }>();
  const user = useRoleGuard(params.role);
  if (!user) return null;

  return (
    <AppShell user={user}>
      <div className="p-4 sm:p-6 lg:p-8 space-y-6 w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">Create New Course</h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Author curriculum, configure interactive challenges, and publish enterprise learning tracks in one place.
            </p>
          </div>
        </div>
        <CourseForm user={user} />
      </div>
    </AppShell>
  );
}
