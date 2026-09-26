"use client";

import { useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useRoleGuard } from "@/lib/hooks/use-role-guard";
import { AppShell } from "@/components/layout/AppShell";
import { CourseForm } from "@/components/courses/CourseForm";
import { DepartmentLockBanner } from "@/components/courses/DepartmentLockBanner";
import { useCoursesStore } from "@/lib/store/courses-store";
import { canEditDepartmentResource } from "@/lib/permissions";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { PlayCircle } from "lucide-react";

export default function CourseEditPage() {
  const params = useParams<{ role: string; courseId: string }>();
  const router = useRouter();
  const user = useRoleGuard(params.role);
  const courses = useCoursesStore((s) => s.courses);
  const course = useMemo(() => courses.find((c) => c.id === params.courseId), [courses, params.courseId]);

  if (!user) return null;

  if (!course) {
    return (
      <AppShell user={user}>
        <div className="p-6">
          <p className="text-text-secondary">Course not found.</p>
          <Button variant="outline" className="mt-3" onClick={() => router.push(`/${user.role}/courses`)}>
            Back to courses
          </Button>
        </div>
      </AppShell>
    );
  }

  const editable = canEditDepartmentResource(user, course.department);

  return (
    <AppShell user={user}>
      <div className="p-4 sm:p-6 lg:p-8 space-y-6 w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">{course.title}</h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              {course.category} · {course.department ?? "Enterprise"}
            </p>
          </div>
          <Button variant="outline" className="gap-2 border-border text-foreground hover:bg-muted" render={<Link href={`/${user.role}/courses/${course.id}/player`} />}>
            <PlayCircle className="w-4 h-4 text-primary" />
            Preview Player
          </Button>
        </div>

        {!editable && course.department && (
          <DepartmentLockBanner department={course.department} course={course} requester={user} />
        )}

        {editable ? (
          <CourseForm user={user} existing={course} />
        ) : (
          <Card className="border-surface-border shadow-card opacity-70 pointer-events-none select-none">
            <CardContent className="p-6 text-sm text-text-tertiary">
              Form fields are disabled — this course is owned by another department.
            </CardContent>
          </Card>
        )}
      </div>
    </AppShell>
  );
}
