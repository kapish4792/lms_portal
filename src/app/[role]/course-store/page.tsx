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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCoursesStore } from "@/lib/store/courses-store";
import { useCategoriesStore } from "@/lib/store/categories-store";
import { Search, Star, ShoppingBag, Lock } from "lucide-react";

export default function CourseStorePage() {
  const params = useParams<{ role: string }>();
  const user = useRoleGuard(params.role);
  const courses = useCoursesStore((s) => s.courses);
  const orgCategories = useCategoriesStore((s) => s.categories);

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [priceFilter, setPriceFilter] = useState("all");

  const scoped = useMemo(() => (user ? courses.filter((c) => c.org === user.org) : []), [courses, user]);
  const categories = useMemo(() => {
    const fromCourses = scoped.map((c) => c.category).filter(Boolean);
    const fromStore = (user ? orgCategories.filter((c) => c.org === user.org) : []).map((c) => c.name);
    return Array.from(new Set([...fromStore, ...fromCourses]));
  }, [scoped, orgCategories, user]);

  const filtered = scoped.filter((c) => {
    const matchesSearch = !search.trim() || c.title.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === "all" || c.category === categoryFilter;
    const price = c.price ?? 0;
    const matchesPrice = priceFilter === "all" || (priceFilter === "free" ? price === 0 : price > 0);
    return matchesSearch && matchesCategory && matchesPrice;
  });

  if (!user) return null;

  return (
    <AppShell user={user}>
      <div className="p-6 space-y-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Course Store</h1>
          <p className="text-text-secondary mt-1">Discover and acquire courses for {user.org}</p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-tertiary" />
            <Input placeholder="Search courses..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-8" />
          </div>
          <Select value={categoryFilter} onValueChange={(v) => setCategoryFilter(v ?? "all")}>
            <SelectTrigger>
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
            <SelectTrigger>
              <SelectValue placeholder="Price" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any price</SelectItem>
              <SelectItem value="free">Free</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((course) => (
            <Card key={course.id} className="border-surface-border shadow-card">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="w-10 h-10 rounded-lg bg-brand-100 dark:bg-brand-950 flex items-center justify-center shrink-0">
                    <ShoppingBag className="w-5 h-5 text-brand-600" />
                  </div>
                  {course.rating && (
                    <span className="flex items-center gap-1 text-xs text-text-secondary">
                      <Star className="w-3.5 h-3.5 fill-warning text-warning" />
                      {course.rating.toFixed(1)}
                    </span>
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-text-primary leading-tight">{course.title}</h3>
                  <p className="text-xs text-text-tertiary mt-1">{course.category}</p>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-text-primary">
                    {(course.price ?? 0) === 0 ? "Free" : `$${course.price}`}
                  </span>
                  {(course.enrollmentType ?? "open") !== "open" && (
                    <Badge variant="outline" className="gap-1">
                      <Lock className="w-3 h-3" />
                      {course.enrollmentType === "gated" ? "Seat-limited" : "Approval required"}
                    </Badge>
                  )}
                </div>
                <Button size="sm" className="w-full" render={<Link href={`/${user.role}/course-store/${course.id}`} />}>
                  View course
                </Button>
              </CardContent>
            </Card>
          ))}
          {filtered.length === 0 && (
            <p className="text-text-tertiary col-span-full text-center py-10">No courses match these filters.</p>
          )}
        </div>
      </div>
    </AppShell>
  );
}
