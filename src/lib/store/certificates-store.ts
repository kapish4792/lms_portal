import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useNotificationsStore } from "./notifications-store";

export type CertificateStyle = "classic" | "modern" | "minimal";

export interface CertificateTemplate {
  id: string;
  name: string;
  style: CertificateStyle;
  headline: string;
  subheadline: string;
  bodyTemplate: string; // Supports {learnerName}, {courseTitle}, {completionDate}, {orgName}
  signatureName: string;
  signatureTitle: string;
  accentColor: string; // Hex or CSS color
  org: string;
  isCustom: boolean;
  badgeText?: string;
  createdAt: string;
}

export interface IssuedCertificate {
  id: string;
  certificateId: string; // e.g. "CERT-2026-8941"
  learnerIdentifier: string;
  learnerName: string;
  courseId: string;
  courseTitle: string;
  templateSnapshot: CertificateTemplate; // Frozen snapshot of template at time of issue
  issuedBy: string; // Issuer identifier
  issuedByName: string;
  issuedByRole: string;
  issuedAt: string; // ISO string
  completionDate: string;
  org: string;
  status: "active" | "revoked";
}

export const SEED_TEMPLATES: CertificateTemplate[] = [
  {
    id: "tmpl-classic",
    name: "Classic Gold Ribbon",
    style: "classic",
    headline: "Certificate of Achievement",
    subheadline: "This credential is fundamentally awarded to",
    bodyTemplate:
      "for exceptional dedication and successful mastery in completing the comprehensive curriculum for {courseTitle} at {orgName}.",
    signatureName: "Dr. Alexander Vance",
    signatureTitle: "Dean of Academic Excellence",
    accentColor: "#d97706", // Amber / Gold
    org: "Acme Corp",
    isCustom: false,
    badgeText: "VERIFIED HONORS",
    createdAt: "2026-01-10T00:00:00Z",
  },
  {
    id: "tmpl-modern",
    name: "Modern Tech Indigo",
    style: "modern",
    headline: "Certificate of Completion",
    subheadline: "PROUDLY PRESENTED TO",
    bodyTemplate:
      "in official recognition of fulfilling all practical requirements, assessments, and technical benchmarks for {courseTitle}.",
    signatureName: "Elena Rostova",
    signatureTitle: "VP of Global Learning & Development",
    accentColor: "#6366f1", // Indigo
    org: "Acme Corp",
    isCustom: false,
    badgeText: "ACCREDITED CERTIFICATION",
    createdAt: "2026-02-15T00:00:00Z",
  },
  {
    id: "tmpl-minimal",
    name: "Minimalist Executive",
    style: "minimal",
    headline: "Professional Certificate",
    subheadline: "Awarded to",
    bodyTemplate:
      "having demonstrated professional competence and verified completion of {courseTitle} conducted by {orgName}.",
    signatureName: "Marcus Sterling",
    signatureTitle: "Chief Learning Officer",
    accentColor: "#0f172a", // Slate / Charcoal
    org: "Acme Corp",
    isCustom: false,
    badgeText: "ENTERPRISE VERIFIED",
    createdAt: "2026-03-01T00:00:00Z",
  },
];

export const SEED_ISSUED_CERTIFICATES: IssuedCertificate[] = [
  {
    id: "cert-iss-1",
    certificateId: "CERT-2026-7842",
    learnerIdentifier: "learner@lms.dev",
    learnerName: "Jamie Learner",
    courseId: "c-2",
    courseTitle: "Enterprise Cybersecurity & Zero Trust Architecture",
    templateSnapshot: {
      ...SEED_TEMPLATES[1],
    },
    issuedBy: "instructor@lms.dev",
    issuedByName: "Riley Instructor",
    issuedByRole: "instructor",
    issuedAt: "2026-08-20T16:45:00Z",
    completionDate: "2026-08-20",
    org: "Acme Corp",
    status: "active",
  },
  {
    id: "cert-iss-2",
    certificateId: "CERT-2026-9104",
    learnerIdentifier: "learner@lms.dev",
    learnerName: "Jamie Learner",
    courseId: "c-1",
    courseTitle: "Full-Stack Web Development Bootcamp",
    templateSnapshot: {
      ...SEED_TEMPLATES[0],
    },
    issuedBy: "admin@lms.dev",
    issuedByName: "Avery Chen",
    issuedByRole: "org-admin",
    issuedAt: "2026-09-22T11:30:00Z",
    completionDate: "2026-09-22",
    org: "Acme Corp",
    status: "active",
  },
];

interface CertificatesState {
  templates: CertificateTemplate[];
  issuedCertificates: IssuedCertificate[];
  createTemplate: (template: Omit<CertificateTemplate, "id" | "createdAt">) => CertificateTemplate;
  updateTemplate: (id: string, updates: Partial<CertificateTemplate>) => void;
  deleteTemplate: (id: string) => void;
  issueCertificate: (params: {
    learnerIdentifier: string;
    learnerName: string;
    courseId: string;
    courseTitle: string;
    templateId: string;
    issuedBy: string;
    issuedByName: string;
    issuedByRole: string;
    completionDate: string;
    org: string;
  }) => IssuedCertificate;
  issueBulkCertificates: (params: {
    learners: Array<{ identifier: string; name: string }>;
    courseId: string;
    courseTitle: string;
    templateId: string;
    issuedBy: string;
    issuedByName: string;
    issuedByRole: string;
    completionDate?: string;
    org: string;
  }) => IssuedCertificate[];
  revokeCertificate: (id: string) => void;
  getCertificateById: (certificateId: string) => IssuedCertificate | undefined;
}

