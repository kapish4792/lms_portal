import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface RubricCriterionScore {
  criterion: string;
  points: number;
  maxPoints: number;
}

export interface Submission {
  id: string;
  courseId: string;
  courseTitle: string;
  lessonId: string;
  lessonTitle: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  submittedAt: string; // ISO string
  status: "pending" | "graded";
  submissionType: "text" | "upload" | "both";
  repoUrl?: string;
  notes?: string;
  files: { name: string; size: string }[];
  rubricScores: RubricCriterionScore[];
  totalScore?: number; // 0-100
  feedback?: string;
  gradedBy?: string;
  gradedAt?: string;
}

const SEED_SUBMISSIONS: Submission[] = [
  {
    id: "sub-1",
    courseId: "c-1",
    courseTitle: "Onboarding 2026: ESSCI Electronics & Culture",
    lessonId: "l-4",
    lessonTitle: "ESSCI Compliance Case Study & Architecture Review",
    userId: "learner@lms.dev",
    userName: "Rohan Deshmukh",
    submittedAt: "2026-09-28T14:32:00Z",
    status: "pending",
    submissionType: "both",
    repoUrl: "https://github.com/essci-org/security-hardening-rfc",
    notes:
      "Implemented role-based token sanitization with AES-GCM encryption for all PII data payload boundaries. Added automated unit and integration tests covering OWASP injection vectors.",
    files: [
      { name: "architecture_threat_model_v2.pdf", size: "2.4 MB" },
      { name: "compliance_audit_checklist.xlsx", size: "840 KB" },
    ],
    rubricScores: [
      { criterion: "Threat Modeling & Trust Boundaries", points: 30, maxPoints: 35 },
      { criterion: "Code Validation & Sanitization", points: 32, maxPoints: 35 },
      { criterion: "Security Policy Documentation", points: 28, maxPoints: 30 },
    ],
  },
  {
    id: "sub-2",
    courseId: "c-2",
    courseTitle: "Modern React 19 & Next.js 16 Architecture",
    lessonId: "l-react-assign",
    lessonTitle: "Production App Router Architecture & Edge Middleware",
    userId: "learner@lms.dev",
    userName: "Rohan Deshmukh",
    submittedAt: "2026-09-29T10:15:00Z",
    status: "graded",
    submissionType: "both",
    repoUrl: "https://github.com/rohan-deshmukh/next16-lms-edge",
    notes:
      "Designed a zero-waterfall parallel route layout with Suspense boundaries, streaming SSR, and edge token decryption.",
    files: [{ name: "benchmark_latency_report.pdf", size: "1.1 MB" }],
    rubricScores: [
      { criterion: "App Router Directory Structure", points: 38, maxPoints: 40 },
      { criterion: "Performance & Streaming SSR", points: 30, maxPoints: 30 },
      { criterion: "Edge Middleware Security", points: 28, maxPoints: 30 },
    ],
    totalScore: 96,
    feedback:
      "Outstanding implementation! The edge token decryption benchmark shows sub-10ms response times. Clear documentation and proper Suspense fallbacks.",
    gradedBy: "Prof. Priya Nair",
    gradedAt: "2026-09-29T16:40:00Z",
  },
  {
    id: "sub-3",
    courseId: "c-1",
    courseTitle: "Onboarding 2026: ESSCI Electronics & Culture",
    lessonId: "l-4",
    lessonTitle: "ESSCI Compliance Case Study & Architecture Review",
    userId: "ananya.sharma@lms.dev",
    userName: "Ananya Sharma",
    submittedAt: "2026-09-30T09:20:00Z",
    status: "pending",
    submissionType: "both",
    repoUrl: "https://github.com/ananya-dev/compliance-rfc",
    notes:
      "Comprehensive review of data retention and access policies across microservices, including automated compliance audit script.",
    files: [{ name: "data_governance_rfc.pdf", size: "3.2 MB" }],
    rubricScores: [
      { criterion: "Threat Modeling & Trust Boundaries", points: 0, maxPoints: 35 },
      { criterion: "Code Validation & Sanitization", points: 0, maxPoints: 35 },
      { criterion: "Security Policy Documentation", points: 0, maxPoints: 30 },
    ],
  },
];

interface SubmissionsState {
  submissions: Submission[];
  submitAssignment: (submission: Omit<Submission, "id" | "submittedAt" | "status">) => string;
  gradeSubmission: (
    submissionId: string,
    rubricScores: RubricCriterionScore[],
    feedback: string,
    gradedBy: string
  ) => void;
  getSubmissionForLesson: (userId: string, lessonId: string) => Submission | undefined;
}

export const useSubmissionsStore = create<SubmissionsState>()(
  persist(
    (set, get) => ({
      submissions: SEED_SUBMISSIONS,

      submitAssignment: (data) => {
        const existing = get().submissions.find(
          (s) => s.userId === data.userId && s.lessonId === data.lessonId
        );
        if (existing) {
          const updated: Submission = {
            ...existing,
            ...data,
            submittedAt: new Date().toISOString(),
            status: "pending",
          };
          set((state) => ({
            submissions: state.submissions.map((s) => (s.id === existing.id ? updated : s)),
          }));
          return existing.id;
        }

        const id = `sub-${Date.now()}`;
        const newSub: Submission = {
          ...data,
          id,
          submittedAt: new Date().toISOString(),
          status: "pending",
        };
        set((state) => ({
          submissions: [newSub, ...state.submissions],
        }));
        return id;
      },

      gradeSubmission: (submissionId, rubricScores, feedback, gradedBy) => {
        const total = rubricScores.reduce((acc, curr) => acc + curr.points, 0);
        set((state) => ({
          submissions: state.submissions.map((sub) =>
            sub.id === submissionId
              ? {
                  ...sub,
                  status: "graded",
                  rubricScores,
                  totalScore: total,
                  feedback,
                  gradedBy,
                  gradedAt: new Date().toISOString(),
                }
              : sub
          ),
        }));
      },

      getSubmissionForLesson: (userId, lessonId) => {
        return get().submissions.find((s) => s.userId === userId && s.lessonId === lessonId);
      },
    }),
    {
      name: "lms-submissions-storage",
    }
  )
);
