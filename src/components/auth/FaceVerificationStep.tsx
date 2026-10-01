"use client";

import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ShieldCheck,
  CheckCircle2,
  ScanFace,
  Sparkles,
  RefreshCw,
} from "lucide-react";
import type { MockUser } from "@/lib/mock/users";
import { startCameraStream, stopAllCameraStreams, attachStreamToVideo } from "@/lib/camera";

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
  const [scanStatus, setScanStatus] = useState<ScanStatus>("requesting");
  const [cameraPermissionGranted, setCameraPermissionGranted] = useState<boolean | null>(null);
  const [statusMessage, setStatusMessage] = useState("Activating device camera sensor...");
  const [matchPercentage, setMatchPercentage] = useState(0);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const scanTimerRef = useRef<NodeJS.Timeout[]>([]);

  // Safely stop all camera tracks and clear pending timers
  const teardownCamera = () => {
    scanTimerRef.current.forEach(clearTimeout);
    scanTimerRef.current = [];
    stopAllCameraStreams(videoRef.current);
  };

  useEffect(() => {
    let isCancelled = false;

    const initCamera = async () => {
      setScanStatus("requesting");
      setStatusMessage("Opening device camera...");

      const res = await startCameraStream(videoRef.current, {
        facingMode: "user",
        width: 640,
        height: 480,
      });

      if (isCancelled) {
        teardownCamera();
        return;
      }

      if (res.success && res.stream) {
        setCameraPermissionGranted(true);
        if (videoRef.current) {
          attachStreamToVideo(videoRef.current, res.stream);
        }
      } else {
        setCameraPermissionGranted(false);
      }

      runVerificationPipeline();
    };

    initCamera();

    const handleBeforeUnload = () => {
      teardownCamera();
    };
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      isCancelled = true;
      window.removeEventListener("beforeunload", handleBeforeUnload);
      teardownCamera();
    };
  }, []);

  const runVerificationPipeline = () => {
    // Stage 1: Aligning (0.5s)
    const t1 = setTimeout(() => {
      setScanStatus("aligning");
      setStatusMessage("Face detected. Aligning facial geometry inside frame...");
      setMatchPercentage(48);
    }, 500);

    // Stage 2: Analyzing geometry & liveness (1.6s)
    const t2 = setTimeout(() => {
      setScanStatus("analyzing");
      setStatusMessage("Scanning biometric landmarks & liveness...");
      setMatchPercentage(88);
    }, 1600);

    // Stage 3: Match verification (3.0s)
    const t3 = setTimeout(() => {
      setMatchPercentage(99.6);
      setScanStatus("verified");
      setStatusMessage(`Identity Confirmed: ${user.name} (ESSCI Verified)`);

      // Stage 4: Clean up camera hardware first, then trigger success callback
      const t4 = setTimeout(() => {
        teardownCamera();
        onSuccess();
      }, 800);
      scanTimerRef.current.push(t4);
    }, 3000);

    scanTimerRef.current.push(t1, t2, t3);
  };

  const handleCancel = () => {
    teardownCamera();
    onCancel();
  };

  const handleFastTrack = () => {
    teardownCamera();
    setMatchPercentage(100);
    setScanStatus("verified");
    setStatusMessage(`Identity Confirmed: ${user.name}`);
    setTimeout(() => {
      onSuccess();
    }, 250);
  };

  return (
    <Card className="border-surface-border shadow-card overflow-hidden">
      <CardHeader className="text-center pb-3">
        <div className="mx-auto w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-2 shadow-xs border border-primary/20">
          <ScanFace className="w-6 h-6 animate-pulse" />
        </div>
        <div className="flex items-center justify-center gap-1.5 mb-1">
          <Badge variant="outline" className="text-[10px] uppercase tracking-wider font-bold border-primary/30 text-primary bg-primary/5">
            ESSCI Facial Recognition
          </Badge>
        </div>
        <CardTitle className="text-xl sm:text-2xl font-bold text-text-primary">
          Biometric Face Scan
        </CardTitle>
        <CardDescription className="text-xs sm:text-sm text-text-secondary">
          Please keep your face centered within the oval frame.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4 pt-1">
        {/* Learner ID Badge - Clean text & icon, NO stored photo */}
        <div className="p-3 rounded-xl bg-surface-sunken border border-surface-border/80 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shrink-0 border border-primary/20">
              {user.name.slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-semibold text-text-tertiary uppercase tracking-wider block">
                Learner Verification
              </span>
              <span className="text-sm font-bold text-text-primary block truncate">
                {user.name}
              </span>
              <span className="text-xs text-text-secondary block truncate">
                {user.identifier} • {user.department || "Electronics"}
              </span>
            </div>
          </div>
          <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20">
            <ShieldCheck className="w-4 h-4" />
          </div>
        </div>

        {/* Viewfinder / Live Camera Box with Perfectly Centered Biometric Frame */}
        <div className="relative w-full aspect-4/3 max-w-[360px] mx-auto rounded-2xl overflow-hidden bg-slate-950 border-2 border-primary/50 shadow-2xl flex items-center justify-center">
          {/* Layer 0: Standby Background Wireframe (Co-located with oval reticle) */}
          <div className="absolute inset-0 z-0 flex flex-col items-center justify-center bg-linear-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-300">
            {/* Realistic Biometric Human Face Outline strictly within the oval */}
            <div className="w-44 h-56 flex items-center justify-center relative">
              <svg
                viewBox="0 0 200 260"
                className="w-40 h-52 text-cyan-400 drop-shadow-[0_0_10px_#00e5ff]"
                fill="none"
                stroke="currentColor"
              >
                {/* Head / Jawline Contour */}
                <path
                  d="M 40,85 C 40,25 160,25 160,85 C 160,150 145,215 100,235 C 55,215 40,150 40,85 Z"
                  strokeWidth="2.5"
                  strokeDasharray="6 4"
                  className="opacity-80"
                />
                {/* Eyes */}
                <circle cx="75" cy="95" r="9" strokeWidth="2" />
                <circle cx="125" cy="95" r="9" strokeWidth="2" />
                <circle cx="75" cy="95" r="3.5" fill="#00e5ff" className="animate-pulse" />
                <circle cx="125" cy="95" r="3.5" fill="#00e5ff" className="animate-pulse" />
                {/* Eyebrows */}
                <path d="M 62,82 Q 75,76 88,82" strokeWidth="2" strokeLinecap="round" />
                <path d="M 112,82 Q 125,76 138,82" strokeWidth="2" strokeLinecap="round" />
                {/* Nose Bridge and Tip */}
                <path d="M 100,92 L 96,132 L 106,132" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                {/* Lips */}
                <path d="M 80,165 Q 100,178 120,165" strokeWidth="2" strokeLinecap="round" />
                <path d="M 86,168 Q 100,172 114,168" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
                {/* Biometric Landmark Target Points */}
                <circle cx="100" cy="50" r="3" fill="#00e5ff" />
                <circle cx="50" cy="120" r="3" fill="#00e5ff" />
                <circle cx="150" cy="120" r="3" fill="#00e5ff" />
                <circle cx="100" cy="205" r="3" fill="#1ea838" />
                {/* Cheek Nodes with Pulse */}
                <circle cx="62" cy="135" r="3" fill="#00e5ff" className="animate-ping" />
                <circle cx="138" cy="135" r="3" fill="#00e5ff" className="animate-ping" />
              </svg>
            </div>
            <span className="text-[10px] font-mono text-cyan-300 uppercase tracking-widest font-bold -mt-2">
              {cameraPermissionGranted ? "OPTICAL SENSOR ACTIVE" : "BIOMETRIC SENSOR READY"}
            </span>
          </div>

          {/* Layer 10: Actual Live Video Feed (Rendered on top of Layer 0) */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={`absolute inset-0 z-10 w-full h-full object-cover scale-x-[-1] transition-opacity duration-300 ${
              cameraPermissionGranted ? "opacity-100 block" : "opacity-0 pointer-events-none"
            }`}
          />

          {/* Layer 20: Unified Face Oval Target Reticle & Laser Beam (Centered over face) */}
          <div className="absolute inset-0 z-20 pointer-events-none flex items-center justify-center">
            {/* The Generously Proportioned Face Oval Box (Fits human face naturally) */}
            <div
              className={`relative w-44 h-56 rounded-[50%] transition-colors duration-300 flex items-center justify-center overflow-hidden ${
                scanStatus === "verified"
                  ? "border-2 border-emerald-400 shadow-[0_0_20px_rgba(30,168,56,0.6)]"
                  : "border-2 border-dashed border-cyan-400/90 shadow-[0_0_15px_rgba(0,229,255,0.35)]"
              }`}
            >
              {/* Laser Scanning Line sweeps within the face oval */}
              {scanStatus !== "verified" && (
                <div className="absolute left-0 right-0 h-1 bg-linear-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_#00e5ff] animate-laser-scan" />
              )}
            </div>

            {/* 4 Precision Corner Targeting Brackets aligned around the oval */}
            <div className="absolute w-52 h-64 pointer-events-none">
              <div className="absolute -top-1 -left-1 w-5 h-5 border-t-2 border-l-2 border-cyan-400" />
              <div className="absolute -top-1 -right-1 w-5 h-5 border-t-2 border-r-2 border-cyan-400" />
              <div className="absolute -bottom-1 -left-1 w-5 h-5 border-b-2 border-l-2 border-cyan-400" />
              <div className="absolute -bottom-1 -right-1 w-5 h-5 border-b-2 border-r-2 border-cyan-400" />
            </div>
          </div>

          {/* Layer 30: Live HUD Badges */}
          <div className="absolute top-2.5 left-2.5 right-2.5 z-30 flex items-center justify-between text-[10px] font-mono text-white/95 bg-black/75 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 shadow-md">
            <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              OPTICAL SENSOR • 30 FPS
            </span>
            <span className="text-cyan-400 font-bold">
              {scanStatus === "verified" ? "CONFIRMED" : `MATCH: ${matchPercentage}%`}
            </span>
          </div>

          {/* Layer 40: Center Verified Overlay (Triggers only when confirmed) */}
          {scanStatus === "verified" && (
            <div className="absolute inset-0 z-40 bg-emerald-950/90 backdrop-blur-xs flex flex-col items-center justify-center text-white animate-in fade-in zoom-in-95 duration-200">
              <div className="w-14 h-14 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/50 mb-2">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <span className="text-base font-bold tracking-tight">Identity Confirmed</span>
              <span className="text-xs text-emerald-200 mt-0.5">Match: {matchPercentage}%</span>
            </div>
          )}
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
              : "Keep your face centered within the oval frame."}
          </p>
        </div>

        {/* Actions & Fast-Track Button */}
        <div className="flex items-center justify-between pt-2 border-t border-surface-border">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleCancel}
            className="text-xs text-text-secondary hover:text-text-primary h-8 px-2 cursor-pointer"
          >
            Cancel / Return to Login
          </Button>

          {scanStatus !== "verified" && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleFastTrack}
              className="text-xs font-medium h-8 px-2.5 gap-1.5 border-dashed border-primary/40 text-primary hover:bg-primary/5 cursor-pointer"
            >
              <Sparkles className="w-3 h-3" />
              <span>Fast-Track Scan (Demo)</span>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
