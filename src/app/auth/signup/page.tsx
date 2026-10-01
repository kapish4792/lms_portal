"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { BrandLogo } from "@/components/ui/brand-logo";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCoursesStore } from "@/lib/store/courses-store";
import { useAuthStore } from "@/lib/store/auth-store";
import { useUsersStore } from "@/lib/store/users-store";
import {
  ShieldCheck,
  Star,
  CheckCircle2,
  ArrowRight,
  Loader2,
  AlertTriangle,
  Award,
  Sparkles,
  BookOpen,
  GraduationCap,
} from "lucide-react";

function SignUpContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialCourseId = searchParams.get("courseId") || "";

  const enrollUserInCourse = useCoursesStore((s) => s.enrollUserInCourse);
  const registerLearner = useAuthStore((s) => s.registerLearner);
  const addUser = useUsersStore((s) => s.addUser);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [organization, setOrganization] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !email.trim() || !password.trim()) {
      setError("Please fill in all required fields.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }
    if (!agreeTerms) {
      setError("Please agree to the Terms of Service to continue.");
      return;
    }

    setError(null);
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
      const orgName = organization.trim() || "ESSCI";

      // 1. Add to user directory
      addUser({
        firstName: firstName.trim(),
        lastName: lastName.trim() || "Learner",
        email: email.trim().toLowerCase(),
        username: email.trim().split("@")[0],
        role: "learner",
        org: orgName,
        department: "Individual",
      });

      // 2. Authenticate session as learner
      const user = registerLearner({
        email: email.trim().toLowerCase(),
        name: fullName,
        org: orgName,
      });

      // 3. If courseId was passed as a deep-link query parameter, enroll user
      if (initialCourseId) {
        enrollUserInCourse(initialCourseId);
      }

      setIsSuccess(true);

      // 4. Redirect after short confirmation
      setTimeout(() => {
        if (initialCourseId) {
          router.push(`/${user.role}/courses/${initialCourseId}`);
        } else {
          router.push(`/${user.role}/dashboard`);
        }
      }, 1500);
    }, 1200);
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-surface-base text-text-primary">
      {/* Left Canvas - Premium Artwork & Value Prop */}
      <div className="lg:w-5/12 bg-linear-to-br from-primary via-[color-mix(in_oklch,var(--primary),black_15%)] to-[color-mix(in_oklch,var(--primary),black_35%)] text-primary-foreground p-8 lg:p-12 flex flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%23ffffff%22 fill-opacity=%220.03%22%3E%3Cpath d=%22M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-40 pointer-events-none" />

        <div className="relative z-10 space-y-6">
          <Link href="/" className="inline-flex items-center shrink-0">
            <BrandLogo size="md" />
          </Link>

          <div className="pt-8 space-y-4">
            <Badge className="bg-white/20 text-white hover:bg-white/30 border-0 backdrop-blur-md py-1 px-3">
              <Sparkles className="w-3.5 h-3.5 mr-1.5" /> Learner & Enterprise Enrollment
            </Badge>
            <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight">
              Invest in your career with world-class certified courses
            </h1>
            <p className="text-white/80 text-base leading-relaxed">
              Create your account to unlock lifetime access to interactive HD video courses, verified industry certificates, and personalized mentorship.
            </p>
          </div>

          {/* Benefits List */}
          <div className="space-y-4 pt-4">
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center shrink-0 mt-0.5">
                <Award className="w-4 h-4 text-emerald-300" />
              </div>
              <div>
                <p className="font-semibold text-white text-sm">Verifiable Completion Certificates</p>
                <p className="text-xs text-white/70">Showcase accredited digital badges on LinkedIn and resume.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center shrink-0 mt-0.5">
                <GraduationCap className="w-4 h-4 text-sky-300" />
              </div>
              <div>
                <p className="font-semibold text-white text-sm">Lifetime Course Access & Updates</p>
                <p className="text-xs text-white/70">Study at your own pace across web, tablet, or mobile.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center shrink-0 mt-0.5">
                <ShieldCheck className="w-4 h-4 text-amber-300" />
              </div>
              <div>
                <p className="font-semibold text-white text-sm">30-Day Money-Back Guarantee</p>
                <p className="text-xs text-white/70">Risk-free trial with 100% satisfaction guarantee.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Testimonial Quote */}
        <div className="relative z-10 pt-10 border-t border-white/10 mt-8">
          <div className="flex items-center gap-1 text-amber-300 mb-2">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-3.5 h-3.5 fill-current" />
            ))}
          </div>
          <p className="text-sm italic text-white/90 leading-snug">
            &ldquo;The courses are exceptionally practical. The video player notes feature helped me implement Kubernetes directly into production.&rdquo;
          </p>
          <p className="text-xs text-white/60 mt-2 font-medium">
            — Jordan Taylor, Senior DevOps Engineer
          </p>
        </div>
      </div>

      {/* Right Canvas - Interactive Registration Form */}
      <div className="flex-1 flex flex-col justify-between p-6 sm:p-10 lg:p-12 overflow-y-auto">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-8">
          <Link
            href="/"
            className="text-xs font-semibold text-text-secondary hover:text-text-primary flex items-center gap-1"
          >
            ← Back to Course Catalog
          </Link>
          <div className="flex items-center gap-4">
            <p className="text-xs text-text-secondary">
              Already have an account?{" "}
              <Link href="/auth/login" className="text-brand-600 font-semibold hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>

        <div className="w-full max-w-xl mx-auto space-y-6">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-text-primary">
              Create your learner account
            </h2>
            <p className="text-sm text-text-secondary mt-1">
              Sign up today to explore and master our enterprise course catalog.
            </p>
          </div>

          {error && (
            <div className="flex items-start gap-2 rounded-lg border border-danger-200 bg-danger-50 dark:bg-danger-950/30 dark:border-danger-900 p-3 text-sm text-danger-700 dark:text-danger-300">
              <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {isSuccess ? (
            <Card className="border-emerald-500/30 bg-emerald-500/10 shadow-lg text-center p-8 space-y-4">
              <div className="w-14 h-14 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto shadow-md">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-emerald-950 dark:text-emerald-100">
                Account Created Successfully!
              </h3>
              <p className="text-sm text-text-secondary max-w-md mx-auto">
                Welcome to ESSCI Skilling India in Electronics! Your account has been provisioned. Redirecting to your learning workspace...
              </p>
              <div className="flex items-center justify-center gap-2 pt-2 text-primary font-medium text-sm">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Launching dashboard...</span>
              </div>
            </Card>
          ) : (
            <form onSubmit={handleSignUp} className="space-y-6">
              {/* Personal Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="firstName" className="text-xs font-semibold">
                    First Name *
                  </Label>
                  <Input
                    id="firstName"
                    placeholder="e.g. Alex"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="lastName" className="text-xs font-semibold">
                    Last Name
                  </Label>
                  <Input
                    id="lastName"
                    placeholder="e.g. Morgan"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-semibold">
                  Email Address *
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="alex.morgan@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-xs font-semibold">
                    Password *
                  </Label>
                  <span className="text-[11px] text-text-tertiary">Min 8 characters</span>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="Create a strong password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="org" className="text-xs font-semibold">
                  Company / Organization <span className="font-normal text-text-tertiary">(Optional)</span>
                </Label>
                <Input
                  id="org"
                  placeholder="ESSCI or Independent"
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  disabled={isLoading}
                />
              </div>

              {/* Terms checkbox */}
              <label className="flex items-start gap-2 text-xs text-text-secondary cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="rounded border-surface-border mt-0.5"
                />
                <span>
                  I agree to the LMS Terms of Service and Privacy Policy.
                </span>
              </label>

              {/* Submit CTA */}
              <Button
                type="submit"
                size="lg"
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 py-3 text-sm font-semibold shadow-md"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Setting up your account...
                  </>
                ) : (
                  <>
                    Create Account & Start Learning
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </>
                )}
              </Button>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-text-tertiary pt-8">
          Enterprise Learning Portal • Built for modern engineering, sales & leadership education
        </div>
      </div>
    </div>
  );
}

export default function SignUpPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-surface-base">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      }
    >
      <SignUpContent />
    </Suspense>
  );
}
