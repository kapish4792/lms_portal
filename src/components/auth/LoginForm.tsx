"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { BrandLogo } from "@/components/ui/brand-logo";
import { FaceVerificationStep } from "@/components/auth/FaceVerificationStep";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/lib/store/auth-store";
import { useEnrollmentsStore } from "@/lib/store/enrollments-store";
import { DEV_OTP, resolveUser, type MockUser } from "@/lib/mock/users";
import {
  Mail,
  Lock,
  Building2,
  Loader2,
  ArrowLeft,
  ShieldCheck,
  AlertTriangle,
  Eye,
  EyeOff,
  Sparkles,
} from "lucide-react";

type Step = 1 | 2 | "sso" | "mfa" | "face";

// Simulated TOTP authenticator code — Section 3.2's MFA verification step,
// shown only for accounts seeded with mfaEnrolled: true, so the flow is
// demonstrable without a real authenticator app.
const DEV_TOTP = "654321";

const SSOButton = ({
  children,
  icon,
  onClick,
  disabled,
  variant = "outline",
  className,
}: {
  children: React.ReactNode;
  icon: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: "outline" | "ghost";
  className?: string;
}) => (
  <Button
    type="button"
    variant={variant}
    size="lg"
    className={cn(
      "w-full gap-3 justify-center",
      variant === "outline" && "border-surface-border hover:border-brand-300 hover:bg-brand-50 dark:hover:bg-brand-950/50",
      variant === "ghost" && "hover:bg-surface-sunken",
      className
    )}
    onClick={onClick}
    disabled={disabled}
  >
    <span className="flex items-center justify-center text-lg">{icon}</span>
    {children}
  </Button>
);

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
);

const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#1877F2">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

const AppleIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-black dark:fill-white">
    <path d="M16.365 1.43c0 1.14-.493 2.27-1.177 3.08-.744.9-1.99 1.57-2.987 1.57-.12 0-.23-.02-.3-.03-.014-.1-.033-.22-.033-.35 0-1.11.606-2.28 1.235-2.99.744-.85 2.03-1.5 3.08-1.55.014.1.03.2.03.27zm4.565 15.71c-.03.07-.463 1.58-1.518 3.12-.945 1.34-1.94 2.71-3.43 2.71-1.517 0-1.9-.88-3.63-.88-1.698 0-2.302.91-3.67.91-1.377 0-2.332-1.26-3.428-2.8-1.287-1.82-2.323-4.63-2.323-7.28 0-4.28 2.797-6.55 5.552-6.55 1.448 0 2.675.95 3.6.95.865 0 2.222-1.01 3.902-1.01.673 0 3.187.06 4.83 2.42-.126.08-2.883 1.68-2.883 5.14 0 4.02 3.53 5.38 3.6 5.38z" />
  </svg>
);

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const courseIdParam = searchParams.get("courseId");
  const directLogin = useAuthStore((s) => s.directLogin);
  const startLogin = useAuthStore((s) => s.startLogin);
  const verifyOtp = useAuthStore((s) => s.verifyOtp);
  const isTrustedDevice = useAuthStore((s) => s.isTrustedDevice);
  const isLockedOut = useAuthStore((s) => s.isLockedOut);
  const requiresCaptcha = useAuthStore((s) => s.requiresCaptcha);
  const enroll = useEnrollmentsStore((s) => s.enroll);

  const redirectAfterLogin = (user: { role: string; identifier?: string; email?: string; id?: string }) => {
    if (courseIdParam) {
      const userKey = user.email || user.id || user.identifier || identifier || "learner@lms.dev";
      enroll(userKey, courseIdParam);
      router.push(`/${user.role}/courses/${courseIdParam}/player`);
      return;
    }
    router.push(`/${user.role}/dashboard`);
  };

  // Section 3.2: accounts seeded with mfaEnrolled: true go through a simulated
  // TOTP step after primary auth succeeds, instead of landing straight on the
  // dashboard — a trusted device still skips it, same as real MFA UX.
  const proceedAfterPrimaryAuth = (user: MockUser) => {
    if (user.mfaEnrolled && !isTrustedDevice(user.identifier)) {
      setTotpCode("");
      setStep("mfa");
      return;
    }
    // Learner Biometric Facial Recognition Verification Step
    if (user.role === "learner") {
      setPendingLearnerUser(user);
      setStep("face");
      return;
    }
    redirectAfterLogin(user);
  };

  const [step, setStep] = useState<Step>(1);
  const [pendingLearnerUser, setPendingLearnerUser] = useState<MockUser | null>(null);
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState("");
  const [totpCode, setTotpCode] = useState("");
  const [ssoDomain, setSsoDomain] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [trustDevice, setTrustDevice] = useState(false);
  const [captchaChecked, setCaptchaChecked] = useState(false);
  const lockoutIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [lockoutSecondsLeft, setLockoutSecondsLeft] = useState(0);

  useEffect(() => {
    if (resendTimer > 0) {
      const interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [resendTimer]);

  useEffect(() => {
    return () => {
      if (lockoutIntervalRef.current) clearInterval(lockoutIntervalRef.current);
    };
  }, []);

  const beginLockoutCountdown = () => {
    setLockoutSecondsLeft(15 * 60);
    if (lockoutIntervalRef.current) clearInterval(lockoutIntervalRef.current);
    lockoutIntervalRef.current = setInterval(() => {
      setLockoutSecondsLeft((prev) => {
        if (prev <= 1) {
          if (lockoutIntervalRef.current) clearInterval(lockoutIntervalRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleQuickLogin = (emailOrSlug: string) => {
    setError(null);
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      const user = directLogin(emailOrSlug);
      proceedAfterPrimaryAuth(user);
    }, 300);
  };

  const handleContinue = () => {
    if (!identifier.trim()) return;
    setError(null);
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      const user = resolveUser(identifier);
      // If user typed password OR device is trusted: log in directly!
      if (password.trim() || isTrustedDevice(identifier)) {
        directLogin(identifier);
        proceedAfterPrimaryAuth(user);
        return;
      }
      startLogin(identifier);
      setStep(2);
      setResendTimer(60);
      setCaptchaChecked(false);
    }, 500);
  };

  const handleVerify = () => {
    if (otp.length !== 6) return;
    if (requiresCaptcha() && !captchaChecked) {
      setError("Please confirm you're not a robot to continue.");
      return;
    }
    setError(null);
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      const result = verifyOtp(otp, trustDevice);
      if (!result.success) {
        setError(result.error ?? "Something went wrong.");
        setOtp("");
        if (isLockedOut()) beginLockoutCountdown();
        return;
      }
      const user = useAuthStore.getState().currentUser || resolveUser(identifier);
      useAuthStore.setState({ currentUser: user, pendingIdentifier: null });
      if (user) {
        proceedAfterPrimaryAuth(user);
      } else {
        router.push("/learner/dashboard");
      }
    }, 500);
  };

  const handleMfaVerify = () => {
    if (totpCode.length !== 6) return;
    setError(null);
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      if (totpCode !== DEV_TOTP) {
        setError("Invalid authenticator code. Please try again.");
        setTotpCode("");
        return;
      }
      const user = useAuthStore.getState().currentUser || resolveUser(identifier);
      redirectAfterLogin(user);
    }, 600);
  };

  const handleSocialLogin = (provider: string) => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      const user = directLogin("learner@lms.dev");
      redirectAfterLogin(user);
    }, 300);
  };

  const handleResend = () => {
    if (resendTimer > 0) return;
    setResendTimer(60);
    setError(null);
  };

  const handleBack = () => {
    setStep(1);
    setOtp("");
    setTotpCode("");
    setError(null);
  };

  const handleEnterpriseSso = () => {
    if (!ssoDomain.trim()) return;
    setError(null);
    setIsLoading(true);
    // Simulates federated SAML 2.0 / Okta / Azure AD tenant handshake — no
    // password is collected here, the identity provider owns that step.
    setTimeout(() => {
      setIsLoading(false);
      const user = startLogin(ssoDomain.includes("@") ? ssoDomain : `admin@${ssoDomain}`);
      const result = { success: true, user };
      if (result.success && user) {
        useAuthStore.setState({ currentUser: user, pendingIdentifier: null });
        proceedAfterPrimaryAuth(user);
      }
    }, 1200);
  };

  const locked = isLockedOut();
  const lockoutMinutes = Math.floor(lockoutSecondsLeft / 60);
  const lockoutSeconds = lockoutSecondsLeft % 60;

  return (
    <div className="min-h-screen flex">
      {/* Left Canvas - Brand Artwork */}
      <div className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center p-12 bg-linear-to-br from-primary via-[color-mix(in_oklch,var(--primary),black_15%)] to-[color-mix(in_oklch,var(--primary),black_35%)] text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%23ffffff%22 fill-opacity=%220.03%22%3E%3Cpath d=%22M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-50" />
        <div className="relative z-10 max-w-md text-center">
          <div className="mb-8">
            <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-white shadow-xl mb-6">
              <Image
                src="/logo.jpg"
                alt="ESSCI Skilling India in Electronics"
                width={160}
                height={110}
                className="h-16 w-auto object-contain"
                priority
              />
            </div>
            <h1 className="text-3xl lg:text-4xl font-bold tracking-tight mb-4">
              ESSCI Skilling India in Electronics
            </h1>
            <p className="text-base text-white/85 leading-relaxed">
              Electronics Sector Skills Council of India — Empowering workforce skilling, certifications, and electronics innovation across India.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-4 text-sm text-white/70">
            <div className="p-4 bg-white/5 rounded-xl backdrop-blur-sm">
              <div className="text-2xl font-bold text-white">10K+</div>
              <div>Courses</div>
            </div>
            <div className="p-4 bg-white/5 rounded-xl backdrop-blur-sm">
              <div className="text-2xl font-bold text-white">50K+</div>
              <div>Learners</div>
            </div>
            <div className="p-4 bg-white/5 rounded-xl backdrop-blur-sm">
              <div className="text-2xl font-bold text-white">99%</div>
              <div>Completion</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Canvas - Login Card */}
      <div className="flex-1 flex items-center justify-center p-8 lg:p-12 bg-surface-base">
        <div className="w-full max-w-md">
          {/* Top Navigation */}
          <div className="flex items-center justify-between mb-8">
            <Link href="/" className="inline-flex items-center shrink-0">
              <BrandLogo size="md" />
            </Link>
            <div className="flex items-center gap-3">
              <Link href="/" className="text-xs font-medium text-text-secondary hover:text-text-primary transition-colors">
                Browse Courses
              </Link>
            </div>
          </div>

          {/* Login Card or Face Verification */}
          {step === "face" && pendingLearnerUser ? (
            <FaceVerificationStep
              user={pendingLearnerUser}
              onSuccess={() => {
                redirectAfterLogin(pendingLearnerUser);
              }}
              onCancel={() => {
                setPendingLearnerUser(null);
                setStep(1);
              }}
            />
          ) : (
            <Card className="border-surface-border shadow-card">
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-2xl font-bold text-text-primary">
                  {step === 1 && "Log in to continue your learning journey"}
                  {step === 2 && "Check your inbox"}
                  {step === "mfa" && "Two-Factor Authentication"}
                  {step === "sso" && "Log in with your organization"}
                </CardTitle>
                {step === 2 && (
                  <p className="text-text-secondary mt-2">
                    Enter the 6-digit code we sent to <strong className="text-text-primary">{identifier}</strong> to finish your login.
                  </p>
                )}
                {step === "mfa" && (
                  <p className="text-text-secondary mt-2">
                    This account requires MFA. Enter the 6-digit code from your authenticator app.
                  </p>
                )}
                {step === "sso" && (
                  <p className="text-text-secondary mt-2">
                    Enter your work email or organization domain to continue with your
                    identity provider (SAML 2.0, Okta, or Azure AD).
                  </p>
                )}
              </CardHeader>
              <CardContent className="space-y-6">
                {error && (
                  <div className="flex items-start gap-2 rounded-lg border border-danger-200 bg-danger-50 dark:bg-danger-950/30 dark:border-danger-900 px-3 py-2 text-sm text-danger-700 dark:text-danger-300">
                    <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {locked && (
                  <div className="flex items-start gap-2 rounded-lg border border-danger-200 bg-danger-50 dark:bg-danger-950/30 dark:border-danger-900 px-3 py-2 text-sm text-danger-700 dark:text-danger-300">
                    <Lock className="w-4 h-4 mt-0.5 shrink-0" />
                    <span>
                      Account temporarily locked. Try again in {lockoutMinutes}:
                      {lockoutSeconds.toString().padStart(2, "0")}.
                    </span>
                  </div>
                )}

                {step === 1 && (
                  <>
                    {/* Quick 1-click demo logins */}
                    <div className="rounded-xl border border-surface-border bg-surface-sunken/60 p-3 space-y-2">
                      <div className="flex items-center justify-between text-xs font-semibold text-text-tertiary">
                        <span className="flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5 text-primary" /> Instant 1-Click Demo Login:
                        </span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleQuickLogin("lmsadmin@lms.dev")}
                          className="py-1.5 px-2 text-xs font-bold rounded-lg bg-primary/15 text-primary hover:bg-primary/25 border border-primary/25 transition-all text-center"
                        >
                          LMS Admin
                        </button>
                        <button
                          type="button"
                          onClick={() => handleQuickLogin("admin@lms.dev")}
                          className="py-1.5 px-2 text-xs font-semibold rounded-lg bg-surface-base hover:bg-surface-raised border border-surface-border text-text-primary transition-all text-center"
                        >
                          Org Admin
                        </button>
                        <button
                          type="button"
                          onClick={() => handleQuickLogin("instructor@lms.dev")}
                          className="py-1.5 px-2 text-xs font-semibold rounded-lg bg-surface-base hover:bg-surface-raised border border-surface-border text-text-primary transition-all text-center"
                        >
                          Instructor
                        </button>
                        <button
                          type="button"
                          onClick={() => handleQuickLogin("learner@lms.dev")}
                          className="py-1.5 px-2 text-xs font-semibold rounded-lg bg-surface-base hover:bg-surface-raised border border-surface-border text-text-primary transition-all text-center"
                        >
                          Learner
                        </button>
                        <button
                          type="button"
                          onClick={() => handleQuickLogin("manager@lms.dev")}
                          className="py-1.5 px-2 text-xs font-semibold rounded-lg bg-surface-base hover:bg-surface-raised border border-surface-border text-text-primary transition-all text-center"
                        >
                          Manager
                        </button>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="identifier" className="text-text-primary font-medium text-xs">
                            Email, Username, or Role
                          </Label>
                          <Link
                            href="/auth/forgot-password"
                            className="text-xs text-brand-600 hover:text-brand-700 font-medium"
                          >
                            Forgot password?
                          </Link>
                        </div>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary w-4 h-4" />
                          <Input
                            id="identifier"
                            type="text"
                            placeholder="e.g. admin@lms.dev or learner@lms.dev"
                            value={identifier}
                            onChange={(e) => setIdentifier(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleContinue()}
                            className="pl-9 pr-10"
                            disabled={isLoading}
                            autoComplete="email"
                            autoFocus
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="password" className="text-text-primary font-medium text-xs">
                          Password <span className="text-text-tertiary font-normal">(Optional for Demo)</span>
                        </Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary w-4 h-4" />
                          <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter password or leave empty for OTP"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleContinue()}
                            className="pl-9 pr-10 text-sm"
                            disabled={isLoading}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-primary"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    </div>

                    <Button
                      className="w-full bg-primary text-primary-foreground hover:bg-primary/90 py-3 font-semibold shadow-xs"
                      onClick={handleContinue}
                      disabled={isLoading || !identifier.trim()}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Logging in...
                        </>
                      ) : password.trim() ? (
                        "Sign In"
                      ) : (
                        "Continue"
                      )}
                    </Button>

                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <Separator className="w-full" />
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="bg-surface-base px-2 text-text-tertiary">Other log in options</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <SSOButton icon={<GoogleIcon />} onClick={() => handleSocialLogin("Google")}>Google</SSOButton>
                      <SSOButton icon={<FacebookIcon />} onClick={() => handleSocialLogin("Facebook")}>Facebook</SSOButton>
                      <SSOButton icon={<AppleIcon />} onClick={() => handleSocialLogin("Apple")}>Apple</SSOButton>
                    </div>

                    <p className="text-center text-sm text-text-secondary">
                      Don&apos;t have an account?{" "}
                      <Link href="/auth/signup" className="text-brand-600 hover:text-brand-700 font-semibold underline underline-offset-4">
                        Sign up to buy courses
                      </Link>
                    </p>

                    <Button
                      variant="outline"
                      className="w-full border-surface-border bg-surface-raised hover:bg-brand-50 dark:hover:bg-brand-950/30 gap-3"
                      onClick={() => {
                        setError(null);
                        setStep("sso");
                      }}
                    >
                      <Building2 className="w-5 h-5" />
                      <span>Log in with your organization</span>
                    </Button>
                  </>
                )}

                {step === 2 && (
                  <>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="otp" className="text-text-primary font-medium">
                          6-digit code
                        </Label>
                        <button
                          type="button"
                          onClick={() => setOtp(DEV_OTP)}
                          className="text-xs text-brand-600 hover:underline font-semibold"
                        >
                          Auto-fill ({DEV_OTP})
                        </button>
                      </div>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary w-5 h-5" />
                        <Input
                          id="otp"
                          type="text"
                          inputMode="numeric"
                          maxLength={6}
                          placeholder={DEV_OTP}
                          value={otp}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, "").slice(0, 6);
                            setOtp(value);
                          }}
                          onKeyDown={(e) => e.key === "Enter" && handleVerify()}
                          className="pl-10 text-center text-2xl tracking-widest font-mono"
                          disabled={isLoading || locked}
                          autoComplete="one-time-code"
                          autoFocus
                        />
                      </div>
                    </div>

                    {requiresCaptcha() && !locked && (
                      <label className="flex items-center gap-3 rounded-lg border border-surface-border bg-surface-sunken px-3 py-3 text-sm cursor-pointer">
                        <input
                          type="checkbox"
                          checked={captchaChecked}
                          onChange={(e) => setCaptchaChecked(e.target.checked)}
                          className="w-4 h-4"
                        />
                        <span className="text-text-secondary">I&apos;m not a robot</span>
                      </label>
                    )}

                    <label className="flex items-center justify-between gap-3 rounded-lg border border-surface-border px-3 py-3">
                      <div>
                        <p className="text-sm font-medium text-text-primary">Trust this browser for 30 days</p>
                        <p className="text-xs text-text-tertiary">Skip verification on this device next time</p>
                      </div>
                      <Switch
                        checked={trustDevice}
                        onCheckedChange={(checked: boolean) => setTrustDevice(checked)}
                        disabled={isLoading || locked}
                      />
                    </label>

                    <Button
                      className="w-full bg-primary text-primary-foreground hover:bg-primary/90 py-3"
                      onClick={handleVerify}
                      disabled={isLoading || otp.length !== 6 || locked}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Log in
                        </>
                      ) : (
                        "Log in"
                      )}
                    </Button>

                    <div className="space-y-3 text-sm text-center">
                      <p className="text-text-secondary">
                        Didn&apos;t receive the code?{" "}
                        <button
                          onClick={handleResend}
                          disabled={resendTimer > 0 || isLoading}
                          className={cn(
                            "font-medium",
                            resendTimer > 0 ? "text-text-tertiary cursor-not-allowed" : "text-brand-600 hover:text-brand-700"
                          )}
                        >
                          {resendTimer > 0 ? `Resend code in ${resendTimer}s` : "Resend code"}
                        </button>
                      </p>
                      <p className="text-text-secondary">
                        <Link href="/auth/forgot-password" className="text-brand-600 hover:text-brand-700 font-medium">
                          Having trouble logging in? Reset your password
                        </Link>
                      </p>
                      <p className="text-text-secondary">
                        <button onClick={handleBack} className="text-brand-600 hover:text-brand-700 font-medium">
                          Log in to a different account
                        </button>
                      </p>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full text-text-secondary hover:text-text-primary"
                      onClick={handleBack}
                    >
                      <ArrowLeft className="mr-2 w-4 h-4" />
                      Back to email entry
                    </Button>
                  </>
                )}

                {step === "mfa" && (
                  <>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="totp" className="text-text-primary font-medium">
                          Authenticator code
                        </Label>
                        <button
                          type="button"
                          onClick={() => setTotpCode(DEV_TOTP)}
                          className="text-xs text-brand-600 hover:underline font-semibold"
                        >
                          Auto-fill ({DEV_TOTP})
                        </button>
                      </div>
                      <div className="relative">
                        <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary w-5 h-5" />
                        <Input
                          id="totp"
                          type="text"
                          inputMode="numeric"
                          maxLength={6}
                          placeholder={DEV_TOTP}
                          value={totpCode}
                          onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                          onKeyDown={(e) => e.key === "Enter" && handleMfaVerify()}
                          className="pl-10 text-center text-2xl tracking-widest font-mono"
                          disabled={isLoading}
                          autoComplete="one-time-code"
                          autoFocus
                        />
                      </div>
                      <p className="text-xs text-text-tertiary">
                        Simulated TOTP for this demo — a real deployment would validate against Google/Microsoft Authenticator or Authy.
                      </p>
                    </div>

                    <Button
                      className="w-full bg-primary text-primary-foreground hover:bg-primary/90 py-3"
                      onClick={handleMfaVerify}
                      disabled={isLoading || totpCode.length !== 6}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Verifying...
                        </>
                      ) : (
                        "Verify & Log in"
                      )}
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full text-text-secondary hover:text-text-primary"
                      onClick={handleBack}
                    >
                      <ArrowLeft className="mr-2 w-4 h-4" />
                      Back to email entry
                    </Button>
                  </>
                )}

                {step === "sso" && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="sso-domain" className="text-text-primary font-medium">
                        Work email or organization domain
                      </Label>
                      <div className="relative">
                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary w-5 h-5" />
                        <Input
                          id="sso-domain"
                          type="text"
                          placeholder="you@company.com or company.com"
                          value={ssoDomain}
                          onChange={(e) => setSsoDomain(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && handleEnterpriseSso()}
                          className="pl-10"
                          disabled={isLoading}
                          autoFocus
                        />
                      </div>
                    </div>

                    <Button
                      className="w-full bg-primary text-primary-foreground hover:bg-primary/90 py-3 gap-2"
                      onClick={handleEnterpriseSso}
                      disabled={isLoading || !ssoDomain.trim()}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Redirecting to your identity provider...
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="w-4 h-4" />
                          Continue with SSO
                        </>
                      )}
                    </Button>

                    <p className="text-xs text-text-tertiary text-center">
                      You&apos;ll be redirected to your organization&apos;s SAML 2.0, Okta, or
                      Azure AD sign-in page. No password is entered here.
                    </p>

                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full text-text-secondary hover:text-text-primary"
                      onClick={() => {
                        setError(null);
                        setStep(1);
                      }}
                    >
                      <ArrowLeft className="mr-2 w-4 h-4" />
                      Back to email entry
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          )}

          <p className="text-center text-xs text-text-tertiary mt-6">
            Powered by ESSCI Skilling India in Electronics
          </p>
        </div>
      </div>
    </div>
  );
}
