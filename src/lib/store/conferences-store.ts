import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface ConferenceSession {
  id: string;
  title: string;
  courseTitle: string;
  instructorName: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  durationMinutes: number;
  locationType: "virtual" | "physical";
  locationDetail: string; // Zoom link or Room Name
  capacity: number;
  registeredCount: number;
  waitlistCount: number;
  status: "upcoming" | "in-progress" | "completed" | "cancelled";
  org: string;
}

const seedConferences = (): ConferenceSession[] => [
  {
    id: "conf-1",
    title: "Q4 Cybersecurity Threat Briefing & Live QA",
    courseTitle: "Annual Information Security Awareness",
    instructorName: "Sarah Connor",
    date: "2026-10-05",
    startTime: "14:00",
    durationMinutes: 60,
    locationType: "virtual",
    locationDetail: "https://zoom.us/j/93821094821",
    capacity: 100,
    registeredCount: 68,
    waitlistCount: 0,
    status: "upcoming",
    org: "Acme Corp",
  },
  {
    id: "conf-2",
    title: "Hands-on Next.js 16 Server Architecture Workshop",
    courseTitle: "Advanced React & Next.js Patterns",
    instructorName: "Miles Dyson",
    date: "2026-10-12",
    startTime: "10:30",
    durationMinutes: 90,
    locationType: "virtual",
    locationDetail: "https://teams.microsoft.com/l/meetup-join/acme-nextjs",
    capacity: 40,
    registeredCount: 40,
    waitlistCount: 6,
    status: "upcoming",
    org: "Acme Corp",
  },
  {
    id: "conf-3",
    title: "Executive Leadership Strategy Session (On-Site)",
    courseTitle: "Executive Leadership Fundamentals",
    instructorName: "Kyle Reese",
    date: "2026-10-18",
    startTime: "09:00",
    durationMinutes: 180,
    locationType: "physical",
    locationDetail: "Building B, Executive Briefing Center (Room 402)",
    capacity: 25,
    registeredCount: 18,
    waitlistCount: 0,
    status: "upcoming",
    org: "Acme Corp",
  },
];

interface ConferencesState {
  conferences: ConferenceSession[];
  addConference: (conf: Omit<ConferenceSession, "id" | "registeredCount" | "waitlistCount">) => string;
  registerAttendee: (id: string) => void;
  cancelConference: (id: string) => void;
}

export const useConferencesStore = create<ConferencesState>()(
  persist(
    (set) => ({
      conferences: seedConferences(),
      addConference: (conf) => {
        const id = `conf-${Date.now()}`;
        set((state) => ({
          conferences: [
            {
              ...conf,
              id,
              registeredCount: 0,
              waitlistCount: 0,
            },
            ...state.conferences,
          ],
        }));
        return id;
      },
      registerAttendee: (id) =>
        set((state) => ({
          conferences: state.conferences.map((c) => {
            if (c.id !== id) return c;
            if (c.registeredCount < c.capacity) {
              return { ...c, registeredCount: c.registeredCount + 1 };
            }
            return { ...c, waitlistCount: c.waitlistCount + 1 };
          }),
        })),
      cancelConference: (id) =>
        set((state) => ({
          conferences: state.conferences.map((c) => (c.id === id ? { ...c, status: "cancelled" } : c)),
        })),
    }),
    { name: "lms-conferences-store" }
  )
);
