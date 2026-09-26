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
// Section 3.12's core automated event triggers, seeded per org as the Org Admin's
// customizable copy (Super Admin's own org row doubles as the platform default).
const CORE_TRIGGER_KEYS: { key: string; label: string; subject: string; body: string }[] = [
  {
    key: "welcome",
    label: "Welcome & account activation",
    subject: "Welcome to {orgName}!",
    body: "Hi {userName},\n\nWelcome to {orgName}! Your account has been created and your access permissions have been provisioned.\n\nLog in at {loginUrl} to get started exploring your courses.\n\nBest regards,\nThe {orgName} Learning & Development Team",
  },
  {
    key: "course-assignment",
    label: "Course assignment alert",
    subject: "New course assigned: {courseTitle}",
    body: "Hi {userName},\n\nYou have been enrolled in a new course: {courseTitle}.\n\nYour instructor and team have prepared all lessons, quizzes, and learning objectives.\n\nStart learning now: {courseUrl}\n\nBest regards,\nThe {orgName} Training Team",
  },
  {
    key: "expiration-30d",
    label: "Upcoming expiration reminder (30 days)",
    subject: "Course expiring in 30 days: {courseTitle}",
    body: "Hi {userName},\n\nThis is a friendly reminder that your enrollment access to {courseTitle} will expire on {expiryDate} (30 days remaining).\n\nPlease complete all pending modules to ensure your credit is recorded.\n\nResume course: {courseUrl}\n\nBest regards,\nThe {orgName} Training Team",
  },
  {
    key: "expiration-7d",
    label: "Upcoming expiration reminder (7 days)",
    subject: "Action Required: {courseTitle} expires in 7 days",
    body: "Hi {userName},\n\nYour access to {courseTitle} will expire in 7 days on {expiryDate}.\n\nDon't lose your progress! Complete the remaining lessons and evaluations before the expiration date.\n\nOpen course: {courseUrl}\n\nBest regards,\nThe {orgName} Training Team",
  },
  {
    key: "expiration-1d",
    label: "Upcoming expiration reminder (1 day)",
    subject: "URGENT: Final day to complete {courseTitle}",
    body: "Hi {userName},\n\nThis is your final notice: your enrollment in {courseTitle} expires tomorrow ({expiryDate}).\n\nPlease submit any unfinished quizzes or exercises today.\n\nComplete now: {courseUrl}\n\nBest regards,\nThe {orgName} Training Team",
  },
  {
    key: "completion-certificate",
    label: "Course completion & certificate delivery",
    subject: "Congratulations! You completed {courseTitle}",
    body: "Hi {userName},\n\nCongratulations on successfully completing {courseTitle}!\n\nYour performance metrics have been recorded and your official verified certificate is now available.\n\nDownload your certificate: {certificateUrl}\n\nKeep up the great learning journey!\n\nBest regards,\nThe {orgName} Team",
  },
  {
    key: "inactive-nudge",
    label: "Inactive learner nudge (14+ days)",
    subject: "We miss you on {orgName} - Continue your learning!",
    body: "Hi {userName},\n\nIt's been over two weeks since you last logged in to your learning dashboard. Continuous learning is key to professional growth!\n\nPick up right where you left off: {dashboardUrl}\n\nBest regards,\nThe {orgName} Learning Team",
  },
];

export const seedTriggers = (): NotificationTrigger[] => [
  ...CORE_TRIGGER_KEYS.map((t, i) => ({
    id: `trig-acme-${i}`,
    ...t,
    enabled: true,
    org: "Acme Corp",
    triggerType: "automatic" as const,
    triggerEvent: t.key,
  })),
  ...CORE_TRIGGER_KEYS.map((t, i) => ({
    id: `trig-lms-${i}`,
    ...t,
    enabled: true,
    org: "LMS Platform",
    triggerType: "automatic" as const,
    triggerEvent: t.key,
  })),
];

