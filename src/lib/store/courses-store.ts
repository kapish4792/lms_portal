import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type CourseType = 'course' | 'practice-test';
export type LessonType = 'video' | 'quiz' | 'assignment' | 'article' | 'coding';
export type CourseStatus = 'draft' | 'published';
// Section 3.8: "open" = direct self-enrollment; "request" = routes through the
// Manager/Dept Head Approval Inbox; "gated" = seat-limited (e.g. ILT), same
// approval routing as "request" in this mock since there's no seat cap yet.
export type EnrollmentType = 'open' | 'request' | 'gated';

export interface Lesson {
  id: string;
  title: string;
  type: LessonType;
  // Section 3.6.C: falls back to a public sample stream so the player is
  // demonstrably real (Video.js, HLS) without needing an upload pipeline.
  videoUrl?: string;
  duration?: string;
  description?: string;
  quizData?: {
    passingScore?: number;
    questions?: {
      id?: string;
      prompt: string;
      options: string[];
      correctIndex: number;
      explanation?: string;
    }[];
  };
  assignmentData?: {
    instructions?: string;
    rubric?: { criterion: string; points: number }[];
    submissionType?: 'file' | 'github' | 'both';
  };
  codingData?: {
    language?: string;
    starterCode?: string;
    instructions?: string;
    testCases?: { input: string; expected: string }[];
  };
  articleData?: {
    body?: string;
    estimatedReadTime?: string;
  };
}

export interface Section {
  id: string;
  title: string;
  lessons: Lesson[];
}

export interface Course {
  id: string;
  title: string;
  type: CourseType;
  category: string;
  categories?: string[];
  department?: string;
  org: string;
  authorId: string; // matches MockUser.identifier
  objectives: string[];
  coverImage?: string; // data URL
  status: CourseStatus;
  sections: Section[];
  enrolled: number;
  completionRate: number;
  avgScore: number;
  reviewsEnabled: boolean;
  price?: number; // 0 or undefined = free
  enrollmentType?: EnrollmentType; // defaults to "open" when absent
  rating?: number; // 0-5
}

const SAMPLE_VIDEO = 'https://www.youtube.com/watch?v=Ke90Tje7VS0';

// A direct (non-YouTube) MP4 source so at least one lesson exercises the real
// Video.js path — custom control bar, notes hotkey (B), 5s rewind/forward,
// playback-speed menu — all of which VideoPlayer.tsx intentionally skips for
// YouTube sources (those get a plain iframe instead). Used for the very first
// lesson of the very first seeded course so a click-through demo hits it by
// default.
// Google's commondatastorage sample bucket doesn't send CORS/Content-Type
// headers that satisfy Chrome's Opaque Response Blocking for cross-origin
// <video> playback (net::ERR_BLOCKED_BY_ORB) — MDN's interactive-examples
// media host serves this specifically for cross-origin embedding, with the
// right headers, so it actually plays.
const SAMPLE_DIRECT_VIDEO = 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4';

