"use client";

import Link from "next/link";
import { useMemo, useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useRoleGuard } from "@/lib/hooks/use-role-guard";
import { AppShell } from "@/components/layout/AppShell";
import { CourseCard } from "@/components/courses/CourseCard";
import { Button } from "@/components/ui/button";
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
import {
  Search,
  SlidersHorizontal,
  X,
  RefreshCw,
  Sparkles,
  ShoppingBag,
} from "lucide-react";

export default function CourseStorePage() {
  const params = useParams<{ role: string }>();
  const user = useRoleGuard(params.role);
  const courses = useCoursesStore((s) => s.courses);
  const orgCategories = useCategoriesStore((s) => s.categories);

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  const [priceFilter, setPriceFilter] = useState("Any Price");
  const [isLoading, setIsLoading] = useState(true);

  // Simulate API calling with realistic network latency
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 450);
    return () => clearTimeout(timer);
  }, [search, categoryFilter, priceFilter, user?.org]);

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 500);
  };

  // Pull from mock dataset with org scoping and fallback to platform catalog
  const scoped = useMemo(() => {
    if (!user) return [];
    const list = courses.filter((c) => c.org === user.org);
    return list.length > 0 ? list : courses;
  }, [courses, user]);

  const categories = useMemo(() => {
    const fromCourses = scoped.map((c) => c.category).filter(Boolean);
    const fromStore = (user ? orgCategories.filter((c) => c.org === user.org) : []).map((c) => c.name);
    return Array.from(new Set([...fromStore, ...fromCourses]));
  }, [scoped, orgCategories, user]);

  const filtered = useMemo(() => {
    return scoped.filter((c) => {
      const matchesSearch = !search.trim() || c.title.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = categoryFilter === "All Categories" || c.category === categoryFilter;
      const price = c.price ?? 0;
      const matchesPrice = priceFilter === "Any Price" || (priceFilter === "Free" ? price === 0 : price > 0);
      return matchesSearch && matchesCategory && matchesPrice;
    });
  }, [scoped, search, categoryFilter, priceFilter]);

  if (!user) return null;

  return (
    <AppShell user={user}>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-text-primary">Course Store</h1>
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Marketplace
              </span>
            </div>
            <p className="text-text-secondary mt-1 text-sm">
              Discover and acquire enterprise learning courses for {user.org}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isLoading}
              className="gap-2 h-9 text-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-primary" : ""}`} />
              <span>{isLoading ? "Syncing..." : "Refresh Store"}</span>
            </Button>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="flex items-center gap-3 flex-wrap rounded-xl border border-surface-border bg-surface-sunken/40 p-3">
          <div className="relative flex-1 min-w-55 sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-tertiary" />
            <Input
              placeholder="Search courses by keyword..."
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

            <Select value={priceFilter} onValueChange={(v) => setPriceFilter(v ?? "Any Price")}>
              <SelectTrigger size="sm" className="w-32 bg-surface-base">
                <SelectValue placeholder="Price" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Any Price">Any Price</SelectItem>
                <SelectItem value="Free">Free</SelectItem>
                <SelectItem value="Paid">Paid</SelectItem>
              </SelectContent>
            </Select>

            {(search || categoryFilter !== "All Categories" || priceFilter !== "Any Price") && (
              <Button
                variant="ghost"
                size="sm"
                className="h-9 gap-1.5 text-text-tertiary hover:text-text-primary"
                onClick={() => {
                  setSearch("");
                  setCategoryFilter("All Categories");
                  setPriceFilter("Any Price");
                }}
              >
                <X className="w-3.5 h-3.5" />
                Clear
              </Button>
            )}
          </div>
        </div>

        {/* Course Grid: Simulated API Loading vs Unified CourseCard */}
        {isLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6].map((idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-surface-border bg-surface-base overflow-hidden p-0 animate-pulse flex flex-col h-full"
              >
                <div className="aspect-video w-full bg-surface-sunken/80" />
                <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="h-3 w-20 bg-surface-sunken rounded" />
                    <div className="h-4 w-full bg-surface-sunken rounded" />
                    <div className="h-3 w-3/4 bg-surface-sunken rounded" />
                  </div>
                  <div className="pt-3 border-t border-surface-border space-y-2">
                    <div className="h-4 w-16 bg-surface-sunken rounded" />
                    <div className="h-9 w-full bg-surface-sunken rounded-lg" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 space-y-3 rounded-2xl border border-dashed border-surface-border bg-surface-base/50 p-6">
            <ShoppingBag className="w-10 h-10 text-text-tertiary mx-auto opacity-50" />
            <h3 className="text-base font-semibold text-text-primary">No courses found</h3>
            <p className="text-sm text-text-tertiary max-w-sm mx-auto">
              No course store listings matched your search criteria. Try clearing the filters or searching for another term.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearch("");
                setCategoryFilter("All Categories");
                setPriceFilter("Any Price");
              }}
            >
              Reset Filters
            </Button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                user={user}
                mode="store"
                href={`/${user.role}/course-store/${course.id}`}
              />
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