export const seedInbox = (): NotificationItem[] => [
  // --- Acme Corp: Learner (Jamie) ---
  {
    id: "notif-seed-1",
    recipientIdentifier: "learner@lms.dev",
    title: "Course Assigned: Enterprise Cloud Security",
    body: "Hi Jamie,\n\nYou have been assigned to 'Enterprise Cloud Security: Zero-Trust & Defense-in-Depth' by your department lead.\n\nDue date: in 14 days.\nPlease complete the required modules and coding exercises before the deadline.",
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
    org: "Acme Corp",
  },
  {
    id: "notif-seed-2",
    recipientIdentifier: "learner@lms.dev",
    title: "Certificate Issued: Full-Stack TypeScript Mastery",
    body: "Congratulations Jamie!\n\nYou have successfully completed 'Full-Stack TypeScript Mastery' with a final assessment grade of 96%.\n\nYour cryptographic certificate (#CERT-ACME-8849) has been issued and is available for download in your Certificates dashboard.",
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    org: "Acme Corp",
  },
  {
    id: "notif-seed-3",
    recipientIdentifier: "learner@lms.dev",
    title: "Upcoming Deadline: 7 Days Remaining",
    body: "Reminder: Your access to 'Threat Modeling & Secure API Design' is scheduled to close in 7 days.\n\nYou are currently at 80% progress. Complete the remaining quiz to record your completion.",
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(),
    org: "Acme Corp",
  },
  {
    id: "notif-seed-4",
    recipientIdentifier: "learner@lms.dev",
    title: "Discussion Reply from Instructor Riley",
    body: "Riley Instructor replied to your question in 'Microservices Architecture':\n\n'Great question! When configuring circuit breaker timeouts, aim for 2.5x your p99 downstream service latency...'",
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    org: "Acme Corp",
  },
  {
    id: "notif-seed-5",
    recipientIdentifier: "learner@lms.dev",
    title: "Welcome to Acme Corp Learning Portal",
    body: "Hi Jamie,\n\nWelcome to Acme Corp! Your single sign-on corporate learning account has been activated. Explore your assigned curriculum in My Training or discover elective courses in the Catalog.",
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 120).toISOString(),
    org: "Acme Corp",
  },

  // --- Acme Corp: Admin (Avery) ---
  {
    id: "notif-seed-6",
    recipientIdentifier: "admin@lms.dev",
    title: "Automated Compliance Audit: 94% Completion",
    body: "Monthly Compliance Summary for Acme Corp:\n\n42 of 45 active staff members completed the mandatory Q3 Security & Ethics awareness training. 3 users have been flagged for automated reminder follow-up.",
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    org: "Acme Corp",
  },
  {
    id: "notif-seed-7",
    recipientIdentifier: "admin@lms.dev",
    title: "New User Registration: Devon Park",
    body: "A new department head account (depthead@lms.dev) has been registered under Engineering department at Acme Corp.",
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    org: "Acme Corp",
  },
  {
    id: "notif-seed-8",
    recipientIdentifier: "admin@lms.dev",
    title: "Bulk Certificate Generation Completed",
    body: "Batch issuance of 18 certificates for 'Cloud Security Specialist' completed successfully. All learner notification emails dispatched.",
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
    org: "Acme Corp",
  },
  {
    id: "notif-seed-9",
    recipientIdentifier: "admin@lms.dev",
    title: "Inactive Learner Nudge Automated Trigger Fired",
    body: "Trigger 'inactive-nudge' executed: 4 learners who have been inactive for more than 14 days received re-engagement emails.",
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
    org: "Acme Corp",
  },

  // --- Acme Corp: Instructor (Riley) ---
  {
    id: "notif-seed-10",
    recipientIdentifier: "instructor@lms.dev",
    title: "New Assignment Submission: Capstone Project",
    body: "Jamie Learner has submitted the final project for 'Enterprise Cloud Security'.\n\nRubric evaluation and automated sandbox test results are ready for grading.",
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    org: "Acme Corp",
  },
  {
    id: "notif-seed-11",
    recipientIdentifier: "instructor@lms.dev",
    title: "Live ILT Webinar Scheduled: Systems Architecture",
    body: "Your webinar session is scheduled for tomorrow at 14:00 UTC. 26 learners are registered. The Zoom bridge link has been validated.",
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(),
    org: "Acme Corp",
  },

  // --- Acme Corp: Manager / Dept Head (Morgan / Devon) ---
  {
    id: "notif-seed-12",
    recipientIdentifier: "manager@lms.dev",
    title: "Weekly Team Progress Digest",
    body: "Sales department update:\n- Total lessons completed: 84\n- Average assessment score: 88.5%\n- 2 members completed their onboarding path.",
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    org: "Acme Corp",
  },
  {
    id: "notif-seed-13",
    recipientIdentifier: "depthead@lms.dev",
    title: "Engineering Department Skill Matrix Updated",
    body: "Engineering department certification coverage reached 90% in Cloud Security & Kubernetes Operations.",
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
    org: "Acme Corp",
  },

  // --- LMS Platform: LMS Admin / Super Admin (Alex / Sam) ---
  {
    id: "notif-seed-14",
    recipientIdentifier: "lmsadmin@lms.dev",
    title: "Platform Health & Daily Telemetry",
    body: "All platform clusters operational.\n- Active tenants: 14\n- Average API latency: 14ms\n- Background worker queues: 0 delayed tasks\n- Database health: 100%",
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    org: "LMS Platform",
  },
  {
    id: "notif-seed-15",
    recipientIdentifier: "super@lms.dev",
    title: "Tenant Onboarding Verified: Acme Corp",
    body: "Organization Acme Corp verified domain routing and provisioned 120 enterprise seats. Dedicated SSO endpoint active.",
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
    org: "LMS Platform",
  },
  {
    id: "notif-seed-16",
    recipientIdentifier: "lmsadmin@lms.dev",
    title: "System Automated Backup Completed",
    body: "Daily encrypted database snapshot and artifact checkpoint saved to cold storage with zero integrity errors.",
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    org: "LMS Platform",
  },
  {
    id: "notif-seed-17",
    recipientIdentifier: "super@lms.dev",
    title: "Global Trigger Dispatch Summary",
    body: "Over the last 24 hours, 184 automated notification triggers fired across all tenant portals (142 welcome emails, 28 certificate dispatches, 14 expiry nudges).",
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 30).toISOString(),
    org: "LMS Platform",
  },
];

