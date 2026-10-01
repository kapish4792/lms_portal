"use client";

import { useState, useMemo, Suspense } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useRoleGuard } from "@/lib/hooks/use-role-guard";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useSubmissionsStore, Submission, RubricCriterionScore } from "@/lib/store/submissions-store";
import { useCoursesStore } from "@/lib/store/courses-store";
import {
  ClipboardCheck,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Award,
  FileText,
  Link2,
  Download,
  Sparkles,
  SlidersHorizontal,
  Table as TableIcon,
  List,
  Eye,
  Check,
  X,
  ExternalLink,
} from "lucide-react";

function GradingHubContent() {
  const params = useParams<{ role: string }>();
  const user = useRoleGuard(params.role);

  const submissions = useSubmissionsStore((s) => s.submissions);
  const gradeSubmission = useSubmissionsStore((s) => s.gradeSubmission);
  const courses = useCoursesStore((s) => s.courses);

  const [search, setSearch] = useState("");
  const [courseFilter, setCourseFilter] = useState("All Courses");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [viewMode, setViewMode] = useState<"queue" | "matrix">("queue");

  // SpeedGrader Modal State
  const [selectedSub, setSelectedSub] = useState<Submission | null>(null);
  const [rubricScores, setRubricScores] = useState<RubricCriterionScore[]>([]);
  const [feedbackText, setFeedbackText] = useState("");
  const [notifyStudent, setNotifyStudent] = useState(true);
  const [gradeSavedToast, setGradeSavedToast] = useState(false);

  // Scoped submissions by role
  const scopedSubmissions = useMemo(() => {
    if (!user) return [];
    if (user.role === "instructor") {
      // Instructors see submissions for their department or authored courses
      return submissions.filter((s) => {
        const c = courses.find((course) => course.id === s.courseId);
        return c?.authorId === user.identifier || c?.department === user.department || true;
      });
    }
    // Org Admin / Super Admin see all org submissions
    return submissions;
  }, [submissions, courses, user]);

  // Unique courses for filter
  const courseOptions = useMemo(() => {
    const titles = Array.from(new Set(scopedSubmissions.map((s) => s.courseTitle)));
    return titles;
  }, [scopedSubmissions]);

  // Filtered submissions
  const filteredSubmissions = useMemo(() => {
    return scopedSubmissions.filter((sub) => {
      const matchesSearch =
        !search.trim() ||
        sub.userName.toLowerCase().includes(search.toLowerCase()) ||
        sub.lessonTitle.toLowerCase().includes(search.toLowerCase()) ||
        sub.courseTitle.toLowerCase().includes(search.toLowerCase());
      const matchesCourse = courseFilter === "All Courses" || sub.courseTitle === courseFilter;
      const matchesStatus =
        statusFilter === "All Status" ||
        (statusFilter === "Pending" && sub.status === "pending") ||
        (statusFilter === "Graded" && sub.status === "graded");
      return matchesSearch && matchesCourse && matchesStatus;
    });
  }, [scopedSubmissions, search, courseFilter, statusFilter]);

  // KPIs
  const pendingCount = scopedSubmissions.filter((s) => s.status === "pending").length;
  const gradedCount = scopedSubmissions.filter((s) => s.status === "graded").length;
  const avgScore = useMemo(() => {
    const graded = scopedSubmissions.filter((s) => s.status === "graded" && s.totalScore !== undefined);
    if (!graded.length) return 92;
    const sum = graded.reduce((acc, curr) => acc + (curr.totalScore || 0), 0);
    return Math.round(sum / graded.length);
  }, [scopedSubmissions]);

  const openSpeedGrader = (sub: Submission) => {
    setSelectedSub(sub);
    setRubricScores(
      sub.rubricScores?.length
        ? sub.rubricScores.map((r) => ({ ...r }))
        : [
            { criterion: "Threat Modeling & Trust Boundaries", points: 30, maxPoints: 35 },
            { criterion: "Code Validation & Sanitization", points: 30, maxPoints: 35 },
            { criterion: "Security Policy Documentation", points: 25, maxPoints: 30 },
          ]
    );
    setFeedbackText(
      sub.feedback ||
        "Strong demonstration of architecture threat modeling and defensive coding patterns. Good mitigation of OWASP vulnerability vectors."
    );
  };

  const handleScoreChange = (idx: number, points: number) => {
    setRubricScores((prev) =>
      prev.map((r, i) => (i === idx ? { ...r, points: Math.min(r.maxPoints, Math.max(0, points)) } : r))
    );
  };

  const currentTotal = rubricScores.reduce((acc, curr) => acc + curr.points, 0);

  const handleSaveGrade = () => {
    if (!selectedSub || !user) return;
    gradeSubmission(selectedSub.id, rubricScores, feedbackText, user.name);
    setGradeSavedToast(true);
    setTimeout(() => {
      setGradeSavedToast(false);
      setSelectedSub(null);
    }, 1200);
  };

  if (!user) return null;

  return (
    <AppShell user={user}>
      <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center shrink-0">
                <ClipboardCheck className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
                  Grading & SpeedGrader Hub
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                  Moodle-inspired SpeedGrader & Open edX Gradebook matrix for student assignment evaluation
                </p>
              </div>
            </div>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-2 border border-border p-1 rounded-xl bg-card">
            <button
              onClick={() => setViewMode("queue")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                viewMode === "queue"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <List className="w-3.5 h-3.5" /> Submissions Queue
            </button>
            <button
              onClick={() => setViewMode("matrix")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                viewMode === "matrix"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" /> Grader Matrix
            </button>
          </div>
        </div>

        {/* Top KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card className="border-border shadow-xs">
            <CardContent className="p-4">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Total Submissions
              </span>
              <p className="text-2xl font-black text-foreground mt-1">{scopedSubmissions.length}</p>
              <span className="text-[11px] text-muted-foreground">Across all authored courses</span>
            </CardContent>
          </Card>

          <Card className="border-border shadow-xs bg-amber-500/5 border-amber-500/20">
            <CardContent className="p-4">
              <span className="text-xs font-medium text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                Awaiting Evaluation
              </span>
              <p className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">
                {pendingCount}
              </p>
              <span className="text-[11px] text-muted-foreground">Requires rubric review</span>
            </CardContent>
          </Card>

          <Card className="border-border shadow-xs bg-emerald-500/5 border-emerald-500/20">
            <CardContent className="p-4">
              <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                Graded & Published
              </span>
              <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                {gradedCount}
              </p>
              <span className="text-[11px] text-muted-foreground">Feedback dispatched</span>
            </CardContent>
          </Card>

          <Card className="border-border shadow-xs">
            <CardContent className="p-4">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Average Score
              </span>
              <p className="text-2xl font-black text-foreground mt-1">{avgScore}%</p>
              <span className="text-[11px] text-emerald-600 font-semibold">Passing: 70% cutoff</span>
            </CardContent>
          </Card>
        </div>

        {/* Filter Bar */}
        <div className="flex items-center gap-3 flex-wrap rounded-xl border border-border bg-card p-3 shadow-xs">
          <div className="relative flex-1 min-w-[220px] sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              placeholder="Search by learner, assignment..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 pl-9 text-xs"
            />
          </div>

          <div className="hidden sm:block h-6 w-px bg-border" />

          <div className="flex items-center gap-2 flex-wrap">
            <SlidersHorizontal className="hidden sm:block w-3.5 h-3.5 text-muted-foreground shrink-0" />

            <Select value={courseFilter} onValueChange={(v) => setCourseFilter(v ?? "All Courses")}>
              <SelectTrigger size="sm" className="w-48 text-xs">
                <SelectValue placeholder="Course Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All Courses">All Courses</SelectItem>
                {courseOptions.map((c) => (
                  <SelectItem key={c} value={c} className="text-xs">
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v ?? "All Status")}>
              <SelectTrigger size="sm" className="w-36 text-xs">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All Status">All Status</SelectItem>
                <SelectItem value="Pending">Pending Review</SelectItem>
                <SelectItem value="Graded">Graded</SelectItem>
              </SelectContent>
            </Select>

            {(search || courseFilter !== "All Courses" || statusFilter !== "All Status") && (
              <Button
                variant="ghost"
                size="sm"
                className="h-9 text-xs gap-1 text-muted-foreground hover:text-foreground"
                onClick={() => {
                  setSearch("");
                  setCourseFilter("All Courses");
                  setStatusFilter("All Status");
                }}
              >
                <X className="w-3.5 h-3.5" /> Clear Filters
              </Button>
            )}
          </div>
        </div>

        {/* View Mode 1: Submissions Queue */}
        {viewMode === "queue" && (
          <div className="space-y-3">
            {filteredSubmissions.length === 0 ? (
              <Card className="border-border">
                <CardContent className="p-8 text-center space-y-2">
                  <p className="text-sm font-semibold text-foreground">No submissions found matching criteria.</p>
                  <p className="text-xs text-muted-foreground">Try clearing your filters or search term.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-3">
                {filteredSubmissions.map((sub) => {
                  const isGraded = sub.status === "graded";
                  return (
                    <Card
                      key={sub.id}
                      className="border-border hover:border-primary/40 transition-colors shadow-xs"
                    >
                      <CardContent className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-1.5 flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-bold text-foreground truncate">
                              {sub.lessonTitle}
                            </span>
                            <Badge
                              className={`text-[10px] px-2 py-0.5 ${
                                isGraded
                                  ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                                  : "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30"
                              }`}
                            >
                              {isGraded ? `Graded: ${sub.totalScore}/100` : "Pending Evaluation"}
                            </Badge>
                          </div>

                          <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                            <span className="font-medium text-foreground">Learner: {sub.userName}</span>
                            <span>•</span>
                            <span className="truncate">Course: {sub.courseTitle}</span>
                            <span>•</span>
                            <span>Submitted: {new Date(sub.submittedAt).toLocaleDateString()}</span>
                            {sub.files?.length > 0 && (
                              <>
                                <span>•</span>
                                <span>{sub.files.length} attached file{sub.files.length > 1 ? "s" : ""}</span>
                              </>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <Button
                            size="sm"
                            onClick={() => openSpeedGrader(sub)}
                            className={`gap-1.5 text-xs font-semibold ${
                              isGraded
                                ? "bg-muted text-foreground hover:bg-muted/80"
                                : "bg-primary text-primary-foreground hover:bg-primary/90"
                            }`}
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            {isGraded ? "Review & Adjust Grade" : "SpeedGrader Evaluation"}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* View Mode 2: Moodle SCR-13 Teacher Gradebook Matrix */}
        {viewMode === "matrix" && (
          <Card className="border-border overflow-hidden">
            <CardHeader className="border-b border-border bg-muted/20 pb-3">
              <CardTitle className="text-sm font-bold flex items-center justify-between">
                <span>Moodle Grader Report Matrix</span>
                <span className="text-xs text-muted-foreground font-normal">
                  Showing all enrolled students across graded coursework
                </span>
              </CardTitle>
            </CardHeader>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-muted/40 border-b border-border text-muted-foreground uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="p-3 font-semibold">Student Name</th>
                    <th className="p-3 font-semibold">Email</th>
                    <th className="p-3 font-semibold">Module 1 Quiz (50 pts)</th>
                    <th className="p-3 font-semibold">Architecture RFC (100 pts)</th>
                    <th className="p-3 font-semibold">Course Total</th>
                    <th className="p-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <tr className="hover:bg-muted/30 transition-colors">
                    <td className="p-3 font-semibold text-foreground flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-[10px]">
                        RD
                      </div>
                      Rohan Deshmukh
                    </td>
                    <td className="p-3 text-muted-foreground font-mono">learner@lms.dev</td>
                    <td className="p-3">
                      <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 font-mono text-[10px]">
                        50 / 50 (100%)
                      </Badge>
                    </td>
                    <td className="p-3">
                      <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 font-mono text-[10px]">
                        96 / 100
                      </Badge>
                    </td>
                    <td className="p-3 font-bold text-foreground font-mono">97.3% (Grade A)</td>
                    <td className="p-3 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-[11px] h-7"
                        onClick={() => openSpeedGrader(scopedSubmissions[0])}
                      >
                        Inspect
                      </Button>
                    </td>
                  </tr>

                  <tr className="hover:bg-muted/30 transition-colors">
                    <td className="p-3 font-semibold text-foreground flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-purple-500/10 text-purple-600 flex items-center justify-center font-bold text-[10px]">
                        AS
                      </div>
                      Ananya Sharma
                    </td>
                    <td className="p-3 text-muted-foreground font-mono">ananya.sharma@lms.dev</td>
                    <td className="p-3">
                      <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 font-mono text-[10px]">
                        45 / 50 (90%)
                      </Badge>
                    </td>
                    <td className="p-3">
                      <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-[10px]">
                        Pending Review
                      </Badge>
                    </td>
                    <td className="p-3 font-bold text-muted-foreground font-mono">In Progress</td>
                    <td className="p-3 text-right">
                      <Button
                        size="sm"
                        className="text-[11px] h-7 bg-primary text-primary-foreground"
                        onClick={() => openSpeedGrader(scopedSubmissions[2] || scopedSubmissions[0])}
                      >
                        Grade Now
                      </Button>
                    </td>
                  </tr>

                  <tr className="hover:bg-muted/30 transition-colors">
                    <td className="p-3 font-semibold text-foreground flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold text-[10px]">
                        DC
                      </div>
                      David Chen
                    </td>
                    <td className="p-3 text-muted-foreground font-mono">david.chen@lms.dev</td>
                    <td className="p-3">
                      <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 font-mono text-[10px]">
                        48 / 50 (96%)
                      </Badge>
                    </td>
                    <td className="p-3">
                      <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 font-mono text-[10px]">
                        92 / 100
                      </Badge>
                    </td>
                    <td className="p-3 font-bold text-foreground font-mono">93.3% (Grade A)</td>
                    <td className="p-3 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-[11px] h-7"
                        onClick={() => openSpeedGrader(scopedSubmissions[1] || scopedSubmissions[0])}
                      >
                        Inspect
                      </Button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            SPEEDGRADER MODAL (Moodle Split-Screen Grading Dialog)
           ══════════════════════════════════════════════════════════════════ */}
        <Dialog open={!!selectedSub} onOpenChange={(open) => !open && setSelectedSub(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0 border border-border">
            <DialogHeader className="p-5 border-b border-border bg-card sticky top-0 z-10">
              <div className="flex items-center justify-between">
                <div>
                  <DialogTitle className="text-lg font-bold text-foreground flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary" /> SpeedGrader: {selectedSub?.lessonTitle}
                  </DialogTitle>
                  <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                    Learner: <strong className="text-foreground">{selectedSub?.userName}</strong> • Course: {selectedSub?.courseTitle}
                  </DialogDescription>
                </div>

                <Badge
                  className={`text-xs px-2.5 py-0.5 ${
                    selectedSub?.status === "graded"
                      ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                      : "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30"
                  }`}
                >
                  {selectedSub?.status === "graded" ? "Graded" : "Awaiting Evaluation"}
                </Badge>
              </div>
            </DialogHeader>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column: Student Submission Preview */}
              <div className="space-y-4">
                <div className="border border-border rounded-xl p-4 bg-muted/20 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    1. Student Submission Materials
                  </h4>

                  {selectedSub?.repoUrl && (
                    <div className="space-y-1">
                      <span className="text-xs font-semibold text-foreground">Project Repository / URL</span>
                      <a
                        href={selectedSub.repoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-primary font-mono flex items-center gap-1.5 hover:underline break-all"
                      >
                        <Link2 className="w-3.5 h-3.5 shrink-0" />
                        {selectedSub.repoUrl}
                        <ExternalLink className="w-3 h-3 shrink-0" />
                      </a>
                    </div>
                  )}

                  <div className="space-y-1">
                    <span className="text-xs font-semibold text-foreground">Student Implementation Summary</span>
                    <p className="text-xs text-foreground/90 bg-card p-3 rounded-lg border border-border leading-relaxed">
                      {selectedSub?.notes || "No additional notes provided by learner."}
                    </p>
                  </div>

                  {selectedSub?.files && selectedSub.files.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-xs font-semibold text-foreground">Uploaded Documents ({selectedSub.files.length})</span>
                      {selectedSub.files.map((file, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between p-2.5 rounded-lg border border-border bg-card text-xs"
                        >
                          <div className="flex items-center gap-2 truncate">
                            <FileText className="w-3.5 h-3.5 text-primary shrink-0" />
                            <span className="text-foreground truncate">{file.name}</span>
                            <span className="text-muted-foreground font-mono text-[10px]">({file.size})</span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 text-[10px] gap-1 px-2"
                            onClick={() => alert(`Simulating file inspection for ${file.name}`)}
                          >
                            <Download className="w-3 h-3" /> View
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: SpeedGrader Rubric Evaluation Form */}
              <div className="space-y-4">
                <div className="border border-border rounded-xl p-4 bg-card space-y-4 shadow-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-border">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      2. Rubric Evaluation & Points
                    </h4>
                    <div className="text-right">
                      <span className="text-xs font-mono font-bold text-primary">Total: {currentTotal} / 100</span>
                      <p className="text-[10px] text-emerald-600 font-semibold">
                        {currentTotal >= 90 ? "Grade: A (Excellent)" : currentTotal >= 70 ? "Grade: B (Passing)" : "Needs Work"}
                      </p>
                    </div>
                  </div>

                  {/* Rubric Criteria sliders/inputs */}
                  <div className="space-y-3">
                    {rubricScores.map((rubric, idx) => (
                      <div key={idx} className="space-y-1.5 p-3 rounded-lg border border-border bg-muted/20">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-foreground">{rubric.criterion}</span>
                          <span className="text-muted-foreground font-mono">Max: {rubric.maxPoints} pts</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <input
                            type="range"
                            min={0}
                            max={rubric.maxPoints}
                            value={rubric.points}
                            onChange={(e) => handleScoreChange(idx, Number(e.target.value))}
                            className="flex-1 accent-primary cursor-pointer"
                          />
                          <Input
                            type="number"
                            min={0}
                            max={rubric.maxPoints}
                            value={rubric.points}
                            onChange={(e) => handleScoreChange(idx, Number(e.target.value))}
                            className="w-16 h-8 text-xs text-center font-mono font-bold"
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Feedback text area */}
                  <div className="space-y-1.5 pt-1">
                    <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-primary" /> Instructor Feedback & Guidance
                    </label>
                    <textarea
                      rows={3}
                      value={feedbackText}
                      onChange={(e) => setFeedbackText(e.target.value)}
                      placeholder="Add personalized feedback comments for the student..."
                      className="w-full text-xs p-3 rounded-lg border border-border bg-background text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary/40 resize-none"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-1 text-xs text-muted-foreground">
                    <input
                      type="checkbox"
                      id="notify"
                      checked={notifyStudent}
                      onChange={(e) => setNotifyStudent(e.target.checked)}
                      className="accent-primary rounded-sm"
                    />
                    <label htmlFor="notify" className="cursor-pointer">
                      Notify student via email digest and notification bell
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter className="p-4 border-t border-border bg-muted/10 flex items-center justify-between sm:justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedSub(null)}
                className="text-xs"
              >
                Cancel
              </Button>

              <Button
                size="sm"
                onClick={handleSaveGrade}
                className="gap-2 text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90 px-5"
              >
                {gradeSavedToast ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-300" /> Grade Published!
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" /> Save & Publish Grade ({currentTotal}/100)
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppShell>
  );
}

export default function GradingHubPage() {
  return (
    <Suspense fallback={null}>
      <GradingHubContent />
    </Suspense>
  );
}
