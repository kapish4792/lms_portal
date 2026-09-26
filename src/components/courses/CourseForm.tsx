"use client";

import { useState, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MultiSelect } from "@/components/ui/multi-select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useCoursesStore } from "@/lib/store/courses-store";
import { useCategoriesStore } from "@/lib/store/categories-store";
import type { Course, CourseType, Lesson, LessonType, Section } from "@/lib/store/courses-store";
import type { MockUser } from "@/lib/mock/users";
import {
  Check,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Video,
  HelpCircle,
  FileText,
  ClipboardList,
  Code2,
  X,
  Upload,
  Image as ImageIcon,
  Sparkles,
  BookOpen,
  GraduationCap,
  Clock,
  Layers,
  Pencil,
  CheckCircle2,
  FolderDown,
  Sliders,
  AlertCircle,
  Film,
  FileCode,
  Tv,
  Link2,
  HardDrive,
  Terminal,
  ShieldCheck,
  Cpu,
  Info,
} from "lucide-react";

const FALLBACK_CATEGORIES = [
  "Compliance",
  "Technical Skills",
  "Cloud Architecture",
  "Cybersecurity",
  "Leadership",
  "Engineering",
  "Sales Enablement",
  "Onboarding",
  "AI & Data",
];

const PRESET_COVERS = [
  {
    name: "Cybersecurity",
    url: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1200&auto=format&fit=crop&q=80",
  },
  {
    name: "Cloud Architecture",
    url: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&auto=format&fit=crop&q=80",
  },
  {
    name: "Full Stack Dev",
    url: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&auto=format&fit=crop&q=80",
  },
  {
    name: "Leadership & Strategy",
    url: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&auto=format&fit=crop&q=80",
  },
];

const LESSON_ICONS: Record<LessonType, typeof Video> = {
  video: Video,
  quiz: HelpCircle,
  assignment: ClipboardList,
  article: FileText,
  coding: Code2,
};

const SAMPLE_VIDEO = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";

let idCounter = 0;
const nextId = (prefix: string) => `${prefix}-${Date.now()}-${idCounter++}`;

