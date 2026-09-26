"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGroupsStore } from "@/lib/store/groups-store";
import type { Group, GroupRule } from "@/lib/store/groups-store";
import { useUsersStore } from "@/lib/store/users-store";
import { useCoursesStore } from "@/lib/store/courses-store";
import type { MockUser } from "@/lib/mock/users";
import { ROLE_LABELS } from "@/lib/permissions";

const DEPARTMENTS = ["Engineering", "Sales", "HR", "Finance"];

export function GroupForm({ user, existing }: { user: MockUser; existing?: Group }) {
  const router = useRouter();
  const addGroup = useGroupsStore((s) => s.addGroup);
  const updateGroup = useGroupsStore((s) => s.updateGroup);
  const allDirectory = useUsersStore((s) => s.directory);
  const allCourses = useCoursesStore((s) => s.courses);
  const directory = useMemo(() => allDirectory.filter((d) => d.org === user.org), [allDirectory, user.org]);
  const courses = useMemo(() => allCourses.filter((c) => c.org === user.org), [allCourses, user.org]);

  const [name, setName] = useState(existing?.name ?? "");
  const [department, setDepartment] = useState(existing?.department ?? DEPARTMENTS[0]);
  const [useRule, setUseRule] = useState(!!existing?.rule);
  const [ruleField, setRuleField] = useState<GroupRule["field"]>(existing?.rule?.field ?? "department");
  const [ruleValue, setRuleValue] = useState(existing?.rule?.value ?? DEPARTMENTS[0]);
  const [memberIds, setMemberIds] = useState<string[]>(existing?.memberIds ?? []);
  const [courseIds, setCourseIds] = useState<string[]>(existing?.courseIds ?? []);

  const toggleMember = (id: string) =>
    setMemberIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  const toggleCourse = (id: string) =>
    setCourseIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const handleSave = () => {
    const payload = {
      name: name || "Untitled group",
      org: user.org,
      department,
      memberIds: useRule ? [] : memberIds,
      courseIds,
      rule: useRule ? { field: ruleField, value: ruleValue } : undefined,
    };
    if (existing) updateGroup(existing.id, payload);
    else addGroup(payload);
    router.push(`/${user.role}/groups`);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <Card className="border-surface-border shadow-card">
        <CardHeader>
          <CardTitle className="text-base">Group Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Q3 Sales Onboarding" />
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
        </CardContent>
      </Card>

      <Card className="border-surface-border shadow-card">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Membership</CardTitle>
          <label className="flex items-center gap-2 text-sm text-text-secondary">
            Dynamic rule-based
            <Switch checked={useRule} onCheckedChange={(c: boolean) => setUseRule(c)} />
          </label>
        </CardHeader>
        <CardContent>
          {useRule ? (
            <div className="flex items-center gap-2">
              <Select value={ruleField} onValueChange={(v) => setRuleField((v ?? "department") as GroupRule["field"])}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="department">Department</SelectItem>
                  <SelectItem value="role">Role</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-sm text-text-tertiary">equals</span>
              <Select value={ruleValue} onValueChange={(v) => setRuleValue(v ?? "")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(ruleField === "department" ? DEPARTMENTS : Object.keys(ROLE_LABELS)).map((v) => (
                    <SelectItem key={v} value={v}>
                      {ruleField === "role" ? ROLE_LABELS[v as keyof typeof ROLE_LABELS] : v}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <div className="max-h-56 overflow-y-auto space-y-1.5">
              {directory.map((d) => (
                <label key={d.id} className="flex items-center gap-2 text-sm px-2 py-1.5 rounded-md hover:bg-surface-sunken">
                  <input type="checkbox" checked={memberIds.includes(d.id)} onChange={() => toggleMember(d.id)} />
                  {d.firstName} {d.lastName} <span className="text-text-tertiary">· {d.email}</span>
                </label>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-surface-border shadow-card">
        <CardHeader>
          <CardTitle className="text-base">Assigned Courses (auto-enrollment)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1.5">
          {courses.map((c) => (
            <label key={c.id} className="flex items-center gap-2 text-sm px-2 py-1.5 rounded-md hover:bg-surface-sunken">
              <input type="checkbox" checked={courseIds.includes(c.id)} onChange={() => toggleCourse(c.id)} />
              {c.title}
            </label>
          ))}
        </CardContent>
      </Card>

      <Button onClick={handleSave}>Save group</Button>
    </div>
  );
}
