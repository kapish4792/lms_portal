import { create } from "zustand";
import { persist } from "zustand/middleware";
import { MOCK_USERS, type Role } from "@/lib/mock/users";

export type AccountStatus = "Active" | "Suspended";

export interface DirectoryUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  role: Role;
  department?: string;
  org: string;
  status: AccountStatus;
  registeredAt: string; // ISO date
  groupIds?: string[]; // Group.id in useGroupsStore
}

const seedDirectory = (): DirectoryUser[] => {
  const extra: DirectoryUser[] = [
    { id: "u-101", firstName: "Priya", lastName: "Nair", email: "priya.nair@acme.dev", username: "priya.nair", role: "instructor", org: "Acme Corp", department: "Sales", status: "Active", registeredAt: "2026-06-02" },
    { id: "u-102", firstName: "Marcus", lastName: "Webb", email: "marcus.webb@acme.dev", username: "marcus.webb", role: "learner", org: "Acme Corp", department: "Engineering", status: "Active", registeredAt: "2026-07-14" },
    { id: "u-103", firstName: "Lena", lastName: "Farouk", email: "lena.farouk@acme.dev", username: "lena.farouk", role: "learner", org: "Acme Corp", department: "Sales", status: "Suspended", registeredAt: "2026-04-21" },
    { id: "u-104", firstName: "Tom", lastName: "Reyes", email: "tom.reyes@acme.dev", username: "tom.reyes", role: "learner", org: "Acme Corp", department: "Engineering", status: "Active", registeredAt: "2026-08-30" },
  ];
  const seeded: DirectoryUser[] = MOCK_USERS.map((u, i) => {
    const [firstName, ...rest] = u.name.split(" ");
    return {
      id: `seed-${i}`,
      firstName,
      lastName: rest.join(" ") || "—",
      email: u.identifier,
      username: u.identifier.split("@")[0],
      role: u.role,
      department: u.department,
      org: u.org,
      status: "Active",
      registeredAt: "2026-01-15",
    };
  });
  return [...seeded, ...extra];
};

interface UsersState {
  directory: DirectoryUser[];
  addUser: (user: Omit<DirectoryUser, "id" | "registeredAt" | "status">) => string;
  setStatus: (ids: string[], status: AccountStatus) => void;
}

export const useUsersStore = create<UsersState>()(
  persist(
    (set) => ({
      directory: seedDirectory(),
      addUser: (user) => {
        if (user.role === "lms-admin") {
          const existingLmsAdmin = useUsersStore.getState().directory.find((u) => u.role === "lms-admin");
          if (existingLmsAdmin) {
            throw new Error("Only one LMS Administrator can exist. An LMS Admin already exists in the system.");
          }
        }
        const id = `u-${Date.now()}`;
        set((state) => ({
          directory: [
            {
              ...user,
              id,
              status: "Active",
              registeredAt: new Date().toISOString().slice(0, 10),
            },
            ...state.directory,
          ],
        }));
        return id;
      },
      setStatus: (ids, status) =>
        set((state) => ({
          directory: state.directory.map((u) => (ids.includes(u.id) ? { ...u, status } : u)),
        })),
    }),
    { name: "lms-users-store" }
  )
);
