"use client";

import React, { useState } from "react";
import {
  CertificateTemplate,
  useCertificatesStore,
} from "@/lib/store/certificates-store";
import { CertificateView } from "./CertificateView";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Palette,
  Sparkles,
  Save,
  Check,
  RotateCcw,
  Layers,
  FileSignature,
  Eye,
} from "lucide-react";

interface CertificateDesignerProps {
  initialTemplate?: CertificateTemplate;
  org: string;
  onSaved?: (savedTemplate: CertificateTemplate) => void;
  onSelectForIssue?: (template: CertificateTemplate) => void;
}

const PRESET_COLORS = [
  { name: "Gold / Amber", hex: "#d97706" },
  { name: "Royal Indigo", hex: "#6366f1" },
  { name: "Emerald Green", hex: "#059669" },
  { name: "Crimson Red", hex: "#dc2626" },
  { name: "Slate / Charcoal", hex: "#0f172a" },
  { name: "Deep Cyan", hex: "#0891b2" },
];

export function CertificateDesigner({
  initialTemplate,
  org,
  onSaved,
  onSelectForIssue,
}: CertificateDesignerProps) {
  const templates = useCertificatesStore((s) => s.templates);
  const createTemplate = useCertificatesStore((s) => s.createTemplate);
  const updateTemplate = useCertificatesStore((s) => s.updateTemplate);

  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(
    initialTemplate?.id || templates[0]?.id || "tmpl-classic"
  );

  const activeTemplate =
    templates.find((t) => t.id === selectedTemplateId) || templates[0];

  const [name, setName] = useState(activeTemplate?.name || "Custom Certificate Template");
  const [style, setStyle] = useState<"classic" | "modern" | "minimal">(
    activeTemplate?.style || "classic"
  );
  const [headline, setHeadline] = useState(
    activeTemplate?.headline || "Certificate of Achievement"
  );
  const [subheadline, setSubheadline] = useState(
    activeTemplate?.subheadline || "This credential is fundamentally awarded to"
  );
  const [bodyTemplate, setBodyTemplate] = useState(
    activeTemplate?.bodyTemplate ||
      "for exceptional dedication and successful mastery in completing the comprehensive curriculum for {courseTitle} at {orgName}."
  );
  const [signatureName, setSignatureName] = useState(
    activeTemplate?.signatureName || "Dr. Alexander Vance"
  );
  const [signatureTitle, setSignatureTitle] = useState(
    activeTemplate?.signatureTitle || "Dean of Academic Excellence"
  );
  const [accentColor, setAccentColor] = useState(
    activeTemplate?.accentColor || "#d97706"
  );

  const [savedSuccess, setSavedSuccess] = useState(false);

  // Switch template base
  const handleSelectBaseTemplate = (tmpl: CertificateTemplate) => {
    setSelectedTemplateId(tmpl.id);
    setName(`${tmpl.name} (Custom)`);
    setStyle(tmpl.style);
    setHeadline(tmpl.headline);
    setSubheadline(tmpl.subheadline);
    setBodyTemplate(tmpl.bodyTemplate);
    setSignatureName(tmpl.signatureName);
    setSignatureTitle(tmpl.signatureTitle);
    setAccentColor(tmpl.accentColor);
  };

  const currentEditingTemplate: CertificateTemplate = {
    id: selectedTemplateId,
    name,
    style,
    headline,
    subheadline,
    bodyTemplate,
    signatureName,
    signatureTitle,
    accentColor,
    org,
    isCustom: true,
    createdAt: new Date().toISOString(),
  };

  const handleSaveCustom = () => {
    const created = createTemplate({
      name,
      style,
      headline,
      subheadline,
      bodyTemplate,
      signatureName,
      signatureTitle,
      accentColor,
      org,
      isCustom: true,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
    onSaved?.(created);
  };

  const insertPlaceholder = (tag: string) => {
    setBodyTemplate((prev) => `${prev} ${tag}`);
  };

  return (
    <div className="space-y-8">
      {/* 1. Template Presets Selection Bar */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-text-primary flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" /> Select Starting Template
            </h3>
            <p className="text-xs text-text-secondary">
              Pick a baseline style and customize typography, wording, and brand colors.
            </p>
          </div>
          <Badge variant="outline" className="text-xs font-semibold">
            {templates.length} Templates Available
          </Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {templates.map((tmpl) => {
            const isSelected = selectedTemplateId === tmpl.id;
            return (
              <button
                type="button"
                key={tmpl.id}
                onClick={() => handleSelectBaseTemplate(tmpl)}
                className={`text-left p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? "border-primary bg-primary/5 shadow-md ring-2 ring-primary/20"
                    : "border-surface-border bg-surface-base hover:border-brand-300 hover:bg-surface-sunken"
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="font-bold text-sm text-text-primary truncate">
                    {tmpl.name}
                  </span>
                  <Badge
                    variant="secondary"
                    className="text-[10px] uppercase font-bold tracking-wider capitalize"
                  >
                    {tmpl.style}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-xs text-text-secondary">
                  <div
                    className="w-3.5 h-3.5 rounded-full border border-black/10 shrink-0"
                    style={{ backgroundColor: tmpl.accentColor }}
                  />
                  <span className="truncate">{tmpl.headline}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Designer Workspace: Controls (Left) + Live Canvas Preview (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Form Controls */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="border-surface-border bg-surface-base shadow-sm">
            <CardHeader className="pb-3 border-b border-surface-border">
              <CardTitle className="text-sm font-bold flex items-center justify-between">
                <span>Certificate Content & Details</span>
                <span className="text-[11px] text-text-tertiary font-normal">
                  Live Updating
                </span>
              </CardTitle>
            </CardHeader>

            <CardContent className="p-4 sm:p-5 space-y-4">
              {/* Template Name */}
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-text-secondary">
                  Template Name
                </Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Executive Honors Certificate"
                  className="text-xs"
                />
              </div>

              {/* Style Variant */}
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-text-secondary">
                  Visual Theme Style
                </Label>
                <div className="grid grid-cols-3 gap-2">
                  {(["classic", "modern", "minimal"] as const).map((s) => (
                    <button
                      type="button"
                      key={s}
                      onClick={() => setStyle(s)}
                      className={`px-3 py-2 text-xs font-bold rounded-lg border capitalize transition-all cursor-pointer ${
                        style === s
                          ? "bg-primary text-primary-foreground border-primary shadow-xs"
                          : "bg-surface-sunken text-text-secondary border-surface-border hover:text-text-primary"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Headline */}
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-text-secondary">
                  Main Headline
                </Label>
                <Input
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  placeholder="e.g. Certificate of Completion"
                  className="text-xs font-semibold"
                />
              </div>

              {/* Subheadline */}
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-text-secondary">
                  Sub-headline / Intro Line
                </Label>
                <Input
                  value={subheadline}
                  onChange={(e) => setSubheadline(e.target.value)}
                  placeholder="e.g. Proudly presented to"
                  className="text-xs"
                />
              </div>

              {/* Body Template with Placeholders */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-bold text-text-secondary">
                    Body Description Template
                  </Label>
                  <span className="text-[10px] text-text-tertiary">
                    Click tags to insert
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5 pb-1">
                  {[
                    "{courseTitle}",
                    "{orgName}",
                    "{completionDate}",
                    "{learnerName}",
                  ].map((tag) => (
                    <button
                      type="button"
                      key={tag}
                      onClick={() => insertPlaceholder(tag)}
                      className="px-2 py-0.5 text-[10px] font-mono font-bold bg-primary/10 text-primary border border-primary/20 rounded hover:bg-primary/20 transition-colors cursor-pointer"
                    >
                      + {tag}
                    </button>
                  ))}
                </div>
                <Textarea
                  value={bodyTemplate}
                  onChange={(e) => setBodyTemplate(e.target.value)}
                  rows={3}
                  className="text-xs leading-relaxed"
                  placeholder="Body sentence explaining the accomplishment..."
                />
              </div>

              {/* Signature Block */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-text-secondary">
                    Signatory Name
                  </Label>
                  <Input
                    value={signatureName}
                    onChange={(e) => setSignatureName(e.target.value)}
                    placeholder="e.g. Dr. Alex Morgan"
                    className="text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-text-secondary">
                    Signatory Title
                  </Label>
                  <Input
                    value={signatureTitle}
                    onChange={(e) => setSignatureTitle(e.target.value)}
                    placeholder="e.g. Head of Engineering"
                    className="text-xs"
                  />
                </div>
              </div>

              {/* Accent Color Picker */}
              <div className="space-y-2 pt-2 border-t border-surface-border">
                <Label className="text-xs font-bold text-text-secondary flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5" /> Accent & Seal Color
                </Label>
                <div className="flex items-center gap-2 flex-wrap">
                  {PRESET_COLORS.map((c) => (
                    <button
                      type="button"
                      key={c.hex}
                      onClick={() => setAccentColor(c.hex)}
                      className={`w-7 h-7 rounded-full border-2 transition-transform cursor-pointer ${
                        accentColor.toLowerCase() === c.hex.toLowerCase()
                          ? "scale-115 border-white shadow-md ring-2 ring-primary"
                          : "border-transparent hover:scale-105"
                      }`}
                      style={{ backgroundColor: c.hex }}
                      title={c.name}
                    />
                  ))}
                  <Input
                    type="color"
                    value={accentColor}
                    onChange={(e) => setAccentColor(e.target.value)}
                    className="w-8 h-8 p-0 border-0 rounded-full cursor-pointer"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 flex items-center gap-2">
                <Button
                  onClick={handleSaveCustom}
                  className="flex-1 text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm cursor-pointer"
                >
                  {savedSuccess ? (
                    <>
                      <Check className="w-4 h-4 mr-1.5 text-emerald-300" /> Saved to
                      Templates!
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-1.5" /> Save as Template
                    </>
                  )}
                </Button>

                {onSelectForIssue && (
                  <Button
                    variant="outline"
                    onClick={() => onSelectForIssue(currentEditingTemplate)}
                    className="text-xs font-bold border-primary text-primary hover:bg-primary/10 cursor-pointer"
                  >
                    Use for Issuance →
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Live Visual Canvas Preview */}
        <div className="lg:col-span-7 space-y-3 sticky top-20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-text-tertiary flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-primary" /> Live Document Canvas Preview
            </span>
            <span className="text-[11px] text-text-tertiary">
              Standard 1.414:1 Landscape Format (Print Ready)
            </span>
          </div>

          <div className="p-4 sm:p-6 bg-surface-sunken/60 rounded-2xl border border-surface-border">
            <CertificateView
              template={currentEditingTemplate}
              previewData={{
                learnerName: "Rohan Deshmukh",
                courseTitle: "Enterprise Cybersecurity & Zero Trust Architecture",
                completionDate: new Date().toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                }),
                orgName: org || "ESSCI",
                certificateId: "CERT-2026-PREVIEW",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
