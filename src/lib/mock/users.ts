/**
 * Role type is the platform's canonical role-slug union.
 * Defined in src/config/roles.ts (RoleSlug) — re-exported here as `Role`
 * to preserve backward compatibility with existing imports from this file.
 */
import type { RoleSlug } from "@/config/roles";
export type { RoleSlug as Role } from "@/config/roles";

export interface MockUser {
  identifier: string; // email or phone used to log in
  name: string;
  role: RoleSlug;
  org: string;
  department?: string;
  avatarUrl?: string;
  bio?: string;
  phone?: string;
  mfaEnrolled: boolean;
}

// Seed directory used to resolve an identifier to a role for the dedicated-login
// redirect (Section 3.3.B). In a real backend this lookup happens server-side.
// Note: Only one LMS Admin can exist (singleton enforcement).
export const MOCK_USERS: MockUser[] = [
  { identifier: "super@lms.dev", name: "Sam Root", role: "super-admin", org: "LMS Platform", mfaEnrolled: true },
  { identifier: "lmsadmin@lms.dev", name: "Alex Morgan", role: "lms-admin", org: "LMS Platform", mfaEnrolled: true },
  { identifier: "admin@lms.dev", name: "Avery Chen", role: "org-admin", org: "Acme Corp", mfaEnrolled: true },
  { identifier: "depthead@lms.dev", name: "Devon Park", role: "dept-head", org: "Acme Corp", department: "Engineering", mfaEnrolled: true },
  { identifier: "instructor@lms.dev", name: "Riley Instructor", role: "instructor", org: "Acme Corp", department: "Engineering", mfaEnrolled: false },
  { identifier: "learner@lms.dev", name: "Jamie Learner", role: "learner", org: "Acme Corp", department: "Sales", mfaEnrolled: false },
  { identifier: "manager@lms.dev", name: "Morgan Lead", role: "manager", org: "Acme Corp", department: "Sales", mfaEnrolled: true },
];

export const DEV_OTP = "123456";

export function findUserByIdentifier(identifier: string): MockUser | undefined {
  const normalized = identifier.trim().toLowerCase();
  return MOCK_USERS.find(
    (u) =>
      u.identifier.toLowerCase() === normalized ||
      u.identifier.toLowerCase().split("@")[0] === normalized ||
      u.role === normalized ||
      ((normalized === "lmsadmin" || normalized === "lms-admin" || normalized === "lms admin") && u.identifier === "lmsadmin@lms.dev") ||
      (normalized === "admin" && (u.role === "org-admin" || u.identifier === "admin@lms.dev"))
  );
}

// Unknown identifiers still complete the demo flow as a Learner so the UI can be
// exercised end-to-end without needing a seeded account.
export function resolveUser(identifier: string): MockUser {
  return (
    findUserByIdentifier(identifier) ?? {
      identifier,
      name: identifier.split("@")[0] || "New User",
      role: "learner",
      org: "Acme Corp",
      mfaEnrolled: false,
    }
  );
}
