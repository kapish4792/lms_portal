"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { useRoleGuard } from "@/lib/hooks/use-role-guard";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCoursesStore, Course } from "@/lib/store/courses-store";
import { useEnrollmentsStore, Enrollment } from "@/lib/store/enrollments-store";
import { Search, Play, ArrowRight, Clock, Trophy, Calendar, BookOpen, SlidersHorizontal, X } from "lucide-react";
import { CourseCard } from "@/components/courses/CourseCard";

interface TrainingItem {
  course: Course;
  enrollment: Enrollment;
  progress: number;
  lastAccessed?: string;
}

export default function MyTrainingPage() {
  const params = useParams<{ role: string }>();
  const user = useRoleGuard(params.role);
  const courses = useCoursesStore((s) => s.courses);
  const enrollments = useEnrollmentsStore((s) => s.enrollments);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [currentTime] = useState<number>(() => Date.now());

  // Get user's enrollments
  const userEnrollments = useMemo(
    () => (user ? enrollments.filter((e) => e.userId === user.identifier) : []),
    [enrollments, user?.identifier]
  );

  // Get enrolled courses with progress
  const enrolledCourses = useMemo(() => {
    if (!user) return [];
    const items: TrainingItem[] = [];
    for (const enrollment of userEnrollments) {
      const course = courses.find((c) => c.id === enrollment.courseId);
      if (course) {
        items.push({
          course,
          enrollment,
          progress: enrollment.progress ?? 0,
          lastAccessed: enrollment.lastAccessedAt,
        });
      }
    }
    return items;
  }, [userEnrollments, courses, user]);

  // Filter enrolled courses
  const filteredCourses = useMemo(() => {
    if (!user) return [];
    return enrolledCourses.filter((item) => {
      const matchesSearch =
        !search.trim() ||
        item.course.title.toLowerCase().includes(search.toLowerCase()) ||
        item.course.category.toLowerCase().includes(search.toLowerCase());
      const matchesStatus =
        statusFilter === "All Status" ||
        (statusFilter === "In Progress" && item.progress > 0 && item.progress < 100) ||
        (statusFilter === "Completed" && item.progress >= 100) ||
        (statusFilter === "Not Started" && item.progress === 0);
      return matchesSearch && matchesStatus;
    });
  }, [enrolledCourses, search, statusFilter, user]);

  // Upcoming deadlines (courses with due dates or expiration)
  const upcomingDeadlines = useMemo(() => {
    if (!user) return [];
    return enrolledCourses
      .filter((item) => item.enrollment.dueDate && item.progress < 100)
      .sort((a, b) => {
        const aTime = a.enrollment.dueDate ? new Date(a.enrollment.dueDate).getTime() : 0;
        const bTime = b.enrollment.dueDate ? new Date(b.enrollment.dueDate).getTime() : 0;
        return aTime - bTime;
      })
      .slice(0, 5);
  }, [enrolledCourses, user]);

  // Recently accessed
  const recentCourses = useMemo(() => {
    if (!user) return [];
    return enrolledCourses
      .filter((item) => !!item.lastAccessed)
      .sort((a, b) => new Date(b.lastAccessed!).getTime() - new Date(a.lastAccessed!).getTime())
      .slice(0, 4);
  }, [enrolledCourses, user]);

  const getStatusBadge = (progress: number) => {
    if (progress >= 100) return { label: "Completed", variant: "default" as const, icon: Trophy };
    if (progress > 0) return { label: "In Progress", variant: "secondary" as const, icon: Play };
    return { label: "Not Started", variant: "outline" as const, icon: Clock };
  };

  if (!user) return null;

  return (
    <AppShell user={user}>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-text-primary">My Training</h1>
          <p className="text-text-secondary mt-1">
            {enrolledCourses.length} course{enrolledCourses.length === 1 ? "" : "s"} in your learning plan
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="border-surface-border shadow-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold text-text-primary">{enrolledCourses.length}</p>
                  <p className="text-sm text-text-tertiary">Enrolled Courses</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-brand-100 dark:bg-brand-950 flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-brand-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-surface-border shadow-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold text-text-primary">
                    {enrolledCourses.filter((c) => c.progress >= 100).length}
                  </p>
                  <p className="text-sm text-text-tertiary">Completed</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-success-100 dark:bg-success-950 flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-success-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-surface-border shadow-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold text-text-primary">
                    {enrolledCourses.filter((c) => c.progress > 0 && c.progress < 100).length}
                  </p>
                  <p className="text-sm text-text-tertiary">In Progress</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-warning-100 dark:bg-warning-950 flex items-center justify-center">
                  <Play className="w-6 h-6 text-warning-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Deadlines */}
        {upcomingDeadlines.length > 0 && (
          <Card className="border-surface-border shadow-card">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-warning-600" />
                <h3 className="font-semibold text-text-primary">Upcoming Deadlines</h3>
              </div>
              <div className="space-y-2">
                {upcomingDeadlines.map((item) => {
                  const dueDate = item.enrollment.dueDate;
                  const daysLeft = dueDate && currentTime !== null
                    ? Math.ceil((new Date(dueDate).getTime() - currentTime) / (1000 * 60 * 60 * 24))
                    : null;
                  return (
                    <div key={item.course.id} className="flex items-center justify-between p-3 rounded-lg border border-surface-border bg-surface-sunken/50">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-brand-100 dark:bg-brand-950 flex items-center justify-center shrink-0">
                          <BookOpen className="w-5 h-5 text-brand-600" />
                        </div>
                        <div>
                          <p className="font-medium text-text-primary">{item.course.title}</p>
                          <p className="text-sm text-text-tertiary">{item.course.category}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant={daysLeft !== null && daysLeft <= 3 ? "destructive" : "outline"}>
                          {daysLeft !== null ? `${daysLeft}d left` : "No due date"}
                        </Badge>
                        <Button
                          size="sm"
                          variant="outline"
                          render={
                            <Link href={`/${user.role}/courses/${item.course.id}/player`} />
                          }
                        >
                          <Play className="w-3.5 h-3.5 mr-1.5" />
                          Continue
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Continue Learning - Quick Resume */}
        {recentCourses.length > 0 && (
          <Card className="border-surface-border shadow-card">
            <CardContent className="p-4 space-y-3">
              <h3 className="font-semibold text-text-primary flex items-center gap-2">
                <Play className="w-5 h-5 text-brand-600" />
                Continue Learning
              </h3>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {recentCourses.map((item) => (
                  <Link key={item.course.id} href={`/${user.role}/courses/${item.course.id}/player`}>
                    <div className="p-3 rounded-lg border border-surface-border bg-surface-base hover:border-brand-500/50 transition-colors group">
                      <div className="w-full h-24 rounded-lg bg-brand-100 dark:bg-brand-950 flex items-center justify-center mb-2 group-hover:opacity-80 transition-opacity">
                        <Play className="w-8 h-8 text-brand-600" />
                      </div>
                      <p className="font-medium text-text-primary text-sm truncate">{item.course.title}</p>
                      <div className="mt-2">
                        <Progress value={item.progress} className="h-1.5" />
                        <p className="text-xs text-text-tertiary mt-1">{Math.round(item.progress)}% complete</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* My Courses Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h2 className="text-xl font-bold text-text-primary">All My Courses</h2>
              <p className="text-sm text-text-secondary">
                {filteredCourses.length} of {userEnrollments.length} enrolled course{userEnrollments.length === 1 ? "" : "s"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap rounded-xl border border-surface-border bg-surface-sunken/40 p-3">
            <div className="relative flex-1 min-w-55 sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-tertiary" />
              <Input
                placeholder="Search my courses..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-9 pl-9 bg-surface-base"
              />
            </div>

            <div className="hidden sm:block h-6 w-px bg-surface-border" />

            <div className="flex items-center gap-2 flex-wrap">
              <SlidersHorizontal className="hidden sm:block w-3.5 h-3.5 text-text-tertiary shrink-0" />
              <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v ?? "All Status")}>
                <SelectTrigger size="sm" className="w-36 bg-surface-base">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All Status">All Statuses</SelectItem>
                  <SelectItem value="Not Started">Not Started</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                </SelectContent>
              </Select>

              {(search || statusFilter !== "All Status") && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-9 gap-1.5 text-text-tertiary hover:text-text-primary"
                  onClick={() => {
                    setSearch("");
                    setStatusFilter("All Status");
                  }}
                >
                  <X className="w-3.5 h-3.5" />
                  Clear
                </Button>
              )}
            </div>
          </div>

          {filteredCourses.length === 0 ? (
            <Card className="border-surface-border shadow-card">
              <CardContent className="p-12 text-center">
                <BookOpen className="w-12 h-12 text-text-tertiary mx-auto mb-3" />
                <p className="text-text-secondary">No courses found</p>
                <p className="text-text-tertiary text-sm mt-1">
                  {search || statusFilter !== "All Status"
                    ? "Try adjusting your filters"
                    : "Browse the Catalog to find courses to enroll in"}
                </p>
                {!search && statusFilter === "All Status" && (
                  <Button
                    className="mt-4 gap-2"
                    render={<Link href={`/${user.role}/catalog`} />}
                  >
                    <ArrowRight className="w-4 h-4" />
                    Browse Catalog
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredCourses.map((item) => (
                <CourseCard
                  key={item.course.id}
                  course={item.course}
                  user={user}
                  mode="learning"
                  isEnrolled={true}
                  progress={item.progress}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}