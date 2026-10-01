"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCoursesStore } from "@/lib/store/courses-store";
import { useEnrollmentsStore } from "@/lib/store/enrollments-store";
import { useAuthStore } from "@/lib/store/auth-store";
import { PlayCircle, Clock, Award, BookOpen, ArrowRight, Sparkles, CheckCircle2 } from "lucide-react";
import type { Role } from "@/lib/mock/users";

function ProgressBar({ value }: { value: number }) {
  return (
    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
      <div
        className="h-full rounded-full bg-primary transition-all duration-300"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}

export function LearnerDashboard({ role }: { role: Role }) {
  const currentUser = useAuthStore((s) => s.currentUser);
  const userIdentifier = currentUser?.identifier || "learner@lms.dev";

  const allCourses = useCoursesStore((s) => s.courses);
  const enrollments = useEnrollmentsStore((s) => s.enrollments);

  const userEnrollments = useMemo(() => {
    return enrollments.filter((e) => e.userId === userIdentifier);
  }, [enrollments, userIdentifier]);

  const enrolledCourseList = useMemo(() => {
    return userEnrollments
      .map((enr) => {
        const course = allCourses.find((c) => c.id === enr.courseId);
        if (!course) return null;
        return {
          course,
          enrollment: enr,
          progress: enr.progress ?? 0,
        };
      })
      .filter(Boolean) as { course: typeof allCourses[0]; enrollment: typeof userEnrollments[0]; progress: number }[];
  }, [userEnrollments, allCourses]);

  // Primary active course to resume
  const activeResume = enrolledCourseList.find((item) => item.progress < 100) || enrolledCourseList[0] || {
    course: allCourses[0],
    enrollment: userEnrollments[0],
    progress: 68,
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Quick Resume Card */}
        <Card className="lg:col-span-2 border-border shadow-md bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
          <CardContent className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-6">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-primary-foreground/80 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Jump Back into Learning
              </span>
              <h3 className="text-xl font-black text-white">{activeResume.course.title}</h3>
              <p className="text-xs text-primary-foreground/90">
                Next lesson: {activeResume.course.sections[0]?.lessons[1]?.title || "Interactive Lecture"}
              </p>
              <div className="w-56 pt-2">
                <div className="h-2 rounded-full bg-white/20 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-white transition-all"
                    style={{ width: `${activeResume.progress}%` }}
                  />
                </div>
                <span className="text-[11px] text-white/90 font-mono mt-1 block">
                  {activeResume.progress}% completed
                </span>
              </div>
            </div>

            <Button
              variant="secondary"
              size="sm"
              className="gap-2 shrink-0 font-bold text-xs bg-white text-primary hover:bg-white/90 shadow-sm"
              render={<Link href={`/${role}/courses/${activeResume.course.id}/player`} />}
            >
              <PlayCircle className="w-4 h-4 text-primary" />
              Resume Learning
            </Button>
          </CardContent>
        </Card>

        {/* Upcoming Deadlines (Moodle Timeline / Open edX Dates) */}
        <Card className="border-border shadow-xs">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-500" /> Upcoming Deadlines
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-xs p-2.5 rounded-lg border border-border bg-card space-y-1">
              <p className="font-semibold text-foreground">Architecture Threat Modeling RFC</p>
              <div className="flex items-center justify-between text-muted-foreground text-[11px]">
                <span className="text-destructive font-semibold">Due in 3 days</span>
                <Link
                  href={`/${role}/courses/c-1/player`}
                  className="text-primary hover:underline font-medium"
                >
                  Open Assignment →
                </Link>
              </div>
            </div>

            <div className="text-xs p-2.5 rounded-lg border border-border bg-card space-y-1">
              <p className="font-semibold text-foreground">Next.js 16 Edge Middleware Lab</p>
              <div className="flex items-center justify-between text-muted-foreground text-[11px]">
                <span>Due Oct 20, 2026</span>
                <Link
                  href={`/${role}/courses/c-2/player`}
                  className="text-primary hover:underline font-medium"
                >
                  Review Lab →
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Enrolled Courses */}
        <Card className="lg:col-span-2 border-border shadow-xs">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-primary" /> My Enrolled Courses
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs gap-1 text-primary hover:text-primary"
              render={<Link href={`/${role}/catalog`} />}
            >
              Explore Catalog <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </CardHeader>
          <CardContent className="grid sm:grid-cols-2 gap-3">
            {enrolledCourseList.map(({ course, progress }) => (
              <div
                key={course.id}
                className="rounded-xl border border-border p-3.5 space-y-2.5 bg-card hover:border-primary/40 transition-colors shadow-xs"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shrink-0">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-foreground leading-tight truncate">
                      {course.title}
                    </p>
                    <span className="text-[10px] text-muted-foreground">
                      {course.category} • {course.department || "Enterprise"}
                    </span>
                  </div>
                </div>

                <ProgressBar value={progress} />

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] font-mono text-muted-foreground">
                    {progress}% complete
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs h-7 gap-1 font-semibold"
                    render={<Link href={`/${role}/courses/${course.id}/player`} />}
                  >
                    {progress >= 100 ? (
                      <>
                        <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Review
                      </>
                    ) : progress === 0 ? (
                      "Start"
                    ) : (
                      "Continue"
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Verified Achievements & Credentials */}
        <Card className="border-border shadow-xs">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Award className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> Verified Credentials
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 space-y-2">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">🎓</span>
                <div>
                  <p className="text-xs font-bold text-foreground">Cloud Security Specialist</p>
                  <span className="text-[10px] text-muted-foreground">Verified ID: ESSCI-SEC-2026</span>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs h-7 text-emerald-700 dark:text-emerald-300 border-emerald-500/30"
                render={<Link href={`/${role}/certificates`} />}
              >
                View Certificate
              </Button>
            </div>

            <div className="p-2.5 rounded-lg border border-border bg-card text-xs flex items-center gap-2.5">
              <span className="text-xl">🏆</span>
              <div>
                <p className="font-semibold text-foreground">Top Quiz Performer</p>
                <span className="text-[10px] text-muted-foreground">100% on first attempt</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
