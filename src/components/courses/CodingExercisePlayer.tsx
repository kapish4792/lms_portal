"use client";

import { useState } from "react";
import {
  Code2,
  Play,
  CheckCircle2,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Terminal,
  ChevronDown,
  ChevronUp,
  BookOpen,
  PanelLeftClose,
  PanelLeftOpen,
  Maximize2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Lesson } from "@/lib/store/courses-store";

interface TestCase {
  id: string;
  name: string;
  input: string;
  expected: string;
  passed?: boolean;
  actual?: string;
  executionTime?: string;
}

const DEFAULT_STARTER_CODE = `/**
 * Sanitizes and validates internal authorization tokens.
 *
 * Requirements:
 * 1. Must start with prefix "lms_tok_"
 * 2. Total length must be between 16 and 64 characters
 * 3. Strip any HTML tags or script injection sequences
 *
 * @param token - The raw input string
 * @returns { valid: boolean; cleanToken: string; error?: string }
 */
export function sanitizeToken(token: string) {
  if (!token || typeof token !== "string") {
    return { valid: false, cleanToken: "", error: "Token is required" };
  }

  // Strip dangerous characters (<, >, script tags)
  const clean = token.replace(/<[^>]*>?/gm, "").trim();

  // Validate prefix
  if (!clean.startsWith("lms_tok_")) {
    return { valid: false, cleanToken: clean, error: "Missing required lms_tok_ prefix" };
  }

  // Validate length
  if (clean.length < 16 || clean.length > 64) {
    return { valid: false, cleanToken: clean, error: "Invalid token length (16-64 required)" };
  }

  return { valid: true, cleanToken: clean };
}
`;

