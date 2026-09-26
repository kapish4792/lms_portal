"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { useRoleGuard } from "@/lib/hooks/use-role-guard";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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
import { useDiscussionsStore } from "@/lib/store/discussions-store";
import { useCoursesStore } from "@/lib/store/courses-store";
import { ROLE_LABELS } from "@/lib/permissions";
import {
  MessageSquare,
  Search,
  Plus,
  ThumbsUp,
  Pin,
  CheckCircle2,
  Trash2,
  Send,
  User,
  GraduationCap,
  SlidersHorizontal,
  X,
} from "lucide-react";

export default function DiscussionsPage() {
  const params = useParams<{ role: string }>();
  const user = useRoleGuard(params.role);

  const threads = useDiscussionsStore((s) => s.threads);
  const addThread = useDiscussionsStore((s) => s.addThread);
  const addReply = useDiscussionsStore((s) => s.addReply);
  const togglePin = useDiscussionsStore((s) => s.togglePin);
  const toggleResolve = useDiscussionsStore((s) => s.toggleResolve);
  const upvoteThread = useDiscussionsStore((s) => s.upvoteThread);
  const deleteThread = useDiscussionsStore((s) => s.deleteThread);
  const courses = useCoursesStore((s) => s.courses);

  const [search, setSearch] = useState("");
  const [filterCourse, setFilterCourse] = useState("All Courses");
  const [filterStatus, setFilterStatus] = useState("All Discussions");
  const [modalOpen, setModalOpen] = useState(false);
  const [expandedThreadId, setExpandedThreadId] = useState<string | null>(null);

  // New thread form state
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [courseTitle, setCourseTitle] = useState("");
  const [lessonName, setLessonName] = useState("");

  // New reply text per thread
  const [replyText, setReplyText] = useState("");

  const scoped = useMemo(() => (user ? threads.filter((t) => t.org === user.org) : []), [threads, user]);
  const scopedCourses = useMemo(() => (user ? courses.filter((c) => c.org === user.org) : []), [courses, user]);

  const filtered = scoped.filter((t) => {
    const matchesSearch =
      !search.trim() ||
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.content.toLowerCase().includes(search.toLowerCase()) ||
      t.authorName.toLowerCase().includes(search.toLowerCase());
    const matchesCourse = filterCourse === "All Courses" || t.courseTitle === filterCourse;
    const matchesStatus =
      filterStatus === "All Discussions" ||
      (filterStatus === "pinned" && t.isPinned) ||
      (filterStatus === "resolved" && t.isResolved) ||
      (filterStatus === "unanswered" && t.replies.length === 0);
    return matchesSearch && matchesCourse && matchesStatus;
  });

  if (!user) return null;

  const isInstructorOrAdmin =
    user.role === "instructor" || user.role === "org-admin" || user.role === "super-admin" || user.role === "lms-admin" || user.role === "dept-head";

  const handleCreateThread = () => {
    if (!title.trim() || !content.trim()) return;
    addThread({
      title,
      content,
      courseTitle: courseTitle || (scopedCourses[0]?.title ?? "General Discussion"),
      lessonName: lessonName || undefined,
      authorName: user.name,
      authorRole: user.role,
      isPinned: false,
      isResolved: false,
      org: user.org,
    });
    setModalOpen(false);
    setTitle("");
    setContent("");
    setLessonName("");
  };

  const handlePostReply = (threadId: string) => {
    if (!replyText.trim()) return;
    addReply(threadId, {
      authorName: user.name,
      authorRole: user.role,
      content: replyText,
      isInstructorReply: isInstructorOrAdmin,
    });
    setReplyText("");
  };

  return (
    <AppShell user={user}>
      <div className="p-6 space-y-6 max-w-5xl">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-text-primary">Discussions & Social Q&A</h1>
              <Badge variant="outline">Module 14</Badge>
            </div>
            <p className="text-text-secondary mt-1">
              Peer collaboration, lesson Q&A, and verified instructor answers (§3.19)
            </p>
          </div>

          <Button className="gap-2" onClick={() => setModalOpen(true)}>
            <Plus className="w-4 h-4" />
            Start Discussion
          </Button>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 flex-wrap rounded-xl border border-surface-border bg-surface-sunken/40 p-3">
          <div className="relative flex-1 min-w-55 sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-tertiary" />
            <Input
              placeholder="Search questions, answers, topics..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 pl-9 bg-surface-base"
            />
          </div>

          <div className="hidden sm:block h-6 w-px bg-surface-border" />

          <div className="flex items-center gap-2 flex-wrap">
            <SlidersHorizontal className="hidden sm:block w-3.5 h-3.5 text-text-tertiary shrink-0" />
            <Select value={filterCourse} onValueChange={(v) => setFilterCourse(v ?? "All Courses")}>
              <SelectTrigger size="sm" className="w-48 bg-surface-base">
                <SelectValue placeholder="All Courses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All Courses">All Courses</SelectItem>
                {scopedCourses.map((c) => (
                  <SelectItem key={c.id} value={c.title}>
                    {c.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filterStatus}
              onValueChange={(v) => {
                if (v === "All Discussions" || v === "pinned" || v === "resolved" || v === "unanswered") {
                  setFilterStatus(v);
                }
              }}
            >
              <SelectTrigger size="sm" className="w-40 bg-surface-base">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All Discussions">All Discussions</SelectItem>
                <SelectItem value="pinned">Pinned Only</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="unanswered">Unanswered</SelectItem>
              </SelectContent>
            </Select>

            {(search || filterCourse !== "All Courses" || filterStatus !== "All Discussions") && (
              <Button
                variant="ghost"
                size="sm"
                className="h-9 gap-1.5 text-text-tertiary hover:text-text-primary"
                onClick={() => {
                  setSearch("");
                  setFilterCourse("All Courses");
                  setFilterStatus("All Discussions");
                }}
              >
                <X className="w-3.5 h-3.5" />
                Clear
              </Button>
            )}
          </div>
        </div>

        {/* Discussion Threads List */}
        <div className="space-y-4">
          {filtered.map((t) => {
            const isExpanded = expandedThreadId === t.id;

            return (
              <Card
                key={t.id}
                className={`border-surface-border shadow-card transition-all ${
                  t.isPinned ? "border-l-4 border-l-brand-500" : ""
                }`}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        {t.isPinned && (
                          <Badge variant="outline" className="text-brand-500 border-brand-500/30 gap-1 text-xs">
                            <Pin className="w-3 h-3" /> Pinned
                          </Badge>
                        )}
                        {t.isResolved && (
                          <Badge variant="outline" className="text-success border-success/30 gap-1 text-xs">
                            <CheckCircle2 className="w-3 h-3" /> Resolved
                          </Badge>
                        )}
                        <span className="text-xs bg-surface-sunken px-2 py-0.5 rounded border border-surface-border text-text-secondary">
                          {t.courseTitle}
                        </span>
                        {t.lessonName && (
                          <span className="text-xs text-text-tertiary">· {t.lessonName}</span>
                        )}
                      </div>

                      <h3
                        className="text-base font-semibold text-text-primary hover:text-brand-500 cursor-pointer pt-1"
                        onClick={() => setExpandedThreadId(isExpanded ? null : t.id)}
                      >
                        {t.title}
                      </h3>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-1.5 text-xs text-text-secondary"
                        onClick={() => upvoteThread(t.id)}
                      >
                        <ThumbsUp className="w-3.5 h-3.5" />
                        {t.upvotes}
                      </Button>

                      {isInstructorOrAdmin && (
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            title={t.isPinned ? "Unpin thread" : "Pin thread"}
                            onClick={() => togglePin(t.id)}
                            className={t.isPinned ? "text-brand-500" : "text-text-tertiary"}
                          >
                            <Pin className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            title={t.isResolved ? "Mark unresolved" : "Mark resolved"}
                            onClick={() => toggleResolve(t.id)}
                            className={t.isResolved ? "text-success" : "text-text-tertiary"}
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            className="text-text-tertiary hover:text-danger"
                            title="Delete thread"
                            onClick={() => deleteThread(t.id)}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>

                  <p className="text-sm text-text-secondary mt-2 leading-relaxed">{t.content}</p>

                  <div className="flex items-center justify-between text-xs text-text-tertiary pt-2">
                    <div className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5" />
                      <span>{t.authorName}</span>
                      <Badge variant="outline" className="text-[10px] uppercase py-0 px-1">
                        {ROLE_LABELS[t.authorRole as keyof typeof ROLE_LABELS] ?? t.authorRole}
                      </Badge>
                      <span>· {new Date(t.timestamp).toLocaleDateString()}</span>
                    </div>

                    <button
                      className="text-brand-500 hover:underline font-medium flex items-center gap-1"
                      onClick={() => setExpandedThreadId(isExpanded ? null : t.id)}
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      {t.replies.length} {t.replies.length === 1 ? "Reply" : "Replies"}
                    </button>
                  </div>
                </CardHeader>

                {/* Expanded Replies & Reply Box */}
                {isExpanded && (
                  <CardContent className="border-t border-surface-border pt-4 space-y-4 bg-surface-sunken/20">
                    {/* Replies List */}
                    <div className="space-y-3">
                      {t.replies.map((reply) => (
                        <div
                          key={reply.id}
                          className={`p-3.5 rounded-lg border text-sm space-y-2 ${
                            reply.isInstructorReply
                              ? "bg-brand-500/5 border-brand-500/30"
                              : "bg-surface-base border-surface-border"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-text-primary text-xs">{reply.authorName}</span>
                              {reply.isInstructorReply && (
                                <Badge className="bg-brand-500 text-white text-[10px] py-0 px-1.5 gap-1">
                                  <GraduationCap className="w-3 h-3" /> Instructor
                                </Badge>
                              )}
                              <span className="text-[11px] text-text-tertiary">
                                {new Date(reply.timestamp).toLocaleString()}
                              </span>
                            </div>
                          </div>
                          <p className="text-text-secondary leading-relaxed">{reply.content}</p>
                        </div>
                      ))}

                      {t.replies.length === 0 && (
                        <p className="text-xs text-text-tertiary italic text-center py-2">
                          No replies yet. Be the first to share an answer or insight.
                        </p>
                      )}
                    </div>

                    {/* Reply Input Box */}
                    <div className="flex items-start gap-2 pt-2">
                      <Textarea
                        placeholder="Write a response or answer..."
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        className="text-sm min-h-[72px]"
                      />
                      <Button
                        size="sm"
                        className="gap-1.5 shrink-0"
                        onClick={() => handlePostReply(t.id)}
                        disabled={!replyText.trim()}
                      >
                        <Send className="w-3.5 h-3.5" /> Reply
                      </Button>
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}

          {filtered.length === 0 && (
            <div className="text-center py-16 text-text-tertiary">
              No discussions found matching criteria. Start a new thread!
            </div>
          )}
        </div>

        {/* Start Discussion Modal */}
        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogContent className="max-w-2xl sm:max-w-3xl p-6 sm:p-8">
            <DialogHeader>
              <DialogTitle>Start New Discussion</DialogTitle>
              <DialogDescription>
                Ask a question to instructors and peers or initiate a topical study thread.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <div className="space-y-1.5">
                <Label>Question / Discussion Title</Label>
                <Input
                  placeholder="e.g. How does server-side caching affect session cookies?"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label>Associated Course</Label>
                <Select value={courseTitle} onValueChange={(v) => setCourseTitle(v ?? "")}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select course" />
                  </SelectTrigger>
                  <SelectContent>
                    {scopedCourses.map((c) => (
                      <SelectItem key={c.id} value={c.title}>
                        {c.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>Lesson (Optional)</Label>
                <Input
                  placeholder="e.g. Chapter 3: State Machines"
                  value={lessonName}
                  onChange={(e) => setLessonName(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label>Details & Context</Label>
                <Textarea
                  placeholder="Elaborate on your question, problem, or topic..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
            </div>

            <DialogFooter>
              <Button onClick={handleCreateThread} disabled={!title.trim() || !content.trim()}>
                Post Discussion
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppShell>
  );
}
