import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ActivityAction =
  | "Lesson Started"
  | "Lesson Completed"
  | "Test Passed"
  | "Test Failed"
  | "Assignment Submitted"
  | "Certificate Issued"
  | "User Registered";

export interface ActivityLogEntry {
  id: string;
  timestamp: string; // ISO string
  learnerName: string;
  action: ActivityAction;
  courseName: string;
  lessonName?: string;
  score?: number;
  ipAddress: string;
  org: string;
}

const seedActivityLogs = (): ActivityLogEntry[] => [
  {
    id: "act-1",
    timestamp: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
    learnerName: "Sarah Connor",
    action: "Test Passed",
    courseName: "Annual Information Security Awareness",
    lessonName: "Phishing & Social Engineering Quiz",
    score: 95,
    ipAddress: "192.168.1.104",
    org: "ESSCI",
  },
  {
    id: "act-2",
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    learnerName: "John Connor",
    action: "Lesson Completed",
    courseName: "Workplace Harassment Prevention",
    lessonName: "Module 2: Reporting Procedures",
    ipAddress: "192.168.1.112",
    org: "ESSCI",
  },
  {
    id: "act-3",
    timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    learnerName: "Kyle Reese",
    action: "Certificate Issued",
    courseName: "Annual Information Security Awareness",
    lessonName: "Course Attestation",
    score: 100,
    ipAddress: "192.168.1.88",
    org: "ESSCI",
  },
  {
    id: "act-4",
    timestamp: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
    learnerName: "Miles Dyson",
    action: "Assignment Submitted",
    courseName: "Advanced React & Next.js Patterns",
    lessonName: "State Management Architecture Lab",
    score: 90,
    ipAddress: "192.168.1.201",
    org: "ESSCI",
  },
  {
    id: "act-5",
    timestamp: new Date(Date.now() - 1000 * 60 * 720).toISOString(),
    learnerName: "Sarah Connor",
    action: "Lesson Started",
    courseName: "Executive Leadership Fundamentals",
    lessonName: "Vision & Strategic Alignment",
    ipAddress: "192.168.1.104",
    org: "ESSCI",
  },
  {
    id: "act-6",
    timestamp: new Date(Date.now() - 1000 * 60 * 1440).toISOString(),
    learnerName: "John Connor",
    action: "Test Failed",
    courseName: "Enterprise Cloud Governance",
    lessonName: "AWS/GCP Security Architecture Exam",
    score: 68,
    ipAddress: "192.168.1.112",
    org: "ESSCI",
  },
  {
    id: "act-7",
    timestamp: new Date(Date.now() - 1000 * 60 * 2880).toISOString(),
    learnerName: "Marcus Wright",
    action: "User Registered",
    courseName: "System Onboarding",
    ipAddress: "192.168.1.45",
    org: "ESSCI",
  },
];

interface ActivityLogState {
  logs: ActivityLogEntry[];
  logActivity: (entry: Omit<ActivityLogEntry, "id" | "timestamp">) => void;
}

export const useActivityLogStore = create<ActivityLogState>()(
  persist(
    (set) => ({
      logs: seedActivityLogs(),
      logActivity: (entry) =>
        set((state) => ({
          logs: [
            {
              ...entry,
              id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
              timestamp: new Date().toISOString(),
            },
            ...state.logs,
          ],
        })),
    }),
    { name: "lms-activity-log-store" }
  )
);
