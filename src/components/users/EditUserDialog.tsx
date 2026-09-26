"use client";

import { useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
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
import { DatePicker } from "@/components/ui/date-picker";
import { useUsersStore } from "@/lib/store/users-store";
import type { DirectoryUser, UpdateUserInput } from "@/lib/store/users-store";
import { useGroupsStore } from "@/lib/store/groups-store";
import { useOrganizationsStore } from "@/lib/store/organizations-store";
import type { Role } from "@/lib/mock/users";
import { ROLE_LABELS } from "@/lib/permissions";

const DEPARTMENTS = ["Engineering", "Sales", "HR", "Finance"];
const ASSIGNABLE_ROLES: Role[] = ["org-admin", "dept-head", "instructor", "manager", "learner"];
const LMS_ADMIN_ROLE: Role = "lms-admin";

interface EditUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: DirectoryUser | null;
  currentUserRole: string;
  currentUserOrg: string;
}

export function EditUserDialog({
  open,
  onOpenChange,
  user,
  currentUserRole,
  currentUserOrg,
}: EditUserDialogProps) {
  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <EditUserFormContent
        key={user?.id ?? "new"}
        user={user}
        currentUserRole={currentUserRole}
        currentUserOrg={currentUserOrg}
        onOpenChange={onOpenChange}
      />
    </Dialog>
  );
}

interface EditUserFormContentProps {
  user: DirectoryUser | null;
  currentUserRole: string;
  currentUserOrg: string;
  onOpenChange: (open: boolean) => void;
}

