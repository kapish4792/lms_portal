import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface PortalSettings {
  siteName: string;
  siteDescription: string;
  domainName: string;
  customDomain: string;
  primaryColor: string;
  accentColor: string;
  fontFamily: string;
  /** Stable ID referencing src/config/fonts.ts — used to hydrate Google Font links on load. */
  fontId: string;
  themeMode: "system" | "light" | "dark";
  defaultLanguage: string;
  timezone: string;
  dateFormat: "MM/DD/YYYY" | "DD/MM/YYYY" | "YYYY-MM-DD";
  currencySymbol: string;
  announcementText: string;
  announcementActive: boolean;
  announcementAudience: "all" | "learners" | "instructors";
  whiteLabelWatermark: boolean; // hide "Powered by LMS"
  registrationMode: "closed" | "approval" | "open";
  requireTermsOnLogin: boolean;
  // Strategic Suggestions §3.17.A Glossary Mapping
  glossary: {
    learner: string;
    instructor: string;
    course: string;
    category: string;
    group: string;
  };
}

export interface SecuritySettings {
  minPasswordLength: number;
  requireSpecialChar: boolean;
  requireNumber: boolean;
  passwordExpirationDays: number;
  lockoutAttempts: number;
  lockoutDurationMinutes: number;
  enforceMfa: boolean;
  domainWhitelist: string;
  enableVideoWatermark: boolean;
}

export interface IntegrationSettings {
  apiKey: string;
  webhookUrl: string;
  ssoEnabled: boolean;
  ssoProvider: "saml" | "okta" | "azure";
  zoomConnected: boolean;
  teamsConnected: boolean;
  slackConnected: boolean;
}

export interface GamificationSettings {
  pointsPerLogin: number;
  pointsPerCourseComplete: number;
  pointsPerQuizAce: number;
  leaderboardVisible: boolean;
}

export interface EcommerceSettings {
  enabled: boolean;
  currency: string;
  stripeConnected: boolean;
  taxRatePercent: number;
}

export interface SessionDevice {
  id: string;
  device: string;
  browser: string;
  ipAddress: string;
  location: string;
  lastActive: string;
  isCurrent: boolean;
}

export interface SettingsState {
  portal: PortalSettings;
  security: SecuritySettings;
  integrations: IntegrationSettings;
  gamification: GamificationSettings;
  ecommerce: EcommerceSettings;
  sessions: SessionDevice[];
  updatePortal: (patch: Partial<PortalSettings>) => void;
  updateSecurity: (patch: Partial<SecuritySettings>) => void;
  updateIntegrations: (patch: Partial<IntegrationSettings>) => void;
  updateGamification: (patch: Partial<GamificationSettings>) => void;
  updateEcommerce: (patch: Partial<EcommerceSettings>) => void;
  revokeSession: (sessionId: string) => void;
  revokeAllOtherSessions: () => void;
  generateApiKey: () => void;
}

const defaultPortal: PortalSettings = {
  siteName: "ESSCI Skilling India in Electronics",
  siteDescription: "Electronics Sector Skills Council of India - Skilling India in Electronics LMS Platform.",
  domainName: "essci.lms.local",
  customDomain: "academy.essci.org",
  primaryColor: "#01458E",
  accentColor: "#1EA838",
  fontFamily: "'Geist Sans', system-ui, sans-serif",
  fontId: "geist",
  themeMode: "system",
  defaultLanguage: "English (India)",
  timezone: "Asia/Kolkata (UTC+5:30)",
  dateFormat: "DD/MM/YYYY",
  currencySymbol: "₹",
  announcementText: "Welcome to ESSCI - National Electronics Skilling Portal.",
  announcementActive: true,
  announcementAudience: "all",
  whiteLabelWatermark: true,
  registrationMode: "approval",
  requireTermsOnLogin: true,
  glossary: {
    learner: "Learner",
    instructor: "Instructor",
    course: "Course",
    category: "Category",
    group: "Cohort",
  },
};

const defaultSecurity: SecuritySettings = {
  minPasswordLength: 10,
  requireSpecialChar: true,
  requireNumber: true,
  passwordExpirationDays: 90,
  lockoutAttempts: 5,
  lockoutDurationMinutes: 15,
  enforceMfa: true,
  domainWhitelist: "essci.org, academy.essci.org",
  enableVideoWatermark: true,
};

const defaultIntegrations: IntegrationSettings = {
  apiKey: "lms_live_key_9f48d76934daeacme",
  webhookUrl: "https://api.essci.org/webhooks/lms-events",
  ssoEnabled: true,
  ssoProvider: "saml",
  zoomConnected: true,
  teamsConnected: false,
  slackConnected: true,
};

const defaultGamification: GamificationSettings = {
  pointsPerLogin: 5,
  pointsPerCourseComplete: 100,
  pointsPerQuizAce: 50,
  leaderboardVisible: true,
};

const defaultEcommerce: EcommerceSettings = {
  enabled: true,
  currency: "USD ($)",
  stripeConnected: true,
  taxRatePercent: 8.5,
};

const defaultSessions: SessionDevice[] = [
  {
    id: "sess-1",
    device: "MacBook Pro 16-inch",
    browser: "Chrome 122.0",
    ipAddress: "192.168.1.104",
    location: "New York, USA",
    lastActive: "Active now",
    isCurrent: true,
  },
  {
    id: "sess-2",
    device: "iPhone 15 Pro",
    browser: "Mobile Safari 17.3",
    ipAddress: "192.168.1.112",
    location: "New York, USA",
    lastActive: "3 hours ago",
    isCurrent: false,
  },
  {
    id: "sess-3",
    device: "Dell Precision Tower",
    browser: "Microsoft Edge 121.0",
    ipAddress: "10.0.4.88",
    location: "Chicago, USA",
    lastActive: "2 days ago",
    isCurrent: false,
  },
];

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      portal: defaultPortal,
      security: defaultSecurity,
      integrations: defaultIntegrations,
      gamification: defaultGamification,
      ecommerce: defaultEcommerce,
      sessions: defaultSessions,

      updatePortal: (patch) => set((s) => ({ portal: { ...s.portal, ...patch } })),
      updateSecurity: (patch) => set((s) => ({ security: { ...s.security, ...patch } })),
      updateIntegrations: (patch) => set((s) => ({ integrations: { ...s.integrations, ...patch } })),
      updateGamification: (patch) => set((s) => ({ gamification: { ...s.gamification, ...patch } })),
      updateEcommerce: (patch) => set((s) => ({ ecommerce: { ...s.ecommerce, ...patch } })),

      revokeSession: (id) =>
        set((s) => ({
          sessions: s.sessions.filter((item) => item.id !== id),
        })),

      revokeAllOtherSessions: () =>
        set((s) => ({
          sessions: s.sessions.filter((item) => item.isCurrent),
        })),

      generateApiKey: () =>
        set((s) => ({
          integrations: {
            ...s.integrations,
            apiKey: `lms_live_key_${Math.random().toString(36).substring(2)}${Math.random().toString(36).substring(2)}`,
          },
        })),
    }),
    { name: "lms-settings-store" }
  )
);