interface NotificationsState {
  triggers: NotificationTrigger[];
  inbox: NotificationItem[];
  toggleTrigger: (id: string) => void;
  sendNotification: (input: Omit<NotificationItem, "id" | "read" | "createdAt">) => void;
  markRead: (id: string) => void;
  markAllRead: (identifier?: string) => void;
  resetToSeedData: () => void;
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
      inbox: seedInbox(),
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
      markAllRead: (identifier) =>
        set((state) => ({
          inbox: state.inbox.map((n) =>
            !identifier || n.recipientIdentifier === identifier ? { ...n, read: true } : n
          ),
        })),
      resetToSeedData: () =>
        set({
          triggers: seedTriggers(),
          inbox: seedInbox(),
        }),
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
      getTriggersForOrg: (org) => {
        const list = get().triggers.filter((t) => t.org === org);
        return list.length > 0 ? list : get().triggers.filter((t) => t.org === "Acme Corp");
      },
    }),
    {
      name: "lms-notifications-store",
      version: 3,
      migrate: (persistedState: any, version: number) => {
        const state = (persistedState as Partial<NotificationsState>) || {};
        const inbox = state.inbox && state.inbox.length > 0 ? state.inbox : seedInbox();
        const triggers = state.triggers && state.triggers.length > 0 ? state.triggers : seedTriggers();
        return {
          ...state,
          triggers,
          inbox,
        };
      },
    }
  )
);
