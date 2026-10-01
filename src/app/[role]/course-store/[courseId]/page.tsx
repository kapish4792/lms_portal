"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useRoleGuard } from "@/lib/hooks/use-role-guard";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCoursesStore } from "@/lib/store/courses-store";
import { useApprovalsStore } from "@/lib/store/approvals-store";
import { useUsersStore } from "@/lib/store/users-store";
import { useNotificationsStore } from "@/lib/store/notifications-store";
import { Star, ChevronDown, Users2, Ticket } from "lucide-react";

type RedemptionMode = "license-key" | "csv-invite";

export default function CourseLandingPage() {
  const params = useParams<{ role: string; courseId: string }>();
  const router = useRouter();
  const user = useRoleGuard(params.role);
  const courses = useCoursesStore((s) => s.courses);
  const course = useMemo(() => courses.find((c) => c.id === params.courseId), [courses, params.courseId]);
  const requestAccess = useApprovalsStore((s) => s.requestAccess);
  const requests = useApprovalsStore((s) => s.requests);
  const directory = useUsersStore((s) => s.directory);
  const sendNotification = useNotificationsStore((s) => s.sendNotification);

  const [bulkOpen, setBulkOpen] = useState(false);
  const [seatQty, setSeatQty] = useState(10);
  const [mode, setMode] = useState<RedemptionMode>("license-key");
  const [csvEmails, setCsvEmails] = useState("");
  const [licenseKey, setLicenseKey] = useState<string | null>(null);
  const [claimedSeats, setClaimedSeats] = useState<{ total: number; claimed: number } | null>(null);

  if (!user) return null;
  if (!course) {
    return (
      <AppShell user={user}>
        <p className="p-6 text-text-secondary">Course not found.</p>
      </AppShell>
    );
  }

  const enrollmentType = course.enrollmentType ?? "open";
  const alreadyRequested = requests.some(
    (r) => r.courseId === course.id && r.requesterName === user.name && r.status === "pending"
  );

  const handleEnroll = () => {
    if (enrollmentType === "open") {
      router.push(`/${user.role}/courses/${course.id}/player`);
      return;
    }
    requestAccess({ requesterName: user.name, courseId: course.id, courseTitle: course.title, org: user.org });
    const manager = directory.find(
      (d) => d.org === user.org && d.department === user.department && d.role === "manager"
    );
    sendNotification({
      recipientIdentifier: manager?.email ?? "manager@lms.dev",
      title: "Enrollment request pending",
      body: `${user.name} requested enrollment in "${course.title}".`,
      org: user.org,
    });
  };

  const generateLicenseKey = () => {
    const code = `${course.category.slice(0, 3).toUpperCase()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    setLicenseKey(code);
    setClaimedSeats({ total: seatQty, claimed: 0 });
  };

  const sendCsvInvites = () => {
    const emails = csvEmails.split(/[\n,]/).map((e) => e.trim()).filter(Boolean);
    setClaimedSeats({ total: seatQty, claimed: emails.length });
    setBulkOpen(false);
  };

  return (
    <AppShell user={user}>
      <div className="p-6 grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 max-w-5xl">
        <div className="space-y-4">
          <div>
            {course.rating && (
              <span className="flex items-center gap-1 text-sm text-text-secondary mb-1">
                <Star className="w-4 h-4 fill-warning text-warning" />
                {course.rating.toFixed(1)} rating · {course.enrolled} enrolled
              </span>
            )}
            <h1 className="text-2xl font-bold text-text-primary">{course.title}</h1>
            <p className="text-text-secondary mt-2">{course.category}</p>
          </div>

          {course.coverImage && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={course.coverImage} alt={course.title} className="w-full rounded-xl border border-surface-border" />
          )}

          <Card className="border-surface-border shadow-card">
            <CardHeader>
              <CardTitle className="text-base">What you&apos;ll learn</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="grid sm:grid-cols-2 gap-2 text-sm text-text-secondary list-disc pl-4">
                {course.objectives.map((o, i) => (
                  <li key={i}>{o}</li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="border-surface-border shadow-card">
            <CardHeader>
              <CardTitle className="text-base">Syllabus</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {course.sections.map((section) => (
                <details key={section.id} className="rounded-lg border border-surface-border group" open>
                  <summary className="flex items-center justify-between px-3 py-2 cursor-pointer text-sm font-medium text-text-primary">
                    {section.title}
                    <ChevronDown className="w-4 h-4 text-text-tertiary transition-transform group-open:rotate-180" />
                  </summary>
                  <ul className="px-3 pb-2 space-y-1">
                    {section.lessons.map((l) => (
                      <li key={l.id} className="text-sm text-text-secondary pl-2">
                        · {l.title}
                      </li>
                    ))}
                  </ul>
                </details>
              ))}
            </CardContent>
          </Card>

          <Card className="border-surface-border shadow-card">
            <CardHeader>
              <CardTitle className="text-base">Reviews</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-text-tertiary">
                Review governance (Section 3.6.E) isn&apos;t built yet — this is a placeholder.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4 lg:sticky lg:top-6 h-fit">
          <Card className="border-surface-border shadow-card">
            <CardContent className="p-4 space-y-3">
              <p className="text-2xl font-bold text-text-primary">
                {(course.price ?? 0) === 0 ? "Free" : `$${course.price}`}
              </p>
              {enrollmentType !== "open" && (
                <Badge variant="outline">
                  {enrollmentType === "gated" ? "Seat-limited" : "Requires approval"}
                </Badge>
              )}
              <Button
                className="w-full"
                disabled={enrollmentType !== "open" && alreadyRequested}
                onClick={handleEnroll}
              >
                {enrollmentType === "open" ? "Enroll now" : alreadyRequested ? "Request pending" : "Request access"}
              </Button>
              {enrollmentType !== "open" && !alreadyRequested && (
                <p className="text-xs text-text-tertiary text-center">
                  Sent to your Manager or Department Head for approval.
                </p>
              )}
            </CardContent>
          </Card>

          {user.role !== "learner" && (
            <Card className="border-surface-border shadow-card">
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Users2 className="w-4 h-4" />
                  Bulk seat licensing
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {claimedSeats && (
                  <p className="text-sm text-text-secondary">
                    {claimedSeats.claimed} of {claimedSeats.total} seats claimed
                  </p>
                )}
                {licenseKey && (
                  <p className="text-xs font-mono bg-surface-sunken rounded px-2 py-1 flex items-center gap-1.5">
                    <Ticket className="w-3.5 h-3.5 shrink-0" />
                    {licenseKey}
                  </p>
                )}
                <Button variant="outline" size="sm" className="w-full" onClick={() => setBulkOpen(true)}>
                  Purchase seats
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <Dialog open={bulkOpen} onOpenChange={setBulkOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bulk purchase seats</DialogTitle>
            <DialogDescription>Buy a block of seats and distribute access to your team.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <label className="text-sm text-text-secondary">
              Seat quantity
              <Input
                type="number"
                min={1}
                value={seatQty}
                onChange={(e) => setSeatQty(Number(e.target.value))}
                className="mt-1"
              />
            </label>
            <Select value={mode} onValueChange={(v) => setMode((v ?? "license-key") as RedemptionMode)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="license-key">License key (self-redeem)</SelectItem>
                <SelectItem value="csv-invite">CSV invite (auto-enroll)</SelectItem>
              </SelectContent>
            </Select>
            {mode === "csv-invite" && (
              <Input
                placeholder="email1@essci.org, email2@essci.org"
                value={csvEmails}
                onChange={(e) => setCsvEmails(e.target.value)}
              />
            )}
          </div>
          <DialogFooter>
            <Button
              onClick={() => {
                if (mode === "license-key") {
                  generateLicenseKey();
                  setBulkOpen(false);
                } else {
                  sendCsvInvites();
                }
              }}
            >
              {mode === "license-key" ? "Generate license key" : "Send invites"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
