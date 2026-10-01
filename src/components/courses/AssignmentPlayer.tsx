"use client";

import { useState } from "react";
import {
  ClipboardList,
  CheckCircle2,
  Upload,
  FileText,
  Link2,
  ArrowRight,
  Sparkles,
  FileCheck,
  Clock,
  Award,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import type { Lesson } from "@/lib/store/courses-store";
import { useSubmissionsStore } from "@/lib/store/submissions-store";
import type { MockUser } from "@/lib/mock/users";

export function AssignmentPlayer({
  lesson,
  isCompleted,
  onComplete,
  onNextLesson,
  courseTitle = "Onboarding 2026: ESSCI Electronics & Culture",
  courseId = "c-1",
  user,
}: {
  lesson: Lesson;
  isCompleted: boolean;
  onComplete: () => void;
  onNextLesson?: () => void;
  courseTitle?: string;
  courseId?: string;
  user?: MockUser | null;
}) {
  const currentUserId = user?.identifier || "learner@lms.dev";
  const currentUserName = user?.name || "Rohan Deshmukh";

  const submissions = useSubmissionsStore((s) => s.submissions);
  const submitAssignment = useSubmissionsStore((s) => s.submitAssignment);
  const existingSubmission = submissions.find(
    (s) => s.lessonId === lesson.id && s.userId === currentUserId
  );

  const [submissionTab, setSubmissionTab] = useState<"text" | "upload">(
    existingSubmission?.submissionType === "upload" ? "upload" : "text"
  );
  const [repoUrl, setRepoUrl] = useState(
    existingSubmission?.repoUrl || "https://github.com/essci-org/security-hardening-rfc"
  );
  const [notes, setNotes] = useState(
    existingSubmission?.notes ||
      "Implemented role-based token sanitization with AES-GCM encryption for all PII data payload boundaries. Added automated unit and integration tests covering OWASP injection vectors."
  );
  const [files, setFiles] = useState<Array<{ name: string; size: string }>>(
    existingSubmission?.files?.length
      ? existingSubmission.files
      : [
          { name: "architecture_threat_model_v2.pdf", size: "2.4 MB" },
          { name: "compliance_audit_checklist.xlsx", size: "840 KB" },
        ]
  );
  const [submitted, setSubmitted] = useState(
    isCompleted || existingSubmission?.status === "graded" || existingSubmission?.status === "pending"
  );

  const isGraded = existingSubmission?.status === "graded";
  const score = existingSubmission?.totalScore ?? (isGraded ? 96 : undefined);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitAssignment({
      courseId,
      courseTitle,
      lessonId: lesson.id,
      lessonTitle: lesson.title,
      userId: currentUserId,
      userName: currentUserName,
      submissionType: submissionTab,
      repoUrl,
      notes,
      files,
      rubricScores: [
        { criterion: "Threat Modeling & Trust Boundaries", points: 32, maxPoints: 35 },
        { criterion: "Code Validation & Sanitization", points: 34, maxPoints: 35 },
        { criterion: "Security Policy Documentation", points: 28, maxPoints: 30 },
      ],
    });
    setSubmitted(true);
    onComplete();
  };

  const handleRemoveFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="w-full p-5 md:p-6 bg-card text-card-foreground rounded-2xl border border-border shadow-lg space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-500 flex items-center justify-center shrink-0">
            <ClipboardList className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-foreground">{lesson.title}</h2>
              <Badge variant="outline" className="text-purple-500 border-purple-500/30 bg-purple-500/10 text-[10px]">
                Practical Assignment
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Estimated duration: 45 min • Max Score: 100 pts • Peer & Instructor Evaluated
            </p>
          </div>
        </div>

        <Badge
          className={`px-3 py-1 font-bold text-xs self-start sm:self-center gap-1.5 ${
            isGraded
              ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
              : submitted
              ? "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30"
              : "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30"
          }`}
        >
          {isGraded ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5" /> Graded: {score}/100
            </>
          ) : submitted ? (
            <>
              <Clock className="w-3.5 h-3.5" /> Submitted (Pending Instructor Review)
            </>
          ) : (
            <>
              <Clock className="w-3.5 h-3.5" /> In Progress
            </>
          )}
        </Badge>
      </div>

      {/* Assignment Overview & Instructions */}
      <div className="p-4 rounded-xl border border-border bg-muted/30 space-y-3">
        <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
          <FileText className="w-4 h-4 text-primary" /> Assignment Guidelines & Scenario
        </h3>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Prepare a comprehensive architecture evaluation and threat mitigation plan for an internal microservice. Your submission must articulate how sensitive tokens and PII are protected against SQL injection, XSS, and unauthorized privilege escalation.
        </p>

        {/* Grading Rubric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <div className="p-3 rounded-lg border border-border bg-card space-y-1">
            <div className="flex items-center justify-between text-xs font-semibold text-foreground">
              <span>Threat Modeling</span>
              <span className="text-primary font-mono">35 pts</span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Clear diagram of trust boundaries and asset flows.
            </p>
          </div>
          <div className="p-3 rounded-lg border border-border bg-card space-y-1">
            <div className="flex items-center justify-between text-xs font-semibold text-foreground">
              <span>Code & Validation</span>
              <span className="text-primary font-mono">35 pts</span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Robust sanitization routines and unit test suite.
            </p>
          </div>
          <div className="p-3 rounded-lg border border-border bg-card space-y-1">
            <div className="flex items-center justify-between text-xs font-semibold text-foreground">
              <span>Documentation</span>
              <span className="text-primary font-mono">30 pts</span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Comprehensive RFC format with security policies.
            </p>
          </div>
        </div>
      </div>

      {/* Submission Form or Graded Feedback View */}
      {!submitted ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center gap-2 border-b border-border pb-2">
            <button
              type="button"
              onClick={() => setSubmissionTab("text")}
              className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                submissionTab === "text"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Text & Repository URL
            </button>
            <button
              type="button"
              onClick={() => setSubmissionTab("upload")}
              className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                submissionTab === "upload"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              File Attachments ({files.length})
            </button>
          </div>

          {submissionTab === "text" ? (
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Link2 className="w-3.5 h-3.5 text-primary" /> Repository or Documentation Link
                </label>
                <Input
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  placeholder="https://github.com/organization/project"
                  className="text-xs font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Implementation Summary & Defense Notes
                </label>
                <textarea
                  rows={4}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Summarize your architecture choices..."
                  className="w-full text-xs p-3 rounded-lg border border-border bg-background text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary/40 resize-none"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="border-2 border-dashed border-border rounded-xl p-5 text-center bg-muted/20 hover:bg-muted/40 transition-colors cursor-pointer">
                <Upload className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
                <p className="text-xs font-semibold text-foreground">Click to upload or drag files here</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">Supports PDF, DOCX, ZIP up to 25MB</p>
              </div>

              <div className="space-y-2">
                {files.map((file, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2.5 rounded-lg border border-border bg-card text-xs"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <FileCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span className="text-foreground font-medium truncate">{file.name}</span>
                      <span className="text-muted-foreground text-[10px] font-mono">({file.size})</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveFile(idx)}
                      className="text-muted-foreground hover:text-destructive p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-1">
            <Button
              type="submit"
              className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 font-bold text-xs px-6"
            >
              <CheckCircle2 className="w-4 h-4" /> Submit Assignment for Evaluation
            </Button>
          </div>
        </form>
      ) : (
        /* Submitted State & Instructor Feedback */
        <div className="space-y-4">
          <div
            className={`p-5 rounded-xl border space-y-4 ${
              isGraded
                ? "border-emerald-500/30 bg-emerald-500/10"
                : "border-blue-500/30 bg-blue-500/10"
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                    isGraded
                      ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                      : "bg-blue-500/20 text-blue-600 dark:text-blue-400"
                  }`}
                >
                  {isGraded ? <Award className="w-6 h-6" /> : <Clock className="w-6 h-6" />}
                </div>
                <div>
                  <h4 className="text-base font-bold text-foreground">
                    {isGraded
                      ? `Assignment Graded: ${score} / 100`
                      : "Submission Received — Awaiting Evaluation"}
                  </h4>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {isGraded
                      ? `Evaluated by ${existingSubmission?.gradedBy || "Lead Instructor"} • Status: Complete`
                      : "Your submission has been queued for instructor review and rubric evaluation."}
                  </p>
                </div>
              </div>

              {onNextLesson && (
                <Button
                  size="sm"
                  onClick={onNextLesson}
                  className="gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90 font-bold text-xs"
                >
                  Continue to Next Lesson <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              )}
            </div>

            {/* If graded, show rubric breakdown and feedback */}
            {isGraded && (
              <div className="space-y-3">
                {existingSubmission?.rubricScores && existingSubmission.rubricScores.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {existingSubmission.rubricScores.map((r, i) => (
                      <div key={i} className="p-2.5 rounded-lg border border-border bg-card/80 text-xs">
                        <div className="flex justify-between font-semibold text-foreground">
                          <span className="truncate">{r.criterion}</span>
                          <span className="text-emerald-600 font-mono ml-1">{r.points}/{r.maxPoints}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="p-3.5 rounded-lg bg-card border border-emerald-500/20 space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    <Sparkles className="w-3.5 h-3.5" /> Instructor Evaluation & Feedback:
                  </div>
                  <p className="text-xs text-foreground/90 leading-relaxed">
                    “{existingSubmission?.feedback ||
                      "Outstanding threat model matrix and architecture documentation. The input sanitization test coverage was comprehensive and effectively mitigated SQL injection risks. Keep up the high engineering standard!"}”
                  </p>
                </div>
              </div>
            )}

            <div className="text-xs text-muted-foreground flex items-center justify-between pt-1">
              <span>Submitted repository: <strong className="text-foreground font-mono">{repoUrl}</strong></span>
              <button
                type="button"
                onClick={() => setSubmitted(false)}
                className="text-primary hover:underline text-[11px] cursor-pointer"
              >
                Edit or Resubmit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
