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

export function AssignmentPlayer({
  lesson,
  isCompleted,
  onComplete,
  onNextLesson,
}: {
  lesson: Lesson;
  isCompleted: boolean;
  onComplete: () => void;
  onNextLesson?: () => void;
}) {
  const [submissionTab, setSubmissionTab] = useState<"text" | "upload">("text");
  const [repoUrl, setRepoUrl] = useState("https://github.com/essci-org/security-hardening-rfc");
  const [notes, setNotes] = useState(
    "Implemented role-based token sanitization with AES-GCM encryption for all PII data payload boundaries. Added automated unit and integration tests covering OWASP injection vectors."
  );
  const [files, setFiles] = useState<Array<{ name: string; size: string }>>([
    { name: "architecture_threat_model_v2.pdf", size: "2.4 MB" },
    { name: "compliance_audit_checklist.xlsx", size: "840 KB" },
  ]);
  const [submitted, setSubmitted] = useState(isCompleted);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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
            submitted
              ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
              : "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30"
          }`}
        >
          {submitted ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5" /> Submitted & Graded (96/100)
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
              <span>Audit & Logging</span>
              <span className="text-primary font-mono">30 pts</span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Structured telemetry without logging cleartext secrets.
            </p>
          </div>
        </div>
      </div>

      {/* Submission Workspace */}
      {!submitted ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Upload className="w-4 h-4 text-primary" /> Your Submission
            </h3>
            <div className="flex items-center gap-1 bg-muted p-1 rounded-lg border border-border">
              <button
                type="button"
                onClick={() => setSubmissionTab("text")}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                  submissionTab === "text"
                    ? "bg-primary text-primary-foreground font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Repository & Notes
              </button>
              <button
                type="button"
                onClick={() => setSubmissionTab("upload")}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                  submissionTab === "upload"
                    ? "bg-primary text-primary-foreground font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                File Attachments ({files.length})
              </button>
            </div>
          </div>

          {submissionTab === "text" ? (
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1.5">
                  GitHub / Git Repository or Pull Request URL
                </label>
                <div className="relative">
                  <Link2 className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={repoUrl}
                    onChange={(e) => setRepoUrl(e.target.value)}
                    placeholder="https://github.com/..."
                    className="pl-9 text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1.5">
                  Submission Summary & Solution Walkthrough
                </label>
                <textarea
                  rows={4}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Explain your approach, design decisions, and test cases..."
                  className="w-full p-3 rounded-lg bg-background border border-input text-xs text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:border-primary resize-none leading-relaxed"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {/* File dropzone simulator */}
              <div className="border-2 border-dashed border-border hover:border-primary/60 rounded-xl p-6 text-center bg-muted/20 transition-colors cursor-pointer">
                <Upload className="w-8 h-8 text-primary mx-auto mb-2" />
                <p className="text-xs font-semibold text-foreground">
                  Click or drag files here to upload
                </p>
                <p className="text-[11px] text-muted-foreground mt-1">
                  Supported formats: PDF, DOCX, ZIP, MD (Max 25 MB)
                </p>
              </div>

              {/* Uploaded File List */}
              <div className="space-y-2">
                {files.map((file, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-lg border border-border bg-card flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
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
          <div className="p-5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-foreground">Assignment Graded: 96 / 100</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Evaluated by Lead Instructor • Grade: Excellent (A)
                  </p>
                </div>
              </div>

              {onNextLesson && (
                <Button
                  size="sm"
                  onClick={onNextLesson}
                  className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
                >
                  Continue to Next Lesson <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              )}
            </div>

            <div className="p-3.5 rounded-lg bg-card border border-emerald-500/20 space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                <Sparkles className="w-3.5 h-3.5" /> Instructor Evaluation & Feedback:
              </div>
              <p className="text-xs text-foreground/90 leading-relaxed">
                “Outstanding threat model matrix and architecture documentation. The input sanitization test coverage was comprehensive and effectively mitigated SQL injection risks. Keep up the high engineering standard!”
              </p>
            </div>

            <div className="text-xs text-muted-foreground flex items-center justify-between pt-1">
              <span>Submitted repository: <strong className="text-foreground font-mono">{repoUrl}</strong></span>
              <button
                type="button"
                onClick={() => setSubmitted(false)}
                className="text-primary hover:underline text-[11px]"
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
