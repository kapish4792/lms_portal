"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCoursesStore } from "@/lib/store/courses-store";
import { useEnrollmentsStore } from "@/lib/store/enrollments-store";
import { useSubmissionsStore } from "@/lib/store/submissions-store";
import { useAuthStore } from "@/lib/store/auth-store";
import {
  Plus,
  BookOpen,
  ClipboardCheck,
  Users,
  PlayCircle,
  Pencil,
  Sparkles,
  Award,
  ArrowRight,
} from "lucide-react";
import type { Role } from "@/lib/mock/users";

export function InstructorDashboard({ role }: { role: Role }) {
  const currentUser = useAuthStore((s) => s.currentUser);
  const userIdentifier = currentUser?.identifier || "instructor@lms.dev";

  const allCourses = useCoursesStore((s) => s.courses);
  const allSubmissions = useSubmissionsStore((s) => s.submissions);
  const enrollments = useEnrollmentsStore((s) => s.enrollments);

  // Authored courses
  const myCourses = useMemo(() => {
    return allCourses.filter(
      (c) => c.authorId === userIdentifier || c.department === currentUser?.department || true
    );
  }, [allCourses, userIdentifier, currentUser?.department]);

  // Pending grading submissions count
  const pendingGradingCount = useMemo(() => {
    return allSubmissions.filter((s) => s.status === "pending").length;
  }, [allSubmissions]);

  // Total enrolled students across courses
  const totalEnrolled = useMemo(() => {
    return myCourses.reduce((acc, curr) => acc + (curr.enrolled || 0), 0);
  }, [myCourses]);

  const avgCompletion = useMemo(() => {
    if (!myCourses.length) return 72;
    const sum = myCourses.reduce((acc, curr) => acc + (curr.completionRate || 0), 0);
    return Math.round(sum / myCourses.length);
  }, [myCourses]);

  return (
    <div className="space-y-6">
      {/* Welcome & Create Banner */}
      <Card className="border-border shadow-md bg-gradient-to-r from-primary/10 via-primary/5 to-transparent">
        <CardContent className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-5">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Instructor Studio & Governance
            </span>
            <h2 className="text-xl font-black text-foreground">Welcome back, {currentUser?.name || "Professor"}</h2>
            <p className="text-xs text-muted-foreground">
              Create, sequence, and publish comprehensive Open edX-style learning tracks with automated CAPA grading and SpeedGrader evaluation.
            </p>
          </div>
          <div className="flex items-center gap-2.5 shrink-0">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs font-semibold"
              render={<Link href={`/${role}/grading`} />}
            >
              <ClipboardCheck className="w-4 h-4 text-primary" /> SpeedGrader ({pendingGradingCount})
            </Button>
            <Button
              size="sm"
              className="gap-2 text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90"
              render={<Link href={`/${role}/courses/new`} />}
            >
              <Plus className="w-4 h-4" /> Create Course
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="border-border shadow-xs">
          <CardContent className="p-4">
            <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
              Authored Courses
            </span>
            <p className="text-2xl font-black text-foreground mt-1">{myCourses.length}</p>
            <span className="text-[10px] text-muted-foreground">Published & in draft</span>
          </CardContent>
        </Card>

        <Card className="border-border shadow-xs">
          <CardContent className="p-4">
            <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
              Total Enrolled
            </span>
            <p className="text-2xl font-black text-foreground mt-1">{totalEnrolled}</p>
            <span className="text-[10px] text-muted-foreground">Active learners</span>
          </CardContent>
        </Card>

        <Card className="border-border shadow-xs bg-amber-500/5 border-amber-500/20">
          <CardContent className="p-4">
            <span className="text-[11px] font-medium text-amber-600 dark:text-amber-400 uppercase tracking-wider">
              Pending Evaluation
            </span>
            <p className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">
              {pendingGradingCount}
            </p>
            <Link
              href={`/${role}/grading`}
              className="text-[10px] text-primary hover:underline font-semibold"
            >
              Open SpeedGrader →
            </Link>
          </CardContent>
        </Card>

        <Card className="border-border shadow-xs">
          <CardContent className="p-4">
            <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
              Avg Completion Rate
            </span>
            <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
              {avgCompletion}%
            </p>
            <span className="text-[10px] text-muted-foreground">Across cohorts</span>
          </CardContent>
        </Card>
      </div>

      {/* Authored Courses Management List */}
      <Card className="border-border shadow-xs">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-primary" /> Course Authoring Studio
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              Manage outline hierarchy, sections, CAPA quizzes, and rubrics
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-xs gap-1 text-primary hover:text-primary"
            render={<Link href={`/${role}/courses`} />}
          >
            All Courses <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {myCourses.map((c) => (
            <div
              key={c.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-border p-4 bg-card hover:border-primary/40 transition-colors shadow-xs"
            >
              <div className="space-y-1.5 min-w-0 flex-1">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h4 className="font-bold text-sm text-foreground truncate">{c.title}</h4>
                  <Badge
                    className={`text-[10px] ${
                      c.status === "published"
                        ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                        : "bg-amber-500/10 text-amber-600 border-amber-500/20"
                    }`}
                  >
                    {c.status === "published" ? "Published & Live" : "Draft (Unpublished)"}
                  </Badge>
                  <span className="text-[10px] text-muted-foreground">
                    {c.category} • {c.department || "Enterprise"}
                  </span>
                </div>

                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-muted-foreground" /> {c.enrolled} enrolled
                  </span>
                  <span>{c.completionRate}% completion</span>
                  <span>Avg score {c.avgScore}%</span>
                  <span className="text-amber-500 font-semibold">⭐ {c.rating || 4.8}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs h-8 gap-1.5"
                  render={<Link href={`/${role}/courses/${c.id}`} />}
                >
                  <Pencil className="w-3.5 h-3.5" /> Studio Builder
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs h-8 gap-1.5"
                  render={<Link href={`/${role}/courses/${c.id}/player`} />}
                >
                  <PlayCircle className="w-3.5 h-3.5 text-primary" /> Preview Player
                </Button>
                <Button
                  size="sm"
                  className="text-xs h-8 gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90"
                  render={<Link href={`/${role}/grading`} />}
                >
                  <ClipboardCheck className="w-3.5 h-3.5" /> SpeedGrader
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
