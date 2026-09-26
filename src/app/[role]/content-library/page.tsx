"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useRoleGuard } from "@/lib/hooks/use-role-guard";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useContentLibraryStore, type CuratedCourse } from "@/lib/store/content-library-store";
import { useCoursesStore } from "@/lib/store/courses-store";
import {
  Search,
  CheckCircle2,
  Clock,
  BookOpen,
  ShieldCheck,
  Sparkles,
  Download,
  ArrowRight,
} from "lucide-react";

export default function ContentLibraryPage() {
  const params = useParams<{ role: string }>();
  const router = useRouter();
  const user = useRoleGuard(params.role);

  const libraryCourses = useContentLibraryStore((s) => s.courses);
  const importLibraryCourse = useContentLibraryStore((s) => s.importCourse);
  const syncUpdate = useContentLibraryStore((s) => s.syncUpdate);
  const addCourse = useCoursesStore((s) => s.addCourse);
  const courses = useCoursesStore((s) => s.courses);

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [importingId, setImportingId] = useState<string | null>(null);

  const categories = useMemo(() => Array.from(new Set(libraryCourses.map((c) => c.category))), [libraryCourses]);

  const filtered = libraryCourses.filter((c) => {
    const matchesSearch =
      !search.trim() ||
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.description.toLowerCase().includes(search.toLowerCase()) ||
      c.skills.some((s) => s.toLowerCase().includes(search.toLowerCase()));
    const matchesCategory = categoryFilter === "all" || c.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  if (!user) return null;

  // §3.20: Super Admin curates, Org Admin imports — not a general admin/instructor tool.
  const canImport = user.role === "org-admin" || user.role === "super-admin" || user.role === "lms-admin";
  if (!canImport) {
    return (
      <AppShell user={user}>
        <div className="p-6">
          <Card className="border-surface-border shadow-card max-w-lg">
            <CardContent className="p-6 text-sm text-text-secondary">
              Content Library is available to Organization Admins only — courses are curated
              platform-wide and imported into your org's own catalog from here.
            </CardContent>
          </Card>
        </div>
      </AppShell>
    );
  }

  const handleImport = (course: CuratedCourse) => {
    setImportingId(course.id);
    importLibraryCourse(course.id, user.org);

    // If not already in user's organization courses catalog, provision a course copy
    const alreadyExists = courses.some((c) => c.org === user.org && c.title === course.title);
    if (!alreadyExists) {
      addCourse({
        title: course.title,
        type: "course",
        category: course.category,
        department: "Compliance & Training",
        authorId: user.identifier,
        status: "published",
        objectives: [
          "Understand regulatory compliance requirements",
          "Apply incident reporting protocols",
          "Adhere to organizational safety standards",
          "Complete required audit verification",
        ],
        sections: [
          {
            id: `sec-${course.id}-1`,
            title: "Core Modules & Regulatory Foundations",
            lessons: [
              {
                id: `les-${course.id}-1`,
                title: "Introduction & Scope Overview",
                type: "article",
              },
              {
                id: `les-${course.id}-2`,
                title: "Interactive Attestation Case Study",
                type: "video",
              },
            ],
          },
        ],
        org: user.org,
      });
    }

    setTimeout(() => {
      setImportingId(null);
    }, 600);
  };

  return (
    <AppShell user={user}>
      <div className="p-6 space-y-6 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-text-primary">Content Library</h1>
              <Badge variant="outline" className="text-brand-500 border-brand-500/30 gap-1">
                <Sparkles className="w-3 h-3" /> Off-the-Shelf Catalog
              </Badge>
            </div>
            <p className="text-text-secondary mt-1">
              Super-Admin-curated, turnkey compliance and technical courses ready to import into {user.org} (§3.20)
            </p>
          </div>

          <Button
            variant="outline"
            className="gap-2"
            onClick={() => router.push(`/${user.role}/courses`)}
          >
            View {user.org} Catalog
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Filters */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-tertiary" />
            <Input
              placeholder="Search library, skills, compliance..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8"
            />
          </div>

          <Select value={categoryFilter} onValueChange={(v) => setCategoryFilter(v ?? "all")}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Curated Courses Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((course) => {
            const isImported = course.importedOrgs.includes(user.org);
            const isImporting = importingId === course.id;

            return (
              <Card key={course.id} className="border-surface-border shadow-card flex flex-col justify-between">
                <CardHeader className="space-y-2 pb-3">
                  <div className="flex items-center justify-between gap-2">
                    <Badge variant="outline" className="bg-surface-sunken font-mono text-xs">
                      {course.version}
                    </Badge>
                    <Badge
                      variant="outline"
                      className="bg-success/10 text-success border-success/30 text-xs gap-1"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      {course.complianceCert}
                    </Badge>
                  </div>

                  <CardTitle className="text-base font-semibold text-text-primary leading-snug">
                    {course.title}
                  </CardTitle>
                  <CardDescription className="text-xs">
                    {course.category} · Updated {course.lastUpdated}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4 pt-1 flex-1">
                  <p className="text-xs text-text-secondary line-clamp-3 leading-relaxed">
                    {course.description}
                  </p>

                  <div className="flex items-center gap-4 text-xs text-text-tertiary border-t border-surface-border pt-3">
                    <span className="flex items-center gap-1">
                      <BookOpen className="w-3.5 h-3.5" /> {course.lessonsCount} lessons
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> {course.durationHours} hrs
                    </span>
                  </div>

                  {/* Skills tags */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {course.skills.map((skill) => (
                      <span
                        key={skill}
                        className="text-[11px] bg-surface-sunken text-text-secondary px-2 py-0.5 rounded border border-surface-border"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </CardContent>

                <CardFooter className="border-t border-surface-border p-3 bg-surface-sunken/40 flex items-center justify-between gap-2">
                  {isImported ? (
                    <div className="flex items-center justify-between w-full">
                      <span className="flex items-center gap-1 text-xs text-success font-medium">
                        <CheckCircle2 className="w-4 h-4" /> Imported to {user.org}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs gap-1 text-brand-500"
                        onClick={() => syncUpdate(course.id, user.org)}
                      >
                        Check Updates
                      </Button>
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      className="w-full gap-1.5 text-xs"
                      onClick={() => handleImport(course)}
                      disabled={isImporting}
                    >
                      <Download className="w-3.5 h-3.5" />
                      {isImporting ? "Importing..." : `Import into ${user.org}`}
                    </Button>
                  )}
                </CardFooter>
              </Card>
            );
          })}

          {filtered.length === 0 && (
            <div className="col-span-full py-16 text-center text-text-tertiary">
              No off-the-shelf courses match your search criteria.
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
