import { create } from "zustand";
import { persist } from "zustand/middleware";
import { NAV_ITEMS } from "@/lib/permissions";

export interface Organization {
  id: string;
  name: string;
  subdomain: string;
  parentId?: string; // sub-organization when set
  allowSubOrgs: boolean;
  enabledModules: string[]; // NAV_ITEMS ids
}

const ALL_MODULE_IDS = NAV_ITEMS.map((n) => n.id);

const seedOrganizations = (): Organization[] => [
  { id: "org-platform", name: "LMS Platform", subdomain: "platform", allowSubOrgs: true, enabledModules: ALL_MODULE_IDS },
  { id: "org-essci", name: "ESSCI", subdomain: "essci", allowSubOrgs: true, enabledModules: ALL_MODULE_IDS },
];

interface OrganizationsState {
  organizations: Organization[];
  addOrganization: (org: Omit<Organization, "id">) => string;
  updateOrganization: (id: string, patch: Partial<Organization>) => void;
  toggleModule: (id: string, moduleId: string) => void;
  findByName: (name: string) => Organization | undefined;
}

export const useOrganizationsStore = create<OrganizationsState>()(
  persist(
    (set, get) => ({
      organizations: seedOrganizations(),
      addOrganization: (org) => {
        const id = `org-${Date.now()}`;
        set((state) => ({ organizations: [...state.organizations, { ...org, id }] }));
        return id;
      },
      updateOrganization: (id, patch) =>
        set((state) => ({
          organizations: state.organizations.map((o) => (o.id === id ? { ...o, ...patch } : o)),
        })),
      toggleModule: (id, moduleId) => {
        const org = get().organizations.find((o) => o.id === id);
        if (!org) return;
        const enabled = org.enabledModules.includes(moduleId)
          ? org.enabledModules.filter((m) => m !== moduleId)
          : [...org.enabledModules, moduleId];
        set((state) => ({
          organizations: state.organizations.map((o) => (o.id === id ? { ...o, enabledModules: enabled } : o)),
        }));
      },
      findByName: (name) =>
        get().organizations.find(
          (o) => o.name === name || (name === "ESSCI" && o.name === "ESSCI") || (name === "ESSCI" && o.name === "ESSCI")
        ),
    }),
    { name: "lms-organizations-store" }
  )
);
