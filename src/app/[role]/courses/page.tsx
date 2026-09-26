"use client";

import Link from "next/link";
import { useMemo, useState, Suspense } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { useRoleGuard } from "@/lib/hooks/use-role-guard";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCoursesStore } from "@/lib/store/courses-store";
import { useCategoriesStore } from "@/lib/store/categories-store";
import { canEditDepartmentResource } from "@/lib/permissions";
import { Plus, Search, X, BookOpen, SlidersHorizontal } from "lucide-react";
import { Pagination } from "@/components/ui/pagination";
import { getFilterOptions } from "@/lib/config/filters";
import { CourseCard } from "@/components/courses/CourseCard";

function CoursesListContent() {
  const params = useParams<{ role: string }>();
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category") ?? "All Categories";

  const user = useRoleGuard(params.role);
  const courses = useCoursesStore((s) => s.courses);
  const orgCategories = useCategoriesStore((s) => s.categories);

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState(initialCategory);
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(15);

  const scoped = useMemo(
    () => (user ? courses.filter((c) => c.org === user.org) : []),
    [courses, user]
  );

  const categories = useMemo(() => {
    const fromCourses = scoped.map((c) => c.category).filter(Boolean);
    const fromStore = (user ? orgCategories.filter((c) => c.org === user.org) : []).map((c) => c.name);
    return Array.from(new Set([...fromStore, ...fromCourses]));
  }, [scoped, orgCategories, user]);

  const filtered = useMemo(() => {
    return scoped.filter((course) => {
      const matchesSearch = !search.trim() || course.title.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = categoryFilter === "All Categories" || course.category === categoryFilter;
      const matchesStatus = statusFilter === "All Status" || course.status === statusFilter;
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [scoped, search, categoryFilter, statusFilter]);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filtered.slice(start, start + itemsPerPage);
  }, [filtered, currentPage, itemsPerPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  if (!user) return null;

  const isLmsAdmin = user.role === "lms-admin" || user.role === "super-admin";
  if (isLmsAdmin) {
    return (
      <AppShell user={user}>
        <div className="p-6 w-full">
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-8 text-center max-w-xl mx-auto space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
                <BookOpen className="w-7 h-7" />
              </div>
              <h2 className="text-xl font-bold text-text-primary">
                Course Section Disabled for LMS Platform Admin
              </h2>
              <p className="text-sm text-text-secondary">
                Course authoring, lessons, and curriculum catalogs are tenant-scoped and managed directly by Organization Administrators and Instructors.
              </p>
              <div className="pt-2 flex items-center justify-center gap-3">
                <Button render={<Link href={`/${user.role}/organization`} />}>
                  Manage Organizations
                </Button>
                <Button variant="outline" render={<Link href={`/${user.role}/dashboard`} />}>
                  Go to Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </AppShell>
    );
  }

  const statusOptions = getFilterOptions("courseStatus");

  return (
    <AppShell user={user}>
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Courses</h1>
            <p className="text-text-secondary mt-1">
              {filtered.length} of {scoped.length} course{scoped.length === 1 ? "" : "s"} at {user.org}
              {categoryFilter !== "All Categories" && ` · filtered by ${categoryFilter}`}
              {statusFilter !== "All Status" && ` · ${statusOptions.find(o => o.value === statusFilter)?.label}`}
            </p>
          </div>
          <Button className="gap-2" render={<Link href={`/${user.role}/courses/new`} />}>
            <Plus className="w-4 h-4" />
            Create course
          </Button>
        </div>

        <div className="flex items-center gap-3 flex-wrap rounded-xl border border-surface-border bg-surface-sunken/40 p-3">
          <div className="relative flex-1 min-w-55 sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-tertiary" />
            <Input
              placeholder="Search courses..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 pl-9 bg-surface-base"
            />
          </div>

          <div className="hidden sm:block h-6 w-px bg-surface-border" />

          <div className="flex items-center gap-2 flex-wrap">
            <SlidersHorizontal className="hidden sm:block w-3.5 h-3.5 text-text-tertiary shrink-0" />
            <Select value={categoryFilter} onValueChange={(v) => setCategoryFilter(v ?? "All Categories")}>
              <SelectTrigger size="sm" className="w-40 bg-surface-base">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All Categories">All Categories</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v ?? "All Status")}>
              <SelectTrigger size="sm" className="w-36 bg-surface-base">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {(categoryFilter !== "All Categories" || statusFilter !== "All Status" || search) && (
              <Button
                variant="ghost"
                size="sm"
                className="h-9 gap-1.5 text-text-tertiary hover:text-text-primary"
                onClick={() => {
                  setSearch("");
                  setCategoryFilter("All Categories");
                  setStatusFilter("All Status");
                }}
              >
                <X className="w-3.5 h-3.5" />
                Clear
              </Button>
            )}
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-5">
          {paginatedData.map((course) => {
            const editable = canEditDepartmentResource(user, course.department);
            return (
              <CourseCard
                key={course.id}
                course={course}
                user={user}
                mode="management"
                editable={editable}
              />
            );
          })}
          {filtered.length === 0 && (
            <p className="text-text-tertiary col-span-full text-center py-10">
              No courses match your filter criteria.
            </p>
          )}
        </div>

        <Pagination
          totalItems={filtered.length}
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
          onPageChange={handlePageChange}
          onItemsPerPageChange={handleItemsPerPageChange}
        />
      </div>
    </AppShell>
  );
}

export default function CoursesListPage() {
  return (
    <Suspense fallback={null}>
      <CoursesListContent />
    </Suspense>
  );
}
