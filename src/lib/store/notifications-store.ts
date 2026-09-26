import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface NotificationTrigger {
  id: string;
  key: string;
  label: string;
  enabled: boolean;
  org: string;
  // Customizable content fields
  subject: string;
  body: string;
  // Trigger conditions
  triggerType: "automatic" | "manual"; // automatic = system event, manual = admin sends
  triggerEvent?: string; // e.g., "course-assignment", "expiration-30d", etc.
}

export interface NotificationItem {
  id: string;
  recipientIdentifier: string; // MockUser.identifier
  title: string;
  body: string;
  read: boolean;
  createdAt: string; // ISO datetime
  org: string;
}

// Section 3.12's core automated event triggers, seeded per org as the Org Admin's
// customizable copy (Super Admin's own org row doubles as the platform default).
const CORE_TRIGGER_KEYS: { key: string; label: string; subject: string; body: string }[] = [
  {
    key: "welcome",
    label: "Welcome & account activation",
    subject: "Welcome to \\{orgName\\}!",
    body: "Hi \\{userName\\},\\n\\nWelcome to \\{orgName\\}! Your account has been created. Log in at \\{loginUrl\\} to get started.\\n\\nBest regards,\\nThe \\{orgName\\} Team",
  },
  {
    key: "course-assignment",
    label: "Course assignment alert",
    subject: "New course assigned: \\{courseTitle\\}",
    body: "Hi \\{userName\\},\\n\\nYou have been assigned to a new course: \\{courseTitle\\}.\\n\\nStart learning: \\{courseUrl\\}\\n\\nBest regards,\\nThe \\{orgName\\} Team",
  },
  {
    key: "expiration-30d",
    label: "Upcoming expiration reminder (30 days)",
    subject: "Course expiring soon: \\{courseTitle\\} (30 days)",
    body: "Hi \\{userName\\},\\n\\nYour access to \\{courseTitle\\} will expire in 30 days (\\{expiryDate\\}).\\n\\nPlease complete the course before then to maintain your certification.\\n\\nBest regards,\\nThe \\{orgName\\} Team",
  },
  {
    key: "expiration-7d",
    label: "Upcoming expiration reminder (7 days)",
    subject: "Course expiring in 7 days: \\{courseTitle\\}",
    body: "Hi \\{userName\\},\\n\\nThis is a reminder that your access to \\{courseTitle\\} expires in 7 days (\\{expiryDate\\}).\\n\\nComplete the course now: \\{courseUrl\\}\\n\\nBest regards,\\nThe \\{orgName\\} Team",
  },
  {
    key: "expiration-1d",
    label: "Upcoming expiration reminder (1 day)",
    subject: "URGENT: Course expires tomorrow - \\{courseTitle\\}",
    body: "Hi \\{userName\\},\\n\\nYour access to \\{courseTitle\\} expires tomorrow (\\{expiryDate\\}).\\n\\nThis is your final reminder to complete the course.\\n\\nBest regards,\\nThe \\{orgName\\} Team",
  },
  {
    key: "completion-certificate",
    label: "Course completion & certificate delivery",
    subject: "Congratulations! You completed \\{courseTitle\\}",
    body: "Hi \\{userName\\},\\n\\nCongratulations on completing \\{courseTitle\\}! Your certificate is available for download.\\n\\nDownload certificate: \\{certificateUrl\\}\\n\\nBest regards,\\nThe \\{orgName\\} Team",
  },
  {
    key: "inactive-nudge",
    label: "Inactive learner nudge (14+ days)",
    subject: "Don't forget to continue learning!",
    body: "Hi \\{userName\\},\\n\\nWe noticed you haven't logged in for 14+ days. Your courses are waiting for you!\\n\\nResume learning: \\{dashboardUrl\\}\\n\\nBest regards,\\nThe \\{orgName\\} Team",
  },
];

const seedTriggers = (org: string = "Acme Corp"): NotificationTrigger[] =>
  CORE_TRIGGER_KEYS.map((t, i) => ({
    id: `trig-${i}`,
    ...t,
    enabled: true,
    org,
    triggerType: "automatic",
    triggerEvent: t.key,
  }));

interface NotificationsState {
  triggers: NotificationTrigger[];
  inbox: NotificationItem[];
  toggleTrigger: (id: string) => void;
  sendNotification: (input: Omit<NotificationItem, "id" | "read" | "createdAt">) => void;
  markRead: (id: string) => void;
  // Custom trigger management
  addTrigger: (trigger: Omit<NotificationTrigger, "id">) => string;
  updateTrigger: (id: string, updates: Partial<NotificationTrigger>) => void;
  deleteTrigger: (id: string) => void;
  // Get triggers for an org
  getTriggersForOrg: (org: string) => NotificationTrigger[];
}

export const useNotificationsStore = create<NotificationsState>()(
  persist(
    (set, get) => ({
      triggers: seedTriggers(),
      inbox: [],
      toggleTrigger: (id) =>
        set((state) => ({
          triggers: state.triggers.map((t) => (t.id === id ? { ...t, enabled: !t.enabled } : t)),
        })),
      sendNotification: (input) =>
        set((state) => ({
          inbox: [
            { ...input, id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, read: false, createdAt: new Date().toISOString() },
            ...state.inbox,
          ],
        })),
      markRead: (id) =>
        set((state) => ({
          inbox: state.inbox.map((n) => (n.id === id ? { ...n, read: true } : n)),
        })),
      addTrigger: (trigger) => {
        const id = `trig-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
        set((state) => ({
          triggers: [...state.triggers, { ...trigger, id }],
        }));
        return id;
      },
      updateTrigger: (id, updates) =>
        set((state) => ({
          triggers: state.triggers.map((t) => (t.id === id ? { ...t, ...updates } : t)),
        })),
      deleteTrigger: (id) =>
        set((state) => ({
          triggers: state.triggers.filter((t) => t.id !== id),
        })),
      getTriggersForOrg: (org) => get().triggers.filter((t) => t.org === org),
    }),
    { name: "lms-notifications-store" }
  )
);