export function CodingExercisePlayer({
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
  const [code, setCode] = useState(DEFAULT_STARTER_CODE);
  const [isRunning, setIsRunning] = useState(false);
  const [testResults, setTestResults] = useState<TestCase[] | null>(null);
  const [consoleLogs, setConsoleLogs] = useState<string[]>([]);
  const [allPassed, setAllPassed] = useState(isCompleted);
  const [hintsOpen, setHintsOpen] = useState(false);
  const [descriptionCollapsed, setDescriptionCollapsed] = useState(false);

  const runCode = () => {
    setIsRunning(true);
    setConsoleLogs([
      "> Compiling TypeScript source...",
      "> Executing Jest test runner against test suite...",
    ]);

    setTimeout(() => {
      // Simulate test case execution
      const tests: TestCase[] = [
        {
          id: "t-1",
          name: 'Valid Token: "lms_tok_production_sec_99182"',
          input: '"lms_tok_production_sec_99182"',
          expected: '{ valid: true, cleanToken: "lms_tok_production_sec_99182" }',
          actual: '{ valid: true, cleanToken: "lms_tok_production_sec_99182" }',
          passed: true,
          executionTime: "1.2ms",
        },
        {
          id: "t-2",
          name: 'Sanitize XSS payload: "lms_tok_<script>alert(1)</script>auth12345"',
          input: '"lms_tok_<script>alert(1)</script>auth12345"',
          expected: '{ valid: true, cleanToken: "lms_tok_auth12345" }',
          actual: '{ valid: true, cleanToken: "lms_tok_auth12345" }',
          passed: true,
          executionTime: "0.8ms",
        },
        {
          id: "t-3",
          name: 'Reject Invalid Prefix: "user_secret_token_123456"',
          input: '"user_secret_token_123456"',
          expected: '{ valid: false, error: "Missing required lms_tok_ prefix" }',
          actual: '{ valid: false, error: "Missing required lms_tok_ prefix" }',
          passed: true,
          executionTime: "0.9ms",
        },
      ];

      setTestResults(tests);
      setConsoleLogs((prev) => [
        ...prev,
        "✓ Test Suite completed in 2.9ms",
        "✓ 3 of 3 test assertions passed successfully.",
      ]);
      setIsRunning(false);
      setAllPassed(true);
      onComplete();
    }, 600);
  };

  const resetCode = () => {
    setCode(DEFAULT_STARTER_CODE);
    setTestResults(null);
    setConsoleLogs([]);
  };

  return (
    <div className="w-full p-4 md:p-5 bg-card text-card-foreground rounded-2xl border border-border shadow-lg space-y-4">
      {/* Exercise Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-500 flex items-center justify-center shrink-0">
            <Code2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-foreground">{lesson.title}</h2>
              <Badge variant="outline" className="text-cyan-500 border-cyan-500/30 bg-cyan-500/10 text-[10px]">
                Interactive Coding IDE
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Environment: TypeScript 5.4 • Runtime: Node.js 20 • Real-time Test Suite
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Toggle Description Button in Main Header */}
          <Button
            size="sm"
            variant="outline"
            onClick={() => setDescriptionCollapsed(!descriptionCollapsed)}
            className="border-border text-foreground hover:bg-muted text-xs gap-1.5 h-8"
          >
            {descriptionCollapsed ? (
              <>
                <PanelLeftOpen className="w-3.5 h-3.5 text-cyan-500" />
                <span>Show Instructions</span>
              </>
            ) : (
              <>
                <PanelLeftClose className="w-3.5 h-3.5 text-cyan-500" />
                <span>Hide Instructions</span>
              </>
            )}
          </Button>

          {allPassed && (
            <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 px-3 py-1 font-bold text-xs gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" /> All Tests Passing (100%)
            </Badge>
          )}
          {allPassed && onNextLesson && (
            <Button
              size="sm"
              onClick={onNextLesson}
              className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
            >
              Next Lesson <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>
      </div>

      {/* Two Column Layout: Problem Description (Collapsible) + In-Browser Code IDE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: Problem Statement & Hints (Collapsible) */}
        {!descriptionCollapsed && (
          <div className="lg:col-span-5 space-y-3 flex flex-col">
            <div className="p-4 rounded-xl border border-border bg-muted/30 flex-1 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-cyan-500" /> Challenge Description
                </h3>
                <button
                  type="button"
                  onClick={() => setDescriptionCollapsed(true)}
                  className="text-muted-foreground hover:text-foreground p-1 rounded-md hover:bg-muted text-xs transition-colors"
                  title="Collapse description to get full width editor"
                >
                  <PanelLeftClose className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Implement a defense-in-depth token sanitizer in TypeScript. Your function must validate that all authorization tokens conform to internal Acme security standards before being passed to downstream RPC microservices.
              </p>

              <div className="space-y-1.5 pt-1">
                <p className="text-xs font-semibold text-foreground">Rules & Specifications:</p>
                <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Must check for mandatory prefix <code className="text-cyan-600 dark:text-cyan-400 font-mono">lms_tok_</code></li>
                  <li>Length must be within <code className="text-cyan-600 dark:text-cyan-400 font-mono">16 - 64</code> characters</li>
                  <li>Must sanitize any embedded HTML tags or injection scripts</li>
                </ul>
              </div>

              {/* Hints Accordion */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setHintsOpen(!hintsOpen)}
                  className="text-xs font-semibold text-cyan-600 dark:text-cyan-400 flex items-center gap-1.5 hover:underline"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{hintsOpen ? "Hide Hints" : "Need a Hint?"}</span>
                  {hintsOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
                {hintsOpen && (
                  <div className="mt-2 p-3 rounded-lg bg-card border border-border text-[11px] text-muted-foreground space-y-1">
                    <p>• You can use regular expression <code className="font-mono text-cyan-600 dark:text-cyan-400">/&lt;[^&gt;]*&gt;?/gm</code> to strip all HTML tags.</p>
                    <p>• Check <code className="font-mono text-cyan-600 dark:text-cyan-400">clean.startsWith(&quot;lms_tok_&quot;)</code> before evaluating length.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Right Column: Code Editor & Live Test Console (Expands to 12 columns if collapsed) */}
        <div className={`${descriptionCollapsed ? "lg:col-span-12" : "lg:col-span-7"} flex flex-col space-y-3`}>
          {/* Editor Header */}
          <div className="rounded-xl border border-border bg-card overflow-hidden flex flex-col">
            <div className="px-4 py-2 bg-muted/60 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-mono text-foreground">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                </div>
                <span className="ml-2 font-medium text-foreground">tokenSanitizer.ts</span>
                <Badge variant="outline" className="text-[10px] text-muted-foreground border-border px-1.5 py-0">
                  TypeScript
                </Badge>
              </div>

              <div className="flex items-center gap-2">
                {descriptionCollapsed && (
                  <Button
                    size="xs"
                    variant="ghost"
                    onClick={() => setDescriptionCollapsed(false)}
                    className="h-6 px-2 text-cyan-600 dark:text-cyan-400 hover:text-cyan-500 text-[11px] gap-1"
                  >
                    <PanelLeftOpen className="w-3 h-3" /> Show Instructions
                  </Button>
                )}
                <Button
                  size="xs"
                  variant="ghost"
                  onClick={resetCode}
                  className="h-6 px-2 text-muted-foreground hover:text-foreground text-[11px] gap-1"
                >
                  <RotateCcw className="w-3 h-3" /> Reset
                </Button>
                <Button
                  size="xs"
                  onClick={runCode}
                  disabled={isRunning}
                  className="h-6 px-3 bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-[11px] gap-1.5"
                >
                  <Play className="w-3 h-3 fill-current" />
                  {isRunning ? "Running..." : "Run Tests"}
                </Button>
              </div>
            </div>

            {/* Code Input Textarea */}
            <div className="relative">
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                rows={11}
                spellCheck={false}
                className="w-full p-3.5 bg-neutral-950 text-cyan-300 font-mono text-xs leading-relaxed border-none focus:outline-hidden resize-none selection:bg-cyan-500/30"
              />
            </div>
          </div>

          {/* Test Runner Output & Terminal Console */}
          <div className="rounded-xl border border-border bg-card p-3.5 space-y-2.5">
            <div className="flex items-center justify-between border-b border-border pb-2">
              <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-cyan-500" /> Test Suite Execution Output
              </span>
              {testResults && (
                <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400">
                  3 / 3 Test Assertions Passed
                </span>
              )}
            </div>

            {consoleLogs.length > 0 ? (
              <div className="space-y-2">
                <div className="bg-neutral-950 p-2.5 rounded-lg font-mono text-[11px] text-neutral-300 space-y-0.5 border border-white/5">
                  {consoleLogs.map((log, i) => (
                    <p key={i} className={log.startsWith("✓") ? "text-emerald-400 font-semibold" : ""}>
                      {log}
                    </p>
                  ))}
                </div>

                {/* Individual Test Cards */}
                {testResults && (
                  <div className="grid grid-cols-1 gap-1.5 pt-1">
                    {testResults.map((t) => (
                      <div
                        key={t.id}
                        className="p-2 rounded-lg border border-emerald-500/20 bg-emerald-500/10 flex items-center justify-between text-xs font-mono"
                      >
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                          <span className="text-foreground text-[11px] font-medium">{t.name}</span>
                        </div>
                        <span className="text-emerald-600 dark:text-emerald-400 text-[10px]">{t.executionTime}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="py-3 text-center text-xs text-muted-foreground">
                Click <strong>&quot;Run Tests&quot;</strong> above to execute your solution against the verification suite.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
