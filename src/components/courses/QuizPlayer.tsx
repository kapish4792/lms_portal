"use client";

import { useState } from "react";
import {
  HelpCircle,
  CheckCircle2,
  XCircle,
  RotateCcw,
  ArrowRight,
  Sparkles,
  Trophy,
  Check,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { Lesson } from "@/lib/store/courses-store";

interface Question {
  id: string;
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

const SAMPLE_QUESTIONS: Record<string, Question[]> = {
  default: [
    {
      id: "q-1",
      prompt: "What is the primary standard regarding data classification and handling under ESSCI's compliance policy?",
      options: [
        "Store all data in unencrypted public cloud storage for faster team accessibility",
        "Classify and encrypt all Confidential and PII data both at rest and in transit",
        "Commit API secrets directly to source control if the repository is private",
        "Disable security auditing logs in pre-production staging environments",
      ],
      correctIndex: 1,
      explanation:
        "All Confidential and Personally Identifiable Information (PII) must be encrypted both at rest (AES-256) and in transit (TLS 1.3) with strict role-based access control.",
    },
    {
      id: "q-2",
      prompt: "Which HTTP header is essential for mitigating Cross-Site Scripting (XSS) and data injection vulnerabilities in modern web applications?",
      options: [
        "Content-Security-Policy (CSP)",
        "Access-Control-Allow-Origin: *",
        "X-Powered-By: Next.js",
        "Cache-Control: public, max-age=3600",
      ],
      correctIndex: 0,
      explanation:
        "Content-Security-Policy (CSP) restricts the resources (such as JavaScript, CSS, Images) that the browser is allowed to load for a given page, effectively neutralizing malicious script injection.",
    },
    {
      id: "q-3",
      prompt: "When an engineer discovers a potential security vulnerability in production, what is the correct immediate protocol?",
      options: [
        "Post full exploit details in an open team chat to seek peer advice",
        "Privately notify the SecOps Incident Response team via the designated high-priority channel",
        "Attempt to rewrite the production database manually without a migration log",
        "Postpone reporting until the scheduled end-of-quarter security review",
      ],
      correctIndex: 1,
      explanation:
        "Security incidents must be reported immediately and confidentially to the SecOps incident team to allow prompt triage and containment without exposing the vulnerability prematurely.",
    },
  ],
};

export function QuizPlayer({
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
  const questions = SAMPLE_QUESTIONS[lesson.id] || SAMPLE_QUESTIONS.default;
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);

  const currentQ = questions[currentIdx];
  const isLastQuestion = currentIdx === questions.length - 1;
  const hasSelectedCurrent = selectedAnswers[currentIdx] !== undefined;

  // Calculate score
  const correctCount = questions.reduce((acc, q, idx) => {
    return selectedAnswers[idx] === q.correctIndex ? acc + 1 : acc;
  }, 0);
  const scorePct = Math.round((correctCount / questions.length) * 100);
  const passed = scorePct >= 70;

  const handleSelectOption = (optIdx: number) => {
    if (submitted) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentIdx]: optIdx,
    }));
  };

  const handleNextOrSubmit = () => {
    if (!isLastQuestion) {
      setCurrentIdx((prev) => prev + 1);
      setShowExplanation(false);
    } else {
      setSubmitted(true);
      setShowExplanation(true);
      if (passed) {
        onComplete();
      }
    }
  };

  const handleRetake = () => {
    setSelectedAnswers({});
    setSubmitted(false);
    setCurrentIdx(0);
    setShowExplanation(false);
  };

  return (
    <div className="w-full p-5 md:p-6 bg-card text-card-foreground rounded-2xl border border-border shadow-lg">
      {/* Quiz Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center shrink-0">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-foreground">{lesson.title}</h2>
              <Badge variant="outline" className="text-amber-500 border-amber-500/30 bg-amber-500/10 text-[10px]">
                Interactive Quiz
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Passing grade: 70% • {questions.length} questions • Retakes allowed
            </p>
          </div>
        </div>

        {/* Progress or Score */}
        {!submitted ? (
          <div className="flex items-center gap-3 self-end sm:self-center">
            <span className="text-xs text-muted-foreground font-mono">
              Question <strong className="text-foreground">{currentIdx + 1}</strong> of {questions.length}
            </span>
            <div className="w-28">
              <Progress value={((currentIdx + 1) / questions.length) * 100} className="h-2 bg-muted" />
            </div>
          </div>
        ) : (
          <Badge
            className={`px-3 py-1 font-bold text-xs gap-1.5 ${
              passed
                ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                : "bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30"
            }`}
          >
            {passed ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
            Score: {scorePct}% ({correctCount}/{questions.length})
          </Badge>
        )}
      </div>

      {/* Quiz Body */}
      {!submitted ? (
        <div className="py-5 space-y-5">
          <div className="space-y-1.5">
            <span className="text-xs font-semibold text-primary uppercase tracking-wider">
              Question {currentIdx + 1}
            </span>
            <h3 className="text-base sm:text-lg font-semibold text-foreground leading-relaxed">
              {currentQ.prompt}
            </h3>
          </div>

          {/* Options */}
          <div className="space-y-2.5">
            {currentQ.options.map((option, optIdx) => {
              const isSelected = selectedAnswers[currentIdx] === optIdx;
              const letter = String.fromCharCode(65 + optIdx);

              return (
                <button
                  key={optIdx}
                  type="button"
                  onClick={() => handleSelectOption(optIdx)}
                  className={`w-full p-3.5 rounded-xl text-left border flex items-start gap-3.5 transition-all cursor-pointer ${
                    isSelected
                      ? "bg-primary/10 border-primary text-foreground shadow-sm ring-1 ring-primary/30"
                      : "bg-background/80 border-border text-foreground hover:bg-muted/60 hover:border-border/80"
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                      isSelected
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {letter}
                  </div>
                  <span className="text-sm font-medium leading-normal flex-1 pt-0.5">
                    {option}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Controls footer */}
          <div className="flex items-center justify-between pt-4 border-t border-border">
            <Button
              variant="ghost"
              size="sm"
              disabled={currentIdx === 0}
              onClick={() => setCurrentIdx((prev) => prev - 1)}
              className="text-muted-foreground hover:text-foreground"
            >
              Previous Question
            </Button>

            <Button
              onClick={handleNextOrSubmit}
              disabled={!hasSelectedCurrent}
              className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold text-xs px-5"
            >
              {isLastQuestion ? (
                <>
                  <CheckCircle2 className="w-4 h-4" /> Submit Quiz
                </>
              ) : (
                <>
                  Next Question <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      ) : (
        /* Results & Review View */
        <div className="py-5 space-y-5">
          {/* Score Banner */}
          <div
            className={`p-5 rounded-2xl border flex flex-col md:flex-row items-center justify-between gap-5 ${
              passed
                ? "bg-emerald-500/10 border-emerald-500/30 text-foreground"
                : "bg-red-500/10 border-red-500/30 text-foreground"
            }`}
          >
            <div className="flex items-center gap-4 text-center md:text-left">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                  passed ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400" : "bg-red-500/20 text-red-600 dark:text-red-400"
                }`}
              >
                {passed ? <Trophy className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">
                  {passed ? "Congratulations! You Passed!" : "Needs Improvement"}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  You scored <strong className="text-foreground">{scorePct}%</strong> ({correctCount} of {questions.length} correct).
                  {passed ? " This lesson has been marked completed in your progress." : " Review the answers below and try again."}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRetake}
                className="gap-1.5 text-xs"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Retake Quiz
              </Button>
              {passed && onNextLesson && (
                <Button
                  size="sm"
                  onClick={onNextLesson}
                  className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
                >
                  Continue <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              )}
            </div>
          </div>

          {/* Detailed Question Review */}
          <div className="space-y-3.5">
            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Detailed Question Review
            </h4>

            {questions.map((q, idx) => {
              const userAns = selectedAnswers[idx];
              const isCorrect = userAns === q.correctIndex;

              return (
                <div
                  key={q.id}
                  className="p-4 rounded-xl border border-border bg-card space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="text-sm font-semibold text-foreground">
                      {idx + 1}. {q.prompt}
                    </span>
                    <Badge
                      className={`shrink-0 text-[10px] ${
                        isCorrect
                          ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                          : "bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30"
                      }`}
                    >
                      {isCorrect ? "Correct ✓" : "Incorrect ✗"}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {q.options.map((opt, optIdx) => {
                      const isUserChoice = userAns === optIdx;
                      const isCorrectChoice = optIdx === q.correctIndex;

                      let style = "border-border bg-muted/40 text-muted-foreground";
                      if (isCorrectChoice) {
                        style = "border-emerald-500/50 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-semibold";
                      } else if (isUserChoice && !isCorrect) {
                        style = "border-red-500/50 bg-red-500/10 text-red-700 dark:text-red-300";
                      }

                      return (
                        <div
                          key={optIdx}
                          className={`p-2.5 rounded-lg border flex items-center gap-2 ${style}`}
                        >
                          <span className="w-5 h-5 rounded-full bg-muted flex items-center justify-center font-mono text-[10px]">
                            {String.fromCharCode(65 + optIdx)}
                          </span>
                          <span className="flex-1 truncate">{opt}</span>
                          {isCorrectChoice && <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />}
                        </div>
                      );
                    })}
                  </div>

                  <div className="p-3 rounded-lg bg-primary/10 border border-primary/20 text-xs text-foreground flex items-start gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                    <p>
                      <strong className="text-primary font-semibold">Explanation:</strong> {q.explanation}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