export function CourseForm({ user, existing }: { user: MockUser; existing?: Course }) {
  const router = useRouter();
  const addCourse = useCoursesStore((s) => s.addCourse);
  const updateCourse = useCoursesStore((s) => s.updateCourse);
  const categories = useCategoriesStore((s) => s.categories);
  const addCategory = useCategoriesStore((s) => s.addCategory);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoFileInputRef = useRef<HTMLInputElement>(null);

  const categoryOptions = useMemo(() => {
    const list = categories.filter((c) => c.org === user.org).map((c) => c.name);
    return list.length > 0 ? list : FALLBACK_CATEGORIES;
  }, [categories, user.org]);

  const initialCategories = useMemo(() => {
    if (existing?.categories && existing.categories.length > 0) {
      return existing.categories;
    }
    if (existing?.category) {
      return existing.category.split(",").map((s) => s.trim()).filter(Boolean);
    }
    return [];
  }, [existing]);

  // Form State
  const [title, setTitle] = useState(existing?.title ?? "");
  const [type, setType] = useState<CourseType>(existing?.type ?? "course");
  const [selectedCategories, setSelectedCategories] = useState<string[]>(initialCategories);
  const [objectives, setObjectives] = useState<string[]>(
    existing?.objectives && existing.objectives.length > 0
      ? existing.objectives
      : [
          "Understand core architectural principles and internal security guidelines",
          "Deploy reliable services with automated testing and continuous integration",
          "Diagnose production telemetry and resolve latency bottlenecks",
        ]
  );
  const [coverImage, setCoverImage] = useState<string | undefined>(existing?.coverImage);
  const [sections, setSections] = useState<Section[]>(
    existing?.sections && existing.sections.length > 0
      ? existing.sections
      : [
          {
            id: nextId("s"),
            title: "Getting Started & Foundations",
            lessons: [
              {
                id: nextId("l"),
                title: "Welcome & Architecture Overview",
                type: "video",
                videoUrl: SAMPLE_VIDEO,
                duration: "8 min",
              },
            ],
          },
        ]
  );

  // Curriculum Builder Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [targetSectionId, setTargetSectionId] = useState<string | null>(null);
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null);

  // Modal Draft Lesson State
  const [modalLessonType, setModalLessonType] = useState<LessonType>("video");
  const [modalLessonTitle, setModalLessonTitle] = useState("");
  const [modalDuration, setModalDuration] = useState("10 min");

  // Video Draft State (YouTube Link or Local Video File)
  const [modalVideoSourceType, setModalVideoSourceType] = useState<"youtube" | "local">("youtube");
  const [modalVideoUrl, setModalVideoUrl] = useState("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
  const [modalLocalVideoFileName, setModalLocalVideoFileName] = useState<string | null>(null);

  // Quiz Draft State (Unlimited Questions)
  const [modalQuizPassing, setModalQuizPassing] = useState(70);
  const [modalQuizQuestions, setModalQuizQuestions] = useState<
    { prompt: string; options: string[]; correctIndex: number; explanation: string }[]
  >([
    {
      prompt: "What is the primary standard regarding data classification and handling under Acme Corp's compliance policy?",
      options: [
        "Store all data in unencrypted public cloud storage for faster team accessibility",
        "Classify and encrypt all Confidential and PII data both at rest and in transit",
        "Commit API secrets directly to source control if the repository is private",
        "Disable security auditing logs in pre-production staging environments",
      ],
      correctIndex: 1,
      explanation: "All Confidential and Personally Identifiable Information (PII) must be encrypted both at rest (AES-256) and in transit (TLS 1.3).",
    },
    {
      prompt: "Which HTTP header is essential for mitigating Cross-Site Scripting (XSS) and data injection vulnerabilities?",
      options: [
        "Content-Security-Policy (CSP)",
        "Access-Control-Allow-Origin: *",
        "X-Powered-By: Next.js",
        "Cache-Control: public, max-age=3600",
      ],
      correctIndex: 0,
      explanation: "Content-Security-Policy (CSP) restricts unauthorized scripts and execution sources from loading.",
    },
  ]);

  // Assignment Draft State (Unlimited Rubric Items)
  const [modalAssignmentInstructions, setModalAssignmentInstructions] = useState(
    "Implement a comprehensive threat modeling report and automated token validation security test suite. Submit your repository link or bundled archive."
  );
  const [modalAssignmentSubmissionType, setModalAssignmentSubmissionType] = useState<"file" | "github" | "both">("both");
  const [modalAssignmentRubrics, setModalAssignmentRubrics] = useState<
    { criterion: string; points: number }[]
  >([
    { criterion: "Threat Modeling & Trust Boundary Coverage", points: 35 },
    { criterion: "Sanitization Routines & Unit Test Suite", points: 35 },
    { criterion: "Audit Logging & Zero-Leakage Verification", points: 30 },
  ]);

  // Coding Exercise Draft State (Language, Starter Code, and Test Cases)
  const [modalCodingLanguage, setModalCodingLanguage] = useState("typescript");
  const [modalCodingStarter, setModalCodingStarter] = useState(
    `/**\n * Sanitizes and validates internal authorization tokens.\n */\nexport function sanitizeToken(token: string) {\n  if (!token || typeof token !== "string") {\n    return { valid: false, cleanToken: "", error: "Token is required" };\n  }\n  const clean = token.replace(/<[^>]*>?/gm, "").trim();\n  if (!clean.startsWith("lms_tok_")) {\n    return { valid: false, cleanToken: clean, error: "Missing required lms_tok_ prefix" };\n  }\n  return { valid: true, cleanToken: clean };\n}`
  );
  const [modalCodingInstructions, setModalCodingInstructions] = useState(
    "Write a TypeScript function that validates authorization token format, strips HTML injection tags, and enforces mandatory 'lms_tok_' prefix."
  );
  const [modalCodingTestCases, setModalCodingTestCases] = useState<
    { name: string; input: string; expected: string }[]
  >([
    {
      name: "Valid Token with lms_tok_ prefix",
      input: '"lms_tok_production_sec_99182"',
      expected: '{ valid: true, cleanToken: "lms_tok_production_sec_99182" }',
    },
    {
      name: "Sanitize XSS script tag injection",
      input: '"lms_tok_<script>alert(1)</script>auth12345"',
      expected: '{ valid: true, cleanToken: "lms_tok_auth12345" }',
    },
    {
      name: "Reject token without required prefix",
      input: '"user_secret_token_123456"',
      expected: '{ valid: false, error: "Missing required lms_tok_ prefix" }',
    },
  ]);

  // Article Draft State
  const [modalArticleBody, setModalArticleBody] = useState(
    "## Enterprise Cloud Architecture Foundations\n\nIn this reading module, we explore the core principles of defense-in-depth, zero-trust infrastructure, and least-privilege identity access management across distributed microservices.\n\n### Core Pillars\n1. **Zero-Trust Networking**: Verify every request explicitly.\n2. **Least Privilege**: Grant minimal role boundaries.\n3. **Structured Telemetry**: Log audit events securely."
  );

  // Category Helpers & Creation (Org-Admin & Manager)
  const canCreateCategory = ["org-admin", "manager", "super-admin", "lms-admin", "dept-head"].includes(user.role);
  const [newCatName, setNewCatName] = useState("");
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [catError, setCatError] = useState("");


  const handleCreateCategory = () => {
    const trimmed = newCatName.trim();
    if (!trimmed) {
      setCatError("Please enter a category name");
      return;
    }
    if (categoryOptions.some((c) => c.toLowerCase() === trimmed.toLowerCase())) {
      setCatError("A category with this name already exists");
      return;
    }
    addCategory({
      name: trimmed,
      org: user.org,
      color: "var(--primary)",
    });
    setSelectedCategories((prev) => (prev.includes(trimmed) ? prev : [...prev, trimmed]));
    setNewCatName("");
    setCatError("");
    setIsAddingCategory(false);
  };

  // Intended Learners Handlers
  const addObjective = () => {
    setObjectives((prev) => [...prev, ""]);
  };

  const removeObjective = (index: number) => {
    if (objectives.length <= 1) return;
    setObjectives((prev) => prev.filter((_, i) => i !== index));
  };

  const updateObjective = (index: number, val: string) => {
    setObjectives((prev) => prev.map((o, i) => (i === index ? val : o)));
  };

  // Cover Image Handlers
  const handleCoverUpload = (file: File | undefined) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setCoverImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  // Local Video Upload Handler
  const handleVideoFileUpload = (file: File | undefined) => {
    if (!file) return;
    const objectUrl = URL.createObjectURL(file);
    setModalVideoUrl(objectUrl);
    setModalLocalVideoFileName(`${file.name} (${(file.size / (1024 * 1024)).toFixed(1)} MB)`);
  };

  // Section Management
  const addSection = () =>
    setSections((prev) => [
      ...prev,
      { id: nextId("s"), title: `Section ${prev.length + 1}: Module Topics`, lessons: [] },
    ]);

  const removeSection = (id: string) => setSections((prev) => prev.filter((s) => s.id !== id));

  const renameSection = (id: string, val: string) =>
    setSections((prev) => prev.map((s) => (s.id === id ? { ...s, title: val } : s)));

  const moveSection = (index: number, dir: -1 | 1) =>
    setSections((prev) => {
      const next = [...prev];
      const target = index + dir;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });

  const removeLesson = (sectionId: string, lessonId: string) =>
    setSections((prev) =>
      prev.map((s) =>
        s.id === sectionId ? { ...s, lessons: s.lessons.filter((l) => l.id !== lessonId) } : s
      )
    );

  // Modal Open Handlers
  const openAddLessonModal = (sectionId: string, preselectedType: LessonType = "video") => {
    setTargetSectionId(sectionId);
    setEditingLessonId(null);
    setModalLessonType(preselectedType);
    setModalLessonTitle(`New ${preselectedType.charAt(0).toUpperCase() + preselectedType.slice(1)} Module`);
    setModalDuration("10 min");
    setModalVideoUrl(SAMPLE_VIDEO);
    setModalVideoSourceType("youtube");
    setModalLocalVideoFileName(null);
    setModalOpen(true);
  };

  const openEditLessonModal = (sectionId: string, lesson: Lesson) => {
    setTargetSectionId(sectionId);
    setEditingLessonId(lesson.id);
    setModalLessonType(lesson.type);
    setModalLessonTitle(lesson.title);
    setModalDuration(lesson.duration || "10 min");
    setModalVideoUrl(lesson.videoUrl || SAMPLE_VIDEO);
    if (lesson.videoUrl?.startsWith("blob:") || lesson.videoUrl?.startsWith("data:")) {
      setModalVideoSourceType("local");
    } else {
      setModalVideoSourceType("youtube");
    }
    setModalLocalVideoFileName(null);

    if (lesson.quizData?.questions && lesson.quizData.questions.length > 0) {
      setModalQuizQuestions(lesson.quizData.questions as any);
      setModalQuizPassing(lesson.quizData.passingScore ?? 70);
    }
    if (lesson.assignmentData) {
      setModalAssignmentInstructions(lesson.assignmentData.instructions ?? modalAssignmentInstructions);
      if (lesson.assignmentData.rubric && lesson.assignmentData.rubric.length > 0) {
        setModalAssignmentRubrics(lesson.assignmentData.rubric);
      }
      setModalAssignmentSubmissionType(lesson.assignmentData.submissionType ?? "both");
    }
    if (lesson.codingData) {
      setModalCodingLanguage(lesson.codingData.language ?? "typescript");
      setModalCodingStarter(lesson.codingData.starterCode ?? modalCodingStarter);
      setModalCodingInstructions(lesson.codingData.instructions ?? modalCodingInstructions);
      if (lesson.codingData.testCases && lesson.codingData.testCases.length > 0) {
        setModalCodingTestCases(
          lesson.codingData.testCases.map((t, idx) => ({
            name: (t as any).name || `Test Case #${idx + 1}`,
            input: t.input,
            expected: t.expected,
          }))
        );
      }
    }
    if (lesson.articleData) {
      setModalArticleBody(lesson.articleData.body ?? modalArticleBody);
    }
    setModalOpen(true);
  };

  // Quiz Question Builder Handlers
  const addQuizQuestion = () => {
    setModalQuizQuestions((prev) => [
      ...prev,
      {
        prompt: `New Question #${prev.length + 1}`,
        options: ["Option A", "Option B", "Option C", "Option D"],
        correctIndex: 0,
        explanation: "Provide explanation for correct answer...",
      },
    ]);
  };

  const removeQuizQuestion = (qIndex: number) => {
    if (modalQuizQuestions.length <= 1) return;
    setModalQuizQuestions((prev) => prev.filter((_, i) => i !== qIndex));
  };

  const addQuizOption = (qIndex: number) => {
    setModalQuizQuestions((prev) =>
      prev.map((q, idx) =>
        idx === qIndex ? { ...q, options: [...q.options, `Option ${q.options.length + 1}`] } : q
      )
    );
  };

  const removeQuizOption = (qIndex: number, optIndex: number) => {
    setModalQuizQuestions((prev) =>
      prev.map((q, idx) => {
        if (idx !== qIndex || q.options.length <= 2) return q;
        const newOpts = q.options.filter((_, i) => i !== optIndex);
        const newCorrect = q.correctIndex >= newOpts.length ? 0 : q.correctIndex;
        return { ...q, options: newOpts, correctIndex: newCorrect };
      })
    );
  };

  // Assignment Rubric Builder Handlers
  const addAssignmentRubric = () => {
    setModalAssignmentRubrics((prev) => [
      ...prev,
      { criterion: `Evaluation Criterion #${prev.length + 1}`, points: 25 },
    ]);
  };

  const removeAssignmentRubric = (rIndex: number) => {
    if (modalAssignmentRubrics.length <= 1) return;
    setModalAssignmentRubrics((prev) => prev.filter((_, i) => i !== rIndex));
  };

  // Coding Test Cases Builder Handlers
  const addCodingTestCase = () => {
    setModalCodingTestCases((prev) => [
      ...prev,
      {
        name: `Test Case #${prev.length + 1}`,
        input: `"sample_input_${prev.length + 1}"`,
        expected: '{ valid: true }',
      },
    ]);
  };

  const removeCodingTestCase = (tIndex: number) => {
    if (modalCodingTestCases.length <= 1) return;
    setModalCodingTestCases((prev) => prev.filter((_, i) => i !== tIndex));
  };

  const handleSaveLessonModal = () => {
    if (!targetSectionId) return;

    const payload: Lesson = {
      id: editingLessonId || nextId("l"),
      title: modalLessonTitle.trim() || `Untitled ${modalLessonType}`,
      type: modalLessonType,
      duration: modalDuration,
      videoUrl: modalLessonType === "video" ? modalVideoUrl : undefined,
      quizData:
        modalLessonType === "quiz"
          ? {
              passingScore: modalQuizPassing,
              questions: modalQuizQuestions,
            }
          : undefined,
      assignmentData:
        modalLessonType === "assignment"
          ? {
              instructions: modalAssignmentInstructions,
              rubric: modalAssignmentRubrics,
              submissionType: modalAssignmentSubmissionType,
            }
          : undefined,
      codingData:
        modalLessonType === "coding"
          ? {
              language: modalCodingLanguage,
              starterCode: modalCodingStarter,
              instructions: modalCodingInstructions,
              testCases: modalCodingTestCases.map((tc) => ({
                input: tc.input,
                expected: tc.expected,
              })),
            }
          : undefined,
      articleData:
        modalLessonType === "article"
          ? {
              body: modalArticleBody,
              estimatedReadTime: modalDuration,
            }
          : undefined,
    };

    setSections((prev) =>
      prev.map((sec) => {
        if (sec.id !== targetSectionId) return sec;
        if (editingLessonId) {
          return {
            ...sec,
            lessons: sec.lessons.map((l) => (l.id === editingLessonId ? payload : l)),
          };
        } else {
          return {
            ...sec,
            lessons: [...sec.lessons, payload],
          };
        }
      })
    );

    setModalOpen(false);
  };

  // Checklist computation
  const titleComplete = title.trim().length > 0;
  const categoryComplete = selectedCategories.length > 0;
  const objectivesComplete = objectives.filter((o) => o.trim().length > 0).length >= 2;
  const curriculumComplete = sections.length > 0 && sections.some((s) => s.lessons.length > 0);
  const coverComplete = !!coverImage;
  const totalLessons = sections.reduce((acc, s) => acc + s.lessons.length, 0);

  const checklist = [
    { label: "Course format & type", done: true },
    { label: "Working title", done: titleComplete },
    { label: "Categories selected", done: categoryComplete },
    { label: "Learning objectives (min 2)", done: objectivesComplete },
    { label: "Cover image preview", done: coverComplete },
    { label: `Curriculum (${totalLessons} lectures)`, done: curriculumComplete },
  ];

  const handleSave = (status: "draft" | "published") => {
    const payload = {
      title: title.trim() || "Untitled course",
      type,
      category: selectedCategories.join(", ") || "Technical Skills",
      categories: selectedCategories.length > 0 ? selectedCategories : ["Technical Skills"],
      department: user.department,
      org: user.org,
      authorId: user.identifier,
      objectives: objectives.filter((o) => o.trim().length > 0),
      coverImage,
      status,
      sections,
    };

    if (existing) {
      updateCourse(existing.id, payload);
      router.push(`/${user.role}/courses/${existing.id}`);
    } else {
      const id = addCourse(payload);
      router.push(`/${user.role}/courses/${id}`);
    }
  };

  return (
    <div className="w-full grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6 items-start">
      {/* Main Authoring Form Column */}
      <div className="space-y-6 min-w-0">
        {/* 1. COURSE TYPE CARD */}
        <Card className="border-border bg-card shadow-xs">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-primary" /> Course Type & Format
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Choose the learning experience format for your enterprise students.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {[
              {
                id: "course",
                title: "Complete Curriculum Course",
                desc: "Full learning path with video streaming, coding challenges, quizzes & assignments.",
                icon: Layers,
              },
              {
                id: "practice-test",
                title: "Practice & Assessment Exam",
                desc: "Certification simulation mode focusing on rigorous timed question banks.",
                icon: Sparkles,
              },
            ].map((t) => {
              const Icon = t.icon;
              const isSelected = type === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setType(t.id as CourseType)}
                  className={`flex items-start gap-3 rounded-xl border p-4 text-left transition-all ${
                    isSelected
                      ? "border-primary bg-primary/5 text-foreground shadow-xs ring-1 ring-primary"
                      : "border-border text-muted-foreground hover:border-primary/40 hover:bg-muted/40"
                  }`}
                >
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                      isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-sm font-bold text-foreground block">{t.title}</span>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{t.desc}</p>
                  </div>
                </button>
              );
            })}
          </CardContent>
        </Card>

        {/* 2. WORKING TITLE */}
        <Card className="border-border bg-card shadow-xs">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
              <Pencil className="w-4 h-4 text-primary" /> Course Title
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              A clear and compelling title helps colleagues identify relevant knowledge quickly.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Input
              value={title}
              maxLength={80}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Enterprise Cloud Security: Zero-Trust & Defense-in-Depth"
              className="text-sm font-medium bg-background border-border h-10"
            />
            <div className="flex items-center justify-between text-[11px] text-muted-foreground px-0.5">
              <span>Recommended: 30–60 characters for best readability</span>
              <span className="font-mono">{title.length}/80</span>
            </div>
          </CardContent>
        </Card>

        {/* 3. COURSE CATEGORIES (Single non-duplicated pill display) */}
        <Card className="border-border bg-card shadow-xs">
          <CardHeader className="pb-3 flex flex-row items-start justify-between">
            <div>
              <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
                <Sliders className="w-4 h-4 text-primary" /> Course Categories
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground mt-0.5">
                Assign domain tags for filtering, skill matrices, and team assignments.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {selectedCategories.length > 0 && (
                <Badge variant="secondary" className="text-xs font-semibold">
                  {selectedCategories.length} selected
                </Badge>
              )}
              {canCreateCategory && !isAddingCategory && (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => setIsAddingCategory(true)}
                  className="gap-1.5 text-xs border-border hover:bg-muted"
                >
                  <Plus className="w-3.5 h-3.5 text-primary" /> Create Category
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Inline Category Creation for Org-Admin & Manager */}
            {canCreateCategory && isAddingCategory && (
              <div className="p-3.5 rounded-xl border border-primary/30 bg-primary/5 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <Plus className="w-3.5 h-3.5 text-primary" /> Create New Category for {user.org}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingCategory(false);
                      setNewCatName("");
                      setCatError("");
                    }}
                    className="text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    value={newCatName}
                    onChange={(e) => {
                      setNewCatName(e.target.value);
                      if (catError) setCatError("");
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleCreateCategory();
                      }
                    }}
                    placeholder="e.g. Artificial Intelligence, Cloud Security, DevOps"
                    className="bg-background border-border text-xs h-9 flex-1"
                    autoFocus
                  />
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleCreateCategory}
                    className="bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-semibold h-9 px-4 cursor-pointer"
                  >
                    Save & Select
                  </Button>
                </div>
                {catError && <p className="text-[11px] text-destructive font-medium">{catError}</p>}
              </div>
            )}

            {/* Searchable Multi-Select Category Input Box */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground/80">
                Select Categories
              </label>
              <MultiSelect
                options={categoryOptions}
                value={selectedCategories}
                onValueChange={setSelectedCategories}
                placeholder="Search and select categories..."
                searchPlaceholder="Type to search or create category..."
                searchable={true}
                onCreateOption={
                  canCreateCategory
                    ? (catName) => {
                        const trimmed = catName.trim();
                        if (!trimmed) return;
                        if (!categoryOptions.some((c) => c.toLowerCase() === trimmed.toLowerCase())) {
                          addCategory({
                            name: trimmed,
                            org: user.org,
                            color: "var(--primary)",
                          });
                        }
                        setSelectedCategories((prev) => (prev.includes(trimmed) ? prev : [...prev, trimmed]));
                      }
                    : undefined
                }
              />
              <p className="text-[11px] text-muted-foreground">
                Search and select one or more categories for this course.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* 4. INTENDED LEARNERS (Dynamic + Button Add/Remove) */}
        <Card className="border-border bg-card shadow-xs">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-primary" /> Intended Learners & Learning Objectives
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground mt-0.5">
                What key skills and competencies will students master by the end of this course?
              </CardDescription>
            </div>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={addObjective}
              className="gap-1.5 text-xs border-border hover:bg-muted"
            >
              <Plus className="w-3.5 h-3.5 text-primary" /> Add Objective
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {objectives.map((obj, i) => (
              <div key={i} className="flex items-center gap-2 group">
                <span className="w-7 h-7 rounded-lg bg-muted border border-border text-[11px] font-mono font-bold flex items-center justify-center shrink-0 text-muted-foreground">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <Input
                  value={obj}
                  onChange={(e) => updateObjective(i, e.target.value)}
                  placeholder={`Learning objective #${i + 1} (e.g. Master token-based authentication workflows)`}
                  className="bg-background border-border text-xs h-9 flex-1"
                />
                {objectives.length > 1 && (
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    onClick={() => removeObjective(i)}
                    className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0"
                    title="Remove objective"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                )}
              </div>
            ))}

            <div className="pt-2 flex items-center justify-between">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={addObjective}
                className="gap-1.5 text-xs text-primary hover:bg-primary/10 font-semibold"
              >
                <Plus className="w-3.5 h-3.5" /> Add another learning objective
              </Button>
              <span className="text-[11px] text-muted-foreground">
                {objectives.filter((o) => o.trim().length > 0).length} valid objectives
              </span>
            </div>
          </CardContent>
        </Card>

        {/* 5. COVER IMAGE SECTION (Modern 16:9 Banner & Presets) */}
        <Card className="border-border bg-card shadow-xs">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-primary" /> Course Cover Image
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Upload a 16:9 high-resolution banner (PNG, JPG, WebP) or select from industry presets.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Banner Preview Frame */}
            {coverImage ? (
              <div className="relative w-full aspect-video max-h-[260px] rounded-2xl overflow-hidden border border-border group bg-muted/40 shadow-xs">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={coverImage} alt="Course cover banner" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-2xs">
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={() => fileInputRef.current?.click()}
                    className="gap-1.5 text-xs font-semibold"
                  >
                    <Upload className="w-3.5 h-3.5" /> Change Cover
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="destructive"
                    onClick={() => setCoverImage(undefined)}
                    className="gap-1.5 text-xs font-semibold"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Remove
                  </Button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="w-full aspect-video max-h-[220px] rounded-2xl border-2 border-dashed border-border hover:border-primary/60 bg-muted/20 hover:bg-primary/5 transition-all flex flex-col items-center justify-center cursor-pointer p-6 text-center space-y-2"
              >
                <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shadow-xs">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">Click to upload or drag & drop</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    16:9 aspect ratio recommended (1280x720px, max 5MB)
                  </p>
                </div>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleCoverUpload(e.target.files?.[0])}
            />

            {/* Quick Presets */}
            <div className="space-y-1.5 pt-1">
              <span className="text-xs font-semibold text-foreground/80">Or choose a preset cover:</span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {PRESET_COVERS.map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => setCoverImage(preset.url)}
                    className="flex items-center gap-2 p-2 rounded-xl border border-border hover:border-primary bg-background hover:bg-muted/40 transition-colors text-left group cursor-pointer"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={preset.url}
                      alt={preset.name}
                      className="w-8 h-8 rounded-lg object-cover shrink-0"
                    />
                    <span className="text-xs font-medium text-foreground truncate group-hover:text-primary">
                      {preset.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 6. CURRICULUM BUILDER SECTION */}
        <Card className="border-border bg-card shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
                <Layers className="w-4 h-4 text-primary" /> Curriculum & Course Modules
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground mt-0.5">
                Organize lectures, hands-on coding tasks, quizzes, and project assignments.
              </CardDescription>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5 border-border hover:bg-muted text-xs font-semibold"
              onClick={addSection}
            >
              <Plus className="w-3.5 h-3.5 text-primary" />
              Add Section
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {sections.map((section, sIndex) => (
              <div
                key={section.id}
                className="rounded-2xl border border-border bg-background p-4 space-y-3 shadow-xs"
              >
                {/* Section Header Toolbar */}
                <div className="flex items-center gap-2 pb-2 border-b border-border">
                  <span className="w-6 h-6 rounded-md bg-primary/10 text-primary font-mono text-xs font-bold flex items-center justify-center shrink-0">
                    {sIndex + 1}
                  </span>
                  <Input
                    value={section.title}
                    onChange={(e) => renameSection(section.id, e.target.value)}
                    className="font-bold text-sm bg-muted/40 border-border h-8 flex-1"
                    placeholder="Section title..."
                  />
                  <div className="flex items-center gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-muted-foreground hover:text-foreground"
                      onClick={() => moveSection(sIndex, -1)}
                      disabled={sIndex === 0}
                      title="Move up"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-muted-foreground hover:text-foreground"
                      onClick={() => moveSection(sIndex, 1)}
                      disabled={sIndex === sections.length - 1}
                      title="Move down"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      onClick={() => removeSection(section.id)}
                      title="Delete section"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>

                {/* Section Lessons List */}
                <div className="space-y-2">
                  {section.lessons.map((lesson, lIndex) => {
                    const Icon = LESSON_ICONS[lesson.type];
                    return (
                      <div
                        key={lesson.id}
                        className="flex items-center justify-between gap-3 p-2.5 rounded-xl border border-border bg-card hover:border-primary/40 transition-colors text-xs shadow-2xs"
                      >
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          <span className="text-muted-foreground font-mono text-[11px] w-4 shrink-0">
                            {lIndex + 1}.
                          </span>
                          <div
                            className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                              lesson.type === "video"
                                ? "bg-primary/10 text-primary"
                                : lesson.type === "quiz"
                                ? "bg-amber-500/10 text-amber-500"
                                : lesson.type === "assignment"
                                ? "bg-purple-500/10 text-purple-500"
                                : lesson.type === "coding"
                                ? "bg-cyan-500/10 text-cyan-500"
                                : "bg-emerald-500/10 text-emerald-500"
                            }`}
                          >
                            <Icon className="w-3.5 h-3.5" />
                          </div>
                          <span className="font-semibold text-foreground truncate">{lesson.title}</span>
                          <Badge variant="outline" className="capitalize text-[10px] shrink-0 border-border">
                            {lesson.type}
                          </Badge>
                          {lesson.duration && (
                            <span className="text-[11px] text-muted-foreground hidden sm:inline">
                              • {lesson.duration}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => openEditLessonModal(section.id, lesson)}
                            className="h-7 px-2 text-xs text-primary hover:bg-primary/10 gap-1"
                          >
                            <Pencil className="w-3 h-3" /> Edit Content
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => removeLesson(section.id, lesson.id)}
                            className="h-7 w-7 text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}

                  {section.lessons.length === 0 && (
                    <div className="text-center py-4 px-3 rounded-xl border border-dashed border-border text-xs text-muted-foreground">
                      No lectures or activities yet in this section. Click below to add one.
                    </div>
                  )}
                </div>

                {/* Add Content Quick Bar */}
                <div className="pt-1 flex items-center justify-between gap-2 flex-wrap">
                  <span className="text-xs text-muted-foreground font-medium">Add to section:</span>
                  <div className="flex gap-1.5 flex-wrap">
                    {(
                      [
                        { type: "video", label: "Video Lecture", icon: Video },
                        { type: "quiz", label: "Interactive Quiz", icon: HelpCircle },
                        { type: "assignment", label: "Assignment", icon: ClipboardList },
                        { type: "coding", label: "Coding Exercise", icon: Code2 },
                        { type: "article", label: "Reading Article", icon: FileText },
                      ] as const
                    ).map((t) => {
                      const Icon = t.icon;
                      return (
                        <Button
                          key={t.type}
                          size="xs"
                          variant="outline"
                          className="h-7 px-2.5 text-[11px] border-border hover:bg-primary/10 hover:text-primary gap-1"
                          onClick={() => openAddLessonModal(section.id, t.type)}
                        >
                          <Icon className="w-3 h-3" /> {t.label}
                        </Button>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}

            {sections.length === 0 && (
              <div className="text-center py-8 px-4 rounded-2xl border border-dashed border-border space-y-3">
                <Layers className="w-10 h-10 text-muted-foreground/40 mx-auto" />
                <div>
                  <h4 className="text-sm font-bold text-foreground">Curriculum is empty</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Click &quot;Add Section&quot; to begin authoring modules and lectures.
                  </p>
                </div>
                <Button size="sm" onClick={addSection} className="gap-1.5 text-xs font-semibold">
                  <Plus className="w-3.5 h-3.5" /> Add First Section
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Form Action Controls */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => handleSave("draft")}
            className="border-border text-foreground hover:bg-muted text-xs h-9 px-4 font-semibold"
          >
            Save as draft
          </Button>
          <Button
            type="button"
            onClick={() => handleSave("published")}
            className="bg-primary text-primary-foreground hover:bg-primary/90 text-xs h-9 px-5 font-bold shadow-xs"
          >
            Publish course
          </Button>
        </div>
      </div>

      {/* Right Sticky Sidebar (Progress & Quick Checklist) */}
      <aside className="w-full lg:w-[300px] shrink-0 lg:sticky lg:top-20 self-start h-fit space-y-4 z-10">
        <Card className="border-border bg-card shadow-xs">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Readiness Checklist
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {checklist.map((item) => (
              <div key={item.label} className="flex items-center gap-2.5 text-xs">
                <span
                  className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                    item.done
                      ? "bg-emerald-500 text-white shadow-2xs"
                      : "bg-muted border border-border text-transparent"
                  }`}
                >
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                </span>
                <span
                  className={`font-medium ${
                    item.done ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {item.label}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-border bg-muted/30 shadow-2xs p-4 space-y-2 text-xs">
          <span className="font-bold text-foreground block">Authoring Pro Tip</span>
          <p className="text-muted-foreground leading-relaxed">
            High-engagement courses feature interactive coding exercises and quizzes after every 2-3 video lectures.
          </p>
        </Card>
      </aside>

      {/* ════════════════════════════════════════════════════════════════════════
          7. EXPANDED LESSON BUILDER MODAL (Full Width, Multi-Questions, IDE Test Assertions, YouTube & Local Video)
         ════════════════════════════════════════════════════════════════════════ */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-4xl lg:max-w-5xl bg-card text-foreground border-border p-0 shadow-2xl flex flex-col max-h-[88vh] overflow-hidden gap-0">
          <DialogHeader className="px-6 py-3.5 border-b border-border shrink-0 bg-card">
            <DialogTitle className="text-base font-bold text-foreground flex items-center gap-2">
              {editingLessonId ? (
                <>
                  <Pencil className="w-4 h-4 text-primary" /> Edit Lesson Content
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 text-primary" /> Add Content to Curriculum
                </>
              )}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Configure video streams, upload files, author multiple quiz questions, assign projects, or set up IDE test assertions.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
            {/* Content Type Selector Tabs */}
            <div className="grid grid-cols-5 gap-2 p-1.5 rounded-xl bg-muted/40 border border-border">
              {(
                [
                  { type: "video", label: "Video Lecture", icon: Video },
                  { type: "quiz", label: "Interactive Quiz", icon: HelpCircle },
                  { type: "assignment", label: "Practical Assignment", icon: ClipboardList },
                  { type: "coding", label: "Coding Challenge", icon: Code2 },
                  { type: "article", label: "Reading Article", icon: FileText },
                ] as const
              ).map((t) => {
                const Icon = t.icon;
                const isSelected = modalLessonType === t.type;
                return (
                  <button
                    key={t.type}
                    type="button"
                    onClick={() => setModalLessonType(t.type)}
                    className={`flex flex-col items-center gap-1.5 py-2.5 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isSelected
                        ? "bg-card text-foreground shadow-sm border border-border"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Icon
                      className={`w-4 h-4 ${
                        isSelected
                          ? t.type === "video"
                            ? "text-primary"
                            : t.type === "quiz"
                            ? "text-amber-500"
                            : t.type === "assignment"
                            ? "text-purple-500"
                            : t.type === "coding"
                            ? "text-cyan-500"
                            : "text-emerald-500"
                          : ""
                      }`}
                    />
                    <span className="text-[11px]">{t.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Basic Lesson Title & Duration */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-xs font-semibold text-foreground/90">Lesson Title *</label>
                <Input
                  value={modalLessonTitle}
                  onChange={(e) => setModalLessonTitle(e.target.value)}
                  placeholder="e.g. Zero-Trust Token Verification Routine"
                  className="bg-background border-border text-xs h-9"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground/90">Estimated Duration</label>
                <Input
                  value={modalDuration}
                  onChange={(e) => setModalDuration(e.target.value)}
                  placeholder="e.g. 15 min"
                  className="bg-background border-border text-xs h-9"
                />
              </div>
            </div>

            {/* ════════════════════════════════════════════════════════════════════
                A. VIDEO LECTURE CONFIGURATION (YouTube Video or Local Upload)
               ════════════════════════════════════════════════════════════════════ */}
            {modalLessonType === "video" && (
              <div className="space-y-4 p-4 rounded-xl border border-border bg-muted/20">
                {/* Source Type Selector */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <Film className="w-3.5 h-3.5 text-primary" /> Video Source Type:
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { id: "youtube", label: "YouTube Video URL", icon: Tv, desc: "Paste standard youtube.com or youtu.be link" },
                      { id: "local", label: "Local Video File", icon: HardDrive, desc: "Upload MP4 / WebM / MOV from computer" },
                    ].map((srcOption) => {
                      const Icon = srcOption.icon;
                      const isSelected = modalVideoSourceType === srcOption.id;
                      return (
                        <button
                          key={srcOption.id}
                          type="button"
                          onClick={() => setModalVideoSourceType(srcOption.id as any)}
                          className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                            isSelected
                              ? "bg-card border-primary text-foreground shadow-xs ring-1 ring-primary"
                              : "bg-background border-border text-muted-foreground hover:bg-muted"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <Icon className={`w-4 h-4 ${isSelected ? "text-red-500" : ""}`} />
                            <span className="text-xs font-bold text-foreground">{srcOption.label}</span>
                          </div>
                          <p className="text-[11px] text-muted-foreground mt-1">{srcOption.desc}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* YouTube URL Input */}
                {modalVideoSourceType === "youtube" && (
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Tv className="w-3.5 h-3.5 text-red-500" /> YouTube Video URL *
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/10 text-red-600 font-medium dark:text-red-400">
                        YouTube Only
                      </span>
                    </label>
                    <Input
                      value={modalVideoUrl}
                      onChange={(e) => setModalVideoUrl(e.target.value)}
                      placeholder="https://www.youtube.com/watch?v=dQw4w9WgXcQ or https://youtu.be/..."
                      className="bg-background border-border text-xs h-9 font-mono"
                    />
                    <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                      <Info className="w-3.5 h-3.5 text-primary shrink-0" />
                      <span>Supports all standard YouTube formats (<code>youtube.com/watch?v=...</code>, <code>youtu.be/...</code>, <code>embed/...</code>).</span>
                    </div>
                  </div>
                )}

                {/* Local Upload Input */}
                {modalVideoSourceType === "local" && (
                  <div className="space-y-2">
                    <div
                      onClick={() => videoFileInputRef.current?.click()}
                      className="p-6 rounded-xl border-2 border-dashed border-border hover:border-primary/60 bg-background hover:bg-primary/5 transition-all text-center cursor-pointer space-y-2"
                    >
                      <Upload className="w-8 h-8 text-primary mx-auto" />
                      <div>
                        <p className="text-xs font-bold text-foreground">
                          {modalLocalVideoFileName ? `Selected: ${modalLocalVideoFileName}` : "Click to select a local video file (MP4, WebM, MOV)"}
                        </p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          High bitrate 1080p supported. Video is immediately playable in the course player.
                        </p>
                      </div>
                    </div>
                    <input
                      ref={videoFileInputRef}
                      type="file"
                      accept="video/*"
                      className="hidden"
                      onChange={(e) => handleVideoFileUpload(e.target.files?.[0])}
                    />
                  </div>
                )}
              </div>
            )}

            {/* ════════════════════════════════════════════════════════════════════
                B. QUIZ QUESTION MANAGER (Unlimited Questions + Custom Options)
               ════════════════════════════════════════════════════════════════════ */}
            {modalLessonType === "quiz" && (
              <div className="space-y-4 p-4 rounded-xl border border-border bg-muted/20">
                <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-border">
                  <div>
                    <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                      <HelpCircle className="w-3.5 h-3.5 text-amber-500" /> Multiple-Choice Question Bank ({modalQuizQuestions.length} Questions)
                    </h4>
                    <p className="text-[11px] text-muted-foreground">Add questions with choices, feedback, and pass requirements.</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 text-xs">
                      <span className="text-muted-foreground font-semibold">Pass %:</span>
                      <Input
                        type="number"
                        value={modalQuizPassing}
                        onChange={(e) => setModalQuizPassing(Number(e.target.value))}
                        className="w-16 h-7 text-xs bg-background font-mono"
                        min={10}
                        max={100}
                      />
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      onClick={addQuizQuestion}
                      className="h-7 px-2.5 text-xs bg-amber-500 hover:bg-amber-600 text-white font-bold gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Question
                    </Button>
                  </div>
                </div>

                {/* Questions List */}
                <div className="space-y-4">
                  {modalQuizQuestions.map((q, qIdx) => (
                    <div key={qIdx} className="p-4 rounded-xl bg-card border border-border space-y-3 shadow-xs">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-amber-500 flex items-center gap-1.5">
                          <span className="w-5 h-5 rounded-md bg-amber-500/10 text-amber-500 flex items-center justify-center font-mono text-[11px]">
                            {qIdx + 1}
                          </span>
                          Question Prompt:
                        </span>
                        {modalQuizQuestions.length > 1 && (
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            onClick={() => removeQuizQuestion(qIdx)}
                            className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                            title="Delete question"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        )}
                      </div>

                      <Input
                        value={q.prompt}
                        onChange={(e) => {
                          const val = e.target.value;
                          setModalQuizQuestions((prev) =>
                            prev.map((item, idx) => (idx === qIdx ? { ...item, prompt: val } : item))
                          );
                        }}
                        placeholder="Type question prompt (e.g. Which header mitigates XSS attacks?)"
                        className="h-8 text-xs bg-background"
                      />

                      {/* Options */}
                      <div className="space-y-2 pt-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] text-muted-foreground font-semibold">
                            Answer Choices (Select radio button for the correct answer):
                          </span>
                          <button
                            type="button"
                            onClick={() => addQuizOption(qIdx)}
                            className="text-[11px] font-semibold text-primary hover:underline flex items-center gap-1"
                          >
                            <Plus className="w-3 h-3" /> Add Option
                          </button>
                        </div>

                        {q.options.map((opt, optIdx) => (
                          <div key={optIdx} className="flex items-center gap-2">
                            <input
                              type="radio"
                              name={`correct-ans-${qIdx}`}
                              checked={q.correctIndex === optIdx}
                              onChange={() => {
                                setModalQuizQuestions((prev) =>
                                  prev.map((item, idx) =>
                                    idx === qIdx ? { ...item, correctIndex: optIdx } : item
                                  )
                                );
                              }}
                              className="accent-amber-500 w-4 h-4 cursor-pointer"
                              title="Mark as correct answer"
                            />
                            <Input
                              value={opt}
                              onChange={(e) => {
                                const val = e.target.value;
                                setModalQuizQuestions((prev) =>
                                  prev.map((item, idx) => {
                                    if (idx !== qIdx) return item;
                                    const newOpts = [...item.options];
                                    newOpts[optIdx] = val;
                                    return { ...item, options: newOpts };
                                  })
                                );
                              }}
                              placeholder={`Option ${String.fromCharCode(65 + optIdx)}`}
                              className="h-7 text-xs bg-background flex-1"
                            />
                            {q.options.length > 2 && (
                              <button
                                type="button"
                                onClick={() => removeQuizOption(qIdx, optIdx)}
                                className="text-muted-foreground hover:text-destructive p-1 rounded hover:bg-destructive/10"
                                title="Remove option"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Explanation */}
                      <div className="space-y-1 pt-1 border-t border-border">
                        <label className="text-[11px] font-semibold text-muted-foreground">
                          Explanation / Knowledge Feedback Note (shown upon answering):
                        </label>
                        <Input
                          value={q.explanation}
                          onChange={(e) => {
                            const val = e.target.value;
                            setModalQuizQuestions((prev) =>
                              prev.map((item, idx) => (idx === qIdx ? { ...item, explanation: val } : item))
                            );
                          }}
                          placeholder="Explain why this answer is correct..."
                          className="h-7 text-xs bg-background text-muted-foreground"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addQuizQuestion}
                  className="w-full gap-1.5 text-xs border-dashed border-border hover:bg-amber-500/10 hover:text-amber-500"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Another Question
                </Button>
              </div>
            )}

            {/* ════════════════════════════════════════════════════════════════════
                C. PRACTICAL ASSIGNMENT MANAGER (Rubrics, Criteria & Submissions)
               ════════════════════════════════════════════════════════════════════ */}
            {modalLessonType === "assignment" && (
              <div className="space-y-4 p-4 rounded-xl border border-border bg-muted/20">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <ClipboardList className="w-3.5 h-3.5 text-purple-500" /> Assignment Scenario & Instructions
                  </label>
                  <textarea
                    rows={4}
                    value={modalAssignmentInstructions}
                    onChange={(e) => setModalAssignmentInstructions(e.target.value)}
                    placeholder="Provide detailed problem statement, expectations, and delivery artifacts..."
                    className="w-full text-xs rounded-lg border border-border bg-background p-3 text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:border-primary"
                  />
                </div>

                {/* Submission Mode Picker */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Accepted Submission Formats:</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: "both", label: "File Upload + GitHub URL" },
                      { id: "file", label: "File Archive Only (.zip, .pdf)" },
                      { id: "github", label: "GitHub / GitLab Link Only" },
                    ].map((mode) => (
                      <button
                        key={mode.id}
                        type="button"
                        onClick={() => setModalAssignmentSubmissionType(mode.id as any)}
                        className={`p-2 rounded-lg border text-xs font-semibold text-left transition-all cursor-pointer ${
                          modalAssignmentSubmissionType === mode.id
                            ? "bg-card border-purple-500 text-foreground ring-1 ring-purple-500"
                            : "bg-background border-border text-muted-foreground hover:bg-muted"
                        }`}
                      >
                        {mode.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Rubric Criteria Builder */}
                <div className="space-y-3 pt-2 border-t border-border">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-purple-500" /> Evaluation Rubric Criteria ({modalAssignmentRubrics.length} Items)
                      </span>
                      <p className="text-[10px] text-muted-foreground">Total Points: {modalAssignmentRubrics.reduce((a, b) => a + b.points, 0)} pts</p>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      onClick={addAssignmentRubric}
                      className="h-7 px-2 text-xs bg-purple-500 hover:bg-purple-600 text-white font-bold gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Rubric Criterion
                    </Button>
                  </div>

                  <div className="space-y-2">
                    {modalAssignmentRubrics.map((r, rIdx) => (
                      <div key={rIdx} className="p-3 rounded-xl bg-card border border-border flex items-center gap-3 shadow-2xs">
                        <div className="flex-1 space-y-1">
                          <Input
                            value={r.criterion}
                            onChange={(e) => {
                              const val = e.target.value;
                              setModalAssignmentRubrics((prev) =>
                                prev.map((item, idx) => (idx === rIdx ? { ...item, criterion: val } : item))
                              );
                            }}
                            placeholder="Criterion description (e.g. Robust sanitization & unit test assertions)"
                            className="h-7 text-xs bg-background"
                          />
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="text-xs text-muted-foreground font-semibold">Points:</span>
                          <Input
                            type="number"
                            value={r.points}
                            onChange={(e) => {
                              const val = Number(e.target.value);
                              setModalAssignmentRubrics((prev) =>
                                prev.map((item, idx) => (idx === rIdx ? { ...item, points: val } : item))
                              );
                            }}
                            className="h-7 w-16 text-xs bg-background font-mono"
                          />
                        </div>
                        {modalAssignmentRubrics.length > 1 && (
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            onClick={() => removeAssignmentRubric(rIdx)}
                            className="h-7 w-7 text-muted-foreground hover:text-destructive shrink-0"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ════════════════════════════════════════════════════════════════════
                D. CODING CHALLENGE MANAGER (Language, IDE Starter, & Test Cases)
               ════════════════════════════════════════════════════════════════════ */}
            {modalLessonType === "coding" && (
              <div className="space-y-4 p-4 rounded-xl border border-border bg-muted/20">
                {/* Header with Language Selector */}
                <div className="flex items-center justify-between pb-2 border-b border-border">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                      <Code2 className="w-3.5 h-3.5 text-cyan-500" /> In-Browser Code IDE Environment
                    </span>
                    <p className="text-[10px] text-muted-foreground">Automated unit test assertion runner.</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground font-semibold">Language:</span>
                    <select
                      value={modalCodingLanguage}
                      onChange={(e) => setModalCodingLanguage(e.target.value)}
                      className="h-7 px-2 text-xs rounded-lg border border-border bg-background text-foreground font-semibold"
                    >
                      <option value="typescript">TypeScript 5.4</option>
                      <option value="javascript">JavaScript (Node.js 20)</option>
                      <option value="python">Python 3.12</option>
                      <option value="go">Go 1.22</option>
                    </select>
                  </div>
                </div>

                {/* Challenge Instructions */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Challenge Problem Statement *</label>
                  <Input
                    value={modalCodingInstructions}
                    onChange={(e) => setModalCodingInstructions(e.target.value)}
                    placeholder="e.g. Implement defense-in-depth token sanitizer in TypeScript"
                    className="h-8 text-xs bg-background"
                  />
                </div>

                {/* Starter Code */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Starter Code Boilerplate</label>
                  <textarea
                    rows={5}
                    value={modalCodingStarter}
                    onChange={(e) => setModalCodingStarter(e.target.value)}
                    className="w-full font-mono text-xs rounded-xl border border-border bg-background p-3 text-foreground focus:outline-hidden focus:border-primary"
                  />
                </div>

                {/* How Code is Verified Box */}
                <div className="p-3 rounded-xl border border-cyan-500/30 bg-cyan-500/5 space-y-1.5 text-xs text-foreground">
                  <div className="flex items-center gap-1.5 font-bold text-cyan-600 dark:text-cyan-400">
                    <Cpu className="w-4 h-4" /> How Code is Verified:
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    When the student clicks <strong>&quot;Run Tests&quot;</strong>, the in-browser sandbox runner compiles the student&apos;s function, executes it against each input assertion below, and validates that the returned value strictly matches the <strong>Expected Output</strong>.
                  </p>
                </div>

                {/* Test Cases & Expected Output Builder */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                      <Terminal className="w-3.5 h-3.5 text-cyan-500" /> Automated Test Suite Assertions ({modalCodingTestCases.length} Cases)
                    </span>
                    <Button
                      type="button"
                      size="sm"
                      onClick={addCodingTestCase}
                      className="h-7 px-2.5 text-xs bg-cyan-600 hover:bg-cyan-700 text-white font-bold gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Test Case
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {modalCodingTestCases.map((tc, tIdx) => (
                      <div key={tIdx} className="p-3.5 rounded-xl bg-card border border-border space-y-2.5 shadow-2xs">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-bold text-cyan-600 dark:text-cyan-400">
                            Assertion #{tIdx + 1}:
                          </span>
                          {modalCodingTestCases.length > 1 && (
                            <Button
                              type="button"
                              size="icon"
                              variant="ghost"
                              onClick={() => removeCodingTestCase(tIdx)}
                              className="h-6 w-6 text-muted-foreground hover:text-destructive"
                              title="Delete assertion"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          )}
                        </div>

                        <div className="space-y-1">
                          <label className="text-[11px] font-semibold text-muted-foreground">Test Case Name:</label>
                          <Input
                            value={tc.name}
                            onChange={(e) => {
                              const val = e.target.value;
                              setModalCodingTestCases((prev) =>
                                prev.map((item, idx) => (idx === tIdx ? { ...item, name: val } : item))
                              );
                            }}
                            placeholder="e.g. Valid token with lms_tok_ prefix"
                            className="h-7 text-xs bg-background"
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <label className="text-[11px] font-semibold text-muted-foreground">Input Parameter(s):</label>
                            <Input
                              value={tc.input}
                              onChange={(e) => {
                                const val = e.target.value;
                                setModalCodingTestCases((prev) =>
                                  prev.map((item, idx) => (idx === tIdx ? { ...item, input: val } : item))
                                );
                              }}
                              placeholder='"lms_tok_sec_123"'
                              className="h-7 text-xs font-mono bg-background text-cyan-600 dark:text-cyan-400"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[11px] font-semibold text-muted-foreground">Expected Output Return:</label>
                            <Input
                              value={tc.expected}
                              onChange={(e) => {
                                const val = e.target.value;
                                setModalCodingTestCases((prev) =>
                                  prev.map((item, idx) => (idx === tIdx ? { ...item, expected: val } : item))
                                );
                              }}
                              placeholder='{ valid: true, cleanToken: "lms_tok_sec_123" }'
                              className="h-7 text-xs font-mono bg-background text-emerald-600 dark:text-emerald-400"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ════════════════════════════════════════════════════════════════════
                E. ARTICLE / READING MODULE CONFIGURATION
               ════════════════════════════════════════════════════════════════════ */}
            {modalLessonType === "article" && (
              <div className="space-y-3 p-4 rounded-xl border border-border bg-muted/20">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-emerald-500" /> Article Content (Markdown Supported)
                  </label>
                  <textarea
                    rows={8}
                    value={modalArticleBody}
                    onChange={(e) => setModalArticleBody(e.target.value)}
                    placeholder="Write your lecture reading module notes in markdown..."
                    className="w-full text-xs rounded-xl border border-border bg-background p-3 text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:border-primary font-mono"
                  />
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="py-2.5 px-6 border-t border-border flex items-center justify-between shrink-0 bg-card">
            <Button
              type="button"
              variant="outline"
              onClick={() => setModalOpen(false)}
              className="text-muted-foreground hover:text-foreground text-xs h-8 px-4"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSaveLessonModal}
              className="bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-bold px-5 h-8"
            >
              {editingLessonId ? "Save Changes" : "Add to Section"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
