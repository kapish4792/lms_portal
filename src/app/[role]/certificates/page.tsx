"use client";

import React, { useState, useMemo } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { useRoleGuard } from "@/lib/hooks/use-role-guard";
import { AppShell } from "@/components/layout/AppShell";
import {
  useCertificatesStore,
  IssuedCertificate,
  CertificateTemplate,
} from "@/lib/store/certificates-store";
import { CertificateView } from "@/components/certificates/CertificateView";
import { CertificateDesigner } from "@/components/certificates/CertificateDesigner";
import { BulkIssueDialog } from "@/components/certificates/BulkIssueDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Award,
  Sparkles,
  Search,
  Filter,
  Plus,
  Printer,
  Eye,
  CheckCircle2,
  Users,
  Palette,
  ShieldCheck,
  FileCheck,
  Calendar,
  XCircle,
  Download,
  SlidersHorizontal,
  X,
} from "lucide-react";

export default function CertificatesPage() {
  const params = useParams<{ role: string }>();
  const searchParams = useSearchParams();
  const initialCertId = searchParams.get("certId");
  const user = useRoleGuard(params.role);

  const issuedCertificates = useCertificatesStore((s) => s.issuedCertificates);
  const templates = useCertificatesStore((s) => s.templates);
  const revokeCertificate = useCertificatesStore((s) => s.revokeCertificate);

  const [activeTab, setActiveTab] = useState<"issued" | "designer">("issued");
  const [search, setSearch] = useState("");
  const [courseFilter, setCourseFilter] = useState("All Certified Courses");
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);

  // Modal for full-size viewing & printing
  const [viewingCertificate, setViewingCertificate] =
    useState<IssuedCertificate | null>(null);

  // Auto-open if query param passed
  React.useEffect(() => {
    if (initialCertId) {
      const found = issuedCertificates.find((c) => c.id === initialCertId);
      if (found) setViewingCertificate(found);
    }
  }, [initialCertId, issuedCertificates]);

  // Handle Learner view vs Management view
  const isLearner = user?.role === "learner";

  // Filtered certificates
  const relevantCertificates = useMemo(() => {
    return issuedCertificates.filter((cert) => {
      // Scoping
      if (isLearner) {
        if (cert.learnerIdentifier !== user?.identifier) return false;
      } else if (user?.role === "instructor") {
        // Instructor sees certs issued by them or for their courses
        if (cert.issuedBy !== user?.identifier && cert.org !== user?.org) {
          return false;
        }
      }

      // Search & Filters
      const matchesSearch =
        !search.trim() ||
        cert.learnerName.toLowerCase().includes(search.toLowerCase()) ||
        cert.courseTitle.toLowerCase().includes(search.toLowerCase()) ||
        cert.certificateId.toLowerCase().includes(search.toLowerCase());

      const matchesCourse =
        courseFilter === "All Certified Courses" || cert.courseId === courseFilter;

      return matchesSearch && matchesCourse;
    });
  }, [issuedCertificates, isLearner, user, search, courseFilter]);

  // Derived courses for filter
  const uniqueCourses = useMemo(() => {
    const list = Array.from(
      new Set(
        issuedCertificates.map((c) =>
          JSON.stringify({ id: c.courseId, title: c.courseTitle })
        )
      )
    ).map((item) => JSON.parse(item));
    return list;
  }, [issuedCertificates]);

  if (!user) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <AppShell user={user}>
      <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-text-primary flex items-center gap-2.5">
              <Award className="w-7 h-7 text-primary" />
              {isLearner
                ? "My Credentials & Certificates"
                : "Course Certifications & Issuance"}
            </h1>
            <p className="text-xs sm:text-sm text-text-secondary mt-1">
              {isLearner
                ? "View, verify, and print your officially accredited course completion certificates."
                : "Design certificate templates, issue individual credentials, or batch-issue in bulk to completed learners."}
            </p>
          </div>

          {/* Action CTAs for Management Roles */}
          {!isLearner && (
            <div className="flex items-center gap-2.5 shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveTab(activeTab === "designer" ? "issued" : "designer")}
                className="text-xs font-semibold border-surface-border hover:bg-surface-sunken"
              >
                <Palette className="w-4 h-4 mr-1.5 text-primary" />
                {activeTab === "designer" ? "View Issued List" : "Certificate Designer"}
              </Button>

              <Button
                size="sm"
                onClick={() => setBulkDialogOpen(true)}
                className="text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm cursor-pointer"
              >
                <Users className="w-4 h-4 mr-1.5" /> Bulk Issue Certificates
              </Button>
            </div>
          )}
        </div>

        {/* KPI / Overview Summary Bar */}
        {!isLearner && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Card className="border-surface-border bg-surface-base">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xl font-extrabold text-text-primary">
                    {issuedCertificates.length}
                  </p>
                  <p className="text-[11px] text-text-tertiary">Total Issued</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-surface-border bg-surface-base">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xl font-extrabold text-text-primary">
                    {issuedCertificates.filter((c) => c.status === "active").length}
                  </p>
                  <p className="text-[11px] text-text-tertiary">Active Credentials</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-surface-border bg-surface-base">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center font-bold">
                  <Palette className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xl font-extrabold text-text-primary">
                    {templates.length}
                  </p>
                  <p className="text-[11px] text-text-tertiary">Design Templates</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-surface-border bg-surface-base">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
                  <FileCheck className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xl font-extrabold text-text-primary">
                    {uniqueCourses.length}
                  </p>
                  <p className="text-[11px] text-text-tertiary">Certified Courses</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tab View Switcher (for Admins) */}
        {!isLearner && (
          <div className="flex items-center gap-2 border-b border-surface-border pb-1">
            <button
              type="button"
              onClick={() => setActiveTab("issued")}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                activeTab === "issued"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-text-secondary hover:text-text-primary hover:bg-surface-sunken"
              }`}
            >
              Issued Certificates Registry ({relevantCertificates.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("designer")}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                activeTab === "designer"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-text-secondary hover:text-text-primary hover:bg-surface-sunken"
              }`}
            >
              Certificate Template Designer
            </button>
          </div>
        )}

        {/* ──────── TAB 1: ISSUED CERTIFICATES (OR LEARNER VIEW) ──────── */}
        {(isLearner || activeTab === "issued") && (
          <div className="space-y-4">
            {/* Search & Course Filter Bar */}
            <div className="flex items-center gap-3 flex-wrap rounded-xl border border-surface-border bg-surface-sunken/40 p-3">
              <div className="relative flex-1 min-w-55 sm:max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-tertiary" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by learner, course, or ID..."
                  className="h-9 pl-9 bg-surface-base"
                />
              </div>

              <div className="hidden sm:block h-6 w-px bg-surface-border" />

              <div className="flex items-center gap-2 flex-wrap">
                <SlidersHorizontal className="hidden sm:block w-3.5 h-3.5 text-text-tertiary shrink-0" />
                <Select value={courseFilter} onValueChange={(v) => setCourseFilter(v ?? "All Certified Courses")}>
                  <SelectTrigger size="sm" className="w-56 bg-surface-base">
                    <SelectValue placeholder="All Certified Courses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All Certified Courses">All Certified Courses</SelectItem>
                    {uniqueCourses.map((c: any) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {(search || courseFilter !== "All Certified Courses") && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-9 gap-1.5 text-text-tertiary hover:text-text-primary"
                    onClick={() => {
                      setSearch("");
                      setCourseFilter("All Certified Courses");
                    }}
                  >
                    <X className="w-3.5 h-3.5" />
                    Clear
                  </Button>
                )}
              </div>
            </div>

            {/* ──────── LEARNER GRID VIEW ──────── */}
            {isLearner ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {relevantCertificates.map((cert) => (
                  <Card
                    key={cert.id}
                    className="border-surface-border bg-surface-base hover:border-primary/40 hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col justify-between"
                  >
                    <div>
                      {/* Mini Certificate Card Header */}
                      <div className="p-4 bg-linear-to-r from-primary/10 via-brand-50/10 to-surface-sunken border-b border-surface-border flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-white shadow-xs font-bold"
                            style={{
                              backgroundColor:
                                cert.templateSnapshot?.accentColor || "#6366f1",
                            }}
                          >
                            <Award className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-primary block">
                              {cert.org}
                            </span>
                            <span className="text-xs font-mono font-bold text-text-primary">
                              {cert.certificateId}
                            </span>
                          </div>
                        </div>

                        <Badge
                          variant="outline"
                          className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px] font-bold"
                        >
                          <CheckCircle2 className="w-3 h-3 mr-1" /> Validated
                        </Badge>
                      </div>

                      {/* Card Content */}
                      <div className="p-5 space-y-3">
                        <h3 className="font-bold text-base text-text-primary leading-snug line-clamp-2">
                          {cert.courseTitle}
                        </h3>

                        <div className="text-xs text-text-secondary space-y-1">
                          <p className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-text-tertiary" />
                            Completed on{" "}
                            <strong className="text-text-primary">
                              {cert.completionDate}
                            </strong>
                          </p>
                          <p className="flex items-center gap-1.5 truncate">
                            <ShieldCheck className="w-3.5 h-3.5 text-text-tertiary" />
                            Issued by {cert.issuedByName} ({cert.issuedByRole})
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Card Actions */}
                    <div className="p-4 pt-0 border-t border-surface-border/60 mt-3 flex items-center justify-end gap-2 pt-3">
                      <Button
                        size="sm"
                        onClick={() => setViewingCertificate(cert)}
                        className="w-full text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5 mr-1.5" /> View & Print Certificate
                      </Button>
                    </div>
                  </Card>
                ))}

                {relevantCertificates.length === 0 && (
                  <div className="col-span-full py-16 text-center space-y-3 bg-surface-sunken/40 rounded-2xl border border-surface-border">
                    <Award className="w-10 h-10 text-text-tertiary mx-auto" />
                    <h3 className="text-base font-semibold text-text-primary">
                      No Certificates Earned Yet
                    </h3>
                    <p className="text-xs text-text-secondary max-w-sm mx-auto">
                      Complete all curriculum lessons in your enrolled courses to become eligible for instructor certificate issuance.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              /* ──────── ADMIN & INSTRUCTOR REGISTRY TABLE ──────── */
              <div className="border border-surface-border rounded-xl overflow-hidden bg-surface-base shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-surface-sunken text-text-tertiary font-bold uppercase tracking-wider text-[10px] border-b border-surface-border">
                      <tr>
                        <th className="p-3.5">Learner</th>
                        <th className="p-3.5">Course Title</th>
                        <th className="p-3.5">Certificate ID</th>
                        <th className="p-3.5">Template Style</th>
                        <th className="p-3.5">Issued Date</th>
                        <th className="p-3.5">Issuer</th>
                        <th className="p-3.5">Status</th>
                        <th className="p-3.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-border text-text-secondary">
                      {relevantCertificates.map((cert) => (
                        <tr
                          key={cert.id}
                          className="hover:bg-surface-sunken/50 transition-colors"
                        >
                          <td className="p-3.5 font-bold text-text-primary">
                            <div>
                              <span>{cert.learnerName}</span>
                              <span className="block text-[10px] text-text-tertiary font-normal">
                                {cert.learnerIdentifier}
                              </span>
                            </div>
                          </td>
                          <td className="p-3.5 max-w-xs truncate font-medium text-text-primary">
                            {cert.courseTitle}
                          </td>
                          <td className="p-3.5 font-mono text-[11px] font-bold text-primary">
                            {cert.certificateId}
                          </td>
                          <td className="p-3.5 capitalize font-medium">
                            <Badge
                              variant="secondary"
                              className="text-[10px] uppercase font-bold"
                            >
                              {cert.templateSnapshot?.style || "classic"}
                            </Badge>
                          </td>
                          <td className="p-3.5 font-mono text-[11px]">
                            {cert.issuedAt.split("T")[0]}
                          </td>
                          <td className="p-3.5">
                            <span className="text-text-primary font-medium">
                              {cert.issuedByName}
                            </span>
                            <span className="block text-[10px] text-text-tertiary">
                              {cert.issuedByRole}
                            </span>
                          </td>
                          <td className="p-3.5">
                            {cert.status === "active" ? (
                              <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[10px] font-bold">
                                Active
                              </Badge>
                            ) : (
                              <Badge
                                variant="destructive"
                                className="text-[10px] font-bold"
                              >
                                Revoked
                              </Badge>
                            )}
                          </td>
                          <td className="p-3.5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setViewingCertificate(cert)}
                                className="h-7 text-xs font-semibold"
                              >
                                <Eye className="w-3.5 h-3.5 mr-1" /> View
                              </Button>

                              {cert.status === "active" && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => revokeCertificate(cert.id)}
                                  className="h-7 text-xs text-danger hover:bg-danger/10"
                                  title="Revoke Certificate"
                                >
                                  Revoke
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}

                      {relevantCertificates.length === 0 && (
                        <tr>
                          <td
                            colSpan={8}
                            className="p-8 text-center text-text-tertiary text-xs"
                          >
                            No matching certificate records found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ──────── TAB 2: CERTIFICATE DESIGNER (ADMIN/INSTRUCTOR) ──────── */}
        {!isLearner && activeTab === "designer" && (
          <CertificateDesigner
            org={user.org}
            onSelectForIssue={() => {
              setActiveTab("issued");
              setBulkDialogOpen(true);
            }}
          />
        )}

        {/* ──────── BULK ISSUE DIALOG ──────── */}
        <BulkIssueDialog
          open={bulkDialogOpen}
          onOpenChange={setBulkDialogOpen}
          user={user}
          onIssued={() => {
            setActiveTab("issued");
          }}
        />

        {/* ──────── FULL-SIZE VIEW & PRINT MODAL ──────── */}
        {viewingCertificate && (
          <Dialog
            open={!!viewingCertificate}
            onOpenChange={(open) => !open && setViewingCertificate(null)}
          >
            <DialogContent className="max-w-4xl p-4 sm:p-6 print:p-0 print:border-none print:max-w-full">
              <DialogHeader className="flex flex-row items-center justify-between pb-2 border-b border-surface-border print:hidden">
                <DialogTitle className="text-sm font-bold flex items-center gap-2">
                  <Award className="w-4 h-4 text-primary" /> Verified Certificate (
                  {viewingCertificate.certificateId})
                </DialogTitle>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    onClick={handlePrint}
                    className="text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5 mr-1.5" /> Print / Save as PDF
                  </Button>
                </div>
              </DialogHeader>

              {/* Certificate Component in Print/Preview Mode */}
              <div className="py-4">
                <CertificateView certificate={viewingCertificate} />
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </AppShell>
  );
}
