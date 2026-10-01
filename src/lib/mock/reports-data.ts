// Centralized mock data for the Reports Center (§3.13). Every number the
// Reports page renders that isn't a live derivation from a real store lives
// here instead of as an inline literal in the page component — this is still
// mock data (there's no backend), but centralizing it means the page reads
// it the same way it would read a real API response, and a later swap to a
// real `/api/reports/...` endpoint only touches this file's exports.
import { Layers, CheckCircle2, AlertTriangle, Users, type LucideIcon } from "lucide-react";
import { mulberry32 } from "@/lib/mock/seed";

// Section 3.13 item 8: which courses are flagged "mandatory" for the Training
// Matrix. No real `course.mandatory` flag exists on the Course model yet —
// this is the same demo flag used before, just centralized here.
export const MANDATORY_COURSE_IDS = ["c-1", "c-2"];

// Section 3.13 item 1: Overview tab's Activity Breakdown line chart.
export const ACTIVITY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
export const ACTIVITY_SERIES = [
  { label: "Course Completions", color: "var(--color-chart-1)", values: [12, 19, 15, 27, 34, 42, 38] },
  { label: "Active Learner Logins", color: "var(--color-chart-2)", values: [24, 30, 28, 45, 52, 60, 58] },
];

// Section 3.13 item 4: Learning Paths report — no real per-learner enrollment
// tracking exists for paths yet, so enrolled count / completion rate are
// derived from step count via a fixed formula rather than a raw hardcoded
// number per path. Still mock, but at least varies with the path's shape.
export const PATH_ENROLLED_MULTIPLIER = 4.2;
export const PATH_COMPLETION_PER_STEP = 20;
export function estimatePathEnrolled(stepCount: number): number {
  return Math.floor(stepCount * PATH_ENROLLED_MULTIPLIER);
}
export function estimatePathCompletionRate(stepCount: number): number {
  return Math.min(100, stepCount * PATH_COMPLETION_PER_STEP);
}

// Section 3.13 item 3: Courses report is missing "Average Time to Complete"
// and "Expiration Date" per spec — no real duration/expiry tracking exists on
// the Course model, so both are deterministic per-course estimates.
export function estimateAvgTimeToComplete(courseId: string): string {
  const rand = mulberry32(hashString(`course-duration::${courseId}`));
  const hours = 2 + Math.round(rand() * 10); // 2-12 hours
  return `${hours}h`;
}
export function estimateExpirationDate(courseId: string): string {
  const rand = mulberry32(hashString(`course-expiry::${courseId}`));
  const monthsOut = 6 + Math.round(rand() * 18); // 6-24 months from now
  const d = new Date();
  d.setMonth(d.getMonth() + monthsOut);
  return d.toISOString().slice(0, 10);
}

// Section 3.13 item 6: Groups report's "Avg Completion Rate" — deterministic
// per-group value (same hashing approach as src/lib/mock/training-matrix.ts)
// instead of one constant every group shared before.
function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return h >>> 0;
}
export function estimateGroupCompletionRate(groupId: string): number {
  const rand = mulberry32(hashString(`group-completion::${groupId}`));
  return Math.round(55 + rand() * 40); // 55-95%, plausible cohort spread
}

// Section 3.13 item 9: Timeline tab's audit event stream — no real
// cross-module audit log exists (separate from src/lib/store/activity-log-store.ts,
// which only covers learning activities, not admin/security events).
export interface TimelineEvent {
  title: string;
  desc: string;
  actor: string;
  time: string;
  icon: LucideIcon;
  color: string;
}
export const TIMELINE_EVENTS: TimelineEvent[] = [
  {
    title: "New Category Published",
    desc: "Course Category 'Technical Skills' created and taxonomy assigned.",
    actor: "Admin",
    time: "20 minutes ago",
    icon: Layers,
    color: "text-brand-500",
  },
  {
    title: "Security Attestation Completed",
    desc: "Sarah Connor passed Annual Information Security Awareness exam with score 95%.",
    actor: "Sarah Connor",
    time: "45 minutes ago",
    icon: CheckCircle2,
    color: "text-success",
  },
  {
    title: "Course Co-Authoring Access Requested",
    desc: "Instructor requested co-authoring permission for Engineering department content.",
    actor: "Instructor",
    time: "2 hours ago",
    icon: AlertTriangle,
    color: "text-warning",
  },
  {
    title: "User Account Provisioned",
    desc: "Rajesh Patel registered as Learner under ESSCI tenant.",
    actor: "System Provisioner",
    time: "Yesterday at 16:30",
    icon: Users,
    color: "text-blue-500",
  },
];

// Section 3.13 item 11: Analytics tab. Heatmap intensity is a deterministic
// formula (no real per-hour session telemetry exists) rather than a random
// number recomputed on every render — same value every time for a given cell.
export function getHeatmapIntensity(dayIndex: number, hourSlot: number): number {
  return ((dayIndex * 3 + hourSlot * 5) % 9) / 8;
}
export const DEVICE_USAGE = [
  { label: "Desktop (Chrome / Edge / Safari)", iconKey: "laptop" as const, percent: 68, color: "bg-blue-500" },
  { label: "Mobile (iOS / Android Web)", iconKey: "smartphone" as const, percent: 24, color: "bg-brand-500" },
  { label: "Tablet / iPad", iconKey: "tablet" as const, percent: 8, color: "bg-amber-500" },
];

// Section 3.13 item 12: Post-Training Surveys — proposed sub-feature, no
// configuration UI exists yet for attaching a question set to a course.
export const SURVEY_KPIS = { csat: 4.8, nps: 64, retentionIndex: 94 };
export const MOCK_SURVEYS = [
  {
    id: "surv-1",
    learnerName: "Pooja Sharma",
    courseTitle: "Annual Information Security Awareness",
    rating: 5,
    comment: "The practical scenarios were engaging and well structured. Clear actionable guidelines.",
    date: "2026-09-22",
  },
  {
    id: "surv-2",
    learnerName: "Rohan Deshmukh",
    courseTitle: "Workplace Safety & Standards",
    rating: 4,
    comment: "Good real-world examples. Video pacing was comfortable and concise.",
    date: "2026-09-20",
  },
  {
    id: "surv-3",
    learnerName: "Amitabh Sen",
    courseTitle: "Advanced VLSI & Embedded Systems",
    rating: 5,
    comment: "Exceptional depth on architecture patterns and circuit validation.",
    date: "2026-09-18",
  },
  {
    id: "surv-4",
    learnerName: "Kavita Reddy",
    courseTitle: "Annual Information Security Awareness",
    rating: 5,
    comment: "Quick, effective, and satisfied compliance requirements cleanly.",
    date: "2026-09-15",
  },
];

// Simulates a network round-trip for the Reports page's initial load, so the
// page has a genuine loading state instead of rendering store-derived data
// synchronously on first paint — closer to how a real `/api/reports` call
// would behave once a backend exists.
export function simulateReportsFetch<T>(data: T, delayMs = 550): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(data), delayMs));
}
