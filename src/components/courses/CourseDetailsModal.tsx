"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Course } from "@/lib/store/courses-store";
import { useEnrollmentsStore } from "@/lib/store/enrollments-store";
import type { MockUser } from "@/lib/mock/users";
import {
  BookOpen,
  Clock,
  PlayCircle,
  CheckCircle2,
  Users,
  Star,
  Award,
  Sparkles,
  Check,
  Video,
  HelpCircle,
  ClipboardList,
  Code2,
  FileText,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface CourseDetailsModalProps {
  course: Course | null;
  isOpen: boolean;
  onClose: () => void;
  user: MockUser | null;
}

export function CourseDetailsModal({
  course,
  isOpen,
  onClose,
  user,
}: CourseDetailsModalProps) {
  const [activeTab, setActiveTab] = useState<"about" | "syllabus" | "instructor">("about");
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({ "s-1": true });
  const [justEnrolled, setJustEnrolled] = useState(false);

  const enrollments = useEnrollmentsStore((s) => s.enrollments);
  const enroll = useEnrollmentsStore((s) => s.enroll);

  if (!course) return null;

  const currentUserId = user?.identifier || "learner@lms.dev";
  const userEnrollment = enrollments.find(
    (e) => e.userId === currentUserId && e.courseId === course.id
  );
  const isEnrolled = !!userEnrollment || justEnrolled;

  const totalLessons = (course.sections || []).reduce(
    (acc, s) => acc + (s.lessons?.length || 0),
    0
  );

  const toggleSection = (sId: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sId]: !prev[sId],
    }));
  };

  const handleEnrollNow = () => {
    if (!user) return;
    enroll(currentUserId, course.id);
    setJustEnrolled(true);
  };

  const getLessonIcon = (type: string) => {
    switch (type) {
      case "video":
        return <Video className="w-3.5 h-3.5 text-primary" />;
      case "quiz":
        return <HelpCircle className="w-3.5 h-3.5 text-amber-500" />;
      case "assignment":
        return <ClipboardList className="w-3.5 h-3.5 text-purple-500" />;
      case "coding":
        return <Code2 className="w-3.5 h-3.5 text-blue-500" />;
      default:
        return <FileText className="w-3.5 h-3.5 text-muted-foreground" />;
    }
  };

  const role = user?.role || "learner";

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0 border border-border">
        {/* Course Banner Header */}
        <div className="p-6 border-b border-border bg-gradient-to-br from-card via-card to-primary/5 space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className="text-primary border-primary/30 bg-primary/10 text-xs">
              {course.category}
            </Badge>
            <Badge variant="outline" className="text-xs">
              Pacing: Self-Paced
            </Badge>
            <Badge variant="outline" className="text-xs">
              {course.department || "Enterprise"}
            </Badge>
            <span className="text-xs text-amber-500 font-semibold flex items-center gap-1">
              <Star className="w-3.5 h-3.5 fill-current" /> {course.rating || 4.8} ({course.enrolled || 214} ratings)
            </span>
          </div>

          <DialogTitle className="text-2xl font-black text-foreground tracking-tight">
            {course.title}
          </DialogTitle>

          <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
            Comprehensive curriculum aligned with Open edX standards and Moodle academic rigor. Includes interactive video lectures, CAPA quizzes, and hands-on SpeedGrader evaluated assignments.
          </DialogDescription>

          <div className="flex items-center justify-between pt-2 flex-wrap gap-4">
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5 font-medium">
                <BookOpen className="w-4 h-4 text-primary" /> {course.sections.length} Sections
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <Clock className="w-4 h-4 text-primary" /> {totalLessons} Units • ~4.5 Hours
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <Award className="w-4 h-4 text-emerald-600" /> Verified Credential
              </span>
            </div>

            {/* Action CTA Button */}
            {isEnrolled ? (
              <Button
                size="sm"
                className="gap-2 font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-md"
                render={<Link href={`/${role}/courses/${course.id}/player`} />}
              >
                <PlayCircle className="w-4 h-4" /> Start / Resume Learning
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={handleEnrollNow}
                className="gap-2 font-bold text-xs bg-primary text-primary-foreground hover:bg-primary/90 shadow-md"
              >
                <Sparkles className="w-4 h-4" /> Enroll Now (Free Track)
              </Button>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-border bg-card px-6 flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("about")}
            className={`py-3 px-3 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
              activeTab === "about"
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Overview & Objectives
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("syllabus")}
            className={`py-3 px-3 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
              activeTab === "syllabus"
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Course Syllabus ({totalLessons} Units)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("instructor")}
            className={`py-3 px-3 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
              activeTab === "instructor"
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Instructor Profile
          </button>
        </div>

        {/* Tab Content Panels */}
        <div className="p-6 space-y-6">
          {activeTab === "about" && (
            <div className="space-y-6">
              {/* Learning Objectives */}
              <div className="p-5 rounded-2xl border border-border bg-muted/20 space-y-3">
                <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" /> What You Will Master
                </h4>
                <div className="grid sm:grid-cols-2 gap-2.5 text-xs text-foreground/90">
                  {course.objectives.map((obj, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{obj}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Course Requirements */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Prerequisites & Hardware Requirements
                </h4>
                <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Basic knowledge of software systems and web architecture.</li>
                  <li>Modern web browser (Chrome, Firefox, Safari, Edge) with JavaScript enabled.</li>
                  <li>No prior regulatory certification required — beginner to intermediate level.</li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === "syllabus" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Open edX 5-Level Hierarchy: Course → Sections → Units</span>
                <span>Passing Grade: 70% Cutoff</span>
              </div>

              <div className="space-y-3">
                {course.sections.map((section, idx) => {
                  const isOpen = expandedSections[section.id] ?? (idx === 0);
                  return (
                    <div
                      key={section.id}
                      className="rounded-xl border border-border bg-card overflow-hidden"
                    >
                      <button
                        type="button"
                        onClick={() => toggleSection(section.id)}
                        className="w-full p-4 text-left flex items-center justify-between font-bold text-xs sm:text-sm hover:bg-muted/40 transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="w-5 h-5 rounded-md bg-primary/10 text-primary flex items-center justify-center text-[10px]">
                            {idx + 1}
                          </span>
                          <span className="text-foreground">{section.title}</span>
                          <span className="text-[11px] text-muted-foreground font-normal">
                            ({section.lessons.length} units)
                          </span>
                        </div>
                        {isOpen ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                      </button>

                      {isOpen && (
                        <div className="divide-y divide-border border-t border-border bg-muted/10">
                          {section.lessons.map((lesson, lIdx) => (
                            <div
                              key={lesson.id}
                              className="p-3 pl-8 flex items-center justify-between text-xs hover:bg-muted/30 transition-colors"
                            >
                              <div className="flex items-center gap-2.5">
                                {getLessonIcon(lesson.type)}
                                <span className="font-medium text-foreground">{lesson.title}</span>
                              </div>
                              <Badge variant="outline" className="text-[10px] capitalize">
                                {lesson.type}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === "instructor" && (
            <div className="space-y-4">
              <div className="flex items-start gap-4 p-5 rounded-2xl border border-border bg-card">
                <div className="w-14 h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg shrink-0">
                  PN
                </div>
                <div className="space-y-1 flex-1">
                  <h4 className="font-bold text-foreground text-sm">Prof. Priya Nair</h4>
                  <p className="text-xs text-primary font-medium">Head of Engineering Curriculum, ESSCI</p>
                  <p className="text-xs text-muted-foreground leading-relaxed pt-1">
                    Specialist in embedded microelectronics, safety standards compliance, and modern distributed systems. Authored over 12 specialized tracks with high-fidelity practical assessments.
                  </p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2">
                    <span className="text-amber-500 font-semibold">⭐ 4.9 Rating</span>
                    <span>👥 3,400+ Students</span>
                    <span>🎓 6 Published Courses</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
