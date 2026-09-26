import { mulberry32, seededInt } from "@/lib/mock/seed";
import type { Role } from "@/lib/mock/users";

const rand = mulberry32(42);

// Section 3.3.C — Administrator Dashboard
export const portalActivity = Array.from({ length: 14 }, (_, i) => {
  const day = new Date();
  day.setDate(day.getDate() - (13 - i));
  return {
    label: day.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    logins: seededInt(rand, 40, 140),
    completions: seededInt(rand, 10, 60),
  };
});

export const overviewKpis = [
  { label: "Active users", value: "1,284" },
  { label: "Assigned courses", value: "312" },
  { label: "Groups", value: "18" },
  { label: "Training time", value: "4,920 hrs" },
  { label: "Completion rate", value: "76%" },
];

// Colors reference the app's validated categorical chart palette (see
// globals.css --chart-1/2/3) — fixed order, checked with the dataviz skill's
// validate_palette.js for both light and dark surfaces.
export const usersByRole = [
  { label: "Admins", value: 6, colorVar: "--color-chart-1" },
  { label: "Instructors", value: 42, colorVar: "--color-chart-2" },
  { label: "Learners", value: 1236, colorVar: "--color-chart-3" },
];

export const adminTimeline = [
  { actor: "Avery Chen", action: "added a new user", target: "Jamie Learner", time: "12m ago" },
  { actor: "Devon Park", action: "published a course", target: "Onboarding 2026", time: "1h ago" },
  { actor: "Avery Chen", action: "created a group", target: "Sales — APAC", time: "3h ago" },
  { actor: "System", action: "completed a data export", target: "Q3 compliance report", time: "6h ago" },
];

export const quickActions = [
  { label: "Add user", href: "users" },
  { label: "Add course", href: "courses" },
  { label: "Portal settings", href: "settings" },
  { label: "Add group", href: "groups" },
  { label: "Custom reports", href: "reports" },
];

// Section 3.3.D — Learner Dashboard
export const myCourses = [
  { title: "Workplace Safety Fundamentals", progress: 82, thumbnail: "🦺" },
  { title: "Advanced Excel for Analysts", progress: 45, thumbnail: "📊" },
  { title: "Leadership Essentials", progress: 12, thumbnail: "🧭" },
  { title: "Data Privacy & Compliance", progress: 100, thumbnail: "🔒" },
];

export const upcomingDeadlines = [
  { title: "Data Privacy & Compliance", due: "Due in 2 days" },
  { title: "Advanced Excel for Analysts", due: "Due in 6 days" },
];

export const achievements = [
  { label: "Fast Starter", icon: "🚀" },
  { label: "7-Day Streak", icon: "🔥" },
  { label: "Certified: Workplace Safety", icon: "🏅" },
];

export const resumeCourse = { title: "Advanced Excel for Analysts", progress: 45, lastPosition: "Ch. 3 — Pivot Tables" };

// Section 3.3.E — Instructor Dashboard
export const authoredCourses = [
  { title: "Onboarding 2026", enrolled: 214, completionRate: 68, avgScore: 88, pendingReviews: 3 },
  { title: "Secure Coding Practices", enrolled: 96, completionRate: 41, avgScore: 79, pendingReviews: 7 },
  { title: "Effective Code Reviews", enrolled: 58, completionRate: 90, avgScore: 92, pendingReviews: 0 },
];

// Section 3.3.G — Manager Dashboard
export const teamCompliance = { compliant: 18, total: 24 };
export const overdueTraining = [
  { name: "Riley Instructor", course: "Data Privacy & Compliance", daysOverdue: 4 },
  { name: "Jamie Learner", course: "Workplace Safety Fundamentals", daysOverdue: 1 },
];
export const skillCoverage = [
  { category: "Compliance", coverage: 88 },
  { category: "Technical Skills", coverage: 61 },
  { category: "Leadership", coverage: 34 },
];
export const approvalInbox = [
  { requester: "Jamie Learner", item: "Enrollment: Leadership Essentials", requestedAgo: "1h ago" },
  { requester: "Riley Instructor", item: "Seat assignment: Secure Coding Practices", requestedAgo: "1d ago" },
];

export function dashboardGreeting(role: Role): string {
  switch (role) {
    case "learner":
      return "Continue your learning journey";
    case "instructor":
      return "Here's how your courses are performing";
    case "manager":
      return "Your team's training at a glance";
    default:
      return "Welcome back";
  }
}
