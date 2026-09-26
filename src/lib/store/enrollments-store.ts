import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Enrollment {
  id: string;
  userId: string; // MockUser.identifier
  courseId: string;
  enrolledAt: string; // ISO datetime
  progress: number; // 0-100
  completedAt?: string; // ISO datetime
  lastAccessedAt?: string; // ISO datetime
  dueDate?: string; // ISO datetime
  status: "active" | "completed" | "dropped";
  certificateId?: string;
}

const seedEnrollments = (): Enrollment[] => [
  {
    id: "enr-1",
    userId: "learner@lms.dev",
    courseId: "c-1",
    enrolledAt: "2026-08-15T10:00:00Z",
    progress: 65,
    lastAccessedAt: "2026-09-20T14:30:00Z",
    dueDate: "2026-10-15T23:59:59Z",
    status: "active",
  },
  {
    id: "enr-2",
    userId: "learner@lms.dev",
    courseId: "c-2",
    enrolledAt: "2026-07-01T09:00:00Z",
    progress: 100,
    completedAt: "2026-08-20T16:45:00Z",
    lastAccessedAt: "2026-08-20T16:45:00Z",
    status: "completed",
    certificateId: "cert-1",
  },
  {
    id: "enr-3",
    userId: "learner@lms.dev",
    courseId: "c-3",
    enrolledAt: "2026-09-10T11:00:00Z",
    progress: 0,
    lastAccessedAt: undefined,
    dueDate: "2026-11-30T23:59:59Z",
    status: "active",
  },
];

interface EnrollmentsState {
  enrollments: Enrollment[];
  enroll: (userId: string, courseId: string, dueDate?: string) => string;
  getEnrollment: (userId: string, courseId: string) => Enrollment | undefined;
  updateProgress: (enrollmentId: string, progress: number) => void;
  markCompleted: (enrollmentId: string) => void;
  recordAccess: (enrollmentId: string) => void;
}

export const useEnrollmentsStore = create<EnrollmentsState>()(
  persist(
    (set, get) => ({
      enrollments: seedEnrollments(),
      enroll: (userId, courseId, dueDate) => {
        const existing = get().enrollments.find((e) => e.userId === userId && e.courseId === courseId);
        if (existing) return existing.id;
        const id = `enr-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
        set((state) => ({
          enrollments: [
            {
              id,
              userId,
              courseId,
              enrolledAt: new Date().toISOString(),
              progress: 0,
              dueDate,
              status: "active",
            },
            ...state.enrollments,
          ],
        }));
        return id;
      },
      getEnrollment: (userId, courseId) => get().enrollments.find((e) => e.userId === userId && e.courseId === courseId),
      updateProgress: (enrollmentId, progress) =>
        set((state) => ({
          enrollments: state.enrollments.map((e) =>
            e.id === enrollmentId ? { ...e, progress: Math.min(100, Math.max(0, progress)), lastAccessedAt: new Date().toISOString() } : e
          ),
        })),
      markCompleted: (enrollmentId) =>
        set((state) => ({
          enrollments: state.enrollments.map((e) =>
            e.id === enrollmentId
              ? { ...e, progress: 100, completedAt: new Date().toISOString(), status: "completed" as const }
              : e
          ),
        })),
      recordAccess: (enrollmentId) =>
        set((state) => ({
          enrollments: state.enrollments.map((e) =>
            e.id === enrollmentId ? { ...e, lastAccessedAt: new Date().toISOString() } : e
          ),
        })),
    }),
    { name: "lms-enrollments-store" }
  )
);