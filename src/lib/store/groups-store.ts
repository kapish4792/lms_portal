import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Role } from "@/lib/mock/users";

export interface GroupRule {
  field: "department" | "role";
  value: string;
}

export interface Group {
  id: string;
  name: string;
  org: string;
  department?: string;
  memberIds: string[]; // DirectoryUser.id — ignored when `rule` is set
  courseIds: string[]; // Course.id — assigning a course here is the "automated enrollment"
  rule?: GroupRule; // proposed dynamic, rule-based membership
}

const seedGroups = (): Group[] => [
  {
    id: "g-1",
    name: "Q3 Sales Onboarding",
    org: "Acme Corp",
    department: "Sales",
    memberIds: ["u-102", "u-103"],
    courseIds: ["c-1"],
  },
  {
    id: "g-2",
    name: "Engineering — All Instructors",
    org: "Acme Corp",
    department: "Engineering",
    memberIds: [],
    courseIds: ["c-2"],
    rule: { field: "role", value: "instructor" satisfies Role },
  },
];

interface GroupsState {
  groups: Group[];
  addGroup: (group: Omit<Group, "id">) => string;
  updateGroup: (id: string, patch: Partial<Group>) => void;
}

export const useGroupsStore = create<GroupsState>()(
  persist(
    (set) => ({
      groups: seedGroups(),
      addGroup: (group) => {
        const id = `g-${Date.now()}`;
        set((state) => ({ groups: [{ ...group, id }, ...state.groups] }));
        return id;
      },
      updateGroup: (id, patch) =>
        set((state) => ({ groups: state.groups.map((g) => (g.id === id ? { ...g, ...patch } : g)) })),
    }),
    { name: "lms-groups-store" }
  )
);
