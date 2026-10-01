"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useRoleGuard } from "@/lib/hooks/use-role-guard";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogBody,
} from "@/components/ui/dialog";
import {
  useSubscriptionStore,
  SubscriptionPlan,
  Invoice,
  OrgSubscription,
} from "@/lib/store/subscription-store";
import {
  CreditCard,
  ShieldAlert,
  CheckCircle2,
  Download,
  Zap,
  HardDrive,
  Users,
  Check,
  Building,
  Plus,
  Edit2,
  Trash2,
  Sparkles,
  Layers,
  ArrowRight,
  Receipt,
  FileText,
  DollarSign,
  TrendingUp,
  AlertCircle,
  HelpCircle,
} from "lucide-react";

export default function SubscriptionBillingPage() {
  const params = useParams<{ role: string }>();
  const router = useRouter();
  const user = useRoleGuard(params.role);

  const plans = useSubscriptionStore((s) => s.plans);
  const subscriptions = useSubscriptionStore((s) => s.subscriptions);
  const invoices = useSubscriptionStore((s) => s.invoices);
  const createPlan = useSubscriptionStore((s) => s.createPlan);
  const updatePlan = useSubscriptionStore((s) => s.updatePlan);
  const deletePlan = useSubscriptionStore((s) => s.deletePlan);
  const getOrgSubscription = useSubscriptionStore((s) => s.getOrgSubscription);
  const switchOrgPlan = useSubscriptionStore((s) => s.switchOrgPlan);
  const updatePaymentMethod = useSubscriptionStore((s) => s.updatePaymentMethod);
  const addSeatsToOrg = useSubscriptionStore((s) => s.addSeatsToOrg);

  // LMS Admin State
  const [activeAdminTab, setActiveAdminTab] = useState<"plans" | "tenants">("plans");
  const [planModalOpen, setPlanModalOpen] = useState(false);
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
  const [planForm, setPlanForm] = useState({
    name: "",
    description: "",
    monthlyPrice: 99,
    annualPrice: 990,
    seatAllowance: 25,
    storageGb: 20,
    badge: "",
    status: "active" as "active" | "draft" | "archived",
    features: "Standard SCORM compliance\nEmail notifications\nBasic reporting",
  });

  // Org Admin State
  const [switchPlanModalOpen, setSwitchPlanModalOpen] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<string>("");
  const [billingInterval, setBillingInterval] = useState<"monthly" | "annual">("annual");
  const [addSeatsModalOpen, setAddSeatsModalOpen] = useState(false);
  const [seatsToAdd, setSeatsToAdd] = useState<number>(25);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    brand: "VISA Corporate",
    last4: "4242",
    exp: "12/29",
    billingEmail: "",
    taxId: "US-EIN 84-9382109",
    cardholderName: "",
  });
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  if (!user) return null;

  const isLmsAdmin = user.role === "lms-admin" || user.role === "super-admin";
  const isOrgAdmin = user.role === "org-admin";

  // If a role other than LMS Admin or Org Admin tries to access
  if (!isLmsAdmin && !isOrgAdmin) {
    return (
      <AppShell user={user}>
        <div className="p-6 w-full">
          <Card className="border-warning/30 bg-warning/5">
            <CardHeader className="flex flex-row items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-warning/15 flex items-center justify-center shrink-0">
                <ShieldAlert className="w-5 h-5 text-warning" />
              </div>
              <div>
                <CardTitle className="text-lg font-bold">Access Restricted</CardTitle>
                <CardDescription>Billing and Subscription Management</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-text-secondary">
              <p>
                Subscription management and organizational billing are strictly accessible to{" "}
                <strong className="text-text-primary">Organization Administrators</strong> and{" "}
                <strong className="text-text-primary">LMS Platform Administrators</strong>.
              </p>
              <Button
                variant="outline"
                className="mt-2"
                onClick={() => router.push(`/${user.role}/dashboard`)}
              >
                Return to Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </AppShell>
    );
  }

  // --- LMS Admin Handlers ---
  const handleOpenCreatePlan = () => {
    setEditingPlanId(null);
    setPlanForm({
      name: "",
      description: "",
      monthlyPrice: 149,
      annualPrice: 1490,
      seatAllowance: 50,
      storageGb: 40,
      badge: "",
      status: "active",
      features: "Custom branding\nPriority support\nCompliance certificates",
    });
    setPlanModalOpen(true);
  };

  const handleOpenEditPlan = (plan: SubscriptionPlan) => {
    setEditingPlanId(plan.id);
    setPlanForm({
      name: plan.name,
      description: plan.description,
      monthlyPrice: plan.monthlyPrice,
      annualPrice: plan.annualPrice,
      seatAllowance: plan.seatAllowance,
      storageGb: plan.storageGb,
      badge: plan.badge || "",
      status: plan.status,
      features: plan.features.join("\n"),
    });
    setPlanModalOpen(true);
  };

  const handleSavePlan = (e: React.FormEvent) => {
    e.preventDefault();
    const featureList = planForm.features
      .split("\n")
      .map((f) => f.trim())
      .filter(Boolean);

    if (editingPlanId) {
      updatePlan(editingPlanId, {
        name: planForm.name,
        description: planForm.description,
        monthlyPrice: Number(planForm.monthlyPrice),
        annualPrice: Number(planForm.annualPrice),
        seatAllowance: Number(planForm.seatAllowance),
        storageGb: Number(planForm.storageGb),
        badge: planForm.badge.trim() || undefined,
        status: planForm.status,
        features: featureList,
      });
      setActionSuccess("Plan updated successfully!");
    } else {
      createPlan({
        name: planForm.name,
        description: planForm.description,
        monthlyPrice: Number(planForm.monthlyPrice),
        annualPrice: Number(planForm.annualPrice),
        seatAllowance: Number(planForm.seatAllowance),
        storageGb: Number(planForm.storageGb),
        badge: planForm.badge.trim() || undefined,
        status: planForm.status,
        features: featureList,
      });
      setActionSuccess("New plan tier created successfully!");
    }

    setPlanModalOpen(false);
    setTimeout(() => setActionSuccess(null), 3000);
  };

  // --- Org Admin Data & Handlers ---
  const currentOrgName = user.org || "ESSCI";
  const orgSub = getOrgSubscription(currentOrgName);
  const currentPlan = plans.find((p) => p.id === orgSub.planId) || plans[0];
  const orgInvoices = invoices.filter((inv) => inv.orgName === currentOrgName || isLmsAdmin);

  const handleDownloadInvoice = (inv: Invoice) => {
    const text = `=========================================\nOFFICIAL TAX INVOICE & RECEIPT\n=========================================\nInvoice ID: ${inv.id}\nDate: ${inv.date}\nOrganization: ${inv.orgName}\nPlan: ${inv.plan}\nTotal Billed: ${inv.amount}\nStatus: ${inv.status}\n\nThank you for choosing LMS Platform Global.\n=========================================`;
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${inv.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleConfirmPlanSwitch = () => {
    if (!selectedPlanId) return;
    switchOrgPlan(currentOrgName, selectedPlanId, billingInterval);
    setSwitchPlanModalOpen(false);
    setActionSuccess("Organization plan tier upgraded successfully!");
    setTimeout(() => setActionSuccess(null), 3000);
  };

  const handleConfirmAddSeats = () => {
    addSeatsToOrg(currentOrgName, Number(seatsToAdd));
    setAddSeatsModalOpen(false);
    setActionSuccess(`Added ${seatsToAdd} learner seat licenses successfully!`);
    setTimeout(() => setActionSuccess(null), 3000);
  };

  const handleConfirmPaymentMethod = (e: React.FormEvent) => {
    e.preventDefault();
    updatePaymentMethod(currentOrgName, {
      brand: paymentForm.brand,
      last4: paymentForm.last4.slice(-4),
      exp: paymentForm.exp,
      billingEmail: paymentForm.billingEmail || `billing@${currentOrgName.toLowerCase().replace(/\s+/g, "")}.com`,
      taxId: paymentForm.taxId,
      cardholderName: paymentForm.cardholderName || currentOrgName,
    });
    setPaymentModalOpen(false);
    setActionSuccess("Payment details and billing contact updated!");
    setTimeout(() => setActionSuccess(null), 3000);
  };

  return (
    <AppShell user={user}>
      <div className="p-6 space-y-6 w-full">
        {/* Banner Alert if action completed */}
        {actionSuccess && (
          <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 flex items-center gap-3 text-emerald-900 dark:text-emerald-200">
            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
            <span className="font-semibold text-sm">{actionSuccess}</span>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════════════
            1. LMS ADMIN VIEW: Plan Definition Management & Tenant Oversight
           ════════════════════════════════════════════════════════════════════════ */}
        {isLmsAdmin && (
          <div className="space-y-6 w-full">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full">
              <div>
                <div className="flex items-center gap-2.5">
                  <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-text-primary">
                    Platform SaaS Plans & Commercial Management
                  </h1>
                  <Badge className="bg-primary/10 text-primary border-primary/20">
                    LMS Admin Master Control
                  </Badge>
                </div>
                <p className="text-text-secondary text-sm mt-1">
                  Create, price, and maintain subscription tiers available to all organizations across the platform.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Button onClick={handleOpenCreatePlan} className="gap-2 shrink-0">
                  <Plus className="w-4 h-4" /> Create New Plan
                </Button>
              </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
              <Card className="border-surface-border shadow-card">
                <CardContent className="p-5 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-text-tertiary uppercase tracking-wider">
                      Active Plan Tiers
                    </p>
                    <p className="text-2xl font-bold text-text-primary mt-1">
                      {plans.filter((p) => p.status === "active").length} Published
                    </p>
                  </div>
                  <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                    <Layers className="w-6 h-6" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-surface-border shadow-card">
                <CardContent className="p-5 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-text-tertiary uppercase tracking-wider">
                      Subscribed Orgs
                    </p>
                    <p className="text-2xl font-bold text-text-primary mt-1">
                      {Object.keys(subscriptions).length} Tenants
                    </p>
                  </div>
                  <div className="w-11 h-11 rounded-xl bg-sky-500/10 text-sky-600 flex items-center justify-center">
                    <Building className="w-6 h-6" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-surface-border shadow-card">
                <CardContent className="p-5 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-text-tertiary uppercase tracking-wider">
                      Monthly Run-Rate (MRR)
                    </p>
                    <p className="text-2xl font-bold text-text-primary mt-1">
                      $
                      {Object.values(subscriptions).reduce((acc, sub) => {
                        const plan = plans.find((p) => p.id === sub.planId);
                        return acc + (plan?.monthlyPrice ?? 0);
                      }, 0).toLocaleString()}
                    </p>
                  </div>
                  <div className="w-11 h-11 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-surface-border shadow-card">
                <CardContent className="p-5 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-text-tertiary uppercase tracking-wider">
                      Total Allocated Seats
                    </p>
                    <p className="text-2xl font-bold text-text-primary mt-1">
                      {Object.values(subscriptions).reduce((acc, sub) => acc + sub.seatsAllocated, 0)}{" "}
                      Seats
                    </p>
                  </div>
                  <div className="w-11 h-11 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center">
                    <Users className="w-6 h-6" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* View Switcher */}
            <div className="flex items-center gap-2 border-b border-surface-border pb-2">
              <Button
                variant={activeAdminTab === "plans" ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveAdminTab("plans")}
                className="gap-2"
              >
                <Layers className="w-4 h-4" /> Plan Tier Catalog ({plans.length})
              </Button>
              <Button
                variant={activeAdminTab === "tenants" ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveAdminTab("tenants")}
                className="gap-2"
              >
                <Building className="w-4 h-4" /> Tenant Subscriptions ({Object.keys(subscriptions).length})
              </Button>
            </div>

            {/* 1A. Plan Tier Catalog (LMS Admin) */}
            {activeAdminTab === "plans" && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
                {plans.map((plan) => (
                  <Card
                    key={plan.id}
                    className="border-surface-border shadow-card flex flex-col justify-between hover:border-primary/40 transition-colors"
                  >
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <Badge
                          variant={plan.status === "active" ? "default" : "secondary"}
                          className="capitalize text-xs font-semibold"
                        >
                          {plan.status}
                        </Badge>
                        {plan.badge && (
                          <Badge variant="outline" className="text-primary border-primary/30 text-xs">
                            <Sparkles className="w-3 h-3 mr-1" /> {plan.badge}
                          </Badge>
                        )}
                      </div>

                      <CardTitle className="text-xl font-bold text-text-primary">
                        {plan.name}
                      </CardTitle>
                      <CardDescription className="text-xs line-clamp-2">
                        {plan.description}
                      </CardDescription>

                      <div className="pt-3 border-t border-surface-border mt-3">
                        <div className="flex items-baseline gap-1">
                          <span className="text-3xl font-extrabold text-text-primary">
                            ${plan.monthlyPrice}
                          </span>
                          <span className="text-xs text-text-tertiary font-medium">/ month</span>
                        </div>
                        <p className="text-xs text-text-secondary mt-0.5">
                          or ${plan.annualPrice} billed annually
                        </p>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4 pt-0">
                      {/* Specs */}
                      <div className="grid grid-cols-2 gap-2 p-2.5 rounded-lg bg-surface-sunken border border-surface-border text-xs">
                        <div>
                          <span className="text-text-tertiary">Learner Seats:</span>
                          <p className="font-semibold text-text-primary">{plan.seatAllowance} seats</p>
                        </div>
                        <div>
                          <span className="text-text-tertiary">Storage:</span>
                          <p className="font-semibold text-text-primary">{plan.storageGb} GB CDN</p>
                        </div>
                      </div>

                      {/* Features */}
                      <div className="space-y-2">
                        <span className="text-xs font-semibold text-text-tertiary uppercase tracking-wider">
                          Included Features
                        </span>
                        <ul className="space-y-1.5 text-xs text-text-secondary">
                          {plan.features.map((feat, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                              <span>{feat}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </CardContent>

                    <CardFooter className="border-t border-surface-border bg-surface-sunken/30 pt-3 pb-3 flex items-center justify-between gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1.5 flex-1"
                        onClick={() => handleOpenEditPlan(plan)}
                      >
                        <Edit2 className="w-3.5 h-3.5" /> Edit Plan
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-danger-600 hover:text-danger-700 hover:bg-danger-50 dark:hover:bg-danger-950/30 px-2.5"
                        onClick={() => {
                          if (confirm(`Are you sure you want to delete the plan "${plan.name}"?`)) {
                            deletePlan(plan.id);
                          }
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}

            {/* 1B. Tenant Subscriptions & Revenue (LMS Admin) */}
            {activeAdminTab === "tenants" && (
              <Card className="border-surface-border shadow-card w-full">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold">Tenant Subscriptions Directory</CardTitle>
                  <CardDescription>
                    Live overview of customer organizations and their assigned SaaS tiers.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0 overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-surface-border text-left text-text-tertiary bg-surface-sunken/40">
                        <th className="p-3.5 font-medium">Organization</th>
                        <th className="p-3.5 font-medium">Plan Tier</th>
                        <th className="p-3.5 font-medium">Billing Cycle</th>
                        <th className="p-3.5 font-medium">Seat Capacity</th>
                        <th className="p-3.5 font-medium">Storage Used</th>
                        <th className="p-3.5 font-medium">Next Renewal</th>
                        <th className="p-3.5 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-border">
                      {Object.values(subscriptions).map((sub) => {
                        const plan = plans.find((p) => p.id === sub.planId);
                        return (
                          <tr key={sub.orgName} className="hover:bg-surface-sunken/30 transition-colors">
                            <td className="p-3.5 font-semibold text-text-primary flex items-center gap-2">
                              <Building className="w-4 h-4 text-primary" /> {sub.orgName}
                            </td>
                            <td className="p-3.5 text-text-primary font-medium">
                              {plan?.name || "Custom Plan"}
                            </td>
                            <td className="p-3.5 capitalize text-text-secondary">
                              {sub.billingCycle}
                            </td>
                            <td className="p-3.5 text-text-secondary">
                              <span className="font-semibold text-text-primary">{sub.seatsUsed}</span> /{" "}
                              {sub.seatsAllocated} seats
                            </td>
                            <td className="p-3.5 text-text-secondary">
                              <span className="font-semibold text-text-primary">{sub.storageGbUsed}</span> /{" "}
                              {sub.storageGbAllocated} GB
                            </td>
                            <td className="p-3.5 text-text-secondary font-mono text-xs">
                              {sub.renewalDate}
                            </td>
                            <td className="p-3.5">
                              <Badge variant="outline" className="text-emerald-600 border-emerald-500/30 text-xs">
                                <CheckCircle2 className="w-3 h-3 mr-1" /> {sub.status}
                              </Badge>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════════════
            2. ORG ADMIN VIEW: Organization Subscription & Billing Portal
           ════════════════════════════════════════════════════════════════════════ */}
        {isOrgAdmin && (
          <div className="space-y-6 w-full">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full">
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-text-primary">
                  Subscription & Billing Portal
                </h1>
                <p className="text-text-secondary text-sm mt-1">
                  Manage active license tier, seat allocations, payment methods, and invoices for {currentOrgName}.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Button onClick={() => setSwitchPlanModalOpen(true)} className="gap-2">
                  <Zap className="w-4 h-4" /> Upgrade / Switch Plan
                </Button>
              </div>
            </div>

            {/* Top Row: Current Plan & Payment Method (Full width grid) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
              {/* Active Plan Overview Card (2 Columns) */}
              <Card className="lg:col-span-2 border-surface-border shadow-card flex flex-col justify-between">
                <CardHeader className="flex flex-row items-start justify-between pb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Active Subscription
                      </Badge>
                      {currentPlan?.badge && (
                        <Badge variant="outline" className="text-primary border-primary/30">
                          {currentPlan.badge}
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-2xl font-bold text-text-primary">
                      {currentPlan?.name || "Enterprise Tier"}
                    </CardTitle>
                    <CardDescription className="mt-1 text-xs sm:text-sm">
                      ${orgSub.billingCycle === "annual" ? currentPlan.annualPrice : currentPlan.monthlyPrice} /{" "}
                      {orgSub.billingCycle === "annual" ? "year" : "month"} · Renews on {orgSub.renewalDate}
                    </CardDescription>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xs text-text-tertiary">Organization</span>
                    <div className="font-semibold text-text-primary flex items-center gap-1.5 justify-end mt-0.5">
                      <Building className="w-4 h-4 text-primary" /> {currentOrgName}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-6 pt-2">
                  {/* Capacity Meters */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 border-t border-surface-border pt-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2 text-text-secondary">
                          <Users className="w-4 h-4 text-primary" /> Active Learner Seats
                        </span>
                        <span className="font-semibold text-text-primary">
                          {orgSub.seatsUsed} / {orgSub.seatsAllocated} used
                        </span>
                      </div>
                      <Progress
                        value={(orgSub.seatsUsed / (orgSub.seatsAllocated || 1)) * 100}
                        className="h-2.5"
                      />
                      <div className="flex items-center justify-between text-xs text-text-tertiary">
                        <span>{orgSub.seatsAllocated - orgSub.seatsUsed} seats remaining</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-1.5 text-xs text-primary font-semibold hover:underline"
                          onClick={() => setAddSeatsModalOpen(true)}
                        >
                          + Add Seats
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2 text-text-secondary">
                          <HardDrive className="w-4 h-4 text-sky-500" /> Content & CDN Storage
                        </span>
                        <span className="font-semibold text-text-primary">
                          {orgSub.storageGbUsed} GB / {orgSub.storageGbAllocated} GB
                        </span>
                      </div>
                      <Progress
                        value={(orgSub.storageGbUsed / (orgSub.storageGbAllocated || 1)) * 100}
                        className="h-2.5"
                      />
                      <p className="text-xs text-text-tertiary">
                        {(orgSub.storageGbAllocated - orgSub.storageGbUsed).toFixed(1)} GB fast edge capacity remaining
                      </p>
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="bg-surface-sunken/40 border-t border-surface-border flex flex-col sm:flex-row sm:items-center justify-between py-3 gap-2 text-xs">
                  <span className="text-text-secondary">
                    Account Lead: <strong className="text-text-primary">{orgSub.accountManager}</strong>
                  </span>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => setAddSeatsModalOpen(true)}>
                      Add Seat Pack
                    </Button>
                    <Button variant="default" size="sm" onClick={() => setSwitchPlanModalOpen(true)}>
                      Change Plan
                    </Button>
                  </div>
                </CardFooter>
              </Card>

              {/* Payment Method Card (1 Column) */}
              <Card className="border-surface-border shadow-card flex flex-col justify-between">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold">Payment Method & Billing</CardTitle>
                  <CardDescription>Primary corporate billing profile</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 rounded-xl border border-surface-border bg-linear-to-br from-surface-sunken to-surface-base space-y-3 shadow-xs">
                    <div className="flex items-center justify-between">
                      <CreditCard className="w-6 h-6 text-primary" />
                      <span className="text-xs font-bold uppercase tracking-wider text-text-tertiary">
                        {orgSub.paymentMethod.brand}
                      </span>
                    </div>
                    <div className="font-mono text-base font-semibold text-text-primary">
                      •••• •••• •••• {orgSub.paymentMethod.last4}
                    </div>
                    <div className="flex items-center justify-between text-xs text-text-secondary">
                      <span>Expires {orgSub.paymentMethod.exp}</span>
                      <span className="font-medium text-text-primary truncate max-w-[120px]">
                        {orgSub.paymentMethod.cardholderName}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs text-text-secondary border-t border-surface-border pt-3">
                    <div className="flex items-center justify-between">
                      <span className="text-text-tertiary">Tax ID:</span>
                      <span className="font-medium font-mono text-text-primary">{orgSub.paymentMethod.taxId}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-text-tertiary">Billing Email:</span>
                      <span className="font-medium text-text-primary truncate max-w-[170px]">
                        {orgSub.paymentMethod.billingEmail}
                      </span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="border-t border-surface-border pt-3">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      setPaymentForm({
                        brand: orgSub.paymentMethod.brand,
                        last4: orgSub.paymentMethod.last4,
                        exp: orgSub.paymentMethod.exp,
                        billingEmail: orgSub.paymentMethod.billingEmail,
                        taxId: orgSub.paymentMethod.taxId,
                        cardholderName: orgSub.paymentMethod.cardholderName,
                      });
                      setPaymentModalOpen(true);
                    }}
                  >
                    Update Payment Method
                  </Button>
                </CardFooter>
              </Card>
            </div>

            {/* Invoices & Billing History Table (Full Width) */}
            <Card className="border-surface-border shadow-card w-full">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <div>
                  <CardTitle className="text-base font-semibold">Official Tax Invoices & Receipts</CardTitle>
                  <CardDescription>Download tax compliant invoices and transaction statements</CardDescription>
                </div>
                <Badge variant="outline" className="text-xs text-text-tertiary">
                  Auto-Billed
                </Badge>
              </CardHeader>
              <CardContent className="p-0 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-surface-border text-left text-text-tertiary bg-surface-sunken/40">
                      <th className="p-3.5 font-medium">Invoice Number</th>
                      <th className="p-3.5 font-medium">Billing Date</th>
                      <th className="p-3.5 font-medium">Plan Covered</th>
                      <th className="p-3.5 font-medium">Amount Billed</th>
                      <th className="p-3.5 font-medium">Payment Status</th>
                      <th className="p-3.5 font-medium text-right">Receipt Download</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-border">
                    {orgInvoices.map((inv) => (
                      <tr key={inv.id} className="hover:bg-surface-sunken/30 transition-colors">
                        <td className="p-3.5 font-mono font-semibold text-text-primary text-xs">
                          {inv.id}
                        </td>
                        <td className="p-3.5 text-text-secondary">{inv.date}</td>
                        <td className="p-3.5 text-text-primary font-medium">{inv.plan}</td>
                        <td className="p-3.5 font-bold text-text-primary">{inv.amount}</td>
                        <td className="p-3.5">
                          <Badge variant="outline" className="text-emerald-600 border-emerald-500/30 text-xs">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            {inv.status}
                          </Badge>
                        </td>
                        <td className="p-3.5 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="gap-1.5 text-xs text-primary font-semibold"
                            onClick={() => handleDownloadInvoice(inv)}
                          >
                            <Download className="w-3.5 h-3.5" /> PDF Receipt
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════════════
            MODALS & DIALOGS
           ════════════════════════════════════════════════════════════════════════ */}

        {/* 1. LMS Admin: Create or Edit Plan Dialog */}
        <Dialog open={planModalOpen} onOpenChange={setPlanModalOpen}>
          <DialogContent className="w-full max-w-2xl max-h-[88vh] overflow-y-auto p-6">
            <DialogHeader>
              <DialogTitle>
                {editingPlanId ? "Edit Subscription Plan Tier" : "Create New Subscription Plan"}
              </DialogTitle>
              <DialogDescription>
                Configure pricing, capacity, and enterprise features for this SaaS plan tier.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSavePlan} className="space-y-4 py-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="planName" className="text-xs font-semibold">
                    Plan Name *
                  </Label>
                  <Input
                    id="planName"
                    placeholder="e.g. Enterprise Cloud Tier"
                    value={planForm.name}
                    onChange={(e) => setPlanForm({ ...planForm, name: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="planBadge" className="text-xs font-semibold">
                    Marketing Badge (Optional)
                  </Label>
                  <Input
                    id="planBadge"
                    placeholder="e.g. Most Popular or Best Value"
                    value={planForm.badge}
                    onChange={(e) => setPlanForm({ ...planForm, badge: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="planDesc" className="text-xs font-semibold">
                  Plan Description *
                </Label>
                <Input
                  id="planDesc"
                  placeholder="Short summary of target customer segment..."
                  value={planForm.description}
                  onChange={(e) => setPlanForm({ ...planForm, description: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="monthlyPrice" className="text-xs font-semibold">
                    Monthly ($)
                  </Label>
                  <Input
                    id="monthlyPrice"
                    type="number"
                    min="0"
                    value={planForm.monthlyPrice}
                    onChange={(e) => setPlanForm({ ...planForm, monthlyPrice: Number(e.target.value) })}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="annualPrice" className="text-xs font-semibold">
                    Annual ($)
                  </Label>
                  <Input
                    id="annualPrice"
                    type="number"
                    min="0"
                    value={planForm.annualPrice}
                    onChange={(e) => setPlanForm({ ...planForm, annualPrice: Number(e.target.value) })}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="seats" className="text-xs font-semibold">
                    Seats
                  </Label>
                  <Input
                    id="seats"
                    type="number"
                    min="1"
                    value={planForm.seatAllowance}
                    onChange={(e) => setPlanForm({ ...planForm, seatAllowance: Number(e.target.value) })}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="storage" className="text-xs font-semibold">
                    Storage (GB)
                  </Label>
                  <Input
                    id="storage"
                    type="number"
                    min="1"
                    value={planForm.storageGb}
                    onChange={(e) => setPlanForm({ ...planForm, storageGb: Number(e.target.value) })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="features" className="text-xs font-semibold">
                  Plan Feature Highlights (one per line)
                </Label>
                <textarea
                  id="features"
                  rows={4}
                  className="w-full rounded-lg border border-surface-border bg-surface-base px-3 py-2 text-xs text-text-primary focus:outline-hidden focus:ring-2 focus:ring-primary/20"
                  value={planForm.features}
                  onChange={(e) => setPlanForm({ ...planForm, features: e.target.value })}
                  placeholder="Feature 1&#10;Feature 2&#10;Feature 3"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Publication Status</Label>
                <div className="flex items-center gap-3 text-xs">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      checked={planForm.status === "active"}
                      onChange={() => setPlanForm({ ...planForm, status: "active" })}
                    />
                    <span>Active (Published to Orgs)</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      checked={planForm.status === "draft"}
                      onChange={() => setPlanForm({ ...planForm, status: "draft" })}
                    />
                    <span>Draft</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      checked={planForm.status === "archived"}
                      onChange={() => setPlanForm({ ...planForm, status: "archived" })}
                    />
                    <span>Archived</span>
                  </label>
                </div>
              </div>

              <DialogFooter className="pt-3">
                <Button type="button" variant="outline" onClick={() => setPlanModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingPlanId ? "Save Plan Changes" : "Publish New Plan"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* 2. Org Admin: Switch / Upgrade Plan Dialog */}
        <Dialog open={switchPlanModalOpen} onOpenChange={setSwitchPlanModalOpen}>
          <DialogContent className="w-full max-w-4xl max-h-[88vh] overflow-y-auto p-6 sm:p-8">
            <DialogHeader>
              <DialogTitle>Select Subscription Plan for {currentOrgName}</DialogTitle>
              <DialogDescription>
                Choose from available verified platform subscription tiers.
              </DialogDescription>
            </DialogHeader>

            {/* Billing Interval Toggle */}
            <div className="flex items-center justify-center my-4">
              <div className="inline-flex items-center p-1 rounded-xl bg-surface-sunken border border-surface-border">
                <button
                  type="button"
                  onClick={() => setBillingInterval("monthly")}
                  className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    billingInterval === "monthly"
                      ? "bg-surface-base text-text-primary shadow-xs"
                      : "text-text-secondary hover:text-text-primary"
                  }`}
                >
                  Monthly Billing
                </button>
                <button
                  type="button"
                  onClick={() => setBillingInterval("annual")}
                  className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                    billingInterval === "annual"
                      ? "bg-surface-base text-text-primary shadow-xs"
                      : "text-text-secondary hover:text-text-primary"
                  }`}
                >
                  Annual Billing
                  <span className="text-[10px] bg-emerald-500/15 text-emerald-600 font-bold px-1.5 py-0.5 rounded">
                    Save ~17%
                  </span>
                </button>
              </div>
            </div>

            {/* Plans List Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-2">
              {plans
                .filter((p) => p.status === "active")
                .map((plan) => {
                  const isCurrent = orgSub.planId === plan.id;
                  const isSelected = (selectedPlanId || orgSub.planId) === plan.id;
                  const price =
                    billingInterval === "annual" ? plan.annualPrice : plan.monthlyPrice;

                  return (
                    <div
                      key={plan.id}
                      onClick={() => setSelectedPlanId(plan.id)}
                      className={`p-5 rounded-xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                        isSelected
                          ? "border-primary bg-primary/5 shadow-md"
                          : "border-surface-border hover:border-surface-border/80 bg-surface-base"
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-bold text-base text-text-primary">{plan.name}</h4>
                          {isCurrent && (
                            <Badge className="bg-emerald-500/15 text-emerald-600 border-0 text-[10px]">
                              Current
                            </Badge>
                          )}
                        </div>

                        <div className="text-2xl font-extrabold text-text-primary mt-1">
                          ${price}
                          <span className="text-xs font-normal text-text-tertiary">
                            /{billingInterval === "annual" ? "yr" : "mo"}
                          </span>
                        </div>

                        <div className="mt-3 space-y-1.5 text-xs text-text-secondary border-t border-surface-border pt-3">
                          <div className="font-semibold text-text-primary">
                            ✓ {plan.seatAllowance} Active Learner Seats
                          </div>
                          <div>✓ {plan.storageGb} GB Video & CDN Storage</div>
                          {plan.features.slice(0, 3).map((f, i) => (
                            <div key={i}>✓ {f}</div>
                          ))}
                        </div>
                      </div>

                      <div className="pt-4 mt-4 border-t border-surface-border">
                        <Button
                          type="button"
                          variant={isSelected ? "default" : "outline"}
                          size="sm"
                          className="w-full"
                          onClick={() => setSelectedPlanId(plan.id)}
                        >
                          {isSelected ? "Selected" : "Select Tier"}
                        </Button>
                      </div>
                    </div>
                  );
                })}
            </div>

            <div className="p-3 rounded-lg bg-surface-sunken border border-surface-border text-xs text-text-tertiary flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-primary shrink-0" />
              <span>
                Plan tiers and baseline pricing are centrally configured by LMS Platform Administration.
              </span>
            </div>

            <DialogFooter className="pt-2">
              <Button variant="outline" onClick={() => setSwitchPlanModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleConfirmPlanSwitch}>
                Confirm & Switch Plan
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* 3. Org Admin: Add Seats Modal */}
        <Dialog open={addSeatsModalOpen} onOpenChange={setAddSeatsModalOpen}>
          <DialogContent className="w-full max-w-md p-6">
            <DialogHeader>
              <DialogTitle>Add Learner Seat Licenses</DialogTitle>
              <DialogDescription>
                Expand your organization&apos;s active learner capacity instantly.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-3">
              <div className="p-3 rounded-lg bg-surface-sunken border border-surface-border flex items-center justify-between text-xs">
                <span className="text-text-secondary">Current Allocation:</span>
                <span className="font-bold text-text-primary">{orgSub.seatsAllocated} Seats</span>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold">Select Seat Expansion Pack</Label>
                <div className="grid grid-cols-3 gap-2">
                  {[10, 25, 50].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setSeatsToAdd(num)}
                      className={`p-3 rounded-lg border text-center font-bold text-sm transition-all ${
                        seatsToAdd === num
                          ? "border-primary bg-primary/10 text-primary shadow-xs"
                          : "border-surface-border hover:bg-surface-sunken text-text-secondary"
                      }`}
                    >
                      +{num} Seats
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-900 dark:text-emerald-200">
                New Total Capacity: <strong>{orgSub.seatsAllocated + seatsToAdd} Seats</strong>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setAddSeatsModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleConfirmAddSeats}>
                Confirm Seat Addition
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* 4. Org Admin: Update Payment Method Modal */}
        <Dialog open={paymentModalOpen} onOpenChange={setPaymentModalOpen}>
          <DialogContent className="w-full max-w-lg p-6">
            <DialogHeader>
              <DialogTitle>Update Corporate Billing & Payment Method</DialogTitle>
              <DialogDescription>
                Ensure continuous subscription coverage and valid tax invoice delivery.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleConfirmPaymentMethod} className="space-y-4 py-2">
              <div className="space-y-1.5">
                <Label htmlFor="cardholder" className="text-xs font-semibold">
                  Cardholder / Entity Name *
                </Label>
                <Input
                  id="cardholder"
                  placeholder="ESSCIoration Inc."
                  value={paymentForm.cardholderName}
                  onChange={(e) => setPaymentForm({ ...paymentForm, cardholderName: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="cardNum" className="text-xs font-semibold">
                  Card Number *
                </Label>
                <Input
                  id="cardNum"
                  placeholder="4242 •••• •••• 4242"
                  value={paymentForm.last4}
                  onChange={(e) => setPaymentForm({ ...paymentForm, last4: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="exp" className="text-xs font-semibold">
                    Expiration (MM/YY) *
                  </Label>
                  <Input
                    id="exp"
                    placeholder="12/29"
                    value={paymentForm.exp}
                    onChange={(e) => setPaymentForm({ ...paymentForm, exp: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="taxId" className="text-xs font-semibold">
                    Tax ID / VAT No.
                  </Label>
                  <Input
                    id="taxId"
                    placeholder="US-EIN 84-9382109"
                    value={paymentForm.taxId}
                    onChange={(e) => setPaymentForm({ ...paymentForm, taxId: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="billEmail" className="text-xs font-semibold">
                  Billing & Invoice Notification Email *
                </Label>
                <Input
                  id="billEmail"
                  type="email"
                  placeholder="finance@essci.org"
                  value={paymentForm.billingEmail}
                  onChange={(e) => setPaymentForm({ ...paymentForm, billingEmail: e.target.value })}
                  required
                />
              </div>

              <DialogFooter className="pt-2">
                <Button type="button" variant="outline" onClick={() => setPaymentModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  Save Payment Method
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </AppShell>
  );
}
