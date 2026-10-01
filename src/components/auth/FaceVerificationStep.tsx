"use client";

import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Camera,
  CameraOff,
  ShieldCheck,
  CheckCircle2,
  ScanFace,
  Sparkles,
  ArrowRight,
  RefreshCw,
  AlertCircle,
  Eye,
  Lock,
} from "lucide-react";
import type { MockUser } from "@/lib/mock/users";

interface FaceVerificationStepProps {
  user: MockUser;
  onSuccess: () => void;
  onCancel: () => void;
}

type ScanStatus = "idle" | "requesting" | "aligning" | "analyzing" | "verified" | "error";

export function FaceVerificationStep({
  user,
  onSuccess,
  onCancel,
}: FaceVerificationStepProps) {
  const [subStep, setSubStep] = useState<"consent" | "scanning">("consent");
  const [consentGiven, setConsentGiven] = useState(false);
  const [scanStatus, setScanStatus] = useState<ScanStatus>("idle");
  const [cameraPermissionGranted, setCameraPermissionGranted] = useState<boolean | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [statusMessage, setStatusMessage] = useState("Initializing facial recognition system...");
  const [matchPercentage, setMatchPercentage] = useState(0);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const scanTimerRef = useRef<NodeJS.Timeout[]>([]);

  // Stop camera tracks cleanly
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  useEffect(() => {
    return () => {
      stopCamera();
      scanTimerRef.current.forEach(clearTimeout);
    };
  }, [stream]);

  const handleStartScan = async () => {
    if (!consentGiven) return;
    setSubStep("scanning");
    setScanStatus("requesting");
    setStatusMessage("Requesting device camera access...");

    try {
      if (typeof navigator !== "undefined" && navigator.mediaDevices?.getUserMedia) {
        const userStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
          audio: false,
        });
        setStream(userStream);
        setCameraPermissionGranted(true);
        if (videoRef.current) {
          videoRef.current.srcObject = userStream;
          videoRef.current.play().catch(() => {});
        }
      } else {
        // Fallback simulation mode
        setCameraPermissionGranted(false);
      }
    } catch {
      // Permission denied or camera unavailable -> graceful AI simulation fallback
      setCameraPermissionGranted(false);
    }

    // Run facial biometric verification simulation pipeline
    runVerificationPipeline();
  };

  const runVerificationPipeline = () => {
    // Stage 1: Aligning (0.6s)
    const t1 = setTimeout(() => {
      setScanStatus("aligning");
      setStatusMessage("Face detected. Hold still and center your face...");
      setMatchPercentage(42);
    }, 600);

    // Stage 2: Analyzing geometry & liveness (1.8s)
    const t2 = setTimeout(() => {
      setScanStatus("analyzing");
      setStatusMessage("Analyzing facial landmark coordinates & liveness...");
      setMatchPercentage(86);
    }, 1800);

    // Stage 3: Match verification (3.2s)
    const t3 = setTimeout(() => {
      setMatchPercentage(99.4);
      setScanStatus("verified");
      setStatusMessage(`Identity Verified: ${user.name} (ESSCI Learner ID #2026)`);

      // Stage 4: Trigger success callback (after showing success checkmark)
      const t4 = setTimeout(() => {
        stopCamera();
        onSuccess();
      }, 1200);
      scanTimerRef.current.push(t4);
    }, 3200);

    scanTimerRef.current.push(t1, t2, t3);
  };

  const handleFastTrack = () => {
    scanTimerRef.current.forEach(clearTimeout);
    setMatchPercentage(100);
    setScanStatus("verified");
    setStatusMessage(`Identity Verified: ${user.name}`);
    setTimeout(() => {
      stopCamera();
      onSuccess();
    }, 400);
  };

  return (
    <Card className="border-surface-border shadow-card overflow-hidden">
      <CardHeader className="text-center pb-3">
        <div className="mx-auto w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-2 shadow-xs border border-primary/20">
          <ScanFace className="w-6 h-6 animate-pulse" />
        </div>
        <div className="flex items-center justify-center gap-1.5 mb-1">
          <Badge variant="outline" className="text-[10px] uppercase tracking-wider font-bold border-primary/30 text-primary bg-primary/5">
            ESSCI Proctored Authentication
          </Badge>
        </div>
        <CardTitle className="text-xl sm:text-2xl font-bold text-text-primary">
          {subStep === "consent" ? "Learner Biometric Verification" : "Facial Recognition Scan"}
        </CardTitle>
        <CardDescription className="text-xs sm:text-sm text-text-secondary">
          {subStep === "consent"
            ? "Government & ESSCI compliance mandate biometric verification for certified courses."
            : "Please look straight at the camera while we verify your identity."}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-5 pt-1">
        {/* SUBSTEP 1: CONSENT SCREEN */}
        {subStep === "consent" && (
          <div className="space-y-4">
            {/* Learner ID Badge */}
            <div className="p-3 rounded-xl bg-surface-sunken border border-surface-border/80 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <span className="text-[11px] font-semibold text-text-tertiary uppercase tracking-wider block">
                  Enrolled Learner
                </span>
                <span className="text-sm font-bold text-text-primary block truncate">
                  {user.name}
                </span>
                <span className="text-xs text-text-secondary block truncate">
                  {user.identifier} • {user.department || "Electronics"}
                </span>
              </div>
              <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20">
                <ShieldCheck className="w-4 h-4" />
              </div>
            </div>

            {/* Compliance & Camera Purpose Card */}
            <div className="p-3.5 rounded-xl border border-primary/20 bg-primary/5 space-y-2.5 text-xs text-text-secondary">
              <div className="flex items-center gap-2 font-bold text-text-primary">
                <Camera className="w-4 h-4 text-primary shrink-0" />
                <span>Camera Access & Privacy Notice</span>
              </div>
              <p className="leading-relaxed">
                To guarantee academic integrity and prevent impersonation during training assessments, ESSCI utilizes real-time biometric face authentication.
              </p>
              <ul className="space-y-1.5 list-disc list-inside text-text-tertiary text-[11px]">
                <li>Facial scan takes 2–3 seconds to verify liveness.</li>
                <li>Biometric vectors are matched against your learner profile.</li>
                <li>Raw video feed is processed securely on-device and never sold.</li>
              </ul>
            </div>

            {/* Explicit Consent Checkbox */}
            <div className="flex items-start gap-3 p-3 rounded-xl border border-surface-border hover:bg-surface-raised transition-colors">
              <Checkbox
                id="camera-consent"
                checked={consentGiven}
                onCheckedChange={(checked) => setConsentGiven(Boolean(checked))}
                className="mt-0.5"
              />
              <label
                htmlFor="camera-consent"
                className="text-xs text-text-primary font-medium cursor-pointer leading-snug select-none"
              >
                I consent to activating my device camera for facial identity verification and session compliance under ESSCI guidelines.
              </label>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2 pt-1">
              <Button
                type="button"
                onClick={handleStartScan}
                disabled={!consentGiven}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-11 font-semibold gap-2 shadow-md cursor-pointer disabled:opacity-50"
              >
                <Camera className="w-4 h-4" />
                <span>Grant Consent & Start Scan</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={onCancel}
                className="w-full text-xs text-text-secondary hover:text-text-primary"
              >
                Cancel / Return to Login
              </Button>
            </div>
          </div>
        )}

        {/* SUBSTEP 2: SCANNING SCREEN */}
        {subStep === "scanning" && (
          <div className="space-y-4">
            {/* Viewfinder / Camera Box */}
            <div className="relative w-full aspect-4/3 max-w-[340px] mx-auto rounded-2xl overflow-hidden bg-slate-950 border-2 border-primary/40 shadow-inner flex items-center justify-center">
              {/* Actual Video Feed if camera permitted */}
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`absolute inset-0 w-full h-full object-cover scale-x-[-1] ${
                  cameraPermissionGranted ? "opacity-100" : "opacity-0"
                }`}
              />

              {/* Simulation Artwork if no real camera */}
              {!cameraPermissionGranted && (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-4 bg-linear-to-b from-slate-900 via-slate-950 to-slate-900 text-slate-400">
                  <div className="w-24 h-24 rounded-full border-2 border-dashed border-primary/60 flex items-center justify-center relative mb-2">
                    <ScanFace className="w-12 h-12 text-primary/80 animate-pulse" />
                    <div className="absolute -inset-1 rounded-full border border-primary/30 animate-spin" />
                  </div>
                  <span className="text-[11px] font-mono text-primary uppercase tracking-widest">
                    Simulated AI Optical Sensor
                  </span>
                  <span className="text-[10px] text-slate-500 mt-1">
                    Live Biometric Telemetry Active
                  </span>
                </div>
              )}

              {/* Target Bounding Frame & Corner Brackets */}
              <div className="absolute inset-6 border border-white/20 rounded-xl pointer-events-none">
                {/* 4 Corner Accents */}
                <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-primary" />
                <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-primary" />
                <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-primary" />
                <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-primary" />

                {/* Animated Vertical Laser Scanning Bar */}
                {scanStatus !== "verified" && (
                  <div className="absolute left-0 right-0 h-0.5 bg-linear-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_12px_#00e5ff] animate-[scan_2s_ease-in-out_infinite]" />
                )}
              </div>

              {/* Center Verified Overlay */}
              {scanStatus === "verified" && (
                <div className="absolute inset-0 bg-emerald-950/80 backdrop-blur-xs flex flex-col items-center justify-center text-white animate-in fade-in zoom-in-95 duration-200">
                  <div className="w-14 h-14 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/40 mb-2">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <span className="text-base font-bold tracking-tight">Identity Confirmed</span>
                  <span className="text-xs text-emerald-200 mt-0.5">Match: {matchPercentage}%</span>
                </div>
              )}

              {/* Live HUD Badges */}
              <div className="absolute top-2 left-2 right-2 flex items-center justify-between text-[10px] font-mono text-white/90 bg-black/50 backdrop-blur-md px-2.5 py-1 rounded-md">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                  REC • 30 FPS
                </span>
                <span className="text-cyan-400 font-bold">
                  {scanStatus === "verified" ? "CONFIRMED" : `MATCH: ${matchPercentage}%`}
                </span>
              </div>
            </div>

            {/* Status Message and Diagnostics */}
            <div className="text-center space-y-1">
              <p className="text-xs font-semibold text-text-primary flex items-center justify-center gap-2">
                {scanStatus === "verified" ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                ) : (
                  <RefreshCw className="w-3.5 h-3.5 text-primary animate-spin" />
                )}
                <span>{statusMessage}</span>
              </p>
              <p className="text-[11px] text-text-tertiary">
                {scanStatus === "verified"
                  ? "Access granted. Launching learner workspace..."
                  : "Keep your face well-lit and centered in the frame."}
              </p>
            </div>

            {/* Quick Fast-Track Button for testing/demo */}
            {scanStatus !== "verified" && (
              <div className="flex items-center justify-between pt-1 border-t border-surface-border">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={onCancel}
                  className="text-xs text-text-secondary hover:text-text-primary h-8 px-2"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleFastTrack}
                  className="text-xs font-medium h-8 px-2.5 gap-1.5 border-dashed border-primary/40 text-primary hover:bg-primary/5"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Fast-Track Scan (Demo)</span>
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
