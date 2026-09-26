"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAuthStore } from "@/lib/store/auth-store";
import { cn } from "@/lib/utils";
import {
  Mail,
  Lock,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  KeyRound,
  ShieldCheck,
  Eye,
  EyeOff,
} from "lucide-react";

type ForgotStep = "request" | "verify" | "reset" | "success";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const resetPassword = useAuthStore((s) => s.resetPassword);

  const [step, setStep] = useState<ForgotStep>("request");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendTimer, setResendTimer] = useState(0);

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setInterval(() => setResendTimer((prev) => prev - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [resendTimer]);

  // Password strength evaluation
  const hasMinLength = newPassword.length >= 8;
  const hasNumber = /\d/.test(newPassword);
  const hasUppercase = /[A-Z]/.test(newPassword);
  const hasSpecial = /[^A-Za-z0-9]/.test(newPassword);
  const strengthScore = [hasMinLength, hasNumber, hasUppercase, hasSpecial].filter(Boolean).length;

  const handleRequestCode = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email.trim()) {
      setError("Please enter your email or username.");
      return;
    }
    setError(null);
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      setStep("verify");
      setResendTimer(60);
    }, 800);
  };

  const handleVerifyCode = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (code.length !== 6) {
      setError("Please enter the 6-digit code.");
      return;
    }
    setError(null);
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      // Demo code accept 123456 or any 6 digits for testing ease
      if (code !== "123456" && code !== "888888" && code.length !== 6) {
        setError("Invalid recovery code. Please use demo code 123456.");
        return;
      }
      setStep("reset");
    }, 700);
  };

  const handleResetPassword = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!hasMinLength) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setError(null);
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      resetPassword(email);
      setStep("success");
    }, 800);
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-surface-base text-text-primary">
      {/* Top Navbar */}
      <header className="border-b border-surface-border px-6 py-4 flex items-center justify-between">
        <Link href="/" className="inline-flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center text-primary-foreground group-hover:scale-105 transition-transform">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <span className="text-xl font-bold tracking-tight">LMS Portal</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/auth/login" className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors">
            Back to Log in
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          <Card className="border-surface-border shadow-lg">
            <CardHeader className="text-center space-y-2 pb-4">
              <div className="mx-auto w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-2">
                {step === "request" && <KeyRound className="w-6 h-6" />}
                {step === "verify" && <Mail className="w-6 h-6" />}
                {step === "reset" && <Lock className="w-6 h-6" />}
                {step === "success" && <CheckCircle2 className="w-6 h-6 text-emerald-500" />}
              </div>

              <CardTitle className="text-2xl font-bold tracking-tight">
                {step === "request" && "Forgot password?"}
                {step === "verify" && "Check your inbox"}
                {step === "reset" && "Create new password"}
                {step === "success" && "Password reset complete"}
              </CardTitle>

              <CardDescription className="text-sm text-text-secondary">
                {step === "request" && "Enter your registered email address and we'll send a 6-digit recovery code."}
                {step === "verify" && `We sent a 6-digit verification code to ${email || "your email"}.`}
                {step === "reset" && "Choose a strong password with at least 8 characters."}
                {step === "success" && "Your password has been successfully reset. You can now log into your account."}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {error && (
                <div className="flex items-start gap-2 rounded-lg border border-danger-200 bg-danger-50 dark:bg-danger-950/30 dark:border-danger-900 p-3 text-sm text-danger-700 dark:text-danger-300">
                  <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* STEP 1: Request code */}
              {step === "request" && (
                <form onSubmit={handleRequestCode} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="reset-email" className="font-medium text-sm">
                      Email or Username
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary w-5 h-5" />
                      <Input
                        id="reset-email"
                        type="text"
                        placeholder="you@company.com or username"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10"
                        autoFocus
                        disabled={isLoading}
                      />
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-text-tertiary pt-1">
                      <span>Quick fill:</span>
                      <button
                        type="button"
                        onClick={() => setEmail("learner@lms.dev")}
                        className="text-brand-600 hover:underline font-medium"
                      >
                        learner@lms.dev
                      </button>
                      <span>•</span>
                      <button
                        type="button"
                        onClick={() => setEmail("admin@lms.dev")}
                        className="text-brand-600 hover:underline font-medium"
                      >
                        admin@lms.dev
                      </button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90 py-2.5"
                    disabled={isLoading || !email.trim()}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending code...
                      </>
                    ) : (
                      "Send Recovery Code"
                    )}
                  </Button>

                  <div className="text-center pt-2">
                    <Link
                      href="/auth/login"
                      className="inline-flex items-center text-sm text-text-secondary hover:text-text-primary font-medium"
                    >
                      <ArrowLeft className="w-4 h-4 mr-1.5" />
                      Back to sign in
                    </Link>
                  </div>
                </form>
              )}

              {/* STEP 2: Verify code */}
              {step === "verify" && (
                <form onSubmit={handleVerifyCode} className="space-y-4">
                  <div className="rounded-lg bg-surface-sunken border border-surface-border p-3 text-xs text-text-secondary flex items-start gap-2">
                    <ShieldCheck className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
                    <span>
                      Demo recovery code is <strong className="text-text-primary font-mono">123456</strong>. Enter it below to proceed.
                    </span>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="verification-code" className="font-medium text-sm">
                      6-digit Verification Code
                    </Label>
                    <div className="relative">
                      <Input
                        id="verification-code"
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        placeholder="123456"
                        value={code}
                        onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                        className="text-center text-2xl tracking-widest font-mono"
                        autoFocus
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90 py-2.5"
                    disabled={isLoading || code.length !== 6}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      "Verify Code"
                    )}
                  </Button>

                  <div className="flex items-center justify-between text-xs text-text-secondary pt-2">
                    <button
                      type="button"
                      onClick={() => setStep("request")}
                      className="inline-flex items-center hover:text-text-primary"
                    >
                      <ArrowLeft className="w-3.5 h-3.5 mr-1" />
                      Change email
                    </button>
                    <button
                      type="button"
                      disabled={resendTimer > 0}
                      onClick={() => setResendTimer(60)}
                      className={cn(
                        "font-medium",
                        resendTimer > 0 ? "text-text-tertiary cursor-not-allowed" : "text-brand-600 hover:underline"
                      )}
                    >
                      {resendTimer > 0 ? `Resend code in ${resendTimer}s` : "Resend code"}
                    </button>
                  </div>
                </form>
              )}

              {/* STEP 3: Reset Password */}
              {step === "reset" && (
                <form onSubmit={handleResetPassword} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="new-password" className="font-medium text-sm">
                      New Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="new-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter new password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="pr-10"
                        autoFocus
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

                  {/* Strength Bar */}
                  {newPassword && (
                    <div className="space-y-1.5 pt-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-text-secondary">Password strength:</span>
                        <span className={cn(
                          "font-medium",
                          strengthScore <= 1 && "text-danger-500",
                          strengthScore === 2 && "text-warning",
                          strengthScore >= 3 && "text-emerald-500"
                        )}>
                          {strengthScore <= 1 ? "Weak" : strengthScore === 2 ? "Medium" : "Strong"}
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-surface-sunken rounded-full overflow-hidden flex gap-1">
                        <div className={cn("h-full flex-1 rounded-full", strengthScore >= 1 ? (strengthScore <= 1 ? "bg-danger-500" : strengthScore === 2 ? "bg-warning" : "bg-emerald-500") : "bg-surface-border")} />
                        <div className={cn("h-full flex-1 rounded-full", strengthScore >= 2 ? (strengthScore === 2 ? "bg-warning" : "bg-emerald-500") : "bg-surface-border")} />
                        <div className={cn("h-full flex-1 rounded-full", strengthScore >= 3 ? "bg-emerald-500" : "bg-surface-border")} />
                        <div className={cn("h-full flex-1 rounded-full", strengthScore >= 4 ? "bg-emerald-500" : "bg-surface-border")} />
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="confirm-password" className="font-medium text-sm">
                      Confirm New Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="confirm-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Re-enter new password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div className="text-xs space-y-1 text-text-tertiary">
                    <p className={cn("flex items-center gap-1.5", hasMinLength ? "text-emerald-600 dark:text-emerald-400" : "")}>
                      <span>{hasMinLength ? "✓" : "•"}</span> Minimum 8 characters
                    </p>
                    <p className={cn("flex items-center gap-1.5", hasNumber ? "text-emerald-600 dark:text-emerald-400" : "")}>
                      <span>{hasNumber ? "✓" : "•"}</span> At least 1 number (0-9)
                    </p>
                    <p className={cn("flex items-center gap-1.5", hasUppercase ? "text-emerald-600 dark:text-emerald-400" : "")}>
                      <span>{hasUppercase ? "✓" : "•"}</span> At least 1 uppercase letter (A-Z)
                    </p>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90 py-2.5"
                    disabled={isLoading || !hasMinLength || newPassword !== confirmPassword}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Updating password...
                      </>
                    ) : (
                      "Reset & Save Password"
                    )}
                  </Button>
                </form>
              )}

              {/* STEP 4: Success state */}
              {step === "success" && (
                <div className="space-y-6 py-2 text-center">
                  <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-sm">
                    Your password has been successfully updated. All active security locks have been cleared.
                  </div>

                  <Button
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90 py-2.5"
                    onClick={() => router.push("/auth/login")}
                  >
                    Proceed to Log in
                  </Button>

                  <p className="text-xs text-text-secondary">
                    Need help? Contact support at <span className="font-mono text-text-primary">support@lms.dev</span>
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-surface-border py-4 px-6 text-center text-xs text-text-tertiary">
        © 2026 LMS Portal. All rights reserved. Enterprise Learning Architecture.
      </footer>
    </div>
  );
}