function EditUserFormContent({
  user,
  currentUserRole,
  currentUserOrg,
  onOpenChange,
}: EditUserFormContentProps) {
  const addUser = useUsersStore((s) => s.addUser);
  const updateUser = useUsersStore((s) => s.updateUser);
  const allGroups = useGroupsStore((s) => s.groups);
  const updateGroup = useGroupsStore((s) => s.updateGroup);
  const organizations = useOrganizationsStore((s) => s.organizations);
  const directory = useUsersStore((s) => s.directory);

  const lmsAdminExists = useMemo(
    () => directory.some((u) => u.role === LMS_ADMIN_ROLE && u.id !== user?.id),
    [directory, user?.id]
  );
  const assignableRoles = useMemo(
    () => (lmsAdminExists ? ASSIGNABLE_ROLES : [...ASSIGNABLE_ROLES, LMS_ADMIN_ROLE]),
    [lmsAdminExists]
  );

  const isEditing = Boolean(user);
  const isLmsAdmin = currentUserRole === "lms-admin" || currentUserRole === "super-admin";

  const [firstName, setFirstName] = useState(user?.firstName ?? "");
  const [lastName, setLastName] = useState(user?.lastName ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [username, setUsername] = useState(user?.username ?? "");
  const [dob, setDob] = useState(user?.dob ?? "");
  const [autoPassword, setAutoPassword] = useState(true);
  const [role, setRole] = useState<Role>(user?.role ?? (lmsAdminExists ? "learner" : LMS_ADMIN_ROLE));
  const [department, setDepartment] = useState<string>(user?.department ?? DEPARTMENTS[0]);
  const [org, setOrg] = useState<string>(user?.org ?? currentUserOrg);
  const [status, setStatus] = useState<"Active" | "Suspended">(user?.status ?? "Active");
  const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>(user?.groupIds ?? []);

  const groups = useMemo(
    () => allGroups.filter((g) => g.org === org && !g.rule),
    [allGroups, org]
  );

  const canSubmit = firstName.trim() && lastName.trim() && email.trim() && username.trim();

  const handleSubmit = () => {
    if (!canSubmit) return;
    if (role === LMS_ADMIN_ROLE) {
      const existingLmsAdmin = directory.find((u) => u.role === LMS_ADMIN_ROLE && u.id !== user?.id);
      if (existingLmsAdmin) {
        alert("Only one LMS Administrator can exist. An LMS Admin already exists in the system.");
        return;
      }
    }
    const patch: UpdateUserInput = {
      firstName,
      lastName,
      email,
      username,
      role,
      department,
      org,
      status,
      groupIds: selectedGroupIds,
      dob: dob || undefined,
    };
    if (user) {
      updateUser(user.id, patch);
    } else {
      const newUserId = addUser({
        firstName,
        lastName,
        email,
        username,
        role,
        department,
        org,
        groupIds: selectedGroupIds,
        dob: dob || undefined,
      });
      selectedGroupIds.forEach((groupId) => {
        const group = groups.find((g) => g.id === groupId);
        if (group) updateGroup(groupId, { memberIds: [...group.memberIds, newUserId] });
      });
    }
    onOpenChange(false);
  };

  const toggleGroup = (id: string) =>
    setSelectedGroupIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  return (
    <DialogContent className="max-w-2xl sm:max-w-3xl p-6 sm:p-8 max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit User" : "Add User"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the user's details, role, department, organization, and group assignments."
              : "This assigns the exact role, personal details, and authorized modules for the user's dedicated login."}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto pr-1">
          {/* 2-Column Desktop Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-2">
            {/* Col 1: First Name */}
            <div className="space-y-1.5">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                placeholder="e.g. Jane"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                autoFocus
              />
            </div>

            {/* Col 2: Last Name */}
            <div className="space-y-1.5">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                placeholder="e.g. Doe"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>

            {/* Col 1: Email */}
            <div className="space-y-1.5">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="jane.doe@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {/* Col 2: Username */}
            <div className="space-y-1.5">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                placeholder="jane.doe"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            {/* Col 1: Date of Birth (DOB) with Shadcn DatePicker */}
            <div className="space-y-1.5">
              <Label htmlFor="dob">Date of Birth</Label>
              <DatePicker
                id="dob"
                value={dob}
                onChange={setDob}
                placeholder="Select date of birth"
              />
            </div>

            {/* Col 2: Base Role */}
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

            {/* Col 1: Department */}
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

            {/* Col 2: Status (if editing) or Organization (if LMS admin) */}
            {isEditing ? (
              <div className="space-y-1.5">
                <Label>Account Status</Label>
                <Select value={status} onValueChange={(v) => setStatus(v as "Active" | "Suspended")}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            ) : isLmsAdmin ? (
              <div className="space-y-1.5">
                <Label>Organization</Label>
                <Select value={org} onValueChange={(v) => setOrg(v ?? "")}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select organization..." />
                  </SelectTrigger>
                  <SelectContent>
                    {organizations.map((o) => (
                      <SelectItem key={o.id} value={o.name}>
                        {o.name} ({o.subdomain})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div className="space-y-1.5 opacity-60">
                <Label>Organization</Label>
                <Input value={org} disabled className="bg-surface-sunken" />
              </div>
            )}

            {/* Organization for LMS Admin when editing */}
            {isEditing && isLmsAdmin && (
              <div className="space-y-1.5 md:col-span-2">
                <Label>Organization</Label>
                <Select value={org} onValueChange={(v) => setOrg(v ?? "")}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select organization..." />
                  </SelectTrigger>
                  <SelectContent>
                    {organizations.map((o) => (
                      <SelectItem key={o.id} value={o.name}>
                        {o.name} ({o.subdomain})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-text-tertiary">
                  LMS Admin can move users across organizations
                </p>
              </div>
            )}

            {/* Auto-generate password switch (when adding user) */}
            {!isEditing && (
              <div className="md:col-span-2 flex items-center justify-between rounded-lg border border-surface-border px-3.5 py-3 bg-surface-sunken/40">
                <div>
                  <p className="text-sm font-medium text-text-primary">Auto-generate password</p>
                  <p className="text-xs text-text-tertiary">A secure activation link and password will be emailed to the user.</p>
                </div>
                <Switch checked={autoPassword} onCheckedChange={(checked: boolean) => setAutoPassword(checked)} />
              </div>
            )}

            {/* Group Assignment (Full width) */}
            <div className="space-y-2 md:col-span-2 pt-1 border-t border-surface-border/60">
              <Label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Group Assignment</Label>
              {groups.length === 0 ? (
                <p className="text-xs text-text-tertiary">No static groups exist yet for this organization.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-36 overflow-y-auto p-1">
                  {groups.map((g) => (
                    <label
                      key={g.id}
                      className="flex items-center gap-2.5 text-sm p-2 rounded-lg border border-surface-border hover:bg-surface-sunken cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={selectedGroupIds.includes(g.id)}
                        onChange={() => toggleGroup(g.id)}
                        className="rounded border-surface-border text-primary focus:ring-primary/20"
                      />
                      <span className="truncate">{g.name}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="flex-row gap-2 pt-4 border-t border-surface-border">
          <Button variant="outline" className="flex-1 sm:flex-none" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button className="flex-1 sm:flex-none" disabled={!canSubmit} onClick={handleSubmit}>
            {isEditing ? "Save Changes" : "Add User"}
          </Button>
        </DialogFooter>
      </DialogContent>
  );
}