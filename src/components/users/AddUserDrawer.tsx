"use client";

import { useMemo, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
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
import { useUsersStore } from "@/lib/store/users-store";
import type { DirectoryUser } from "@/lib/store/users-store";
import { useGroupsStore } from "@/lib/store/groups-store";
import type { Role } from "@/lib/mock/users";
import { ROLE_LABELS } from "@/lib/permissions";

const DEPARTMENTS = ["Engineering", "Sales", "HR", "Finance"];
const ASSIGNABLE_ROLES: Role[] = ["org-admin", "dept-head", "instructor", "manager", "learner"];

const LMS_ADMIN_ROLE: Role = "lms-admin";

// Section 3.5's 2-Step Add User flow: Step 1 (Super Admin org-scoping prompt)
// is handled by the caller; this is Step 2, the Add User drawer itself —
// captures the fields that determine the new account's dedicated-login role.
export function AddUserDrawer({
  open,
  onOpenChange,
  org,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  org: string;
}) {
  const addUser = useUsersStore((s) => s.addUser);
  const allGroups = useGroupsStore((s) => s.groups);
  const groups = useMemo(() => allGroups.filter((g) => g.org === org && !g.rule), [allGroups, org]);
  const updateGroup = useGroupsStore((s) => s.updateGroup);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [autoPassword, setAutoPassword] = useState(true);
  const [role, setRole] = useState<Role>("learner");
  const [department, setDepartment] = useState<string>(DEPARTMENTS[0]);
  const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>([]);

  const lmsAdminExists = useUsersStore((s) => s.directory.some((u) => u.role === LMS_ADMIN_ROLE));
  const assignableRoles = useMemo(
    () => (lmsAdminExists ? ASSIGNABLE_ROLES : [...ASSIGNABLE_ROLES, LMS_ADMIN_ROLE]),
    [lmsAdminExists]
  );

  const reset = () => {
    setFirstName("");
    setLastName("");
    setEmail("");
    setUsername("");
    setAutoPassword(true);
    setRole(lmsAdminExists ? "learner" : LMS_ADMIN_ROLE);
    setDepartment(DEPARTMENTS[0]);
    setSelectedGroupIds([]);
  };

  const toggleGroup = (id: string) =>
    setSelectedGroupIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const canSubmit = firstName.trim() && lastName.trim() && email.trim() && username.trim();

  const handleSubmit = () => {
    if (!canSubmit) return;
    if (role === LMS_ADMIN_ROLE) {
      const existingLmsAdmin = useUsersStore.getState().directory.find((u) => u.role === LMS_ADMIN_ROLE);
      if (existingLmsAdmin) {
        alert("Only one LMS Administrator can exist. An LMS Admin already exists in the system.");
        return;
      }
    }
    const user: Omit<DirectoryUser, "id" | "registeredAt" | "status"> = {
      firstName,
      lastName,
      email,
      username,
      role,
      department,
      org,
      groupIds: selectedGroupIds,
    };
    const newUserId = addUser(user);
    selectedGroupIds.forEach((groupId) => {
      const group = groups.find((g) => g.id === groupId);
      if (group) updateGroup(groupId, { memberIds: [...group.memberIds, newUserId] });
    });
    reset();
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Add User</SheetTitle>
          <SheetDescription>
            This assigns the exact role and authorized modules the new user&apos;s
            dedicated login will land on.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="firstName">First Name</Label>
              <Input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} autoFocus />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="lastName">Last Name</Label>
              <Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="username">Username</Label>
            <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} />
          </div>

          <div className="flex items-center justify-between rounded-lg border border-surface-border px-3 py-2.5">
            <div>
              <p className="text-sm font-medium text-text-primary">Auto-generate password</p>
              <p className="text-xs text-text-tertiary">Sent to the user&apos;s email on account creation</p>
            </div>
            <Switch checked={autoPassword} onCheckedChange={(checked: boolean) => setAutoPassword(checked)} />
          </div>

          <div className="space-y-1.5">
            <Label>Base Role</Label>
            <Select value={role} onValueChange={(v) => setRole(v as Role)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {assignableRoles.map((r) => (
                  <SelectItem key={r} value={r}>
                    {ROLE_LABELS[r]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Department</Label>
            <Select value={department} onValueChange={(v) => setDepartment(v ?? DEPARTMENTS[0])}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DEPARTMENTS.map((d) => (
                  <SelectItem key={d} value={d}>
                    {d}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Group Assignment</Label>
            {groups.length === 0 ? (
              <p className="text-xs text-text-tertiary">No static groups exist yet for this organization.</p>
            ) : (
              <div className="space-y-1">
                {groups.map((g) => (
                  <label key={g.id} className="flex items-center gap-2 text-sm px-2 py-1.5 rounded-md hover:bg-surface-sunken">
                    <input type="checkbox" checked={selectedGroupIds.includes(g.id)} onChange={() => toggleGroup(g.id)} />
                    {g.name}
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>

        <SheetFooter className="flex-row gap-2">
          <SheetClose render={<Button variant="outline" className="flex-1" />}>Cancel</SheetClose>
          <Button className="flex-1" disabled={!canSubmit} onClick={handleSubmit}>
            Add User
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