const seedCourses = (): Course[] => [
  {
    id: 'c-1',
    title: 'Onboarding 2026: ESSCI Electronics & Culture',
    type: 'course',
    category: 'Compliance',
    department: 'Engineering',
    org: 'ESSCI',
    authorId: 'instructor@lms.dev',
    coverImage: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1200&auto=format&fit=crop&q=80',
    objectives: [
      'Understand company policies and code of conduct',
      'Set up development environment and tooling',
      'Navigate internal systems and communication channels',
      'Complete required compliance training',
    ],
    status: 'published',
    enrolled: 214,
    completionRate: 68,
    avgScore: 88,
    reviewsEnabled: true,
    price: 0,
    enrollmentType: 'open',
    rating: 4.6,
    sections: [
      {
        id: 's-1',
        title: 'Getting Started & Compliance',
        lessons: [
          { id: 'l-1', title: 'Welcome to ESSCI', type: 'video', videoUrl: SAMPLE_DIRECT_VIDEO },
          { id: 'l-2', title: 'Code of Conduct & Ethics Quiz', type: 'quiz' },
          {
            id: 'l-assign-1',
            title: 'Compliance Declaration Assignment',
            type: 'assignment',
            assignmentData: {
              instructions: 'Write a short declaration (200-400 words) describing how you will apply the Code of Conduct to a real scenario in your role.',
              submissionType: 'file',
              rubric: [
                { criterion: 'Understanding of policy', points: 40 },
                { criterion: 'Relevance of scenario', points: 30 },
                { criterion: 'Clarity of writing', points: 30 },
              ],
            },
          },
        ],
      },
      {
        id: 's-2',
        title: 'Development & Engineering Practices',
        lessons: [
          { id: 'l-3', title: 'Dev Environment Walkthrough', type: 'video', videoUrl: SAMPLE_VIDEO },
          { id: 'l-code-1', title: 'Hands-on Coding: Token Sanitizer Function', type: 'coding' },
          {
            id: 'l-assign-2',
            title: 'System Architecture & Security Review',
            type: 'assignment',
            assignmentData: {
              instructions: "Submit a diagram and write-up (or GitHub link) reviewing a system's architecture for a security weakness and how you'd remediate it.",
              submissionType: 'both',
              rubric: [
                { criterion: 'Identifies real vulnerability', points: 35 },
                { criterion: 'Remediation plan quality', points: 35 },
                { criterion: 'Documentation clarity', points: 30 },
              ],
            },
          },
        ],
      },
    ],
  },
  {
    id: 'c-2',
    title: 'Secure Coding Practices & Zero-Trust Defense',
    type: 'course',
    category: 'Technical Skills',
    department: 'Engineering',
    org: 'ESSCI',
    authorId: 'instructor@lms.dev',
    coverImage: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&auto=format&fit=crop&q=80',
    objectives: [
      'Identify common vulnerability classes (OWASP Top 10)',
      'Apply secure coding patterns in day-to-day work',
      'Use static analysis tooling effectively',
      'Respond correctly to a discovered vulnerability',
    ],
    status: 'published',
    enrolled: 96,
    completionRate: 41,
    avgScore: 79,
    reviewsEnabled: true,
    price: 49,
    enrollmentType: 'open',
    rating: 4.8,
    sections: [
      {
        id: 's-3',
        title: 'Foundations',
        lessons: [{ id: 'l-4', title: 'Why Secure Coding Matters', type: 'video', videoUrl: SAMPLE_VIDEO }],
      },
      {
        id: 's-4',
        title: 'Defense in Depth',
        lessons: [{ id: 'l-5', title: 'Input Validation & Sanitization', type: 'video', videoUrl: SAMPLE_VIDEO }],
      },
    ],
  },
  {
    id: 'c-3',
    title: 'Executive Leadership & Strategic Communication',
    type: 'course',
    category: 'Leadership',
    department: 'Management',
    org: 'ESSCI',
    authorId: 'instructor@lms.dev',
    coverImage: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&auto=format&fit=crop&q=80',
    objectives: [
      'Master stakeholder management and executive presence',
      'Formulate high-impact cross-functional strategy',
      'Coach and retain top-tier engineering talent',
      'Drive organizational transformation effectively',
    ],
    status: 'published',
    enrolled: 340,
    completionRate: 74,
    avgScore: 92,
    reviewsEnabled: true,
    price: 89,
    enrollmentType: 'open',
    rating: 4.9,
    sections: [
      {
        id: 's-5',
        title: 'Strategic Vision',
        lessons: [{ id: 'l-6', title: 'Setting Clear Organizational Goals', type: 'video', videoUrl: SAMPLE_VIDEO }],
      },
    ],
  },
  {
    id: 'c-4',
    title: 'Cloud Infrastructure & Kubernetes at Scale',
    type: 'course',
    category: 'Technical Skills',
    department: 'Engineering',
    org: 'ESSCI',
    authorId: 'instructor@lms.dev',
    coverImage: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&auto=format&fit=crop&q=80',
    objectives: [
      'Architect highly resilient cloud systems on AWS & GCP',
      'Deploy and manage multi-cluster Kubernetes environments',
      'Implement automated CI/CD and GitOps pipelines',
      'Enforce zero-trust network policies and cost optimization',
    ],
    status: 'published',
    enrolled: 512,
    completionRate: 63,
    avgScore: 86,
    reviewsEnabled: true,
    price: 129,
    enrollmentType: 'open',
    rating: 4.9,
    sections: [
      {
        id: 's-6',
        title: 'Architecture Blueprint',
        lessons: [{ id: 'l-7', title: 'Kubernetes Control Plane Deep Dive', type: 'video', videoUrl: SAMPLE_VIDEO }],
      },
    ],
  },
  {
    id: 'c-5',
    title: 'High-Velocity Enterprise B2B Sales Mastery',
    type: 'course',
    category: 'Sales Enablement',
    department: 'Sales',
    org: 'ESSCI',
    authorId: 'instructor@lms.dev',
    coverImage: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&auto=format&fit=crop&q=80',
    objectives: [
      'Run consultative discovery calls that uncover latent pain',
      'Build quantified ROI business cases for enterprise champions',
      'Negotiate multi-year contracts with procurement without discounting',
      'Accelerate sales pipeline velocity by 35%',
    ],
    status: 'published',
    enrolled: 228,
    completionRate: 79,
    avgScore: 91,
    reviewsEnabled: true,
    price: 69,
    enrollmentType: 'open',
    rating: 4.7,
    sections: [
      {
        id: 's-7',
        title: 'Discovery & Qualification',
        lessons: [{ id: 'l-8', title: 'The Enterprise Qualification Framework', type: 'video', videoUrl: SAMPLE_VIDEO }],
      },
    ],
  },
  {
    id: 'c-6',
    title: 'Applied Generative AI & LLM Systems in Production',
    type: 'course',
    category: 'Technical Skills',
    department: 'Engineering',
    org: 'ESSCI',
    authorId: 'instructor@lms.dev',
    coverImage: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200&auto=format&fit=crop&q=80',
    objectives: [
      'Build production-ready RAG architectures with vector databases',
      'Fine-tune open-weights models with PEFT/LoRA',
      'Implement robust evaluation benchmarks and guardrails',
      'Deploy low-latency inference services with vLLM',
    ],
    status: 'published',
    enrolled: 840,
    completionRate: 82,
    avgScore: 94,
    reviewsEnabled: true,
    price: 99,
    enrollmentType: 'open',
    rating: 4.95,
    sections: [
      {
        id: 's-8',
        title: 'RAG & Vector Search',
        lessons: [{ id: 'l-9', title: 'Production Vector Retrieval Architecture', type: 'video', videoUrl: SAMPLE_VIDEO }],
      },
    ],
  },
  {
    id: 'c-7',
    title: 'Global Data Privacy, GDPR & AI Compliance',
    type: 'course',
    category: 'Compliance',
    department: 'Legal',
    org: 'ESSCI',
    authorId: 'instructor@lms.dev',
    coverImage: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=1200&auto=format&fit=crop&q=80',
    objectives: [
      'Comply with GDPR, CCPA, and emerging global AI regulations',
      'Conduct Data Protection Impact Assessments (DPIA)',
      'Manage user data subject access and deletion requests (DSAR)',
      'Establish automated auditing and incident response workflows',
    ],
    status: 'published',
    enrolled: 430,
    completionRate: 88,
    avgScore: 93,
    reviewsEnabled: true,
    price: 39,
    enrollmentType: 'open',
    rating: 4.6,
    sections: [
      {
        id: 's-9',
        title: 'Compliance Frameworks',
        lessons: [{ id: 'l-10', title: 'Global Privacy Mandates Overview', type: 'video', videoUrl: SAMPLE_VIDEO }],
      },
    ],
  },
];

