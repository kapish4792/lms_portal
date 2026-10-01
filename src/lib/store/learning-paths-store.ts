import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CompletionType = "checkbox" | "upload";

export interface CourseStep {
  id: string;
  type: "course";
  courseId: string;
}

// Proposed "Onboarding Journey Builder" extension (spec §3.7) — a non-course
// step so a path can mix real courses with onboarding tasks like paperwork.
export interface TaskStep {
  id: string;
  type: "task";
  title: string;
  dueDayFromEnrollment: number;
  assignee: string;
  completionType: CompletionType;
}

export type PathStep = CourseStep | TaskStep;

export interface LearningPath {
  id: string;
  title: string;
  description: string;
  category: string;
  department?: string;
  org: string;
  steps: PathStep[];
}

let idCounter = 0;
const nextId = (prefix: string) => `${prefix}-${Date.now()}-${idCounter++}`;

const seedPaths = (): LearningPath[] => [
  {
    id: "p-1",
    title: "New Engineer Onboarding Pathway",
    description: "Everything a new Engineering hire completes in their first 30 days.",
    category: "Onboarding",
    department: "Engineering",
    org: "ESSCI",
    steps: [
      { id: nextId("s"), type: "task", title: "Sign employee handbook acknowledgment", dueDayFromEnrollment: 1, assignee: "New hire", completionType: "checkbox" },
      { id: nextId("s"), type: "course", courseId: "c-1" },
      { id: nextId("s"), type: "task", title: "Submit tax & ID documents", dueDayFromEnrollment: 3, assignee: "New hire", completionType: "upload" },
      { id: nextId("s"), type: "course", courseId: "c-2" },
    ],
  },
];

interface LearningPathsState {
  paths: LearningPath[];
  completedSteps: Record<string, string[]>; // pathId -> completed step ids, demo-only local progress
  addPath: (path: Omit<LearningPath, "id">) => string;
  updatePath: (id: string, patch: Partial<LearningPath>) => void;
  markStepComplete: (pathId: string, stepId: string) => void;
}

export const useLearningPathsStore = create<LearningPathsState>()(
  persist(
    (set, get) => ({
      paths: seedPaths(),
      completedSteps: {},
      addPath: (path) => {
        const id = nextId("p");
        set((state) => ({ paths: [{ ...path, id }, ...state.paths] }));
        return id;
      },
      updatePath: (id, patch) =>
        set((state) => ({ paths: state.paths.map((p) => (p.id === id ? { ...p, ...patch } : p)) })),
      markStepComplete: (pathId, stepId) => {
        const existing = get().completedSteps[pathId] ?? [];
        if (existing.includes(stepId)) return;
        set({ completedSteps: { ...get().completedSteps, [pathId]: [...existing, stepId] } });
      },
    }),
    { name: "lms-learning-paths-store" }
  )
);
