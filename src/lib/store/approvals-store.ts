import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ApprovalStatus = "pending" | "approved" | "denied";

export interface ApprovalRequest {
  id: string;
  requesterName: string;
  courseId: string;
  courseTitle: string;
  status: ApprovalStatus;
  requestedAt: string; // ISO date
  org: string;
}

interface ApprovalsState {
  requests: ApprovalRequest[];
  requestAccess: (input: Omit<ApprovalRequest, "id" | "status" | "requestedAt">) => void;
  approve: (id: string) => void;
  deny: (id: string) => void;
}

// Section 3.8's `[Request Access]` flow (courses not open for self-enrollment)
// and the Manager's Approval Inbox (Section 3.3.G) are the two ends of the
// same pipe — this store is that pipe.
export const useApprovalsStore = create<ApprovalsState>()(
  persist(
    (set) => ({
      requests: [
        {
          id: "req-seed-1",
          requesterName: "Rohan Deshmukh",
          courseId: "c-2",
          courseTitle: "Secure Coding Practices",
          status: "pending",
          requestedAt: "2026-09-24",
          org: "ESSCI",
        },
      ],
      requestAccess: (input) =>
        set((state) => ({
          requests: [
            {
              ...input,
              id: `req-${Date.now()}`,
              status: "pending",
              requestedAt: new Date().toISOString().slice(0, 10),
            },
            ...state.requests,
          ],
        })),
      approve: (id) =>
        set((state) => ({
          requests: state.requests.map((r) => (r.id === id ? { ...r, status: "approved" } : r)),
        })),
      deny: (id) =>
        set((state) => ({
          requests: state.requests.map((r) => (r.id === id ? { ...r, status: "denied" } : r)),
        })),
    }),
    { name: "lms-approvals-store" }
  )
);