interface CoursesState {
  courses: Course[];
  notes: Record<string, { lessonId: string; timestamp: number; text: string }[]>; // keyed by courseId
  addCourse: (course: Omit<Course, 'id' | 'enrolled' | 'completionRate' | 'avgScore' | 'reviewsEnabled'>) => string;
  updateCourse: (id: string, patch: Partial<Course>) => void;
  addNote: (courseId: string, lessonId: string, timestamp: number, text: string) => void;
  enrollUserInCourse: (courseId: string) => void;
}

export const useCoursesStore = create<CoursesState>()(
  persist(
    (set, get) => ({
      courses: seedCourses(),
      notes: {},
      addCourse: (course) => {
        const id = `c-${Date.now()}`;
        set((state) => ({
          courses: [{ ...course, id, enrolled: 0, completionRate: 0, avgScore: 0, reviewsEnabled: true }, ...state.courses],
        }));
        return id;
      },
      updateCourse: (id, patch) =>
        set((state) => ({
          courses: state.courses.map((c) => (c.id === id ? { ...c, ...patch } : c)),
        })),
      addNote: (courseId, lessonId, timestamp, text) => {
        const existing = get().notes[courseId] ?? [];
        set({ notes: { ...get().notes, [courseId]: [...existing, { lessonId, timestamp, text }] } });
      },
      enrollUserInCourse: (courseId) => {
        set((state) => ({
          courses: state.courses.map((c) => (c.id === courseId ? { ...c, enrolled: (c.enrolled || 0) + 1 } : c)),
        }));
      },
    }),
    { name: 'lms-courses-store-v3' },
  ),
);
