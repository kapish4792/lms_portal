import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface DiscussionReply {
  id: string;
  authorName: string;
  authorRole: string;
  content: string;
  timestamp: string;
  isInstructorReply?: boolean;
  upvotes: number;
}

export interface DiscussionThread {
  id: string;
  title: string;
  content: string;
  courseTitle: string;
  lessonName?: string;
  authorName: string;
  authorRole: string;
  timestamp: string;
  isPinned: boolean;
  isResolved: boolean;
  upvotes: number;
  replies: DiscussionReply[];
  org: string;
}

const seedDiscussions = (): DiscussionThread[] => [
  {
    id: "disc-1",
    title: "Best practice for handling refreshToken expiry during background sync?",
    content: "When using Next.js server actions, how should we intercept expired refresh tokens before the client UI hits a 401? Is middleware the recommended pattern?",
    courseTitle: "Advanced React & Next.js Patterns",
    lessonName: "Authentication Middleware & Token Refresh",
    authorName: "John Connor",
    authorRole: "learner",
    timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    isPinned: true,
    isResolved: true,
    upvotes: 8,
    org: "Acme Corp",
    replies: [
      {
        id: "rep-1",
        authorName: "Miles Dyson",
        authorRole: "instructor",
        content: "Yes! Use Edge Middleware to inspect token freshness before forwarding the request. In Next.js 16, you can rotate the token cookie seamlessly in middleware and pass the updated session downstream.",
        timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
        isInstructorReply: true,
        upvotes: 6,
      },
    ],
  },
  {
    id: "disc-2",
    title: "Clarification on Annual Security compliance deadline for remote contractors",
    content: "Do 1099 contractors need to complete the phishing attestation quiz within 14 days of account provisioning, or before project kickoff?",
    courseTitle: "Annual Information Security Awareness",
    lessonName: "Contractor Compliance Requirements",
    authorName: "Kyle Reese",
    authorRole: "learner",
    timestamp: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
    isPinned: false,
    isResolved: false,
    upvotes: 3,
    org: "Acme Corp",
    replies: [
      {
        id: "rep-2",
        authorName: "Sarah Connor",
        authorRole: "instructor",
        content: "All contractors must complete the attestation BEFORE gaining access to internal repositories or VPN credentials. The 14-day grace period only applies to W-2 onboarding.",
        timestamp: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
        isInstructorReply: true,
        upvotes: 4,
      },
    ],
  },
  {
    id: "disc-3",
    title: "Recommended reading materials on OKR alignment & quarterly goal cascading?",
    content: "Looking for supplementary book or case study recommendations to accompany the Executive Leadership course.",
    courseTitle: "Executive Leadership Fundamentals",
    authorName: "Marcus Wright",
    authorRole: "learner",
    timestamp: new Date(Date.now() - 1000 * 60 * 1440).toISOString(),
    isPinned: false,
    isResolved: false,
    upvotes: 2,
    org: "Acme Corp",
    replies: [],
  },
];

interface DiscussionsState {
  threads: DiscussionThread[];
  addThread: (thread: Omit<DiscussionThread, "id" | "timestamp" | "upvotes" | "replies">) => string;
  addReply: (threadId: string, reply: Omit<DiscussionReply, "id" | "timestamp" | "upvotes">) => void;
  togglePin: (threadId: string) => void;
  toggleResolve: (threadId: string) => void;
  upvoteThread: (threadId: string) => void;
  deleteThread: (threadId: string) => void;
}

export const useDiscussionsStore = create<DiscussionsState>()(
  persist(
    (set) => ({
      threads: seedDiscussions(),
      addThread: (thread) => {
        const id = `disc-${Date.now()}`;
        set((state) => ({
          threads: [
            {
              ...thread,
              id,
              timestamp: new Date().toISOString(),
              upvotes: 1,
              replies: [],
            },
            ...state.threads,
          ],
        }));
        return id;
      },
      addReply: (threadId, reply) =>
        set((state) => ({
          threads: state.threads.map((t) => {
            if (t.id !== threadId) return t;
            return {
              ...t,
              replies: [
                ...t.replies,
                {
                  ...reply,
                  id: `rep-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
                  timestamp: new Date().toISOString(),
                  upvotes: 0,
                },
              ],
            };
          }),
        })),
      togglePin: (threadId) =>
        set((state) => ({
          threads: state.threads.map((t) => (t.id === threadId ? { ...t, isPinned: !t.isPinned } : t)),
        })),
      toggleResolve: (threadId) =>
        set((state) => ({
          threads: state.threads.map((t) => (t.id === threadId ? { ...t, isResolved: !t.isResolved } : t)),
        })),
      upvoteThread: (threadId) =>
        set((state) => ({
          threads: state.threads.map((t) => (t.id === threadId ? { ...t, upvotes: t.upvotes + 1 } : t)),
        })),
      deleteThread: (threadId) =>
        set((state) => ({
          threads: state.threads.filter((t) => t.id !== threadId),
        })),
    }),
    { name: "lms-discussions-store" }
  )
);
