"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import type Player from "video.js/dist/types/player";
import { useRoleGuard } from "@/lib/hooks/use-role-guard";
import { VideoPlayer } from "@/components/courses/VideoPlayer";
import { QuizPlayer } from "@/components/courses/QuizPlayer";
import { AssignmentPlayer } from "@/components/courses/AssignmentPlayer";
import { CodingExercisePlayer } from "@/components/courses/CodingExercisePlayer";
import { useCoursesStore } from "@/lib/store/courses-store";
import { useEnrollmentsStore } from "@/lib/store/enrollments-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  RotateCcw,
  RotateCw,
  Play,
  CheckCircle2,
  CheckCircle,
  Circle,
  Clock,
  BookOpen,
  FileText,
  Search,
  MessageSquare,
  Star,
  Download,
  Share2,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Trophy,
  FolderDown,
  Plus,
  ThumbsUp,
  PanelRightClose,
  PanelRightOpen,
  X,
  Check,
  Film,
  Video,
  Code,
  Code2,
  ClipboardList,
  HelpCircle,
  Megaphone,
  Bell,
  Award,
} from "lucide-react";

function formatTime(seconds: number) {
  if (isNaN(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s < 10 ? "0" : ""}${s}`;
}

interface QAQuestion {
  id: string;
  author: string;
  timestamp: string;
  videoTimestamp?: number;
  title: string;
  content: string;
  upvotes: number;
  upvoted?: boolean;
  replies: {
    id: string;
    author: string;
    role?: string;
    timestamp: string;
    content: string;
  }[];
}

interface ReviewItem {
  id: string;
  userName: string;
  rating: number;
  date: string;
  comment: string;
  helpfulCount: number;
}

const SEED_QA: QAQuestion[] = [
  {
    id: "qa-1",
    author: "Elena Rostova",
    timestamp: "2 days ago",
    videoTimestamp: 145,
    title: "How to handle memory leaks in long-running stream consumers?",
    content:
      "When running the ingestion loop demonstrated around 02:25, should we explicitly close the buffered channel or rely on context cancellation timeout?",
    upvotes: 14,
    replies: [
      {
        id: "rep-1",
        author: "Alex Morgan (Lead Instructor)",
        role: "Instructor",
        timestamp: "1 day ago",
        content:
          "Great question Elena! Always propagate the parent context cancellation and defer closing of the sink buffer to avoid goroutine leaks.",
      },
    ],
  },
  {
    id: "qa-2",
    author: "David Chen",
    timestamp: "5 days ago",
    videoTimestamp: 420,
    title: "Compatibility with Next.js 15 App Router parallel routes",
    content:
      "Does this architectural pattern support interception and parallel modal routes without triggering full re-renders?",
    upvotes: 8,
    replies: [
      {
        id: "rep-2",
        author: "Marcus Vance",
        timestamp: "4 days ago",
        content:
          "Yes, simply wrap the slot layout inside the suspense boundary shown in lesson 3.",
      },
    ],
  },
];

const SEED_REVIEWS: ReviewItem[] = [
  {
    id: "rev-1",
    userName: "Sarah Jenkins",
    rating: 5,
    date: "1 week ago",
    comment:
      "One of the highest quality courses I have taken. The code walkthroughs are crystal clear, and the real-world deployment notes saved our team weeks of trial and error.",
    helpfulCount: 32,
  },
  {
    id: "rev-2",
    userName: "Michael Torres",
    rating: 5,
    date: "2 weeks ago",
    comment:
      "Exceptional depth. The explanation of internal architectures and production edge cases is top notch. Highly recommended for senior engineers.",
    helpfulCount: 19,
  },
  {
    id: "rev-3",
    userName: "Aisha Patel",
    rating: 4,
    date: "3 weeks ago",
    comment:
      "Very practical and well organized curriculum. The timestamped notes feature made revising key concepts extremely fast.",
    helpfulCount: 8,
  },
];

export default function CoursePlayerPage() {
  const params = useParams<{ role: string; courseId: string }>();
  const router = useRouter();
  const user = useRoleGuard(params.role);

  const courses = useCoursesStore((s) => s.courses);
  const allNotes = useCoursesStore((s) => s.notes);
  const addNote = useCoursesStore((s) => s.addNote);

  const enrollments = useEnrollmentsStore((s) => s.enrollments);
  const updateProgress = useEnrollmentsStore((s) => s.updateProgress);

  const course = useMemo(
    () => courses.find((c) => c.id === params.courseId),
    [courses, params.courseId]
  );
  const notes = useMemo(
    () => allNotes[params.courseId] ?? [],
    [allNotes, params.courseId]
  );

  // Flattened list of all lessons
  const allLessons = useMemo(() => {
    if (!course) return [];
    return course.sections.flatMap((s) => s.lessons);
  }, [course]);

  // Current active lesson
  const [activeLessonId, setActiveLessonId] = useState<string>("");
  const activeLesson = useMemo(() => {
    return allLessons.find((l) => l.id === activeLessonId) || allLessons[0];
  }, [allLessons, activeLessonId]);

  const playerRef = useRef<Player | null>(null);

  // Active Bottom Tab (Including Open edX Progress & Grades and Dates Timeline tabs)
  const [activeTab, setActiveTab] = useState<
    "overview" | "progress" | "dates" | "qa" | "notes" | "announcements" | "reviews" | "resources" | "search"
  >("overview");

  // Sidebar Open/Close state
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Section Accordion expanded states (default open for all sections unless toggled closed)
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionId]: !(prev[sectionId] ?? true),
    }));
  };

  // Lesson Completion State
  const [completedLessons, setCompletedLessons] = useState<Record<string, boolean>>({
    "l-1": true,
  });

  const toggleLessonCompleted = (lessonId: string) => {
    setCompletedLessons((prev) => {
      const updated = { ...prev, [lessonId]: !prev[lessonId] };
      const totalCount = allLessons.length || 1;
      const completedCount = Object.values(updated).filter(Boolean).length;
      const pct = Math.round((completedCount / totalCount) * 100);

      const userEnrollment = enrollments.find(
        (e) => e.userId === user?.identifier && e.courseId === course?.id
      );
      if (userEnrollment) {
        updateProgress(userEnrollment.id, pct);
      }
      return updated;
    });
  };

  // Timestamped Note Draft State
  const [noteDraft, setNoteDraft] = useState<{ open: boolean; timestamp: number; text: string }>({
    open: false,
    timestamp: 0,
    text: "",
  });
  const [noteFilter, setNoteFilter] = useState<"current" | "all">("all");

  // Q&A State
  const [qaList, setQaList] = useState<QAQuestion[]>(SEED_QA);
  const [qaSearch, setQaSearch] = useState("");
  const [newQaModalOpen, setNewQaModalOpen] = useState(false);
  const [newQaTitle, setNewQaTitle] = useState("");
  const [newQaContent, setNewQaContent] = useState("");

  // Reviews State
  const [reviewsList, setReviewsList] = useState<ReviewItem[]>(SEED_REVIEWS);
  const [reviewSearch, setReviewSearch] = useState("");
  const [ratingModalOpen, setRatingModalOpen] = useState(false);
  const [userRating, setUserRating] = useState(5);
  const [userReviewText, setUserReviewText] = useState("");
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  // Curriculum search inside drawer
  const [curriculumSearch, setCurriculumSearch] = useState("");

  // Global course search tab
  const [courseSearchQuery, setCourseSearchQuery] = useState("");

  // Video Playback Controls State
  const [currentTime, setCurrentTime] = useState(0);
  const [autoplayNext, setAutoplayNext] = useState(true);

  // Hotkey listener: `B` for note, `Space` for play/pause, `J`/`L` for seek
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }

      const player = playerRef.current;
      if (!player) return;

      const key = e.key.toLowerCase();
      if (key === "b") {
        e.preventDefault();
        player.pause();
        const cur = player.currentTime() ?? 0;
        setNoteDraft({ open: true, timestamp: cur, text: "" });
        setActiveTab("notes");
      } else if (key === " " || key === "k") {
        e.preventDefault();
        if (player.paused()) {
          player.play();
        } else {
          player.pause();
        }
      } else if (key === "j" || e.key === "ArrowLeft") {
        e.preventDefault();
        player.currentTime(Math.max(0, (player.currentTime() ?? 0) - 5));
      } else if (key === "l" || e.key === "ArrowRight") {
        e.preventDefault();
        player.currentTime(Math.min(player.duration() ?? 0, (player.currentTime() ?? 0) + 5));
      } else if (key === "m") {
        e.preventDefault();
        player.muted(!player.muted());
      } else if (key === "f") {
        e.preventDefault();
        if (player.isFullscreen()) {
          player.exitFullscreen();
        } else {
          player.requestFullscreen();
        }
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  if (!user) return null;
  if (!course) {
    return (
      <div className="min-h-screen bg-surface-base text-text-primary flex items-center justify-center">
        <div className="text-center space-y-3">
          <p className="text-lg font-medium text-text-secondary">Course not found.</p>
          <Button render={<Link href={`/${user.role}/catalog`} />}>
            Browse Course Catalog
          </Button>
        </div>
      </div>
    );
  }

  // Course List Destination based on role
  const courseListHref =
    user.role === "learner"
      ? `/${user.role}/my-training`
      : `/${user.role}/courses`;

  const completedCount = Object.values(completedLessons).filter(Boolean).length;
  const totalLessonsCount = allLessons.length || 1;
  const progressPercentage = Math.round((completedCount / totalLessonsCount) * 100);

  const seek = (delta: number) => {
    const player = playerRef.current;
    if (!player) return;
    const cur = player.currentTime() ?? 0;
    player.currentTime(Math.max(0, cur + delta));
  };

  const seekTo = (seconds: number) => {
    const player = playerRef.current;
    if (!player) return;
    player.currentTime(seconds);
    player.play();
  };

  const handleNextLesson = () => {
    const currentIndex = allLessons.findIndex((l) => l.id === activeLesson.id);
    if (currentIndex >= 0 && currentIndex < allLessons.length - 1) {
      setActiveLessonId(allLessons[currentIndex + 1].id);
    }
  };

  const handlePrevLesson = () => {
    const currentIndex = allLessons.findIndex((l) => l.id === activeLesson.id);
    if (currentIndex > 0) {
      setActiveLessonId(allLessons[currentIndex - 1].id);
    }
  };

  const saveNote = () => {
    if (!noteDraft.text.trim() || !activeLesson) return;
    addNote(course.id, activeLesson.id, noteDraft.timestamp, noteDraft.text.trim());
    setNoteDraft({ open: false, timestamp: 0, text: "" });
  };

  const handleCreateQA = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQaTitle.trim() || !newQaContent.trim()) return;
    const player = playerRef.current;
    const newQuestion: QAQuestion = {
      id: `qa-${Date.now()}`,
      author: user.name || "Learner",
      timestamp: "Just now",
      videoTimestamp: player ? Math.floor(player.currentTime() ?? 0) : undefined,
      title: newQaTitle.trim(),
      content: newQaContent.trim(),
      upvotes: 1,
      upvoted: true,
      replies: [],
    };
    setQaList([newQuestion, ...qaList]);
    setNewQaTitle("");
    setNewQaContent("");
    setNewQaModalOpen(false);
  };

  const handleToggleUpvote = (id: string) => {
    setQaList((prev) =>
      prev.map((q) => {
        if (q.id === id) {
          const upvoted = !q.upvoted;
          return {
            ...q,
            upvoted,
            upvotes: upvoted ? q.upvotes + 1 : q.upvotes - 1,
          };
        }
        return q;
      })
    );
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userReviewText.trim()) return;
    const newRev: ReviewItem = {
      id: `rev-${Date.now()}`,
      userName: user.name || "Learner",
      rating: userRating,
      date: "Just now",
      comment: userReviewText.trim(),
      helpfulCount: 0,
    };
    setReviewsList([newRev, ...reviewsList]);
    setReviewSubmitted(true);
    setTimeout(() => {
      setRatingModalOpen(false);
      setReviewSubmitted(false);
      setUserReviewText("");
    }, 1200);
  };

  const displayedNotes = notes.filter((n) =>
    noteFilter === "all" ? true : n.lessonId === activeLesson.id
  );

  const filteredQA = qaList.filter(
    (q) =>
      !qaSearch.trim() ||
      q.title.toLowerCase().includes(qaSearch.toLowerCase()) ||
      q.content.toLowerCase().includes(qaSearch.toLowerCase())
  );

  const filteredReviews = reviewsList.filter(
    (r) =>
      !reviewSearch.trim() ||
      r.comment.toLowerCase().includes(reviewSearch.toLowerCase()) ||
      r.userName.toLowerCase().includes(reviewSearch.toLowerCase())
  );

  const sampleResources = [
    {
      name: "Source-Code-Repository.zip",
      size: "14.2 MB",
      type: "zip",
      url: "#",
    },
    {
      name: "Architecture-CheatSheet-v2.pdf",
      size: "2.8 MB",
      type: "pdf",
      url: "#",
    },
    {
      name: "Lecture-Slides-Deck.pdf",
      size: "5.1 MB",
      type: "pdf",
      url: "#",
    },
  ];

  return (
    // Cinema-Style Course Player Shell with Full Theme Support
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      {/* ════════════════════════════════════════════════════════════════════════
          1. TOP NAVIGATION HEADER
         ════════════════════════════════════════════════════════════════════════ */}
      <header className="flex items-center justify-between px-4 h-14 bg-card/95 backdrop-blur-md border-b border-border shrink-0 z-30">
        {/* Left: Back Link to Course List & Course Title */}
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href={courseListHref}
            className="inline-flex items-center gap-2 px-3 h-9 rounded-lg text-foreground hover:bg-muted font-semibold text-xs transition-colors shrink-0 border border-transparent hover:border-border"
          >
            <ArrowLeft className="w-4 h-4 text-primary shrink-0" />
            <span>Back to Course List</span>
          </Link>

          <div className="h-4 w-px bg-border hidden sm:block shrink-0" />

          <div className="flex items-center gap-2 truncate">
            <span className="text-sm font-bold text-foreground truncate max-w-[240px] md:max-w-md lg:max-w-lg">
              {course.title}
            </span>
          </div>
        </div>

        {/* Right: Progress Ring/Pill, Share, Rating, Theme Toggle & Sidebar Toggle */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {/* Progress Widget */}
          <div className="hidden md:flex items-center gap-2.5 px-3 py-1 rounded-lg bg-muted/50 border border-border text-xs">
            <Trophy className="w-4 h-4 text-amber-500" />
            <div className="flex flex-col text-left">
              <span className="font-bold text-foreground leading-tight">
                {progressPercentage}% Complete
              </span>
              <span className="text-[10px] text-muted-foreground">
                {completedCount} of {totalLessonsCount} completed
              </span>
            </div>
          </div>

          {/* Share Button */}
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground h-8 px-2.5 text-xs gap-1.5 hidden sm:inline-flex"
            onClick={() => {
              if (navigator.clipboard) {
                navigator.clipboard.writeText(window.location.href);
                alert("Course player link copied to clipboard!");
              }
            }}
          >
            <Share2 className="w-3.5 h-3.5" /> Share
          </Button>

          {/* Rating CTA */}
          <Button
            variant="outline"
            size="sm"
            className="border-border text-foreground hover:bg-muted h-8 px-2.5 text-xs gap-1.5"
            onClick={() => setRatingModalOpen(true)}
          >
            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span className="hidden sm:inline">Leave a rating</span>
          </Button>

          {/* Course Content Drawer Toggle */}
          <Button
            variant={sidebarOpen ? "secondary" : "default"}
            size="sm"
            className="h-8 px-3 text-xs gap-1.5 font-semibold bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? (
              <>
                <PanelRightClose className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Course content</span>
              </>
            ) : (
              <>
                <PanelRightOpen className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Course content</span>
              </>
            )}
          </Button>
        </div>
      </header>

      {/* ════════════════════════════════════════════════════════════════════════
          2. MAIN CONTENT AREA (Video Stage + Bottom Tabs + Right Curriculum)
         ════════════════════════════════════════════════════════════════════════ */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden min-h-0">
        {/* Left / Main Workspace: Non-scrolling Stage at Top + Independently Scrollable Tabs & Content below */}
        <div className="flex-1 flex flex-col h-full overflow-hidden bg-background min-h-0">
          {/* A. Full-Width Fixed Cinema-Mode Viewport */}
          <div className="shrink-0 w-full bg-black/95 flex items-center justify-center border-b border-border">
            <div className="w-full aspect-video max-h-[580px] xl:max-h-[640px] relative flex flex-col justify-center overflow-hidden">
              {activeLesson?.type === "quiz" ? (
                <div className="w-full h-full overflow-y-auto p-3 sm:p-5 bg-background">
                  <QuizPlayer
                    lesson={activeLesson}
                    isCompleted={!!completedLessons[activeLesson.id]}
                    onComplete={() => toggleLessonCompleted(activeLesson.id)}
                    onNextLesson={
                      allLessons.findIndex((l) => l.id === activeLesson.id) < allLessons.length - 1
                        ? handleNextLesson
                        : undefined
                    }
                  />
                </div>
              ) : activeLesson?.type === "assignment" ? (
                <div className="w-full h-full overflow-y-auto p-3 sm:p-5 bg-background">
                  <AssignmentPlayer
                    lesson={activeLesson}
                    isCompleted={!!completedLessons[activeLesson.id]}
                    onComplete={() => toggleLessonCompleted(activeLesson.id)}
                    onNextLesson={
                      allLessons.findIndex((l) => l.id === activeLesson.id) < allLessons.length - 1
                        ? handleNextLesson
                        : undefined
                    }
                    courseTitle={course.title}
                    courseId={course.id}
                    user={user}
                  />
                </div>
              ) : activeLesson?.type === "coding" ? (
                <div className="w-full h-full overflow-y-auto p-3 sm:p-5 bg-background">
                  <CodingExercisePlayer
                    lesson={activeLesson}
                    isCompleted={!!completedLessons[activeLesson.id]}
                    onComplete={() => toggleLessonCompleted(activeLesson.id)}
                    onNextLesson={
                      allLessons.findIndex((l) => l.id === activeLesson.id) < allLessons.length - 1
                        ? handleNextLesson
                        : undefined
                    }
                  />
                </div>
              ) : activeLesson?.videoUrl ? (
                <div className="w-full h-full flex items-center justify-center">
                  <VideoPlayer
                    src={activeLesson.videoUrl}
                    onReady={(p) => {
                      playerRef.current = p;
                    }}
                    onEnded={() => {
                      toggleLessonCompleted(activeLesson.id);
                      const currentIndex = allLessons.findIndex((l) => l.id === activeLesson.id);
                      if (autoplayNext && currentIndex < allLessons.length - 1) {
                        handleNextLesson();
                      }
                    }}
                    onPrevLesson={handlePrevLesson}
                    onNextLesson={handleNextLesson}
                    hasPrevLesson={allLessons.findIndex((l) => l.id === activeLesson.id) > 0}
                    hasNextLesson={
                      allLessons.findIndex((l) => l.id === activeLesson.id) < allLessons.length - 1
                    }
                    autoplayNext={autoplayNext}
                    onToggleAutoplay={setAutoplayNext}
                    onTakeNote={(ts) => {
                      const player = playerRef.current;
                      if (player) player.pause();
                      setNoteDraft({
                        open: true,
                        timestamp: ts,
                        text: "",
                      });
                      setActiveTab("notes");
                    }}
                  />
                </div>
              ) : (
                <div className="w-full h-full overflow-y-auto p-3 sm:p-5 flex flex-col items-center justify-center bg-background">
                  <div className="w-full py-8 px-6 text-center space-y-3 bg-card rounded-2xl border border-border shadow-xs">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
                      <FileText className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-bold text-foreground">{activeLesson?.title || "Lesson"}</h3>
                    <p className="text-xs text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                      This reading module covers vital foundational principles. Review the materials, take timestamped study notes, and mark it complete when finished.
                    </p>
                    <div className="flex items-center justify-center gap-3 pt-1">
                      <Button
                        onClick={() => toggleLessonCompleted(activeLesson.id)}
                        className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold text-xs"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        {completedLessons[activeLesson.id] ? "Completed ✓" : "Mark as Complete"}
                      </Button>
                      {allLessons.findIndex((l) => l.id === activeLesson.id) < allLessons.length - 1 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleNextLesson}
                          className="border-border text-foreground hover:bg-muted text-xs"
                        >
                          Next Lesson
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* B. Scrollable Lower Console (Tabs Navigation & Content) */}
          <div className="flex-1 flex flex-col overflow-y-auto min-h-0 bg-background">
            {/* Sticky Navigation Tabs */}
            <div className="border-b border-border bg-card/95 backdrop-blur-xs px-6 sticky top-0 z-20 shrink-0">
              <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
                {[
                  { id: "overview", label: "Overview", icon: BookOpen },
                  { id: "progress", label: "Progress & Grades", icon: Award },
                  { id: "dates", label: "Dates & Schedule", icon: Clock },
                  { id: "qa", label: `Q&A (${qaList.length})`, icon: MessageSquare },
                  { id: "notes", label: `Notes (${notes.length})`, icon: FileText },
                  { id: "announcements", label: "Announcements", icon: Megaphone },
                  { id: "reviews", label: "Reviews", icon: Star },
                  { id: "resources", label: "Learning tools & Resources", icon: FolderDown },
                  { id: "search", label: "Search", icon: Search },
                ].map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`flex items-center gap-2 py-3 px-3.5 font-bold text-xs sm:text-sm border-b-2 transition-colors whitespace-nowrap ${isActive
                        ? "border-primary text-foreground"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                        }`}
                    >
                      <Icon className={`w-4 h-4 ${isActive ? "text-primary" : ""}`} />
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* C. Tab Content Panels */}
            <div className="p-6 max-w-5xl space-y-6">
              {/* 1. OVERVIEW TAB */}
              {activeTab === "overview" && (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-2xl font-bold text-foreground mb-2">
                      {course.title}
                    </h2>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                      <span className="flex items-center gap-1 text-amber-500 font-bold">
                        <Star className="w-3.5 h-3.5 fill-current" /> {course.rating ?? 4.8}
                      </span>
                      <span>•</span>
                      <span>{course.enrolled ?? 214} students enrolled</span>
                      <span>•</span>
                      <span>Category: {course.category}</span>
                      <span>•</span>
                      <span>Department: {course.department || "Enterprise"}</span>
                    </div>
                  </div>

                  {/* What you'll learn (Udemy learning objectives card) */}
                  <div className="p-5 rounded-xl border border-border bg-card space-y-3 shadow-xs">
                    <h3 className="font-bold text-sm text-foreground">What you&apos;ll learn</h3>
                    <div className="grid sm:grid-cols-2 gap-2.5 text-xs text-foreground/80">
                      {course.objectives.map((obj, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                          <span>{obj}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* About current lecture */}
                  <div className="space-y-2 border-t border-border pt-6">
                    <h3 className="text-base font-bold text-foreground">
                      About this lecture: {activeLesson?.title}
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      This lecture covers deep architectural foundations and best practice implementation patterns. Follow along with the code repository files provided in the Resources tab.
                    </p>
                  </div>

                  {/* Instructor Card */}
                  <div className="border-t border-border pt-6 space-y-4">
                    <h3 className="text-base font-bold text-foreground">Instructor</h3>
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xl shrink-0 shadow-md">
                        AM
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-bold text-foreground text-sm">
                          Alex Morgan, Principal Cloud Architect
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          15+ years experience building distributed cloud systems at high scale. Lead instructor for Enterprise Cloud & Architecture.
                        </p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1">
                          <span className="text-amber-500 font-semibold">⭐ 4.9 Instructor Rating</span>
                          <span>👥 14,200 Students</span>
                          <span>🎓 8 Courses</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 2. PROGRESS & GRADES TAB (Open edX Screen 7 / Moodle User Report) */}
              {activeTab === "progress" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-foreground">Course Progress & Grade Breakdown</h2>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Open edX standard grading policy: Passing cutoff score is 70%. Cumulative grade is derived from video completion, knowledge checks, and practical assignments.
                    </p>
                  </div>

                  {/* Summary Metric Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-4 rounded-xl border border-border bg-card">
                      <span className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">Course Progress</span>
                      <p className="text-2xl font-black text-foreground mt-1">{progressPercentage}%</p>
                      <span className="text-[10px] text-muted-foreground">{completedCount} of {totalLessonsCount} units finished</span>
                    </div>

                    <div className="p-4 rounded-xl border border-border bg-card">
                      <span className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">Cumulative Score</span>
                      <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">94%</p>
                      <span className="text-[10px] text-emerald-600 font-semibold">Passing (Threshold: 70%)</span>
                    </div>

                    <div className="p-4 rounded-xl border border-border bg-card">
                      <span className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">Graded Activities</span>
                      <p className="text-2xl font-black text-foreground mt-1">3 / 3</p>
                      <span className="text-[10px] text-muted-foreground">All evaluated</span>
                    </div>

                    <div className="p-4 rounded-xl border border-border bg-card">
                      <span className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">Certificate Status</span>
                      <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-2 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" /> Eligible
                      </p>
                      <span className="text-[10px] text-muted-foreground">Verified ID Issued</span>
                    </div>
                  </div>

                  {/* Open edX Visual SVG Grade Distribution Chart */}
                  <div className="p-5 rounded-2xl border border-border bg-card space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-bold text-foreground">Grade Distribution & Weighting</h3>
                        <p className="text-xs text-muted-foreground">Visual score breakdown across curricular assignment groups</p>
                      </div>
                      <Badge className="bg-primary/10 text-primary border-primary/20 text-xs">
                        Cutoff Threshold: 70%
                      </Badge>
                    </div>

                    {/* Stacked / Grouped Visual Bar Chart */}
                    <div className="space-y-3 pt-2">
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold text-foreground">
                          <span>Video Lectures & Theory (20% weight)</span>
                          <span className="font-mono text-emerald-600">100% (20 / 20 pts)</span>
                        </div>
                        <div className="h-3 w-full bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: "100%" }} />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold text-foreground">
                          <span>CAPA Knowledge Checks / Quizzes (40% weight)</span>
                          <span className="font-mono text-primary">95% (38 / 40 pts)</span>
                        </div>
                        <div className="h-3 w-full bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: "95%" }} />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold text-foreground">
                          <span>Practical Architecture RFC Assignment (40% weight)</span>
                          <span className="font-mono text-purple-600 dark:text-purple-400">90% (36 / 40 pts)</span>
                        </div>
                        <div className="h-3 w-full bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-purple-500 rounded-full transition-all duration-500" style={{ width: "90%" }} />
                        </div>
                      </div>

                      {/* Cutoff Marker Visual Indicator */}
                      <div className="pt-2 flex items-center gap-2 text-xs text-muted-foreground border-t border-border">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                        <span>Cumulative Weighted Total: <strong className="text-foreground">94 / 100 points</strong>. You comfortably exceed the 70% passing threshold!</span>
                      </div>
                    </div>
                  </div>

                  {/* Certificate Claim Banner */}
                  <div className="p-5 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                        <Award className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-foreground">Verified Certificate of Completion</h4>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Issued under ESSCI Open Standards credentialing. Cryptographically verified record.
                        </p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shrink-0"
                      render={<Link href={`/${user.role}/certificates`} />}
                    >
                      <Award className="w-4 h-4" /> View Certificate
                    </Button>
                  </div>
                </div>
              )}

              {/* 3. DATES & SCHEDULE TIMELINE TAB (Open edX Screen 8 / Moodle Calendar) */}
              {activeTab === "dates" && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-bold text-foreground">Course Dates & Milestones</h2>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Chronological progression schedule. Milestones adapt based on course self-pacing or cohort deadlines.
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2 text-xs border-border shrink-0"
                      onClick={() => {
                        const ics = [
                          "BEGIN:VCALENDAR",
                          "VERSION:2.0",
                          "PRODID:-//ESSCI LMS//EN",
                          "BEGIN:VEVENT",
                          `SUMMARY:${course.title} - Final Submission`,
                          "DESCRIPTION:Course milestone deadline",
                          "DTSTART:20261015T183000Z",
                          "DTEND:20261015T193000Z",
                          "STATUS:CONFIRMED",
                          "END:VEVENT",
                          "END:VCALENDAR",
                        ].join("\r\n");
                        const blob = new Blob([ics], { type: "text/calendar" });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement("a");
                        a.href = url;
                        a.download = "course_schedule.ics";
                        a.click();
                      }}
                    >
                      <FolderDown className="w-4 h-4 text-primary" /> Export Schedule (.ics)
                    </Button>
                  </div>

                  {/* Milestone Stream */}
                  <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
                    <div className="relative">
                      <div className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px]">
                        ✓
                      </div>
                      <div className="p-4 rounded-xl border border-border bg-card space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-foreground">Course Enrollment & Orientation</span>
                          <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px]">
                            Completed
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">Account verified and enrolled in ESSCI learning track.</p>
                        <span className="text-[11px] text-text-tertiary font-mono">Started Aug 15, 2026</span>
                      </div>
                    </div>

                    <div className="relative">
                      <div className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px]">
                        ✓
                      </div>
                      <div className="p-4 rounded-xl border border-border bg-card space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-foreground">Module 1 Knowledge Assessment (Quiz)</span>
                          <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px]">
                            Passed (100%)
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">Automated grading verification passed on first attempt.</p>
                        <span className="text-[11px] text-text-tertiary font-mono">Completed Sep 12, 2026</span>
                      </div>
                    </div>

                    <div className="relative">
                      <div className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[10px]">
                        ✓
                      </div>
                      <div className="p-4 rounded-xl border border-border bg-card space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-foreground">Architecture Threat Modeling RFC</span>
                          <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px]">
                            Graded (96/100)
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">Evaluated by Lead Instructor with detailed rubric scoring.</p>
                        <span className="text-[11px] text-text-tertiary font-mono">Submitted Sep 28, 2026</span>
                      </div>
                    </div>

                    <div className="relative">
                      <div className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-muted border border-border text-muted-foreground flex items-center justify-center text-[10px]">
                        ○
                      </div>
                      <div className="p-4 rounded-xl border border-border bg-card/60 space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-foreground">Course Completion & Verified Credential</span>
                          <Badge variant="outline" className="text-amber-500 border-amber-500/30 text-[10px]">
                            Due Oct 15, 2026
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">Final course survey and official verified certificate dispatch.</p>
                        <span className="text-[11px] text-muted-foreground font-mono">Deadline: 23:59 UTC</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 4. Q&A TAB (Udemy Community & Instructor Discussions) */}
              {activeTab === "qa" && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div className="relative flex-1 min-w-[240px]">
                      <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        placeholder="Search all course questions..."
                        value={qaSearch}
                        onChange={(e) => setQaSearch(e.target.value)}
                        className="pl-9 text-xs bg-background border-border text-foreground placeholder:text-muted-foreground focus:border-primary"
                      />
                    </div>
                    <Button
                      onClick={() => setNewQaModalOpen(true)}
                      className="gap-2 text-xs font-semibold shrink-0 bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      <Plus className="w-4 h-4" /> Ask a new question
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {filteredQA.map((q) => (
                      <div
                        key={q.id}
                        className="p-5 rounded-xl border border-border bg-card hover:border-primary/40 transition-colors space-y-3 shadow-xs"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1">
                            <h4 className="font-bold text-sm text-foreground hover:text-primary cursor-pointer">
                              {q.title}
                            </h4>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <span>{q.author}</span>
                              <span>•</span>
                              <span>{q.timestamp}</span>
                              {q.videoTimestamp !== undefined && (
                                <>
                                  <span>•</span>
                                  <button
                                    onClick={() => seekTo(q.videoTimestamp!)}
                                    className="text-primary font-mono font-bold hover:underline"
                                  >
                                    @{formatTime(q.videoTimestamp)}
                                  </button>
                                </>
                              )}
                            </div>
                          </div>

                          {/* Upvote Pill */}
                          <button
                            type="button"
                            onClick={() => handleToggleUpvote(q.id)}
                            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition-all ${q.upvoted
                              ? "bg-primary text-primary-foreground border-primary"
                              : "border-border text-muted-foreground hover:bg-muted hover:text-foreground"
                              }`}
                          >
                            <ThumbsUp className="w-3 h-3" />
                            <span>{q.upvotes}</span>
                          </button>
                        </div>

                        <p className="text-xs text-foreground/90 leading-relaxed">{q.content}</p>

                        {/* Replies */}
                        {q.replies.length > 0 && (
                          <div className="space-y-2 border-t border-border pt-3 mt-3">
                            {q.replies.map((r) => (
                              <div
                                key={r.id}
                                className="p-3 rounded-lg bg-muted/40 border border-border/50 text-xs space-y-1"
                              >
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-foreground">{r.author}</span>
                                  {r.role === "Instructor" && (
                                    <Badge className="bg-primary/20 text-primary hover:bg-primary/30 text-[10px] py-0 px-1.5 border-primary/30">
                                      Instructor
                                    </Badge>
                                  )}
                                  <span className="text-muted-foreground">• {r.timestamp}</span>
                                </div>
                                <p className="text-foreground/90">{r.content}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 3. NOTES TAB (Udemy Timestamped Notes Engine) */}
              {activeTab === "notes" && (
                <div className="space-y-6">
                  {/* Note Creation Bar */}
                  <div className="p-4 rounded-xl border border-border bg-card space-y-3 shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-primary" /> Create a note at{" "}
                        <strong className="text-amber-500 font-mono">
                          {formatTime(noteDraft.timestamp || currentTime)}
                        </strong>
                      </span>
                      <span className="text-[11px] text-muted-foreground">
                        Press <strong>B</strong> while watching anytime
                      </span>
                    </div>

                    <div className="space-y-2">
                      <textarea
                        rows={3}
                        value={noteDraft.text}
                        onChange={(e) =>
                          setNoteDraft({
                            ...noteDraft,
                            open: true,
                            timestamp: noteDraft.timestamp || currentTime,
                            text: e.target.value,
                          })
                        }
                        placeholder="Type your notes or insights here (Markdown supported)..."
                        className="w-full text-xs rounded-lg border border-border bg-background p-3 text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:border-primary"
                      />
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-muted-foreground hover:text-foreground text-xs"
                          onClick={() => setNoteDraft({ open: false, timestamp: 0, text: "" })}
                        >
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          onClick={saveNote}
                          disabled={!noteDraft.text.trim()}
                          className="text-xs bg-primary text-primary-foreground hover:bg-primary/90"
                        >
                          Save Note
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Filter and Notes list */}
                  <div className="flex items-center justify-between border-b border-border pb-3">
                    <div className="flex items-center gap-2 text-xs">
                      <button
                        type="button"
                        onClick={() => setNoteFilter("all")}
                        className={`px-3 py-1 rounded-md font-semibold transition-colors ${noteFilter === "all" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                          }`}
                      >
                        All Lectures ({notes.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setNoteFilter("current")}
                        className={`px-3 py-1 rounded-md font-semibold transition-colors ${noteFilter === "current" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                          }`}
                      >
                        Current Lecture (
                        {notes.filter((n) => n.lessonId === activeLesson?.id).length})
                      </button>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs text-muted-foreground hover:text-foreground gap-1.5"
                      onClick={() => {
                        const text = notes
                          .map(
                            (n) =>
                              `[${formatTime(n.timestamp)}] (Lesson: ${n.lessonId})\n${n.text}\n`
                          )
                          .join("\n---\n\n");
                        const blob = new Blob([text], { type: "text/markdown" });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement("a");
                        a.href = url;
                        a.download = `${course.title}-Notes.md`;
                        a.click();
                        URL.revokeObjectURL(url);
                      }}
                    >
                      <Download className="w-3.5 h-3.5" /> Export Notes (.md)
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {displayedNotes.length === 0 ? (
                      <div className="text-center py-12 space-y-2 text-muted-foreground">
                        <FileText className="w-10 h-10 mx-auto opacity-40" />
                        <p className="text-sm font-medium">No notes saved yet.</p>
                        <p className="text-xs">
                          Click into the note box above or press <strong>B</strong> on your keyboard to save timestamped notes.
                        </p>
                      </div>
                    ) : (
                      displayedNotes.map((note, index) => (
                        <div
                          key={index}
                          className="p-4 rounded-xl border border-border bg-card hover:border-primary/40 transition-colors space-y-2 group shadow-xs"
                        >
                          <div className="flex items-center justify-between">
                            <button
                              type="button"
                              onClick={() => seekTo(note.timestamp)}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 hover:bg-primary text-primary hover:text-primary-foreground font-mono text-xs font-bold transition-all"
                            >
                              <Play className="w-3 h-3 fill-current" />
                              {formatTime(note.timestamp)}
                            </button>
                            <span className="text-[11px] text-muted-foreground">
                              Lesson {note.lessonId}
                            </span>
                          </div>
                          <p className="text-xs text-foreground/90 whitespace-pre-wrap">
                            {note.text}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* 4. ANNOUNCEMENTS TAB (Udemy Feature) */}
              {activeTab === "announcements" && (
                <div className="space-y-6">
                  <div className="p-5 rounded-xl border border-border bg-card space-y-3 shadow-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground font-bold flex items-center justify-center text-sm shadow-xs">
                        AM
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-foreground">Alex Morgan (Instructor)</h4>
                        <p className="text-xs text-muted-foreground">Posted an announcement • 3 days ago</p>
                      </div>
                    </div>
                    <h3 className="text-base font-bold text-foreground pt-1">
                      Welcome to the 2026 Curriculum Update!
                    </h3>
                    <p className="text-xs text-foreground/80 leading-relaxed">
                      Hello everyone! We have just refreshed all architecture diagrams and updated the hands-on code examples for the latest production standards. Check out the Resources tab for the new reference PDF. Happy learning!
                    </p>
                  </div>
                </div>
              )}

              {/* 5. REVIEWS TAB (Student Ratings & Distribution) */}
              {activeTab === "reviews" && (
                <div className="space-y-8">
                  {/* Score and Bar Distribution (Udemy Review Header) */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 rounded-xl border border-border bg-card items-center shadow-xs">
                    <div className="text-center space-y-1 md:border-r border-border md:pr-6">
                      <div className="text-5xl font-black text-amber-500">4.8</div>
                      <div className="flex items-center justify-center gap-1 text-amber-500 py-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-current" />
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground">Course Rating • 1,420 Reviews</p>
                    </div>

                    {/* Rating distribution breakdown */}
                    <div className="md:col-span-2 space-y-2">
                      {[
                        { star: 5, pct: 76 },
                        { star: 4, pct: 18 },
                        { star: 3, pct: 4 },
                        { star: 2, pct: 1 },
                        { star: 1, pct: 1 },
                      ].map((row) => (
                        <div key={row.star} className="flex items-center gap-3 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1 w-14 shrink-0 font-medium text-foreground">
                            <span>{row.star} stars</span>
                          </div>
                          <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                            <div
                              className="h-full bg-amber-500 rounded-full"
                              style={{ width: `${row.pct}%` }}
                            />
                          </div>
                          <span className="w-8 text-right font-mono text-muted-foreground">{row.pct}%</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Reviews List & Search */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="relative flex-1">
                        <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          placeholder="Search student feedback..."
                          value={reviewSearch}
                          onChange={(e) => setReviewSearch(e.target.value)}
                          className="pl-9 text-xs bg-background border-border text-foreground placeholder:text-muted-foreground focus:border-primary"
                        />
                      </div>
                      <Button
                        onClick={() => setRatingModalOpen(true)}
                        size="sm"
                        className="text-xs gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90"
                      >
                        <Star className="w-3.5 h-3.5 text-amber-500 fill-current" /> Write a Review
                      </Button>
                    </div>

                    <div className="space-y-4">
                      {filteredReviews.map((rev) => (
                        <div
                          key={rev.id}
                          className="p-4 rounded-xl border border-border bg-card space-y-2 shadow-xs"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-xs">
                                {rev.userName.charAt(0)}
                              </div>
                              <div>
                                <p className="font-bold text-xs text-foreground">{rev.userName}</p>
                                <div className="flex items-center gap-1 text-amber-500">
                                  {[...Array(rev.rating)].map((_, i) => (
                                    <Star key={i} className="w-3 h-3 fill-current" />
                                  ))}
                                  <span className="text-[10px] text-muted-foreground ml-1">
                                    {rev.date}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                          <p className="text-xs text-foreground/85 leading-relaxed">{rev.comment}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* 6. RESOURCES TAB (Downloadable Materials) */}
              {activeTab === "resources" && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-base font-bold text-foreground mb-1">
                      Downloadable Lecture Materials & Tools
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Starter codes, exercise files, cheatsheets, and reference slides for {activeLesson?.title}.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {sampleResources.map((res, i) => (
                      <div
                        key={i}
                        className="p-4 rounded-xl border border-border bg-card flex items-center justify-between hover:border-primary/40 transition-colors shadow-xs"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                            <FolderDown className="w-5 h-5" />
                          </div>
                          <div className="truncate">
                            <p className="font-bold text-xs text-foreground truncate">{res.name}</p>
                            <span className="text-[11px] text-muted-foreground">{res.size}</span>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="secondary"
                          className="text-xs gap-1.5 shrink-0 hover:bg-primary hover:text-primary-foreground"
                          onClick={() => alert(`Downloading ${res.name}...`)}
                        >
                          <Download className="w-3.5 h-3.5" /> Download
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 7. SEARCH TAB */}
              {activeTab === "search" && (
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search video transcripts, lessons, and notes..."
                      value={courseSearchQuery}
                      onChange={(e) => setCourseSearchQuery(e.target.value)}
                      className="pl-9 text-xs bg-background border-border text-foreground placeholder:text-muted-foreground focus:border-primary"
                    />
                  </div>

                  <div className="space-y-2 pt-2">
                    <p className="text-xs font-semibold text-muted-foreground">MATCHING LESSONS & SECTIONS</p>
                    {allLessons
                      .filter(
                        (l) =>
                          !courseSearchQuery ||
                          l.title.toLowerCase().includes(courseSearchQuery.toLowerCase())
                      )
                      .map((l) => (
                        <div
                          key={l.id}
                          onClick={() => setActiveLessonId(l.id)}
                          className="p-3 rounded-lg border border-border bg-card hover:bg-muted/50 hover:border-primary/50 cursor-pointer flex items-center justify-between text-xs transition-colors shadow-xs"
                        >
                          <div className="flex items-center gap-2">
                            <Play className="w-3.5 h-3.5 text-primary" />
                            <span className="font-semibold text-foreground">{l.title}</span>
                          </div>
                          <Badge variant="outline" className="text-[10px] text-muted-foreground border-border">
                            {l.type}
                          </Badge>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ════════════════════════════════════════════════════════════════════════
            3. RIGHT SIDEBAR: COURSE CONTENT CURRICULUM DRAWER (Udemy Accordion)
           ════════════════════════════════════════════════════════════════════════ */}
        {sidebarOpen && (
          <aside className="w-full lg:w-[380px] xl:w-[420px] bg-card border-l border-border flex flex-col shrink-0 overflow-hidden z-20">
            {/* Drawer Header */}
            <div className="p-4 border-b border-border flex items-center justify-between bg-card">
              <div>
                <h3 className="font-bold text-sm text-foreground">Course content</h3>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {course.sections.length} sections • {totalLessonsCount} lectures • {totalLessonsCount * 8}m total length
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSidebarOpen(false)}
                className="text-muted-foreground hover:text-foreground p-1 rounded-md hover:bg-muted transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick search inside curriculum */}
            <div className="p-3 border-b border-border bg-muted/30">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Filter curriculum..."
                  value={curriculumSearch}
                  onChange={(e) => setCurriculumSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-background border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:border-primary"
                />
              </div>
            </div>

            {/* Sections List */}
            <div className="flex-1 overflow-y-auto divide-y divide-border">
              {course.sections.map((section, sIdx) => {
                const isExpanded = expandedSections[section.id] ?? true;
                const sectionLessons = section.lessons.filter(
                  (l) =>
                    !curriculumSearch ||
                    l.title.toLowerCase().includes(curriculumSearch.toLowerCase())
                );
                const sectionCompletedCount = section.lessons.filter(
                  (l) => completedLessons[l.id]
                ).length;

                return (
                  <div key={section.id} className="bg-card">
                    {/* Section Accordion Trigger */}
                    <button
                      type="button"
                      onClick={() => toggleSection(section.id)}
                      className="w-full p-4 flex items-start justify-between text-left hover:bg-muted/50 transition-colors"
                    >
                      <div className="space-y-0.5 pr-2">
                        <p className="font-bold text-xs text-foreground">
                          Section {sIdx + 1}: {section.title}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          {sectionCompletedCount} / {section.lessons.length} • {section.lessons.length * 8}min
                        </p>
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                      )}
                    </button>

                    {/* Section Lessons List */}
                    {isExpanded && (
                      <div className="divide-y divide-border/60 bg-muted/20">
                        {sectionLessons.map((lesson, lIdx) => {
                          const isCurrent = lesson.id === activeLesson?.id;
                          const isDone = !!completedLessons[lesson.id];

                          return (
                            <div
                              key={lesson.id}
                              className={`p-3.5 flex items-start gap-3 transition-colors cursor-pointer ${isCurrent
                                ? "bg-primary/10 border-l-4 border-primary text-foreground"
                                : "hover:bg-muted/60 text-foreground"
                                }`}
                              onClick={() => setActiveLessonId(lesson.id)}
                            >
                              {/* Udemy-Style Interactive Completion Checkbox */}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleLessonCompleted(lesson.id);
                                }}
                                className={`mt-0.5 shrink-0 w-4 h-4 rounded flex items-center justify-center border transition-all ${isDone
                                  ? "bg-primary border-primary text-primary-foreground shadow-xs"
                                  : "border-muted-foreground/40 hover:border-primary bg-background"
                                  }`}
                                title={isDone ? "Mark as uncompleted" : "Mark as completed"}
                              >
                                {isDone && <Check className="w-3 h-3 stroke-[3]" />}
                              </button>

                              {/* Lesson Info */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <span
                                    className={`text-xs line-clamp-2 ${isCurrent
                                      ? "text-primary font-bold"
                                      : "text-foreground/90 font-medium"
                                      }`}
                                  >
                                    {lIdx + 1}. {lesson.title}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 mt-1 text-[11px] text-muted-foreground">
                                  <span className="flex items-center gap-1.5">
                                    {lesson.type === "video" && <Video className="w-3 h-3 text-primary" />}
                                    {lesson.type === "quiz" && <HelpCircle className="w-3 h-3 text-amber-500" />}
                                    {lesson.type === "assignment" && <ClipboardList className="w-3 h-3 text-purple-500" />}
                                    {lesson.type === "coding" && <Code2 className="w-3 h-3 text-cyan-500" />}
                                    {lesson.type === "article" && <FileText className="w-3 h-3 text-emerald-500" />}
                                    <span className="capitalize font-medium text-muted-foreground">
                                      {lesson.type === "coding" ? "Coding Task" : lesson.type}
                                    </span>
                                  </span>
                                  <span>•</span>
                                  <span>
                                    {lesson.type === "quiz"
                                      ? "3 Questions"
                                      : lesson.type === "coding"
                                        ? "IDE Test Suite"
                                        : lesson.type === "assignment"
                                          ? "Rubric Submit"
                                          : "8 min"}
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </aside>
        )}
      </div>

      {/* ════════════════════════════════════════════════════════════════════════
          4. DIALOGS (Ask Question & Leave Rating)
         ════════════════════════════════════════════════════════════════════════ */}

      {/* Ask Question Dialog */}
      <Dialog open={newQaModalOpen} onOpenChange={setNewQaModalOpen}>
        <DialogContent className="max-w-xl bg-card text-foreground border-border p-6 shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-foreground">
              Ask a New Question
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Post to the instructor and peer community for {activeLesson?.title}.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateQA} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground/90">Question Title *</label>
              <Input
                placeholder="e.g. How does error propagation work in worker pools?"
                value={newQaTitle}
                onChange={(e) => setNewQaTitle(e.target.value)}
                required
                className="bg-background border-border text-foreground text-xs focus:border-primary"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground/90">Details & Code Context *</label>
              <textarea
                rows={4}
                placeholder="Describe what you tried, expected behavior, and code snippets..."
                value={newQaContent}
                onChange={(e) => setNewQaContent(e.target.value)}
                required
                className="w-full text-xs rounded-lg border border-border bg-background p-3 text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:border-primary"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                className="border-border text-muted-foreground hover:text-foreground"
                onClick={() => setNewQaModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" className="text-xs bg-primary text-primary-foreground hover:bg-primary/90">
                Post Question
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Rating & Review Dialog */}
      <Dialog open={ratingModalOpen} onOpenChange={setRatingModalOpen}>
        <DialogContent className="max-w-lg bg-card text-foreground border-border p-6 shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-foreground">
              How would you rate this course?
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Select a star rating and share your learning feedback with the instructor.
            </DialogDescription>
          </DialogHeader>

          {reviewSubmitted ? (
            <div className="py-8 text-center space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
              <h4 className="text-base font-bold text-foreground">Thank you for your feedback!</h4>
              <p className="text-xs text-muted-foreground">Your review has been published to the course page.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmitReview} className="space-y-4 py-2">
              <div className="flex items-center justify-center gap-2 py-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setUserRating(star)}
                    className="p-1 text-amber-500 hover:scale-125 transition-transform"
                  >
                    <Star
                      className={`w-8 h-8 ${star <= userRating ? "fill-amber-500" : "text-muted-foreground/30"
                        }`}
                    />
                  </button>
                ))}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground/90">Tell us about your personal experience</label>
                <textarea
                  rows={4}
                  placeholder="What did you like most? How did the course help your career?"
                  value={userReviewText}
                  onChange={(e) => setUserReviewText(e.target.value)}
                  required
                  className="w-full text-xs rounded-lg border border-border bg-background p-3 text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:border-primary"
                />
              </div>

              <DialogFooter className="pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="border-border text-muted-foreground hover:text-foreground"
                  onClick={() => setRatingModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" className="text-xs bg-primary text-primary-foreground hover:bg-primary/90">
                  Submit Review
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
