"use client";

import React from "react";
import {
  CertificateTemplate,
  IssuedCertificate,
  formatCertificateBody,
} from "@/lib/store/certificates-store";
import { Award, ShieldCheck, CheckCircle2, QrCode } from "lucide-react";

interface CertificateViewProps {
  template?: CertificateTemplate;
  certificate?: IssuedCertificate;
  previewData?: {
    learnerName?: string;
    courseTitle?: string;
    completionDate?: string;
    orgName?: string;
    certificateId?: string;
  };
  className?: string;
}

export function CertificateView({
  template: propTemplate,
  certificate,
  previewData,
  className = "",
}: CertificateViewProps) {
  // Use frozen snapshot if an issued certificate is passed, else use the provided template
  const template = certificate?.templateSnapshot || propTemplate;

  if (!template) {
    return (
      <div className="flex items-center justify-center p-12 bg-surface-sunken text-text-tertiary rounded-xl border border-surface-border">
        No certificate template selected.
      </div>
    );
  }

  const learnerName =
    certificate?.learnerName || previewData?.learnerName || "Alex Rivera";
  const courseTitle =
    certificate?.courseTitle ||
    previewData?.courseTitle ||
    "Full-Stack Web Development Bootcamp";
  const completionDate =
    certificate?.completionDate ||
    previewData?.completionDate ||
    new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  const orgName = certificate?.org || previewData?.orgName || "ESSCI Academy";
  const certificateId =
    certificate?.certificateId ||
    previewData?.certificateId ||
    "CERT-2026-SAMPLE";

  const bodyContent = formatCertificateBody(template.bodyTemplate, {
    learnerName,
    courseTitle,
    completionDate,
    orgName,
  });

  const accent = template.accentColor || "#6366f1";

  return (
    <div
      className={`relative w-full max-w-4xl mx-auto aspect-[1.414/1] bg-white text-slate-900 shadow-2xl rounded-2xl overflow-hidden print:shadow-none print:m-0 print:w-full select-none ${className}`}
      style={{
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
      }}
    >
      {/* ──────────────── STYLE 1: CLASSIC GOLD RIBBON ──────────────── */}
      {template.style === "classic" && (
        <div className="absolute inset-0 p-8 sm:p-12 flex flex-col justify-between bg-[#fcfbf9] border-[12px] border-[#f4eedb]">
          {/* Inner Ornate Border */}
          <div className="absolute inset-3 border-2 border-[#d4af37]/60 pointer-events-none" />
          <div className="absolute inset-4 border border-[#d4af37]/30 pointer-events-none" />

          {/* Corner Rosettes */}
          <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-[#d4af37]" />
          <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-[#d4af37]" />
          <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-[#d4af37]" />
          <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-[#d4af37]" />

          {/* Top Header */}
          <div className="text-center relative z-10 space-y-1">
            <div className="flex items-center justify-center gap-2 mb-2">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center shadow-md"
                style={{ backgroundColor: accent, color: "#fff" }}
              >
                <Award className="w-6 h-6" />
              </div>
            </div>
            <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-slate-500 font-sans">
              {orgName}
            </p>
            <h1
              className="text-2xl sm:text-4xl font-serif font-extrabold tracking-wide"
              style={{ color: accent }}
            >
              {template.headline}
            </h1>
            <p className="text-xs sm:text-sm italic text-slate-600 font-serif pt-1">
              {template.subheadline}
            </p>
          </div>

          {/* Center Learner Name & Course Details */}
          <div className="text-center my-auto py-2 relative z-10 space-y-3">
            <div className="inline-block relative">
              <h2 className="text-2xl sm:text-4xl font-serif font-bold text-slate-950 px-6 pb-1">
                {learnerName}
              </h2>
              <div
                className="h-0.5 w-full mx-auto"
                style={{
                  background: `linear-gradient(90deg, transparent, ${accent}, transparent)`,
                }}
              />
            </div>

            <p className="text-xs sm:text-sm text-slate-700 max-w-xl mx-auto leading-relaxed font-serif">
              {bodyContent}
            </p>
          </div>

          {/* Bottom Signatures & Seal */}
          <div className="flex items-end justify-between pt-4 border-t border-slate-200/80 relative z-10 text-xs">
            {/* Signature Block */}
            <div className="text-center min-w-36 sm:min-w-44">
              <p
                className="font-serif italic text-base sm:text-lg font-bold text-slate-800"
                style={{ fontFamily: "'Brush Script MT', cursive, serif" }}
              >
                {template.signatureName}
              </p>
              <div className="h-px bg-slate-400 my-1 w-full" />
              <p className="font-semibold text-slate-800 text-[11px]">
                {template.signatureName}
              </p>
              <p className="text-[10px] text-slate-500">{template.signatureTitle}</p>
            </div>

            {/* Seal & Badge */}
            <div className="flex flex-col items-center justify-center text-center">
              <div
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border-4 border-double border-white shadow-lg flex flex-col items-center justify-center text-white"
                style={{ backgroundColor: accent }}
              >
                <ShieldCheck className="w-6 h-6 sm:w-7 sm:h-7" />
                <span className="text-[7px] font-black uppercase tracking-tighter">
                  VERIFIED
                </span>
              </div>
              <span className="text-[9px] font-mono text-slate-500 mt-1 font-bold">
                {certificateId}
              </span>
            </div>

            {/* Date & Verification */}
            <div className="text-center min-w-36 sm:min-w-44">
              <p className="font-serif font-bold text-slate-800 text-sm sm:text-base">
                {completionDate}
              </p>
              <div className="h-px bg-slate-400 my-1 w-full" />
              <p className="font-semibold text-slate-800 text-[11px]">Date Awarded</p>
              <p className="text-[10px] text-slate-500">Official Authenticity Stamp</p>
            </div>
          </div>
        </div>
      )}

      {/* ──────────────── STYLE 2: MODERN TECH INDIGO ──────────────── */}
      {template.style === "modern" && (
        <div className="absolute inset-0 p-8 sm:p-12 flex flex-col justify-between bg-slate-950 text-white overflow-hidden">
          {/* Ambient Lighting Gradients */}
          <div
            className="absolute -top-24 -left-24 w-80 h-80 rounded-full blur-3xl opacity-30"
            style={{ backgroundColor: accent }}
          />
          <div
            className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full blur-3xl opacity-25"
            style={{ backgroundColor: accent }}
          />
          <div className="absolute inset-4 border border-white/10 rounded-xl pointer-events-none" />

          {/* Top Brand & ID Header */}
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-white shadow-md shadow-indigo-500/30"
                style={{ backgroundColor: accent }}
              >
                <Award className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-slate-400 block">
                  {orgName}
                </span>
                <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1 font-bold">
                  <CheckCircle2 className="w-3 h-3" /> Accredited Verification
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] uppercase font-mono tracking-widest text-slate-400 block">
                Certificate ID
              </span>
              <span className="text-xs font-mono font-bold text-white">
                {certificateId}
              </span>
            </div>
          </div>

          {/* Center Main Content */}
          <div className="my-auto py-2 relative z-10 space-y-2">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">
              {template.subheadline}
            </p>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white capitalize">
              {learnerName}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
              {bodyContent}
            </p>
          </div>

          {/* Bottom Footer Section */}
          <div className="flex items-end justify-between pt-4 border-t border-white/10 relative z-10 text-xs">
            {/* Signature */}
            <div>
              <p
                className="font-serif italic text-base sm:text-lg font-bold text-white"
                style={{ fontFamily: "'Brush Script MT', cursive, serif" }}
              >
                {template.signatureName}
              </p>
              <div className="h-0.5 bg-white/30 my-1 w-36" />
              <p className="font-bold text-white text-[11px]">
                {template.signatureName}
              </p>
              <p className="text-[10px] text-slate-400">{template.signatureTitle}</p>
            </div>

            {/* Verification Code Box */}
            <div className="flex items-center gap-2.5 bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg backdrop-blur-xs">
              <QrCode className="w-7 h-7 text-white/80" />
              <div className="text-[9px] leading-tight text-slate-400">
                <span className="font-bold text-white block">Digital ID Verified</span>
                <span>Scan or verify online</span>
              </div>
            </div>

            {/* Issued Date */}
            <div className="text-right">
              <p className="font-mono font-bold text-white text-xs">{completionDate}</p>
              <p className="text-[10px] text-slate-400">Date of Completion</p>
            </div>
          </div>
        </div>
      )}

      {/* ──────────────── STYLE 3: MINIMALIST EXECUTIVE ──────────────── */}
      {template.style === "minimal" && (
        <div className="absolute inset-0 p-8 sm:p-14 flex flex-col justify-between bg-[#ffffff] text-slate-900 border border-slate-200">
          {/* Top Header */}
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-black uppercase tracking-widest text-slate-400 block mb-1">
                {orgName}
              </span>
              <h1 className="text-xl sm:text-3xl font-black tracking-tight text-slate-950 uppercase">
                {template.headline}
              </h1>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">
                Issued / Validated
              </span>
              <span className="text-xs font-mono font-semibold text-slate-800">
                {completionDate}
              </span>
            </div>
          </div>

          {/* Center Details */}
          <div className="my-auto py-4 space-y-3">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
              {template.subheadline}
            </p>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-950 tracking-tight">
              {learnerName}
            </h2>
            <div className="w-16 h-1 bg-slate-950 my-2" />
            <p className="text-xs sm:text-sm text-slate-700 max-w-xl leading-relaxed">
              {bodyContent}
            </p>
          </div>

          {/* Bottom Bar */}
          <div className="flex items-end justify-between pt-6 border-t-2 border-slate-950 text-xs">
            <div>
              <p className="font-semibold text-slate-900 text-xs sm:text-sm">
                {template.signatureName}
              </p>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider font-medium">
                {template.signatureTitle}
              </p>
            </div>

            <div className="text-right">
              <p className="text-[10px] font-mono uppercase tracking-widest text-slate-400">
                Authentication Code
              </p>
              <p className="text-xs font-mono font-bold text-slate-900">
                {certificateId}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
