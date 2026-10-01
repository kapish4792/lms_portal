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
  Camera,
  Check,
} from "lucide-react";
import type { MockUser } from "@/lib/mock/users";
import { useUsersStore } from "@/lib/store/users-store";
import { startCameraStream, stopAllCameraStreams, attachStreamToVideo } from "@/lib/camera";

interface FaceVerificationStepProps {
  user: MockUser;
  onSuccess: () => void;
  onCancel: () => void;
}

export function FaceVerificationStep({
  user,
  onSuccess,
  onCancel,
}: FaceVerificationStepProps) {
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [faceImage, setFaceImage] = useState<string | null>(null);
  const [scanStage, setScanStage] = useState<number>(0); // 0: Init, 1: Detect, 2: Mesh, 3: Liveness, 4: Verified
  const [progress, setProgress] = useState<number>(12);
  const [statusMessage, setStatusMessage] = useState("Initializing biometric optical sensor...");

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const scanTimerRef = useRef<NodeJS.Timeout[]>([]);

  // Safely stop all camera tracks and clear pending timers
  const teardownCamera = () => {
    scanTimerRef.current.forEach(clearTimeout);
    scanTimerRef.current = [];
    stopAllCameraStreams(videoRef.current);
    setIsCameraActive(false);
  };

  // 1. Resolve or synthesize the learner's face photo for visible simulation
  useEffect(() => {
    // Check if user has direct facePhoto
    if (user.facePhoto) {
      setFaceImage(user.facePhoto);
      return;
    }

    // Check localStorage cache from signup
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(`essci_face_biometric_${user.identifier.toLowerCase()}`);
      if (stored) {
        setFaceImage(stored);
        return;
      }
    }

    // Check Users directory store
    const dirUser = useUsersStore
      .getState()
      .directory.find((u) => u.email.toLowerCase() === user.identifier.toLowerCase());
    if (dirUser?.facePhoto) {
      setFaceImage(dirUser.facePhoto);
      return;
    }

    // Generate high-contrast biometric simulation canvas face matching signup style
    if (typeof document !== "undefined") {
      const canvas = document.createElement("canvas");
      canvas.width = 400;
      canvas.height = 400;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        // High-contrast biometric gradient backdrop
        const grad = ctx.createLinearGradient(0, 0, 400, 400);
        grad.addColorStop(0, "#01458E");
        grad.addColorStop(0.5, "#0d2b45");
        grad.addColorStop(1, "#081d33");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 400, 400);

        // Biometric scanning reticle ring
        ctx.strokeStyle = "rgba(0, 229, 255, 0.4)";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(200, 160, 95, 0, Math.PI * 2);
        ctx.stroke();

        // Realistic face silhouette head
        ctx.fillStyle = "#e2e8f0";
        ctx.beginPath();
        ctx.arc(200, 160, 68, 0, Math.PI * 2);
        ctx.fill();

        // Eyes
        ctx.fillStyle = "#0f172a";
        ctx.beginPath();
        ctx.arc(174, 150, 6, 0, Math.PI * 2);
        ctx.arc(226, 150, 6, 0, Math.PI * 2);
        ctx.fill();

        // Eyebrows
        ctx.strokeStyle = "#334155";
        ctx.lineWidth = 3;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(164, 138);
        ctx.lineTo(184, 139);
        ctx.moveTo(216, 139);
        ctx.lineTo(236, 138);
        ctx.stroke();

        // Nose
        ctx.strokeStyle = "#94a3b8";
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(200, 148);
        ctx.lineTo(196, 172);
        ctx.lineTo(204, 172);
        ctx.stroke();

        // Friendly smile
        ctx.strokeStyle = "#0f172a";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(200, 182, 20, 0.2 * Math.PI, 0.8 * Math.PI);
        ctx.stroke();

        // Shoulders
        ctx.fillStyle = "#94a3b8";
        ctx.beginPath();
        ctx.arc(200, 370, 130, Math.PI, 0);
        ctx.fill();

        setFaceImage(canvas.toDataURL("image/jpeg", 0.9));
      }
    }
  }, [user]);

  // 2. Camera activation and verification pipeline lifecycle
  const openCamera = async () => {
    setCameraError(null);
    setStatusMessage("Opening device camera...");

    const res = await startCameraStream(videoRef.current, {
      facingMode: "user",
      width: 640,
      height: 480,
    });

    if (res.success && res.stream) {
      setIsCameraActive(true);
      if (videoRef.current) {
        attachStreamToVideo(videoRef.current, res.stream);
      }
    } else {
      setIsCameraActive(false);
      if (res.error !== "Session superseded") {
        setCameraError(res.error || "Device camera unavailable. Using biometric simulation.");
      }
    }
  };

  useEffect(() => {
    let isCancelled = false;

    const init = async () => {
      await openCamera();
      if (!isCancelled) {
        runVerificationPipeline();
      }
    };

    init();

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
    // Stage 1: Face Detection & Alignment (0.6s)
    const t1 = setTimeout(() => {
      setScanStage(1);
      setProgress(35);
      setStatusMessage("Face detected in box. Locking facial alignment...");
    }, 600);

    // Stage 2: 128-Point Landmark Extraction (1.8s)
    const t2 = setTimeout(() => {
      setScanStage(2);
      setProgress(68);
      setStatusMessage("Extracting 128-point biometric facial triangulation mesh...");
    }, 1800);

    // Stage 3: Liveness & Optical Telemetry Check (3.0s)
    const t3 = setTimeout(() => {
      setScanStage(3);
      setProgress(92);
      setStatusMessage("Verifying liveness & anti-spoofing micro-reflections...");
    }, 3000);

    // Stage 4: Match Confirmation (4.2s)
    const t4 = setTimeout(() => {
      setScanStage(4);
      setProgress(100);
      setStatusMessage(`Identity Confirmed: ${user.name} (ESSCI 100% Match)`);

      // Stage 5: Clean up hardware tracks first, then trigger redirect
      const t5 = setTimeout(() => {
        teardownCamera();
        onSuccess();
      }, 900);
      scanTimerRef.current.push(t5);
    }, 4200);

    scanTimerRef.current.push(t1, t2, t3, t4);
  };

  const handleCancel = () => {
    teardownCamera();
    onCancel();
  };

  const handleFastTrack = () => {
    teardownCamera();
    setScanStage(4);
    setProgress(100);
    setStatusMessage(`Identity Confirmed: ${user.name}`);
    setTimeout(() => {
      onSuccess();
    }, 300);
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
          Scanning your facial geometry to securely authorize learner login.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4 pt-1">
        {/* Learner ID Badge */}
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

        {/* Viewfinder / Live Camera Box with High-Tech Biometric Scanning Overlays */}
        <div className="relative w-full aspect-4/3 max-w-[340px] mx-auto rounded-2xl overflow-hidden bg-slate-950 border-2 border-primary/50 shadow-2xl flex items-center justify-center">
          {/* Layer 0: Visible Face Container (Visible during both Simulation and Camera Loading) */}
          <div className="absolute inset-0 z-0 flex items-center justify-center bg-slate-950 overflow-hidden">
            {faceImage ? (
              <img
                src={faceImage}
                alt="Learner Biometric Face"
                className="w-full h-full object-cover scale-105"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-linear-to-b from-slate-900 to-slate-950 text-slate-300">
                <ScanFace className="w-16 h-16 text-cyan-400 animate-pulse" />
              </div>
            )}
          </div>

          {/* Layer 10: Actual Live Video Feed (Always above Layer 0, shows live webcam when permitted) */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={`absolute inset-0 z-10 w-full h-full object-cover scale-x-[-1] transition-opacity duration-300 ${
              isCameraActive ? "opacity-100 block" : "opacity-0 pointer-events-none"
            }`}
          />

          {/* Layer 20: Target Bounding Frame & Laser Bar Directly Over Face */}
          <div className="absolute inset-0 z-20 pointer-events-none flex items-center justify-center">
            {/* The Generously Proportioned Face Oval Box */}
            <div
              className={`relative w-44 h-56 rounded-[50%] transition-colors duration-300 flex items-center justify-center overflow-hidden ${
                scanStage >= 4
                  ? "border-2 border-emerald-400 shadow-[0_0_25px_rgba(30,168,56,0.7)]"
                  : "border-2 border-dashed border-cyan-400/90 shadow-[0_0_18px_rgba(0,229,255,0.4)]"
              }`}
            >
              {/* Dynamic Scanning Triangulation Mesh Nodes (Stage 2+) */}
              {scanStage >= 2 && scanStage < 4 && (
                <svg viewBox="0 0 176 224" className="absolute inset-0 w-full h-full text-cyan-400/70" fill="none">
                  {/* Triangulation Lines across face */}
                  <line x1="88" y1="35" x2="55" y2="85" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" />
                  <line x1="88" y1="35" x2="121" y2="85" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" />
                  <line x1="55" y1="85" x2="88" y2="120" stroke="currentColor" strokeWidth="1" />
                  <line x1="121" y1="85" x2="88" y2="120" stroke="currentColor" strokeWidth="1" />
                  <line x1="55" y1="85" x2="121" y2="85" stroke="currentColor" strokeWidth="1" />
                  <line x1="55" y1="85" x2="40" y2="140" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" />
                  <line x1="121" y1="85" x2="136" y2="140" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" />
                  <line x1="88" y1="120" x2="88" y2="165" stroke="currentColor" strokeWidth="1" />
                  <line x1="40" y1="140" x2="88" y2="165" stroke="currentColor" strokeWidth="1" />
                  <line x1="136" y1="140" x2="88" y2="165" stroke="currentColor" strokeWidth="1" />
                  {/* Glowing Landmark Nodes */}
                  <circle cx="88" cy="35" r="3" fill="#00e5ff" className="animate-ping" />
                  <circle cx="55" cy="85" r="3" fill="#00e5ff" />
                  <circle cx="121" cy="85" r="3" fill="#00e5ff" />
                  <circle cx="88" cy="120" r="3" fill="#1ea838" />
                  <circle cx="40" cy="140" r="3" fill="#00e5ff" />
                  <circle cx="136" cy="140" r="3" fill="#00e5ff" />
                  <circle cx="88" cy="165" r="3" fill="#00e5ff" />
                </svg>
              )}

              {/* Laser Scanning Line sweeps within the face oval directly over the user's face */}
              {scanStage < 4 && (
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

          {/* Layer 30: Live Top HUD Badges */}
          <div className="absolute top-2.5 left-2.5 right-2.5 z-30 flex items-center justify-between text-[10px] font-mono text-white/95 bg-black/75 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 shadow-md">
            <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              STAGE {scanStage}/4 • {isCameraActive ? "LIVE WEBCAM" : "AI OPTICAL SENSOR"}
            </span>
            <span className="text-cyan-400 font-bold">
              {scanStage >= 4 ? "CONFIRMED" : `SCAN: ${progress}%`}
            </span>
          </div>

          {/* Layer 30: Live Bottom Diagnostics HUD */}
          {scanStage > 0 && scanStage < 4 && (
            <div className="absolute bottom-2.5 left-2.5 right-2.5 z-30 flex items-center justify-between text-[9px] font-mono text-white/90 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-md border border-cyan-400/20">
              <span className="text-cyan-300">
                {scanStage === 1 && "SCANNING GEOMETRIC BOUNDS..."}
                {scanStage === 2 && "LANDMARKS: 128/128 MAPPED"}
                {scanStage === 3 && "LIVENESS TELEMETRY: 99.8%"}
              </span>
              <span className="text-emerald-400 font-bold">FPS 30</span>
            </div>
          )}

          {/* Layer 40: Center Verified Overlay (Triggers only when confirmed) */}
          {scanStage >= 4 && (
            <div className="absolute inset-0 z-40 bg-emerald-950/90 backdrop-blur-xs flex flex-col items-center justify-center text-white animate-in fade-in zoom-in-95 duration-200">
              <div className="w-14 h-14 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/50 mb-2">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <span className="text-base font-bold tracking-tight">Identity Confirmed</span>
              <span className="text-xs text-emerald-200 mt-0.5">Biometric Match: 100%</span>
            </div>
          )}
        </div>

        {/* Real-Time Scanning Progress Bar with Status */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-text-primary font-semibold flex items-center gap-1.5 truncate">
              {scanStage >= 4 ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              ) : (
                <RefreshCw className="w-3.5 h-3.5 text-cyan-500 animate-spin shrink-0" />
              )}
              <span className="truncate">{statusMessage}</span>
            </span>
            <span className="font-bold text-cyan-600 dark:text-cyan-400 shrink-0">
              {progress}%
            </span>
          </div>
          <div className="h-2 w-full bg-surface-sunken border border-surface-border rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 rounded-full ${
                scanStage >= 4
                  ? "bg-emerald-500"
                  : "bg-linear-to-r from-primary via-cyan-400 to-emerald-400"
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* 4 Interactive Sequential Scanning Stage Pills */}
        <div className="grid grid-cols-4 gap-1.5 pt-1">
          <div
            className={`p-1.5 rounded-lg border text-[10px] font-semibold flex flex-col items-center gap-1 transition-colors ${
              scanStage >= 1
                ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                : "border-surface-border bg-surface-raised/30 text-text-tertiary"
            }`}
          >
            {scanStage >= 1 ? (
              <Check className="w-3 h-3 text-emerald-500 stroke-[3]" />
            ) : (
              <div className="w-3 h-3 rounded-full border border-current flex items-center justify-center text-[8px]">
                1
              </div>
            )}
            <span className="leading-tight">Detect</span>
          </div>

          <div
            className={`p-1.5 rounded-lg border text-[10px] font-semibold flex flex-col items-center gap-1 transition-colors ${
              scanStage >= 2
                ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                : "border-surface-border bg-surface-raised/30 text-text-tertiary"
            }`}
          >
            {scanStage >= 2 ? (
              <Check className="w-3 h-3 text-emerald-500 stroke-[3]" />
            ) : (
              <div className="w-3 h-3 rounded-full border border-current flex items-center justify-center text-[8px]">
                2
              </div>
            )}
            <span className="leading-tight">Mesh 128D</span>
          </div>

          <div
            className={`p-1.5 rounded-lg border text-[10px] font-semibold flex flex-col items-center gap-1 transition-colors ${
              scanStage >= 3
                ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                : "border-surface-border bg-surface-raised/30 text-text-tertiary"
            }`}
          >
            {scanStage >= 3 ? (
              <Check className="w-3 h-3 text-emerald-500 stroke-[3]" />
            ) : (
              <div className="w-3 h-3 rounded-full border border-current flex items-center justify-center text-[8px]">
                3
              </div>
            )}
            <span className="leading-tight">Liveness</span>
          </div>

          <div
            className={`p-1.5 rounded-lg border text-[10px] font-semibold flex flex-col items-center gap-1 transition-colors ${
              scanStage >= 4
                ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                : "border-surface-border bg-surface-raised/30 text-text-tertiary"
            }`}
          >
            {scanStage >= 4 ? (
              <Check className="w-3 h-3 text-emerald-500 stroke-[3]" />
            ) : (
              <div className="w-3 h-3 rounded-full border border-current flex items-center justify-center text-[8px]">
                4
              </div>
            )}
            <span className="leading-tight">Matched</span>
          </div>
        </div>

        {/* Camera Toggle and Fast-Track Controls */}
        <div className="flex items-center justify-between pt-2 border-t border-surface-border gap-2">
          {!isCameraActive ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={openCamera}
              className="text-xs h-8 px-2.5 gap-1.5 border-primary/30 text-primary hover:bg-primary/5 cursor-pointer"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Turn On Webcam</span>
            </Button>
          ) : (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                teardownCamera();
                runVerificationPipeline();
              }}
              className="text-xs text-text-secondary hover:text-text-primary h-8 px-2 cursor-pointer"
            >
              Use AI Simulation
            </Button>
          )}

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleCancel}
              className="text-xs text-text-secondary hover:text-text-primary h-8 px-2 cursor-pointer"
            >
              Cancel
            </Button>

            {scanStage < 4 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleFastTrack}
                className="text-xs font-medium h-8 px-2.5 gap-1.5 border-dashed border-primary/40 text-primary hover:bg-primary/5 cursor-pointer"
              >
                <Sparkles className="w-3 h-3" />
                <span>Fast-Track</span>
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
