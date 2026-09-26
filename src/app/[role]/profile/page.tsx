"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useRoleGuard } from "@/lib/hooks/use-role-guard";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuthStore } from "@/lib/store/auth-store";
import { ROLE_LABELS } from "@/lib/permissions";
import {
  User,
  ShieldCheck,
  KeyRound,
  QrCode,
  Smartphone,
  Laptop,
  CheckCircle2,
  AlertTriangle,
  Eye,
  EyeOff,
  Building2,
  Mail,
  Camera,
} from "lucide-react";

export default function ProfilePage() {
  const params = useParams<{ role: string }>();
  const user = useRoleGuard(params.role);

  const updateProfile = useAuthStore((s) => s.updateProfile);
  const setMfa = useAuthStore((s) => s.setMfa);
  const changePassword = useAuthStore((s) => s.changePassword);

  // Profile form state
  const [name, setName] = useState(user?.name ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "+1 (555) 234-5678");
  const [department, setDepartment] = useState(user?.department ?? "Operations");
  const [bio, setBio] = useState(
    user?.bio ??
      "Enterprise LMS Administrator focused on continuous learning systems, technical onboarding, and compliance automation."
  );
  const [profileSuccess, setProfileSuccess] = useState(false);

  // Password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  // MFA setup state
  const [mfaTestCode, setMfaTestCode] = useState("");
  const [mfaSetupActive, setMfaSetupActive] = useState(false);
  const [mfaSuccessMsg, setMfaSuccessMsg] = useState<string | null>(null);

  if (!user) return null;

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      name: name.trim() || user.name,
      phone: phone.trim(),
      department: department.trim(),
      bio: bio.trim(),
    });
    setProfileSuccess(true);
    setTimeout(() => setProfileSuccess(false), 3000);
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(false);

    if (newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("New password and confirm password do not match.");
      return;
    }

    const res = changePassword(currentPassword, newPassword);
    if (!res.success) {
      setPasswordError(res.error ?? "Failed to update password.");
      return;
    }

    setPasswordSuccess(true);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setTimeout(() => setPasswordSuccess(false), 3500);
  };

  const handleToggleMfa = (checked: boolean) => {
    if (checked) {
      setMfaSetupActive(true);
    } else {
      setMfa(false);
      setMfaSetupActive(false);
      setMfaSuccessMsg("Two-factor authentication has been disabled.");
      setTimeout(() => setMfaSuccessMsg(null), 3000);
    }
  };

  const handleVerifyMfaSetup = () => {
    if (mfaTestCode.length === 6) {
      setMfa(true);
      setMfaSetupActive(false);
      setMfaTestCode("");
      setMfaSuccessMsg("Two-factor authentication successfully enabled & verified!");
      setTimeout(() => setMfaSuccessMsg(null), 3500);
    }
  };

  return (
    <AppShell user={user}>
      <div className="p-6 max-w-4xl space-y-6">
        {/* Profile Banner */}
        <div className="rounded-2xl border border-surface-border bg-gradient-to-r from-primary/10 via-surface-raised to-surface-sunken p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="relative group">
              <Avatar className="w-16 h-16 border-2 border-primary shadow-sm">
                <AvatarFallback className="bg-primary text-primary-foreground text-xl font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white cursor-pointer">
                <Camera className="w-5 h-5" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-2xl font-bold text-text-primary tracking-tight">{user.name}</h1>
                <Badge variant="default" className="text-xs">
                  {ROLE_LABELS[user.role]}
                </Badge>
                {user.mfaEnrolled ? (
                  <Badge variant="outline" className="text-success border-success/30 gap-1 bg-success/10 text-xs">
                    <ShieldCheck className="w-3 h-3" /> MFA Protected
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-amber-600 border-amber-500/30 gap-1 bg-amber-500/10 text-xs">
                    <AlertTriangle className="w-3 h-3" /> MFA Off
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-4 text-xs text-text-secondary mt-1 flex-wrap">
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-text-tertiary" /> {user.identifier}
                </span>
                <span className="flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-text-tertiary" /> {user.org}
                  {user.department && ` · ${user.department}`}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Tabs */}
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="bg-surface-sunken p-1 rounded-xl border border-surface-border">
            <TabsTrigger value="profile" className="gap-2 text-xs font-medium">
              <User className="w-3.5 h-3.5" /> Personal Profile
            </TabsTrigger>
            <TabsTrigger value="security" className="gap-2 text-xs font-medium">
              <KeyRound className="w-3.5 h-3.5" /> Password & Security
            </TabsTrigger>
            <TabsTrigger value="mfa" className="gap-2 text-xs font-medium">
              <ShieldCheck className="w-3.5 h-3.5" /> Two-Factor (MFA)
            </TabsTrigger>
            <TabsTrigger value="sessions" className="gap-2 text-xs font-medium">
              <Laptop className="w-3.5 h-3.5" /> Active Sessions
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: PERSONAL PROFILE */}
          <TabsContent value="profile" className="space-y-6">
            <Card className="border-surface-border shadow-card">
              <CardHeader>
                <CardTitle className="text-base font-semibold">User Information</CardTitle>
                <CardDescription>Update your personal details, department, and bio visible across your courses.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSaveProfile} className="space-y-4">
                  {profileSuccess && (
                    <div className="p-3 rounded-lg bg-success/15 border border-success/30 text-success text-sm flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>Profile information updated successfully.</span>
                    </div>
                  )}

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="fullName" className="text-xs font-medium text-text-secondary">
                        Display Name
                      </Label>
                      <Input
                        id="fullName"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Your full name"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="email" className="text-xs font-medium text-text-secondary">
                        Email Address (Account Identifier)
                      </Label>
                      <Input
                        id="email"
                        value={user.identifier}
                        disabled
                        className="bg-surface-sunken cursor-not-allowed opacity-80"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="phone" className="text-xs font-medium text-text-secondary">
                        Contact Phone
                      </Label>
                      <Input
                        id="phone"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+1 (555) 000-0000"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="department" className="text-xs font-medium text-text-secondary">
                        Department
                      </Label>
                      <Input
                        id="department"
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        placeholder="e.g. Engineering, Sales"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="bio" className="text-xs font-medium text-text-secondary">
                      Bio / Professional Summary
                    </Label>
                    <Textarea
                      id="bio"
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      rows={3}
                      placeholder="Brief summary of your background..."
                    />
                  </div>

                  <div className="flex justify-end pt-2">
                    <Button type="submit" className="gap-2">
                      Save Profile Changes
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 2: PASSWORD & SECURITY */}
          <TabsContent value="security" className="space-y-6">
            <Card className="border-surface-border shadow-card">
              <CardHeader>
                <CardTitle className="text-base font-semibold">Change Password</CardTitle>
                <CardDescription>Ensure your account uses a secure password with at least 6 characters.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePasswordChange} className="space-y-4 max-w-lg">
                  {passwordError && (
                    <div className="p-3 rounded-lg bg-danger/15 border border-danger/30 text-danger text-sm flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span>{passwordError}</span>
                    </div>
                  )}

                  {passwordSuccess && (
                    <div className="p-3 rounded-lg bg-success/15 border border-success/30 text-success text-sm flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>Password changed successfully. Use your new password on next login.</span>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <Label htmlFor="currPass" className="text-xs font-medium text-text-secondary">
                      Current Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="currPass"
                        type={showPassword ? "text" : "password"}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="••••••••"
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

                  <div className="space-y-1.5">
                    <Label htmlFor="newPass" className="text-xs font-medium text-text-secondary">
                      New Password
                    </Label>
                    <Input
                      id="newPass"
                      type={showPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="At least 6 characters"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="confirmPass" className="text-xs font-medium text-text-secondary">
                      Confirm New Password
                    </Label>
                    <Input
                      id="confirmPass"
                      type={showPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter new password"
                    />
                  </div>

                  <div className="pt-2">
                    <Button type="submit" disabled={!newPassword || !confirmPassword}>
                      Update Password
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 3: TWO-FACTOR AUTH (MFA) */}
          <TabsContent value="mfa" className="space-y-6">
            <Card className="border-surface-border shadow-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base font-semibold">Two-Factor Authentication (MFA / 2FA)</CardTitle>
                    <CardDescription>
                      Protect your account with an extra verification layer (Authenticator app, 6-digit OTP code).
                    </CardDescription>
                  </div>
                  <Switch checked={user.mfaEnrolled || mfaSetupActive} onCheckedChange={handleToggleMfa} />
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {mfaSuccessMsg && (
                  <div className="p-3 rounded-lg bg-success/15 border border-success/30 text-success text-sm flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>{mfaSuccessMsg}</span>
                  </div>
                )}

                {user.mfaEnrolled && !mfaSetupActive && (
                  <div className="rounded-xl border border-success/30 bg-success/10 p-4 flex items-start gap-3">
                    <ShieldCheck className="w-6 h-6 text-success shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <p className="font-semibold text-text-primary text-sm">Two-Factor Authentication is Active</p>
                      <p className="text-xs text-text-secondary">
                        Your account requires a 6-digit OTP code on new browser logins.
                      </p>
                    </div>
                  </div>
                )}

                {(!user.mfaEnrolled || mfaSetupActive) && (
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl border border-surface-border bg-surface-sunken/60 space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/15 text-primary flex items-center justify-center shrink-0">
                          <QrCode className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-sm text-text-primary">Set Up Authenticator App</h4>
                          <p className="text-xs text-text-secondary">
                            Scan this secret key with Google Authenticator, Authy, or 1Password.
                          </p>
                        </div>
                      </div>

                      <div className="p-3 rounded-lg bg-surface-base border border-surface-border font-mono text-xs flex items-center justify-between">
                        <span>Secret Key: <strong className="text-primary font-bold">LMS-AUTH-8721-ABCD-9942</strong></span>
                        <Badge variant="outline" className="text-[10px]">TOTP</Badge>
                      </div>

                      <div className="space-y-2 pt-2 border-t border-surface-border">
                        <Label htmlFor="mfaCode" className="text-xs font-medium text-text-secondary">
                          Enter 6-digit verification code from your app
                        </Label>
                        <div className="flex gap-2 max-w-xs">
                          <Input
                            id="mfaCode"
                            maxLength={6}
                            placeholder="123456"
                            value={mfaTestCode}
                            onChange={(e) => setMfaTestCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                            className="font-mono text-center tracking-widest text-base"
                          />
                          <Button
                            type="button"
                            onClick={handleVerifyMfaSetup}
                            disabled={mfaTestCode.length !== 6}
                          >
                            Verify & Enable
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 4: ACTIVE SESSIONS */}
          <TabsContent value="sessions" className="space-y-6">
            <Card className="border-surface-border shadow-card">
              <CardHeader>
                <CardTitle className="text-base font-semibold">Active Devices & Sessions</CardTitle>
                <CardDescription>Review the browsers and devices currently authenticated with your account.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="rounded-lg border border-surface-border p-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-brand-500/10 text-brand-600 flex items-center justify-center shrink-0">
                      <Laptop className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-text-primary text-sm">Chrome on Windows (Current Session)</p>
                        <Badge variant="default" className="text-[10px] bg-success text-white">Active Now</Badge>
                      </div>
                      <p className="text-xs text-text-tertiary mt-0.5">IP: 192.168.1.104 · Location: Local Platform</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border border-surface-border p-4 flex items-center justify-between gap-4 opacity-75">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-surface-sunken text-text-secondary flex items-center justify-center shrink-0">
                      <Smartphone className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-text-primary text-sm">Safari on iPhone</p>
                      <p className="text-xs text-text-tertiary mt-0.5">Last active: Yesterday at 18:40 · Trusted Device (30d)</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="text-xs text-danger hover:text-danger">
                    Revoke
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
}
