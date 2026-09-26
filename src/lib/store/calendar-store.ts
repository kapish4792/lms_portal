import { create } from "zustand";
import { persist } from "zustand/middleware";

export type EventType = "live_session" | "deadline" | "assessment" | "office_hours" | "event";

export interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  type: EventType;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm (e.g. "10:00")
  endTime: string; // HH:mm (e.g. "11:30")
  durationMinutes: number;
  courseTitle?: string;
  instructorName?: string;
  locationType: "virtual" | "physical" | "asynchronous";
  locationDetail?: string; // Zoom / Teams link or Room name
  org: string;
  audience: "all" | "learners" | "instructors" | "group";
  priority: "low" | "medium" | "high";
  status: "scheduled" | "in-progress" | "completed" | "cancelled";
}

const seedCalendarEvents = (): CalendarEvent[] => [
  {
    id: "cal-1",
    title: "Q4 Cybersecurity Threat Briefing & Live Q&A",
    description: "Mandatory live webinar reviewing recent social engineering attack vectors and annual compliance updates.",
    type: "live_session",
    date: "2026-10-05",
    startTime: "14:00",
    endTime: "15:00",
    durationMinutes: 60,
    courseTitle: "Annual Information Security Awareness",
    instructorName: "Sarah Connor",
    locationType: "virtual",
    locationDetail: "https://zoom.us/j/93821094821",
    org: "Acme Corp",
    audience: "all",
    priority: "high",
    status: "scheduled",
  },
  {
    id: "cal-2",
    title: "SOC 2 Type II Compliance Certification Deadline",
    description: "All engineering and DevOps team members must complete the SOC 2 attestation quiz before midnight.",
    type: "deadline",
    date: "2026-09-30",
    startTime: "23:59",
    endTime: "23:59",
    durationMinutes: 0,
    courseTitle: "SOC 2 Security & Privacy Compliance",
    instructorName: "Sarah Connor",
    locationType: "asynchronous",
    locationDetail: "Online Portal Assessment",
    org: "Acme Corp",
    audience: "learners",
    priority: "high",
    status: "scheduled",
  },
  {
    id: "cal-3",
    title: "Hands-on Next.js 16 Server Architecture Workshop",
    description: "Deep dive into App Router server components, streaming SSR, and cache tag invalidations with live coding.",
    type: "live_session",
    date: "2026-10-12",
    startTime: "10:30",
    endTime: "12:00",
    durationMinutes: 90,
    courseTitle: "Advanced React & Next.js Patterns",
    instructorName: "Miles Dyson",
    locationType: "virtual",
    locationDetail: "https://teams.microsoft.com/l/meetup-join/acme-nextjs",
    org: "Acme Corp",
    audience: "learners",
    priority: "medium",
    status: "scheduled",
  },
  {
    id: "cal-4",
    title: "Cloud Infrastructure Midterm Assessment Window",
    description: "Timed 45-minute practical examination covering AWS IAM policies, Terraform state management, and VPC peering.",
    type: "assessment",
    date: "2026-10-08",
    startTime: "09:00",
    endTime: "17:00",
    durationMinutes: 45,
    courseTitle: "Cloud Architecture & DevOps Foundations",
    instructorName: "Miles Dyson",
    locationType: "asynchronous",
    locationDetail: "Portal Examination Engine",
    org: "Acme Corp",
    audience: "learners",
    priority: "high",
    status: "scheduled",
  },
  {
    id: "cal-5",
    title: "Executive Leadership Strategy Session (On-Site)",
    description: "In-person quarterly leadership seminar focusing on OKR alignment and high-performance team coaching.",
    type: "live_session",
    date: "2026-10-18",
    startTime: "09:00",
    endTime: "12:00",
    durationMinutes: 180,
    courseTitle: "Executive Leadership Fundamentals",
    instructorName: "Kyle Reese",
    locationType: "physical",
    locationDetail: "Building B, Executive Briefing Center (Room 402)",
    org: "Acme Corp",
    audience: "all",
    priority: "medium",
    status: "scheduled",
  },
  {
    id: "cal-6",
    title: "Instructor Open Office Hours & Code Review",
    description: "Drop-in session for learners to get 1-on-1 code reviews on their final capstone assignments.",
    type: "office_hours",
    date: "2026-09-28",
    startTime: "15:00",
    endTime: "16:30",
    durationMinutes: 90,
    courseTitle: "Advanced React & Next.js Patterns",
    instructorName: "Miles Dyson",
    locationType: "virtual",
    locationDetail: "https://meet.google.com/xyz-code-rev",
    org: "Acme Corp",
    audience: "learners",
    priority: "low",
    status: "scheduled",
  },
  {
    id: "cal-7",
    title: "Enterprise Sales Negotiation Workshop",
    description: "Roleplaying exercise on multi-stakeholder SaaS contracts, discounting strategies, and procurement objections.",
    type: "live_session",
    date: "2026-10-02",
    startTime: "11:00",
    endTime: "12:30",
    durationMinutes: 90,
    courseTitle: "B2B Enterprise Sales Mastery",
    instructorName: "Priya Nair",
    locationType: "virtual",
    locationDetail: "https://zoom.us/j/84920193821",
    org: "Acme Corp",
    audience: "group",
    priority: "medium",
    status: "scheduled",
  },
  {
    id: "cal-8",
    title: "Q3 LMS Platform Maintenance Window",
    description: "Scheduled platform upgrade to v2.4 containing performance improvements and updated video player codecs.",
    type: "event",
    date: "2026-09-27",
    startTime: "02:00",
    endTime: "04:00",
    durationMinutes: 120,
    courseTitle: "Platform Operations",
    instructorName: "System Administrator",
    locationType: "asynchronous",
    locationDetail: "All Tenants",
    org: "Acme Corp",
    audience: "all",
    priority: "medium",
    status: "scheduled",
  },
  {
    id: "cal-9",
    title: "Product Design Onboarding Milestone Due",
    description: "Submission deadline for Module 3 design system component library prototype.",
    type: "deadline",
    date: "2026-10-15",
    startTime: "18:00",
    endTime: "18:00",
    durationMinutes: 0,
    courseTitle: "Modern UI/UX Design Systems",
    instructorName: "Elena Rostova",
    locationType: "asynchronous",
    locationDetail: "Course Portal Submission",
    org: "Acme Corp",
    audience: "learners",
    priority: "high",
    status: "scheduled",
  },
  {
    id: "cal-10",
    title: "AI Engineering & LLM Orchestration Sync",
    description: "Live interactive seminar on RAG architecture, vector search benchmarks, and prompt evaluation pipelines.",
    type: "live_session",
    date: "2026-10-22",
    startTime: "13:00",
    endTime: "14:30",
    durationMinutes: 90,
    courseTitle: "AI & Generative Systems in Production",
    instructorName: "Dr. Aris Thorne",
    locationType: "virtual",
    locationDetail: "https://zoom.us/j/47281902831",
    org: "Acme Corp",
    audience: "learners",
    priority: "medium",
    status: "scheduled",
  },
];

interface CalendarState {
  events: CalendarEvent[];
  addEvent: (event: Omit<CalendarEvent, "id" | "status">) => string;
  updateEvent: (id: string, updates: Partial<CalendarEvent>) => void;
  deleteEvent: (id: string) => void;
}

export const useCalendarStore = create<CalendarState>()(
  persist(
    (set) => ({
      events: seedCalendarEvents(),
      addEvent: (eventData) => {
        const id = `cal-${Date.now()}`;
        const newEvent: CalendarEvent = {
          ...eventData,
          id,
          status: "scheduled",
        };
        set((state) => ({
          events: [newEvent, ...state.events],
        }));
        return id;
      },
      updateEvent: (id, updates) =>
        set((state) => ({
          events: state.events.map((e) => (e.id === id ? { ...e, ...updates } : e)),
        })),
      deleteEvent: (id) =>
        set((state) => ({
          events: state.events.filter((e) => e.id !== id),
        })),
    }),
    {
      name: "lms-calendar-storage",
    }
  )
);
