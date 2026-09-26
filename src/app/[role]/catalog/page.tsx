"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { useRoleGuard } from "@/lib/hooks/use-role-guard";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCoursesStore } from "@/lib/store/courses-store";
import { useCategoriesStore } from "@/lib/store/categories-store";
import { useEnrollmentsStore } from "@/lib/store/enrollments-store";
import { Search, Star, ShoppingBag, Play, Clock, Users, Tag, Filter, X, Check, BookOpen } from "lucide-react";
import { CourseCard } from "@/components/courses/CourseCard";

export default function CatalogPage() {
  const params = useParams<{ role: string }>();
  const user = useRoleGuard(params.role);
  const courses = useCoursesStore((s) => s.courses);
  const orgCategories = useCategoriesStore((s) => s.categories);
  const enrollments = useEnrollmentsStore((s) => s.enrollments);
  const enroll = useEnrollmentsStore((s) => s.enroll);

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [priceFilter, setPriceFilter] = useState("all");
  const [sortBy, setSortBy] = useState("relevance");

  // Get user's enrollments to check enrollment status
  const userEnrollments = useMemo(
    () => (user ? enrollments.filter((e) => e.userId === user.identifier) : []),
    [enrollments, user?.identifier]
  );

  // Scope courses to user's org
  const scoped = useMemo(
    () => (user ? courses.filter((c) => c.org === user.org && c.status === "published") : []),
    [courses, user?.org]
  );

  // Get unique categories
  const categories = useMemo(() => {
    if (!user) return [];
    const fromCourses = scoped.map((c) => c.category).filter(Boolean);
    const fromStore = orgCategories.filter((c) => c.org === user.org).map((c) => c.name);
    return Array.from(new Set([...fromStore, ...fromCourses]));
  }, [scoped, orgCategories, user?.org]);

  // Filter and sort courses
  const filtered = useMemo(() => {
    if (!user) return [];
    let result = scoped.filter((course) => {
      const matchesSearch =
        !search.trim() ||
        course.title.toLowerCase().includes(search.toLowerCase()) ||
        course.category.toLowerCase().includes(search.toLowerCase()) ||
        course.objectives.some((obj) => obj.toLowerCase().includes(search.toLowerCase()));
      const matchesCategory = categoryFilter === "all" || course.category === categoryFilter;
      const price = course.price ?? 0;
      const matchesPrice = priceFilter === "all" || (priceFilter === "free" ? price === 0 : price > 0);
      return matchesSearch && matchesCategory && matchesPrice;
    });

    // Sort
    switch (sortBy) {
      case "newest":
        result = [...result].sort((a, b) => b.id.localeCompare(a.id));
        break;
      case "popular":
        result = [...result].sort((a, b) => b.enrolled - a.enrolled);
        break;
      case "rating":
        result = [...result].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
        break;
      case "title":
        result = [...result].sort((a, b) => a.title.localeCompare(b.title));
        break;
      default:
        // relevance - keep original order (could implement search relevance)
        break;
    }

    return result;
  }, [scoped, search, categoryFilter, priceFilter, sortBy]);

  const isEnrolled = (courseId: string) => userEnrollments.some((e) => e.courseId === courseId);
  const getEnrollment = (courseId: string) => userEnrollments.find((e) => e.courseId === courseId);

  const handleEnroll = (courseId: string) => {
    if (!user) return;
    const course = courses.find((c) => c.id === courseId);
    if (!course) return;

    // For "request" or "gated" enrollment types, we'd route to approval
    // For now, just enroll directly
    enroll(user.identifier, courseId);
  };

  const activeFilters = [
    categoryFilter !== "all" && { label: `Category: ${categoryFilter}`, value: "category" },
    priceFilter !== "all" && { label: `Price: ${priceFilter}`, value: "price" },
  ].filter(Boolean) as { label: string; value: string }[];

  if (!user) return null;

  return (
    <AppShell user={user}>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Catalog</h1>
          <p className="text-text-secondary mt-1">
            Discover and enroll in courses available at {user?.org || "your organization"} · {filtered.length} course{filtered.length === 1 ? "" : "s"} found
          </p>
        </div>

        {/* Active Filters Chips */}
        {activeFilters.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="w-4 h-4 text-text-tertiary" />
            <span className="text-sm text-text-tertiary">Active filters:</span>
            {activeFilters.map((f) => (
              <Badge key={f.value} variant="secondary" className="gap-1">
                {f.label}
                <Button variant="ghost" size="icon" className="h-5 w-5 p-0" onClick={() => {
                  if (f.value === "category") setCategoryFilter("all");
                  if (f.value === "price") setPriceFilter("all");
                }}>
                  <X className="w-3 h-3" />
                </Button>
              </Badge>
            ))}
            {activeFilters.length > 0 && (
              <Button variant="ghost" size="sm" onClick={() => { setCategoryFilter("all"); setPriceFilter("all"); }}>
                Clear all
              </Button>
            )}
          </div>
        )}

        {/* Filters Bar */}
        <Card className="border-surface-border shadow-card">
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="relative w-full sm:w-72 flex-1 min-w-[200px]">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-tertiary" />
                <Input
                  placeholder="Search courses, skills, categories..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8"
                />
              </div>

              <Select value={categoryFilter} onValueChange={(v) => setCategoryFilter(v ?? "all")}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All categories</SelectItem>
                  {categories.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={priceFilter} onValueChange={(v) => setPriceFilter(v ?? "all")}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Price" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any price</SelectItem>
                  <SelectItem value="free">Free</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={(v) => setSortBy(v ?? "relevance")}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relevance">Relevance</SelectItem>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="popular">Most Popular</SelectItem>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                  <SelectItem value="title">Title A-Z</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Course Grid */}
        {filtered.length === 0 ? (
          <Card className="border-surface-border shadow-card">
            <CardContent className="p-12 text-center">
              <ShoppingBag className="w-16 h-16 text-text-tertiary mx-auto mb-4" />
              <h3 className="text-lg font-medium text-text-primary mb-2">No courses found</h3>
              <p className="text-text-tertiary">
                {search || categoryFilter !== "all" || priceFilter !== "all"
                  ? "Try adjusting your filters or search terms"
                  : "No published courses available in the catalog yet"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((course) => {
              const enrolled = isEnrolled(course.id);
              const enrollment = getEnrollment(course.id);
              const progress = enrollment?.progress ?? 0;

              return (
                <CourseCard
                  key={course.id}
                  course={course}
                  user={user}
                  mode="catalog"
                  isEnrolled={enrolled}
                  progress={progress}
                  onEnroll={handleEnroll}
                />
              );
            })}
          </div>
        )}

        {/* Empty state for no published courses */}
        {scoped.length === 0 && filtered.length === 0 && (
          <Card className="border-surface-border shadow-card">
            <CardContent className="p-12 text-center">
              <BookOpen className="w-16 h-16 text-text-tertiary mx-auto mb-4" />
              <h3 className="text-lg font-medium text-text-primary mb-2">No courses available</h3>
              <p className="text-text-tertiary">
                There are no published courses in the catalog yet. Contact your administrator or check back later.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </AppShell>
  );
};