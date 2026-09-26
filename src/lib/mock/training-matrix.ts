import { mulberry32 } from "@/lib/mock/seed";

export type MatrixStatus = "completed" | "in-progress" | "overdue" | "not-started";

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return h >>> 0;
}

// No real enrollment-progress table exists yet, so per (learner, course) status
// is derived deterministically — same pair always renders the same status.
export function matrixStatusFor(userId: string, courseId: string): { status: MatrixStatus; percent: number } {
  const rand = mulberry32(hashString(`${userId}::${courseId}`));
  const v = rand();
  if (v > 0.7) return { status: "completed", percent: 100 };
  if (v > 0.4) return { status: "in-progress", percent: Math.round((v / 0.7) * 90) };
  if (v > 0.15) return { status: "overdue", percent: Math.round(v * 100) };
  return { status: "not-started", percent: 0 };
}
