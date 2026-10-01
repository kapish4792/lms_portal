import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CuratedCourse {
  id: string;
  title: string;
  description: string;
  category: string;
  version: string; // e.g. "v2.1"
  lastUpdated: string;
  lessonsCount: number;
  durationHours: number;
  complianceCert: string; // e.g. "SOC 2 & ISO 27001 Certified"
  skills: string[];
  importedOrgs: string[]; // List of org names where this has been imported
}

const seedLibrary: CuratedCourse[] = [
  {
    id: "lib-1",
    title: "Global Data Privacy & GDPR Essentials",
    description: "Comprehensive regulatory compliance covering GDPR, CCPA/CPRA, data subject rights, breach notification workflows, and cross-border data transfer protocols.",
    category: "Compliance",
    version: "v2.3",
    lastUpdated: "2026-08-15",
    lessonsCount: 8,
    durationHours: 2.5,
    complianceCert: "GDPR / CCPA Audit Validated",
    skills: ["Data Privacy", "Regulatory Compliance", "Information Governance"],
    importedOrgs: ["ESSCI"],
  },
  {
    id: "lib-2",
    title: "Zero Trust Architecture & Cloud Security",
    description: "Industry-standard identity-centric security blueprint, least-privilege access, micro-segmentation, and automated incident response in hybrid cloud environments.",
    category: "Technical Skills",
    version: "v3.0",
    lastUpdated: "2026-09-01",
    lessonsCount: 12,
    durationHours: 4.0,
    complianceCert: "SOC 2 Type II Standard",
    skills: ["Cloud Security", "Zero Trust", "Identity Access Management"],
    importedOrgs: [],
  },
  {
    id: "lib-3",
    title: "Workplace Health, Safety & OSHA Standards",
    description: "Universal environmental health and safety fundamentals, hazard identification, emergency evacuation guidelines, and ergonomic best practices.",
    category: "Compliance",
    version: "v1.4",
    lastUpdated: "2026-07-20",
    lessonsCount: 6,
    durationHours: 1.5,
    complianceCert: "OSHA 1910 Compliant",
    skills: ["Workplace Safety", "OSHA Compliance", "Incident Prevention"],
    importedOrgs: ["ESSCI"],
  },
  {
    id: "lib-4",
    title: "Modern AI Engineering & LLM Application Design",
    description: "Architectural foundations for building production generative AI systems, prompt engineering, RAG pipelines, safety guardrails, and latency optimization.",
    category: "Technical Skills",
    version: "v1.0",
    lastUpdated: "2026-09-10",
    lessonsCount: 10,
    durationHours: 3.5,
    complianceCert: "DeepLearning Institute Certified",
    skills: ["Generative AI", "LLM Architecture", "Vector Databases"],
    importedOrgs: [],
  },
  {
    id: "lib-5",
    title: "High-Impact Inclusive Leadership & Feedback Culture",
    description: "Executive coaching, high-performing psychological safety, constructive performance reviews, and cross-functional team delegation.",
    category: "Leadership",
    version: "v2.0",
    lastUpdated: "2026-08-28",
    lessonsCount: 7,
    durationHours: 2.0,
    complianceCert: "Enterprise Leadership Standard",
    skills: ["Leadership", "Team Feedback", "Psychological Safety"],
    importedOrgs: [],
  },
];

interface ContentLibraryState {
  courses: CuratedCourse[];
  importCourse: (id: string, org: string) => void;
  syncUpdate: (id: string, org: string) => void;
}

export const useContentLibraryStore = create<ContentLibraryState>()(
  persist(
    (set) => ({
      courses: seedLibrary,
      importCourse: (id, org) =>
        set((state) => ({
          courses: state.courses.map((c) =>
            c.id === id && !c.importedOrgs.includes(org)
              ? { ...c, importedOrgs: [...c.importedOrgs, org] }
              : c
          ),
        })),
      syncUpdate: (id, org) =>
        set((state) => ({
          courses: state.courses.map((c) =>
            c.id === id && !c.importedOrgs.includes(org)
              ? { ...c, importedOrgs: [...c.importedOrgs, org] }
              : c
          ),
        })),
    }),
    { name: "lms-content-library-store" }
  )
);
