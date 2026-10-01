import { create } from "zustand";
import { persist } from "zustand/middleware";
import { DEV_OTP, resolveUser, type MockUser } from "@/lib/mock/users";

const LOCKOUT_MS = 15 * 60 * 1000; // Section 3.2.4: 15-minute lockout after 5 invalid attempts
const CAPTCHA_AFTER_ATTEMPTS = 2; // Section 3.2.4: CAPTCHA escalation before the hard lockout
const LOCKOUT_AFTER_ATTEMPTS = 5;
const TRUST_DEVICE_MS = 30 * 24 * 60 * 60 * 1000; // Section 3.2.2: "Trust this browser for 30 days"

interface AuthState {
  currentUser: MockUser | null;
  pendingIdentifier: string | null;
  failedOtpAttempts: number;
  lockedUntil: number | null;
  trustedDevices: Record<string, number>; // identifier -> trust expiry timestamp

  isTrustedDevice: (identifier: string) => boolean;
  isLockedOut: () => boolean;
  requiresCaptcha: () => boolean;
  directLogin: (identifier: string) => MockUser;
  startLogin: (identifier: string) => MockUser;
  verifyOtp: (code: string, trustDevice: boolean) => { success: boolean; error?: string };
  registerLearner: (details: { email: string; name: string; org?: string; department?: string }) => MockUser;
  resetPassword: (identifier: string) => { success: boolean; error?: string };
  updateProfile: (patch: Partial<MockUser>) => void;
  setMfa: (enabled: boolean) => void;
  changePassword: (oldPass: string, newPass: string) => { success: boolean; error?: string };
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      currentUser: null,
      pendingIdentifier: null,
      failedOtpAttempts: 0,
      lockedUntil: null,
      trustedDevices: {},

      isTrustedDevice: (identifier) => {
        const expiry = get().trustedDevices[identifier.trim().toLowerCase()];
        return !!expiry && expiry > Date.now();
      },

      isLockedOut: () => {
        const { lockedUntil } = get();
        return !!lockedUntil && lockedUntil > Date.now();
      },

      requiresCaptcha: () => get().failedOtpAttempts >= CAPTCHA_AFTER_ATTEMPTS,

      directLogin: (identifier) => {
        const user = resolveUser(identifier);
        set({
          currentUser: user,
          pendingIdentifier: null,
          failedOtpAttempts: 0,
          lockedUntil: null,
        });
        return user;
      },

      startLogin: (identifier) => {
        const user = resolveUser(identifier);
        const isTrusted = get().isTrustedDevice(identifier);
        set({
          currentUser: isTrusted ? user : get().currentUser,
          pendingIdentifier: isTrusted ? null : identifier,
          failedOtpAttempts: 0,
          lockedUntil: null,
        });
        return user;
      },

      verifyOtp: (code, trustDevice) => {
        const { pendingIdentifier, failedOtpAttempts } = get();
        if (get().isLockedOut()) {
          return { success: false, error: "Too many attempts. Try again later." };
        }
        if (!pendingIdentifier) {
          return { success: false, error: "Session expired. Start over." };
        }
        if (code !== DEV_OTP) {
          const attempts = failedOtpAttempts + 1;
          const locked = attempts >= LOCKOUT_AFTER_ATTEMPTS;
          set({
            failedOtpAttempts: attempts,
            lockedUntil: locked ? Date.now() + LOCKOUT_MS : null,
          });
          return {
            success: false,
            error: locked
              ? "Too many invalid attempts. Locked for 15 minutes."
              : "Invalid code. Please try again.",
          };
        }

        const user = resolveUser(pendingIdentifier);
        const trustedDevices = { ...get().trustedDevices };
        if (trustDevice) {
          trustedDevices[pendingIdentifier.trim().toLowerCase()] = Date.now() + TRUST_DEVICE_MS;
        }
        set({
          currentUser: user,
          pendingIdentifier: null,
          failedOtpAttempts: 0,
          lockedUntil: null,
          trustedDevices,
        });
        return { success: true };
      },

      registerLearner: ({ email, name, org = "ESSCI", department = "Individual" }) => {
        const normalized = email.trim().toLowerCase();
        const user: MockUser = {
          identifier: normalized,
          name: name.trim() || normalized.split("@")[0],
          role: "learner",
          org,
          department,
          mfaEnrolled: false,
        };
        const trustedDevices = { ...get().trustedDevices, [normalized]: Date.now() + TRUST_DEVICE_MS };
        set({
          currentUser: user,
          pendingIdentifier: null,
          failedOtpAttempts: 0,
          lockedUntil: null,
          trustedDevices,
        });
        return user;
      },

      resetPassword: (identifier) => {
        if (!identifier.trim()) {
          return { success: false, error: "Identifier is required." };
        }
        set({
          failedOtpAttempts: 0,
          lockedUntil: null,
        });
        return { success: true };
      },

      updateProfile: (patch) => {
        const current = get().currentUser;
        if (!current) return;
        set({ currentUser: { ...current, ...patch } });
      },

      setMfa: (enabled) => {
        const current = get().currentUser;
        if (!current) return;
        set({ currentUser: { ...current, mfaEnrolled: enabled } });
      },

      changePassword: (_oldPass, newPass) => {
        if (!newPass || newPass.trim().length < 6) {
          return { success: false, error: "Password must be at least 6 characters." };
        }
        return { success: true };
      },

      logout: () => set({ currentUser: null, pendingIdentifier: null }),
    }),
    { name: "lms-auth-store" }
  )
);
