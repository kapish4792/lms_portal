"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCoursesStore } from "@/lib/store/courses-store";
import { useAuthStore } from "@/lib/store/auth-store";
import { useUsersStore } from "@/lib/store/users-store";
import { Checkbox } from "@/components/ui/checkbox";
import {
  ShieldCheck,
  Star,
  CheckCircle2,
  ArrowRight,
  Loader2,
  AlertTriangle,
  Award,
  Sparkles,
  GraduationCap,
  ScanFace,
  Camera,
  CameraOff,
  RefreshCw,
  Check,
} from "lucide-react";
import { startCameraStream, stopAllCameraStreams } from "@/lib/camera";

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

  // Biometric Face Capture States (Unchecked by default)
  const [enableFaceAuth, setEnableFaceAuth] = useState(false);
  const [capturedFacePhoto, setCapturedFacePhoto] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Stop camera tracks cleanly and release camera hardware immediately
  const stopCamera = () => {
    stopAllCameraStreams(videoRef.current);
    setIsCameraActive(false);
  };

  // Start device camera safely with session cancellation handling
  const startCamera = async () => {
    setCameraError(null);
    const res = await startCameraStream(videoRef.current, {
      facingMode: "user",
      width: 640,
      height: 480,
    });

    if (res.success) {
      setIsCameraActive(true);
    } else {
      setIsCameraActive(false);
      if (res.error !== "Session superseded") {
        setCameraError(
          res.error ||
          "Camera access was blocked or unavailable. You can use 'Demo AI Face Capture' to simulate enrollment."
        );
      }
    }
  };

  // Manage camera lifecycle based on biometric toggle and unmount
  useEffect(() => {
    if (enableFaceAuth && !capturedFacePhoto) {
      startCamera();
    } else {
      stopCamera();
    }

    const handleBeforeUnload = () => {
      stopCamera();
    };
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      stopCamera();
    };
  }, [enableFaceAuth, capturedFacePhoto]);

  // Capture face photo from live video feed
  const handleCapturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    try {
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        // Mirror horizontally to match selfie preview
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
        setCapturedFacePhoto(dataUrl);
        stopCamera();
      }
    } catch {
      handleSimulatedCapture();
    }
  };

  // Fallback AI simulated face capture if camera hardware is unavailable
  const handleSimulatedCapture = () => {
    const canvas = document.createElement("canvas");
    canvas.width = 400;
    canvas.height = 400;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      // High-contrast biometric gradient backdrop
      const grad = ctx.createLinearGradient(0, 0, 400, 400);
      grad.addColorStop(0, "#01458E");
      grad.addColorStop(1, "#1EA838");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 400, 400);

      // Silhouette head
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(200, 160, 65, 0, Math.PI * 2);
      ctx.fill();

      // Silhouette shoulders
      ctx.beginPath();
      ctx.arc(200, 360, 120, Math.PI, 0);
      ctx.fill();

      // Biometric scanning reticle ring
      ctx.strokeStyle = "#00e5ff";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(200, 160, 80, 0, Math.PI * 2);
      ctx.stroke();

      const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
      setCapturedFacePhoto(dataUrl);
      stopCamera();
    }
  };

  const handleRetake = () => {
    setCapturedFacePhoto(null);
  };

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
    if (enableFaceAuth && !capturedFacePhoto) {
      setError("Please click 'Capture Face Photo' to complete your biometric enrollment, or uncheck the biometric option.");
      return;
    }

    setError(null);
    stopCamera();
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
      const orgName = organization.trim() || "ESSCI";
      const normalizedEmail = email.trim().toLowerCase();

      // 1. Add to user directory with biometric data
      addUser({
        firstName: firstName.trim(),
        lastName: lastName.trim() || "Learner",
        email: normalizedEmail,
        username: normalizedEmail.split("@")[0],
        role: "learner",
        org: orgName,
        department: "Individual",
        facePhoto: capturedFacePhoto || undefined,
        biometricRegistered: Boolean(capturedFacePhoto),
      });

      // 2. Authenticate session as learner
      const user = registerLearner({
        email: normalizedEmail,
        name: fullName,
        org: orgName,
        facePhoto: capturedFacePhoto || undefined,
        biometricRegistered: Boolean(capturedFacePhoto),
      });

      // 3. Persist face photo in local storage cache for biometric verification matching
      if (capturedFacePhoto && typeof window !== "undefined") {
        try {
          localStorage.setItem(`essci_face_biometric_${normalizedEmail}`, capturedFacePhoto);
        } catch { }
      }

      // 4. If courseId was passed as a deep-link query parameter, enroll user
      if (initialCourseId) {
        enrollUserInCourse(initialCourseId);
      }

      setIsSuccess(true);

      // 5. Redirect to destination
      setTimeout(() => {
        if (initialCourseId) {
          router.push(`/${user.role}/courses/${initialCourseId}`);
        } else {
          router.push(`/${user.role}/dashboard`);
        }
      }, 1500);
    }, 1000);
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-surface-base text-text-primary">
      {/* Left Canvas - Premium Artwork & Value Prop */}
      <div className="lg:w-5/12 bg-linear-to-br from-primary via-[color-mix(in_oklch,var(--primary),black_15%)] to-[color-mix(in_oklch,var(--primary),black_35%)] text-primary-foreground p-8 lg:p-12 flex flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%23ffffff%22 fill-opacity=%220.03%22%3E%3Cpath d=%22M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-40 pointer-events-none" />

        <div className="relative z-10 space-y-6">
          {/* Official Brand Badge with crisp white container and high-contrast text */}
          <Link href="/" className="inline-flex items-center gap-3.5 group">
            <div className="bg-white rounded-2xl px-3.5 py-2 shadow-xl border border-white/30 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Image
                src="/logo.jpg"
                alt="ESSCI Skilling India in Electronics"
                width={160}
                height={70}
                className="h-12 sm:h-14 w-auto object-contain"
                priority
              />
            </div>
            <div className="flex flex-col justify-center text-left">
              <span className="text-xl sm:text-2xl font-black tracking-tight text-white drop-shadow-sm leading-tight">
                ESSCI
              </span>
              <span className="text-xs font-bold text-white tracking-wide drop-shadow-xs">
                Skilling India in Electronics
              </span>
            </div>
          </Link>

          <div className="pt-6 space-y-4">
            <Badge className="bg-white/20 text-white hover:bg-white/30 border-0 backdrop-blur-md py-1 px-3">
              <Sparkles className="w-3.5 h-3.5 mr-1.5" /> Learner & Enterprise Enrollment
            </Badge>
            <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight">
              Invest in your career with world-class certified courses
            </h1>
            <p className="text-white/85 text-base leading-relaxed">
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
        <div className="relative z-10 pt-8 border-t border-white/15 mt-8">
          <div className="flex items-center gap-1 text-amber-300 mb-2">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-3.5 h-3.5 fill-current" />
            ))}
          </div>
          <p className="text-sm italic text-white/90 leading-snug">
            &ldquo;The courses are exceptionally practical. The hands-on PCB design and embedded IoT modules helped our engineering team achieve production-ready hardware in record time.&rdquo;
          </p>
          <p className="text-xs text-white/75 mt-2 font-medium">
            — Aditya Kulkarni, Senior Embedded Systems Engineer
          </p>
        </div>
      </div>

      {/* Right Canvas - Interactive Registration Form */}
      <div className="flex-1 flex flex-col justify-between p-6 sm:p-10 lg:p-12 overflow-y-auto">
        {/* Mobile Brand Header */}
        <div className="lg:hidden flex items-center justify-between pb-4 border-b border-surface-border mb-6">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <div className="bg-white rounded-xl p-1.5 shadow-xs border border-border flex items-center justify-center">
              <Image
                src="/logo.jpg"
                alt="ESSCI"
                width={80}
                height={40}
                className="h-8 w-auto object-contain"
              />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-sm font-bold text-text-primary leading-none">ESSCI</span>
              <span className="text-[10px] font-semibold text-primary">Skilling India in Electronics</span>
            </div>
          </Link>
          <Link href="/auth/login" className="text-xs font-semibold text-primary hover:underline">
            Sign In
          </Link>
        </div>

        {/* Desktop Top bar */}
        <div className="hidden lg:flex items-center justify-between mb-8">
          <Link
            href="/"
            className="text-xs font-semibold text-text-secondary hover:text-text-primary flex items-center gap-1"
          >
            ← Back to Course Catalog
          </Link>
          <div className="flex items-center gap-4">
            <p className="text-xs text-text-secondary">
              Already have an account?{" "}
              <Link href="/auth/login" className="text-primary font-semibold hover:underline">
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
              Sign up today to explore and master our ESSCI-accredited electronics catalog.
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
                Account & Biometrics Created Successfully!
              </h3>
              <p className="text-sm text-text-secondary max-w-md mx-auto">
                Welcome to ESSCI Skilling India in Electronics! Your account has been provisioned and your face biometric profile has been verified. Redirecting to your learning workspace...
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
                    placeholder="e.g. Rahul"
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
                    placeholder="e.g. Sharma"
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
                  placeholder="rahul.sharma@example.in"
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
                  Company / College / Organization <span className="font-normal text-text-tertiary">(Optional)</span>
                </Label>
                <Input
                  id="org"
                  placeholder="ESSCI or Independent"
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  disabled={isLoading}
                />
              </div>

              {/* Biometric Face Recognition Option & Live Camera Capture Panel */}
              <div
                className={`p-4 rounded-xl transition-all duration-200 ${enableFaceAuth
                  ? "border-2 border-primary/30 bg-primary/5 space-y-4"
                  : "border border-surface-border bg-surface-raised/40 space-y-2"
                  }`}
              >
                <div className="flex items-start gap-2.5">
                  <Checkbox
                    id="enableFaceAuth"
                    checked={enableFaceAuth}
                    onCheckedChange={(checked) => {
                      const enabled = Boolean(checked);
                      setEnableFaceAuth(enabled);
                      if (!enabled) {
                        setCapturedFacePhoto(null);
                        stopCamera();
                      }
                    }}
                    className="mt-0.5"
                  />
                  <div className="space-y-0.5">
                    <label
                      htmlFor="enableFaceAuth"
                      className="text-xs font-bold text-text-primary cursor-pointer flex items-center gap-1.5 select-none"
                    >
                      <ScanFace className="w-4 h-4 text-primary" />
                      Register Biometric Face Recognition (Optional)
                    </label>
                    <p className="text-[11px] text-text-tertiary leading-snug">
                      Enables camera-based 1-click login and fulfills ESSCI compliance for accredited certification courses.
                    </p>
                  </div>
                </div>

                {/* Inline Camera Viewfinder & Face Capture Box */}
                {enableFaceAuth && (
                  <div className="pt-2 border-t border-primary/20 space-y-3">
                    {capturedFacePhoto ? (
                      /* Captured Photo Preview */
                      <div className="flex items-center gap-4 p-3 rounded-xl bg-white dark:bg-slate-900 border border-emerald-500/40 shadow-xs">
                        <div className="relative shrink-0">
                          <img
                            src={capturedFacePhoto}
                            alt="Captured Biometric Photo"
                            className="w-16 h-16 rounded-full object-cover border-2 border-emerald-500 shadow-md ring-4 ring-emerald-500/20"
                          />
                          <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-xs">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                              ✓ Enrolled Biometric Profile
                            </Badge>
                          </div>
                          <p className="text-xs font-semibold text-text-primary mt-1">
                            Face Photo Captured & Ready to Save
                          </p>
                          <p className="text-[11px] text-text-tertiary">
                            This biometric profile will verify your identity during login and exams.
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleRetake}
                          className="text-xs gap-1.5 shrink-0 border-border hover:bg-surface-raised cursor-pointer"
                        >
                          <RefreshCw className="w-3.5 h-3.5 text-text-secondary" />
                          <span>Retake</span>
                        </Button>
                      </div>
                    ) : (
                      /* Live Camera Feed & Capture Trigger */
                      <div className="space-y-3">
                        <div className="relative w-full aspect-4/3 max-w-[320px] mx-auto rounded-2xl overflow-hidden bg-slate-950 border-2 border-primary/50 shadow-xl flex items-center justify-center">
                          {/* Layer 0: Fallback Background UI */}
                          <div className="absolute inset-0 z-0 flex flex-col items-center justify-center p-4 bg-linear-to-b from-slate-900 via-slate-950 to-slate-900 text-slate-300 text-center">
                            <ScanFace className="w-12 h-12 text-primary animate-pulse mb-2" />
                            <span className="text-xs font-semibold text-slate-200">
                              Ready to activate camera
                            </span>
                            <span className="text-[11px] text-slate-400 mt-0.5 max-w-[200px]">
                              {cameraError || "Look straight at the device camera"}
                            </span>
                            {!isCameraActive && (
                              <Button
                                type="button"
                                size="sm"
                                onClick={startCamera}
                                className="mt-3 bg-primary text-primary-foreground text-xs font-semibold h-8 gap-1.5 cursor-pointer"
                              >
                                <Camera className="w-3.5 h-3.5" />
                                <span>Turn On Camera</span>
                              </Button>
                            )}
                          </div>

                          {/* Layer 10: Live Video Feed (Always above Layer 0) */}
                          <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted
                            className="absolute inset-0 z-10 w-full h-full object-cover scale-x-[-1] block"
                          />

                          {/* Layer 20: Target Bounding Frame & Laser Bar (Over Video) */}
                          {isCameraActive && (
                            <div className="absolute inset-0 z-20 pointer-events-none flex items-center justify-center">
                              <div className="relative w-44 h-56 rounded-[50%] border-2 border-dashed border-cyan-400/90 shadow-[0_0_15px_rgba(0,229,255,0.35)] flex items-center justify-center overflow-hidden">
                                {/* Laser Scan line */}
                                <div className="absolute left-0 right-0 h-1 bg-linear-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_#00e5ff] animate-laser-scan" />
                              </div>
                              {/* 4 Corner Targeting Brackets */}
                              <div className="absolute w-52 h-64 pointer-events-none">
                                <div className="absolute -top-1 -left-1 w-5 h-5 border-t-2 border-l-2 border-cyan-400" />
                                <div className="absolute -top-1 -right-1 w-5 h-5 border-t-2 border-r-2 border-cyan-400" />
                                <div className="absolute -bottom-1 -left-1 w-5 h-5 border-b-2 border-l-2 border-cyan-400" />
                                <div className="absolute -bottom-1 -right-1 w-5 h-5 border-b-2 border-r-2 border-cyan-400" />
                              </div>
                            </div>
                          )}

                          {/* Layer 30: HUD Overlay Badge */}
                          {isCameraActive && (
                            <div className="absolute top-2.5 left-2.5 right-2.5 z-30 flex items-center justify-between text-[10px] font-mono text-white/95 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 shadow-md">
                              <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                                OPTICAL SENSOR
                              </span>
                              <span className="text-cyan-400 font-bold">READY TO CAPTURE</span>
                            </div>
                          )}
                        </div>

                        {/* Capture Controls */}
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-1">
                          <Button
                            type="button"
                            onClick={handleCapturePhoto}
                            disabled={!isCameraActive}
                            className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-10 px-6 gap-2 shadow-md cursor-pointer disabled:opacity-50"
                          >
                            <Camera className="w-4 h-4" />
                            <span>Capture Face Photo</span>
                          </Button>

                          <Button
                            type="button"
                            variant="outline"
                            onClick={handleSimulatedCapture}
                            className="w-full sm:w-auto text-xs text-primary border-dashed border-primary/40 hover:bg-primary/5 h-10 gap-1.5 cursor-pointer"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Demo AI Face Capture</span>
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
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
                  I agree to the ESSCI Terms of Service and Privacy Policy.
                </span>
              </label>

              {/* Submit CTA */}
              <Button
                type="submit"
                size="lg"
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 py-3 text-sm font-semibold shadow-md cursor-pointer"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Setting up your account & saving biometrics...
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
          ESSCI Skilling India in Electronics • Empowering Electronics Workforce Across India
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