export function formatCertificateBody(
  templateText: string,
  params: {
    learnerName: string;
    courseTitle: string;
    completionDate: string;
    orgName: string;
  }
): string {
  return templateText
    .replace(/\{learnerName\}/g, params.learnerName)
    .replace(/\{courseTitle\}/g, params.courseTitle)
    .replace(/\{completionDate\}/g, params.completionDate)
    .replace(/\{orgName\}/g, params.orgName);
}

function generateCertificateCode(): string {
  const randomHex = Math.random().toString(36).substring(2, 6).toUpperCase();
  const year = new Date().getFullYear();
  return `CERT-${year}-${randomHex}`;
}

export const useCertificatesStore = create<CertificatesState>()(
  persist(
    (set, get) => ({
      templates: SEED_TEMPLATES,
      issuedCertificates: SEED_ISSUED_CERTIFICATES,

      createTemplate: (templateData) => {
        const newTemplate: CertificateTemplate = {
          ...templateData,
          id: `tmpl-custom-${Date.now()}`,
          isCustom: true,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          templates: [...state.templates, newTemplate],
        }));
        return newTemplate;
      },

      updateTemplate: (id, updates) => {
        set((state) => ({
          templates: state.templates.map((t) => (t.id === id ? { ...t, ...updates } : t)),
        }));
      },

      deleteTemplate: (id) => {
        set((state) => ({
          templates: state.templates.filter((t) => t.id !== id),
        }));
      },

      issueCertificate: ({
        learnerIdentifier,
        learnerName,
        courseId,
        courseTitle,
        templateId,
        issuedBy,
        issuedByName,
        issuedByRole,
        completionDate,
        org,
      }) => {
        const template =
          get().templates.find((t) => t.id === templateId) || get().templates[0];

        const newCert: IssuedCertificate = {
          id: `cert-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          certificateId: generateCertificateCode(),
          learnerIdentifier,
          learnerName,
          courseId,
          courseTitle,
          templateSnapshot: { ...template },
          issuedBy,
          issuedByName,
          issuedByRole,
          issuedAt: new Date().toISOString(),
          completionDate: completionDate || new Date().toISOString().split("T")[0],
          org,
          status: "active",
        };

        set((state) => ({
          issuedCertificates: [newCert, ...state.issuedCertificates],
        }));

        // Trigger Notification
        try {
          useNotificationsStore.getState().sendNotification({
            recipientIdentifier: learnerIdentifier,
            title: `Certificate Issued: ${courseTitle}`,
            body: `Congratulations! ${issuedByName} has issued your official certificate of completion (${newCert.certificateId}).`,
            org,
          });
        } catch (e) {
          // Non-blocking notification dispatch
        }

        return newCert;
      },

      issueBulkCertificates: ({
        learners,
        courseId,
        courseTitle,
        templateId,
        issuedBy,
        issuedByName,
        issuedByRole,
        completionDate,
        org,
      }) => {
        const template =
          get().templates.find((t) => t.id === templateId) || get().templates[0];
        const dateStr = completionDate || new Date().toISOString().split("T")[0];

        const createdCerts: IssuedCertificate[] = learners.map((learner, idx) => ({
          id: `cert-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 6)}`,
          certificateId: generateCertificateCode(),
          learnerIdentifier: learner.identifier,
          learnerName: learner.name,
          courseId,
          courseTitle,
          templateSnapshot: { ...template },
          issuedBy,
          issuedByName,
          issuedByRole,
          issuedAt: new Date().toISOString(),
          completionDate: dateStr,
          org,
          status: "active",
        }));

        set((state) => ({
          issuedCertificates: [...createdCerts, ...state.issuedCertificates],
        }));

        // Dispatch notifications
        try {
          const notifStore = useNotificationsStore.getState();
          createdCerts.forEach((cert) => {
            notifStore.sendNotification({
              recipientIdentifier: cert.learnerIdentifier,
              title: `Certificate Issued: ${courseTitle}`,
              body: `Congratulations! ${issuedByName} has issued your official certificate (${cert.certificateId}).`,
              org,
            });
          });
        } catch (e) {
          // Safe fallback
        }

        return createdCerts;
      },

      revokeCertificate: (id) => {
        set((state) => ({
          issuedCertificates: state.issuedCertificates.map((c) =>
            c.id === id ? { ...c, status: "revoked" } : c
          ),
        }));
      },

      getCertificateById: (certificateId) => {
        return get().issuedCertificates.find(
          (c) => c.certificateId === certificateId || c.id === certificateId
        );
      },
    }),
    {
      name: "lms-certificates-store-v1",
    }
  )
);
