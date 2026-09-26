import { useState } from "react";
import { Lock, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUsersStore } from "@/lib/store/users-store";
import { useNotificationsStore } from "@/lib/store/notifications-store";
import type { MockUser } from "@/lib/mock/users";

// Section 3.3.F — Cross-Department Lock State UI, verbatim wording from spec.
export function DepartmentLockBanner({
  department,
  course,
  requester,
}: {
  department: string;
  course: { id: string; title: string };
  requester: MockUser;
}) {
  const directory = useUsersStore((s) => s.directory);
  const sendNotification = useNotificationsStore((s) => s.sendNotification);
  const [sent, setSent] = useState(false);

  const owningDeptHead = directory.find(
    (d) => d.org === requester.org && d.department === department && d.role === "dept-head"
  );

  const handleRequest = () => {
    sendNotification({
      recipientIdentifier: owningDeptHead?.email ?? "admin@lms.dev",
      title: "Co-author access requested",
      body: `${requester.name} requested co-author access to "${course.title}" (${department} Department).`,
      org: requester.org,
    });
    setSent(true);
  };

  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-warning/40 bg-warning/10 px-4 py-3 text-sm">
      <p className="text-text-primary flex items-start gap-2">
        <Lock className="w-4 h-4 mt-0.5 shrink-0 text-warning" />
        <span>
          <strong>Read-Only:</strong> This course belongs to the {department} Department.
          Only {department} Instructors or Department Heads can edit it.
        </span>
      </p>
      <Button size="sm" variant="outline" className="shrink-0 gap-1.5" disabled={sent} onClick={handleRequest}>
        {sent ? (
          <>
            <Check className="w-3.5 h-3.5" />
            Request sent
          </>
        ) : (
          "Request Co-Author Access"
        )}
      </Button>
    </div>
  );
}
