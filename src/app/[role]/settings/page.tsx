"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useRoleGuard } from "@/lib/hooks/use-role-guard";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useSettingsStore } from "@/lib/store/settings-store";
import { AVAILABLE_FONTS, getFontById, DEFAULT_FONT_ID } from "@/config/fonts";
import {
  Building,
  Shield,
  Key,
  Laptop,
  Check,
  RotateCcw,
  Sparkles,
  DollarSign,
  Download,
  Upload,
  Globe,
  Palette,
  Bell,
  Sliders,
  CheckCircle2,
  QrCode,
  Layers,
} from "lucide-react";

export default function AccountSettingsPage() {
  const params = useParams<{ role: string }>();
  const user = useRoleGuard(params.role);

  const {
    portal,
    security,
    integrations,
    gamification,
    ecommerce,
    sessions,
    updatePortal,
    updateSecurity,
    updateIntegrations,
    updateGamification,
    updateEcommerce,
    revokeSession,
    revokeAllOtherSessions,
    generateApiKey,
  } = useSettingsStore();

  const [activeTab, setActiveTab] = useState("portal");
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);

  // RBAC Builder state
  const [rbacMatrix, setRbacMatrix] = useState<Record<string, Record<string, boolean>>>({
    "super-admin": { users: true, courses: true, reports: true, settings: true, billing: true, live: true },
    "org-admin": { users: true, courses: true, reports: true, settings: true, billing: false, live: true },
    "dept-head": { users: false, courses: true, reports: true, settings: false, billing: false, live: true },
    instructor: { users: false, courses: true, reports: true, settings: false, billing: false, live: true },
    manager: { users: false, courses: false, reports: true, settings: false, billing: false, live: false },
    learner: { users: false, courses: false, reports: false, settings: false, billing: false, live: false },
  });

  const toggleRbac = (role: string, perm: string) => {
    setRbacMatrix((prev) => ({
      ...prev,
      [role]: {
        ...prev[role],
        [perm]: !prev[role]?.[perm],
      },
    }));
  };

  const triggerSaveNotification = () => {
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  if (!user) return null;

  const isSuperAdmin = user.role === "super-admin" || user.role === "lms-admin";
  const isOrgAdmin = user.role === "org-admin";

  if (isSuperAdmin) {
    return (
      <AppShell user={user}>
        <div className="p-6 w-full">
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-8 text-center max-w-xl mx-auto space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
                <Sliders className="w-7 h-7" />
              </div>
              <h2 className="text-xl font-bold text-text-primary">
                Account & Settings is Tenant-Managed
              </h2>
              <p className="text-sm text-text-secondary">
                Portal branding, custom CNAME domains, and tenant-specific configurations are managed directly by Organization Administrators. Platform administrators oversee organizations, users, and SaaS subscription tiers.
              </p>
              <div className="pt-2 flex items-center justify-center gap-3">
                <Button render={<Link href={`/${user.role}/organization`} />}>
                  Manage Organizations
                </Button>
                <Button variant="outline" render={<Link href={`/${user.role}/subscription`} />}>
                  Manage Subscription Plans
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </AppShell>
    );
  }

  const canEditSettings = isOrgAdmin;

  return (
    <AppShell user={user}>
      <div className="p-6 space-y-6 w-full">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-text-primary">Account & Settings</h1>
              <Badge variant="outline">Enterprise Administrative Center</Badge>
            </div>
            <p className="text-text-secondary mt-1">
              Organization configuration, component RBAC policies, branding, and integrations for {user.org}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {saveSuccess && (
              <span className="flex items-center gap-1.5 text-xs text-success font-medium animate-in fade-in">
                <CheckCircle2 className="w-4 h-4" /> Changes saved
              </span>
            )}
            <Button onClick={triggerSaveNotification} className="gap-2">
              <Check className="w-4 h-4" />
              Save Configuration
            </Button>
          </div>
        </div>

        {/* Settings Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="border-b border-surface-border overflow-x-auto pb-1">
            <TabsList className="h-auto p-1 bg-surface-sunken/60 inline-flex flex-nowrap min-w-max gap-1">
              <TabsTrigger value="portal">Portal & Branding</TabsTrigger>
              <TabsTrigger value="security">Security & MFA</TabsTrigger>
              <TabsTrigger value="rbac">User Types & RBAC</TabsTrigger>
              <TabsTrigger value="integrations">Integrations & API</TabsTrigger>
              <TabsTrigger value="sessions">Sessions & Devices</TabsTrigger>
              <TabsTrigger value="gamification">Gamification</TabsTrigger>
              <TabsTrigger value="ecommerce">E-Commerce</TabsTrigger>
              <TabsTrigger value="import-export">Import & Export</TabsTrigger>
            </TabsList>
          </div>

          {/* 1. PORTAL & BRANDING */}
          <TabsContent value="portal" className="space-y-6 pt-4">
            {/* Site Identity */}
            <Card className="border-surface-border shadow-card">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Building className="w-5 h-5 text-brand-500" />
                  <CardTitle className="text-base font-semibold">Site Identity & Domain</CardTitle>
                </div>
                <CardDescription>Configure core branding, title tags, and vanity domain</CardDescription>
              </CardHeader>
              <CardContent className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Site Name</Label>
                  <Input
                    value={portal.siteName}
                    onChange={(e) => updatePortal({ siteName: e.target.value })}
                    disabled={!canEditSettings}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Locked Subdomain</Label>
                  <Input value={portal.domainName} disabled className="bg-surface-sunken font-mono text-xs" />
                </div>
                <div className="sm:col-span-2 space-y-1.5">
                  <Label>Site Description (Meta / Discovery)</Label>
                  <Input
                    value={portal.siteDescription}
                    onChange={(e) => updatePortal({ siteDescription: e.target.value })}
                    disabled={!canEditSettings}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Custom CNAME Domain</Label>
                  <Input
                    value={portal.customDomain}
                    onChange={(e) => updatePortal({ customDomain: e.target.value })}
                    disabled={!canEditSettings}
                  />
                </div>
                <div className="flex items-center gap-2 pt-6">
                  <Badge variant="outline" className="text-success border-success/30 gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> SSL Auto-Provisioned
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Branding & Appearance */}
            <Card className="border-surface-border shadow-card">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Palette className="w-5 h-5 text-brand-500" />
                  <CardTitle className="text-base font-semibold">Visual Identity & Fonts</CardTitle>
                </div>
                <CardDescription>Tailor colors, fonts, and dark mode behavior</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <Label>Primary Brand Color</Label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={portal.primaryColor}
                        onChange={(e) => updatePortal({ primaryColor: e.target.value })}
                        className="w-10 h-10 rounded border border-surface-border cursor-pointer bg-transparent"
                      />
                      <Input
                        value={portal.primaryColor}
                        onChange={(e) => updatePortal({ primaryColor: e.target.value })}
                        className="font-mono text-xs"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label>Accent Color</Label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={portal.accentColor}
                        onChange={(e) => updatePortal({ accentColor: e.target.value })}
                        className="w-10 h-10 rounded border border-surface-border cursor-pointer bg-transparent"
                      />
                      <Input
                        value={portal.accentColor}
                        onChange={(e) => updatePortal({ accentColor: e.target.value })}
                        className="font-mono text-xs"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label>Font Family (§3.17.B)</Label>
                    <Select
                      value={portal.fontId ?? DEFAULT_FONT_ID}
                      onValueChange={(v) => {
                        if (!v) return;
                        const font = getFontById(v);
                        if (!font) return;
                        // Inject Google Fonts link if needed
                        if (font.googleFontUrl) {
                          const existing = document.getElementById(`gfont-${font.id}`);
                          if (!existing) {
                            const link = document.createElement("link");
                            link.id = `gfont-${font.id}`;
                            link.rel = "stylesheet";
                            link.href = font.googleFontUrl;
                            document.head.appendChild(link);
                          }
                        }
                        // Apply to document root for live preview
                        document.documentElement.style.setProperty("--font-sans", font.family);
                        if (font.letterSpacing) {
                          document.documentElement.style.setProperty("--font-letter-spacing", font.letterSpacing);
                        }
                        updatePortal({ fontFamily: font.family, fontId: font.id });
                      }}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Choose a font..." />
                      </SelectTrigger>
                      <SelectContent className="max-h-80">
                        {AVAILABLE_FONTS.map((font) => (
                          <SelectItem key={font.id} value={font.id}>
                            <div className="flex flex-col gap-0.5 py-0.5">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-sm">{font.name}</span>
                                <Badge variant="outline" className="text-[10px] h-4 px-1.5 capitalize">
                                  {font.category}
                                </Badge>
                              </div>
                              <span className="text-xs text-text-tertiary">{font.description}</span>
                              <span
                                className="text-xs text-text-secondary mt-0.5 truncate max-w-[260px]"
                                style={{ fontFamily: font.family }}
                              >
                                {font.preview}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-text-tertiary">
                      {AVAILABLE_FONTS.length} fonts available — previewed live as you select
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-surface-border pt-4">
                  <div>
                    <Label className="font-medium">White-Label Watermark Suppression</Label>
                    <p className="text-xs text-text-tertiary">
                      Hide vendor attribution (&quot;Powered by LMS&quot;) for a 100% bespoke corporate look
                    </p>
                  </div>
                  <Switch
                    checked={portal.whiteLabelWatermark}
                    onCheckedChange={(checked) => updatePortal({ whiteLabelWatermark: checked })}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Strategic Suggestions: Configurable Terminology (Glossary Override §3.17.A) */}
            <Card className="border-surface-border shadow-card">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-brand-500" />
                  <CardTitle className="text-base font-semibold">System Terminology / Glossary Override</CardTitle>
                </div>
                <CardDescription>
                  Custom terminology mapping (§3.17.A): rename core LMS entities across the entire UI
                </CardDescription>
              </CardHeader>
              <CardContent className="grid sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label>&quot;Learner&quot; Label</Label>
                  <Input
                    value={portal.glossary.learner}
                    onChange={(e) =>
                      updatePortal({ glossary: { ...portal.glossary, learner: e.target.value } })
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>&quot;Instructor&quot; Label</Label>
                  <Input
                    value={portal.glossary.instructor}
                    onChange={(e) =>
                      updatePortal({ glossary: { ...portal.glossary, instructor: e.target.value } })
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>&quot;Course&quot; Label</Label>
                  <Input
                    value={portal.glossary.course}
                    onChange={(e) =>
                      updatePortal({ glossary: { ...portal.glossary, course: e.target.value } })
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>&quot;Category&quot; Label</Label>
                  <Input
                    value={portal.glossary.category}
                    onChange={(e) =>
                      updatePortal({ glossary: { ...portal.glossary, category: e.target.value } })
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>&quot;Group&quot; Label</Label>
                  <Input
                    value={portal.glossary.group}
                    onChange={(e) =>
                      updatePortal({ glossary: { ...portal.glossary, group: e.target.value } })
                    }
                  />
                </div>
              </CardContent>
            </Card>

            {/* Locale & Regional Preferences */}
            <Card className="border-surface-border shadow-card">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Globe className="w-5 h-5 text-brand-500" />
                  <CardTitle className="text-base font-semibold">Locale & Regional Standards</CardTitle>
                </div>
                <CardDescription>Timezones, date formatting, and language localization</CardDescription>
              </CardHeader>
              <CardContent className="grid sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label>Default Language</Label>
                  <Select
                    value={portal.defaultLanguage}
                    onValueChange={(v) => updatePortal({ defaultLanguage: v ?? "English (US)" })}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="English (US)">English (US)</SelectItem>
                      <SelectItem value="Spanish">Español (Spanish)</SelectItem>
                      <SelectItem value="French">Français (French)</SelectItem>
                      <SelectItem value="German">Deutsch (German)</SelectItem>
                      <SelectItem value="Arabic">العربية (Arabic - RTL)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label>Timezone</Label>
                  <Select
                    value={portal.timezone}
                    onValueChange={(v) => updatePortal({ timezone: v ?? "America/New_York (UTC-5)" })}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="America/New_York (UTC-5)">America/New_York (UTC-5)</SelectItem>
                      <SelectItem value="Europe/London (UTC+0)">Europe/London (UTC+0)</SelectItem>
                      <SelectItem value="Asia/Kolkata (UTC+5:30)">Asia/Kolkata (UTC+5:30)</SelectItem>
                      <SelectItem value="America/Los_Angeles (UTC-8)">America/Los_Angeles (UTC-8)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label>Date Format</Label>
                  <Select
                    value={portal.dateFormat}
                    onValueChange={(v) => {
                      if (v === "MM/DD/YYYY" || v === "DD/MM/YYYY" || v === "YYYY-MM-DD") {
                        updatePortal({ dateFormat: v });
                      }
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MM/DD/YYYY">MM/DD/YYYY (12/31/2026)</SelectItem>
                      <SelectItem value="DD/MM/YYYY">DD/MM/YYYY (31/12/2026)</SelectItem>
                      <SelectItem value="YYYY-MM-DD">YYYY-MM-DD (2026-12-31)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Announcements Banner */}
            <Card className="border-surface-border shadow-card">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-brand-500" />
                  <CardTitle className="text-base font-semibold">Portal Notification Banner</CardTitle>
                </div>
                <CardDescription>Display scheduled maintenance or critical broadcast notices</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Broadcast Banner Active</Label>
                  <Switch
                    checked={portal.announcementActive}
                    onCheckedChange={(checked) => updatePortal({ announcementActive: checked })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Announcement Message</Label>
                  <Input
                    value={portal.announcementText}
                    onChange={(e) => updatePortal({ announcementText: e.target.value })}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 2. SECURITY & MFA */}
          <TabsContent value="security" className="space-y-6 pt-4">
            <Card className="border-surface-border shadow-card">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-brand-500" />
                  <CardTitle className="text-base font-semibold">Corporate Security Policies & MFA</CardTitle>
                </div>
                <CardDescription>
                  Multi-factor authentication enforcement (§3.2), lockout thresholds, and watermarking
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between border-b border-surface-border pb-4">
                  <div>
                    <Label className="font-semibold text-text-primary">Enforce Multi-Factor Authentication (MFA)</Label>
                    <p className="text-xs text-text-tertiary">
                      Mandate TOTP authenticator app or email verification for all organizational logins
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button variant="outline" size="sm" onClick={() => setShowQrModal(true)} className="gap-1.5">
                      <QrCode className="w-3.5 h-3.5" /> Sample QR
                    </Button>
                    <Switch
                      checked={security.enforceMfa}
                      onCheckedChange={(checked) => updateSecurity({ enforceMfa: checked })}
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <Label>Minimum Password Length</Label>
                    <Input
                      type="number"
                      value={security.minPasswordLength}
                      onChange={(e) => updateSecurity({ minPasswordLength: parseInt(e.target.value) || 8 })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Lockout After Failed Attempts</Label>
                    <Input
                      type="number"
                      value={security.lockoutAttempts}
                      onChange={(e) => updateSecurity({ lockoutAttempts: parseInt(e.target.value) || 5 })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Lockout Duration (Minutes)</Label>
                    <Input
                      type="number"
                      value={security.lockoutDurationMinutes}
                      onChange={(e) => updateSecurity({ lockoutDurationMinutes: parseInt(e.target.value) || 15 })}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label>Corporate Domain Whitelist</Label>
                  <Input
                    value={security.domainWhitelist}
                    onChange={(e) => updateSecurity({ domainWhitelist: e.target.value })}
                    placeholder="acme.com, subsidiary.acme.com"
                  />
                  <p className="text-xs text-text-tertiary">
                    Comma-separated list of domains permitted to register or sign in via SSO
                  </p>
                </div>

                <div className="flex items-center justify-between border-t border-surface-border pt-4">
                  <div>
                    <Label className="font-medium">Dynamic Video Anti-Piracy Watermarking</Label>
                    <p className="text-xs text-text-tertiary">
                      Overlays learner name, email, and IP address dynamically across video playback
                    </p>
                  </div>
                  <Switch
                    checked={security.enableVideoWatermark}
                    onCheckedChange={(checked) => updateSecurity({ enableVideoWatermark: checked })}
                  />
                </div>
              </CardContent>
            </Card>

            {/* QR Modal demo */}
            {showQrModal && (
              <Card className="border-brand-500/40 bg-surface-sunken">
                <CardContent className="p-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 bg-white p-2 rounded-lg border border-surface-border flex items-center justify-center">
                      <QrCode className="w-12 h-12 text-black" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-text-primary text-sm">Authenticator QR Preview</h4>
                      <p className="text-xs text-text-secondary">Secret: ABCD-EFGH-1234-WXYZ (Scan with Google/1Password)</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setShowQrModal(false)}>
                    Close
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* 3. USER TYPES & RBAC BUILDER */}
          <TabsContent value="rbac" className="space-y-4 pt-4">
            <Card className="border-surface-border shadow-card">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Layers className="w-5 h-5 text-brand-500" />
                  <CardTitle className="text-base font-semibold">Component-Level Access Control Builder (RBAC)</CardTitle>
                </div>
                <CardDescription>
                  Configure granular capability permissions for system archetypes and custom roles (§3.15)
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-surface-border text-left text-text-tertiary">
                      <th className="p-3 font-medium">Role / Archetype</th>
                      <th className="p-3 font-medium text-center">Manage Users</th>
                      <th className="p-3 font-medium text-center">Course Authoring</th>
                      <th className="p-3 font-medium text-center">Reporting MIS</th>
                      <th className="p-3 font-medium text-center">System Settings</th>
                      <th className="p-3 font-medium text-center">SaaS Billing</th>
                      <th className="p-3 font-medium text-center">Live ILT Classroom</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-border">
                    {[
                      { key: "super-admin", label: "Super Administrator" },
                      { key: "org-admin", label: "Organization Administrator" },
                      { key: "dept-head", label: "Department Head" },
                      { key: "instructor", label: "Instructor" },
                      { key: "manager", label: "Manager" },
                      { key: "learner", label: "Learner" },
                    ].map((r) => (
                      <tr key={r.key} className="hover:bg-surface-sunken/40 transition-colors">
                        <td className="p-3 font-medium text-text-primary">{r.label}</td>
                        {["users", "courses", "reports", "settings", "billing", "live"].map((perm) => (
                          <td key={perm} className="p-3 text-center">
                            <input
                              type="checkbox"
                              checked={!!rbacMatrix[r.key]?.[perm]}
                              onChange={() => toggleRbac(r.key, perm)}
                              className="w-4 h-4 rounded border-surface-border accent-brand-500 cursor-pointer"
                            />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 4. INTEGRATIONS & API */}
          <TabsContent value="integrations" className="space-y-6 pt-4">
            <Card className="border-surface-border shadow-card">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Key className="w-5 h-5 text-brand-500" />
                  <CardTitle className="text-base font-semibold">API Keys & Webhooks</CardTitle>
                </div>
                <CardDescription>Enterprise REST API credentials and real-time webhook endpoints</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <Label>Live Secret API Key</Label>
                  <div className="flex items-center gap-2">
                    <Input value={integrations.apiKey} readOnly className="font-mono text-xs bg-surface-sunken" />
                    <Button
                      variant="outline"
                      onClick={() => {
                        navigator.clipboard?.writeText(integrations.apiKey);
                        setCopiedKey(true);
                        setTimeout(() => setCopiedKey(false), 1500);
                      }}
                    >
                      {copiedKey ? "Copied" : "Copy"}
                    </Button>
                    <Button variant="outline" onClick={generateApiKey}>
                      <RotateCcw className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label>Webhook Payload Destination URL</Label>
                  <Input
                    value={integrations.webhookUrl}
                    onChange={(e) => updateIntegrations({ webhookUrl: e.target.value })}
                  />
                  <p className="text-xs text-text-tertiary">
                    Events dispatched: `user.registered`, `course.completed`, `cert.issued`
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-surface-border shadow-card">
              <CardHeader>
                <CardTitle className="text-base font-semibold">Connected Services</CardTitle>
                <CardDescription>Collaboration and video conference integrations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { name: "Zoom Meetings", connected: integrations.zoomConnected, key: "zoomConnected" as const },
                  { name: "Microsoft Teams", connected: integrations.teamsConnected, key: "teamsConnected" as const },
                  { name: "Slack Notifications", connected: integrations.slackConnected, key: "slackConnected" as const },
                ].map((svc) => (
                  <div key={svc.name} className="flex items-center justify-between p-3 rounded-lg border border-surface-border">
                    <span className="font-medium text-sm text-text-primary">{svc.name}</span>
                    <Switch
                      checked={svc.connected}
                      onCheckedChange={(checked) => updateIntegrations({ [svc.key]: checked })}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* 5. SESSIONS & DEVICES */}
          <TabsContent value="sessions" className="space-y-4 pt-4">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <p className="text-sm text-text-secondary">
                Active signed-in browser sessions across your devices. Revoke unrecognized devices immediately.
              </p>
              <Button variant="outline" size="sm" onClick={revokeAllOtherSessions}>
                Sign Out All Other Devices
              </Button>
            </div>

            <Card className="border-surface-border shadow-card">
              <CardContent className="p-0 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-surface-border text-left text-text-tertiary">
                      <th className="p-3 font-medium">Device / OS</th>
                      <th className="p-3 font-medium">Browser</th>
                      <th className="p-3 font-medium">Location & IP</th>
                      <th className="p-3 font-medium">Last Active</th>
                      <th className="p-3 font-medium text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-border">
                    {sessions.map((s) => (
                      <tr key={s.id} className="hover:bg-surface-sunken/40 transition-colors">
                        <td className="p-3 font-medium text-text-primary">
                          <div className="flex items-center gap-2">
                            <Laptop className="w-4 h-4 text-brand-500" />
                            {s.device}
                            {s.isCurrent && (
                              <Badge variant="outline" className="text-success border-success/30 text-xs">
                                Current
                              </Badge>
                            )}
                          </div>
                        </td>
                        <td className="p-3 text-text-secondary">{s.browser}</td>
                        <td className="p-3 text-text-secondary">
                          {s.location} <span className="font-mono text-xs text-text-tertiary">({s.ipAddress})</span>
                        </td>
                        <td className="p-3 text-text-tertiary text-xs">{s.lastActive}</td>
                        <td className="p-3 text-right">
                          {!s.isCurrent && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-danger hover:text-danger hover:bg-danger/10"
                              onClick={() => revokeSession(s.id)}
                            >
                              Revoke
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 6. GAMIFICATION */}
          <TabsContent value="gamification" className="space-y-4 pt-4">
            <Card className="border-surface-border shadow-card">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-brand-500" />
                  <CardTitle className="text-base font-semibold">Points, Badges & Leaderboards</CardTitle>
                </div>
                <CardDescription>Incentivize learner progression through motivational gamification</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <Label>Points Per Login</Label>
                    <Input
                      type="number"
                      value={gamification.pointsPerLogin}
                      onChange={(e) => updateGamification({ pointsPerLogin: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Points Per Course Completion</Label>
                    <Input
                      type="number"
                      value={gamification.pointsPerCourseComplete}
                      onChange={(e) => updateGamification({ pointsPerCourseComplete: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Points Per 100% Quiz Score</Label>
                    <Input
                      type="number"
                      value={gamification.pointsPerQuizAce}
                      onChange={(e) => updateGamification({ pointsPerQuizAce: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-surface-border pt-4">
                  <div>
                    <Label className="font-medium">Public Organization Leaderboard</Label>
                    <p className="text-xs text-text-tertiary">Allow learners to view peer point rankings</p>
                  </div>
                  <Switch
                    checked={gamification.leaderboardVisible}
                    onCheckedChange={(checked) => updateGamification({ leaderboardVisible: checked })}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 7. E-COMMERCE */}
          <TabsContent value="ecommerce" className="space-y-4 pt-4">
            <Card className="border-surface-border shadow-card">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-brand-500" />
                  <CardTitle className="text-base font-semibold">Course Store E-Commerce</CardTitle>
                </div>
                <CardDescription>Payment gateway configuration for paid external courses</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between border-b border-surface-border pb-4">
                  <div>
                    <Label className="font-medium">Enable Commercial Course Sales</Label>
                    <p className="text-xs text-text-tertiary">Accept payments for courses on Course Store catalog</p>
                  </div>
                  <Switch
                    checked={ecommerce.enabled}
                    onCheckedChange={(checked) => updateEcommerce({ enabled: checked })}
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>Default Currency</Label>
                    <Select
                      value={ecommerce.currency}
                      onValueChange={(v) => updateEcommerce({ currency: v ?? "USD ($)" })}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD ($)">USD ($)</SelectItem>
                        <SelectItem value="EUR (€)">EUR (€)</SelectItem>
                        <SelectItem value="GBP (£)">GBP (£)</SelectItem>
                        <SelectItem value="INR (₹)">INR (₹)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label>Tax Rate (%)</Label>
                    <Input
                      type="number"
                      value={ecommerce.taxRatePercent}
                      onChange={(e) => updateEcommerce({ taxRatePercent: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg border border-surface-border">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm">Stripe Payments</span>
                    <Badge variant="outline" className="text-success border-success/30">
                      Connected (Test Mode)
                    </Badge>
                  </div>
                  <Button variant="outline" size="sm">
                    Configure Gateway
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 8. IMPORT & EXPORT */}
          <TabsContent value="import-export" className="space-y-4 pt-4">
            <div className="grid sm:grid-cols-2 gap-6">
              <Card className="border-surface-border shadow-card">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Upload className="w-5 h-5 text-brand-500" />
                    <CardTitle className="text-base font-semibold">Bulk User Onboarding (CSV)</CardTitle>
                  </div>
                  <CardDescription>Provision up to 5,000 employees simultaneously</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="border-2 border-dashed border-surface-border rounded-lg p-6 text-center space-y-2">
                    <Upload className="w-8 h-8 text-text-tertiary mx-auto" />
                    <p className="text-xs text-text-secondary">Drag and drop .csv file here, or click to browse</p>
                    <Button variant="outline" size="sm">
                      Select CSV File
                    </Button>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs text-brand-500"
                    onClick={() => {
                      const csv = "First Name,Last Name,Email,Role,Department\nJohn,Doe,john@acme.com,learner,Sales";
                      const blob = new Blob([csv], { type: "text/csv" });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = "user_import_sample.csv";
                      a.click();
                    }}
                  >
                    Download CSV Sample Template
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-surface-border shadow-card">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Download className="w-5 h-5 text-brand-500" />
                    <CardTitle className="text-base font-semibold">Tenant Data Backup & Archive</CardTitle>
                  </div>
                  <CardDescription>Download complete database export of your tenant</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-xs text-text-secondary">
                    Includes all users, completion attestations, course manifests, and audit timeline records in a
                    standardized JSON format.
                  </p>
                  <Button
                    className="gap-2 w-full"
                    onClick={() => {
                      const data = { org: user.org, exportDate: new Date().toISOString(), portal, security };
                      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = `${user.org}-tenant-backup.json`;
                      a.click();
                    }}
                  >
                    <Download className="w-4 h-4" />
                    Export Full Tenant Archive (.json)
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
}
