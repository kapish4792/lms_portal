"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { useRoleGuard } from "@/lib/hooks/use-role-guard";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useNotificationsStore } from "@/lib/store/notifications-store";
import { Bell, Plus, Edit, Trash2, Save, X, ChevronDown } from "lucide-react";

export default function NotificationsSettingsPage() {
  const params = useParams<{ role: string }>();
  const user = useRoleGuard(params.role);
  const allTriggers = useNotificationsStore((s) => s.triggers);
  const allInbox = useNotificationsStore((s) => s.inbox);
  const toggleTrigger = useNotificationsStore((s) => s.toggleTrigger);
  const addTrigger = useNotificationsStore((s) => s.addTrigger);
  const updateTrigger = useNotificationsStore((s) => s.updateTrigger);
  const deleteTrigger = useNotificationsStore((s) => s.deleteTrigger);

  const triggers = useMemo(() => allTriggers.filter((t) => t.org === user?.org), [allTriggers, user?.org]);
  const sent = useMemo(() => allInbox.filter((n) => n.org === user?.org), [allInbox, user?.org]);

  // State for dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTrigger, setEditingTrigger] = useState<typeof triggers[0] | null>(null);
  const [formData, setFormData] = useState({
    label: "",
    subject: "",
    body: "",
    enabled: true,
    triggerType: "automatic" as "automatic" | "manual",
    triggerEvent: "",
  });

  if (!user) return null;

  const isOrgAdmin = user.role === "org-admin" || user.role === "super-admin" || user.role === "lms-admin";

  const openCreateDialog = () => {
    setEditingTrigger(null);
    setFormData({
      label: "",
      subject: "",
      body: "",
      enabled: true,
      triggerType: "automatic",
      triggerEvent: "",
    });
    setDialogOpen(true);
  };

  const openEditDialog = (trigger: typeof triggers[0]) => {
    setEditingTrigger(trigger);
    setFormData({
      label: trigger.label,
      subject: trigger.subject,
      body: trigger.body,
      enabled: trigger.enabled,
      triggerType: trigger.triggerType,
      triggerEvent: trigger.triggerEvent || "",
    });
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!formData.label.trim() || !formData.subject.trim() || !formData.body.trim()) return;

    if (editingTrigger) {
      updateTrigger(editingTrigger.id, {
        label: formData.label,
        subject: formData.subject,
        body: formData.body,
        enabled: formData.enabled,
        triggerType: formData.triggerType,
        triggerEvent: formData.triggerEvent,
      });
    } else {
      addTrigger({
        ...formData,
        org: user.org,
        key: `custom-${Date.now()}`,
      });
    }
    setDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this notification trigger?")) {
      deleteTrigger(id);
    }
  };

  const triggerEvents = [
    { value: "welcome", label: "Welcome & account activation" },
    { value: "course-assignment", label: "Course assignment alert" },
    { value: "expiration-30d", label: "Upcoming expiration reminder (30 days)" },
    { value: "expiration-7d", label: "Upcoming expiration reminder (7 days)" },
    { value: "expiration-1d", label: "Upcoming expiration reminder (1 day)" },
    { value: "completion-certificate", label: "Course completion & certificate delivery" },
    { value: "inactive-nudge", label: "Inactive learner nudge (14+ days)" },
    { value: "custom", label: "Custom event (manual send)" },
  ];

  const availablePlaceholders = [
    "{userName}",
    "{orgName}",
    "{loginUrl}",
    "{courseTitle}",
    "{courseUrl}",
    "{expiryDate}",
    "{certificateUrl}",
    "{dashboardUrl}",
  ];

  return (
    <AppShell user={user}>
      <div className="p-6 space-y-6 max-w-4xl">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Notifications</h1>
          <p className="text-text-secondary mt-1">
            {user.role === "super-admin" || user.role === "lms-admin"
              ? "Platform default triggers — new organizations seed from these."
              : `Customize automated triggers for ${user.org}.`}
          </p>
        </div>

        {/* Automated Triggers Section */}
        <Card className="border-surface-border shadow-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Automated Triggers</CardTitle>
            {isOrgAdmin && (
              <Button size="sm" className="gap-2" onClick={openCreateDialog}>
                <Plus className="w-4 h-4" />
                Create Custom Trigger
              </Button>
            )}
          </CardHeader>
          <CardContent className="space-y-3">
            {triggers.length === 0 && (
              <p className="text-sm text-text-tertiary py-4 text-center">
                No notification triggers configured. Create one to get started.
              </p>
            )}
            {triggers.map((t) => (
              <div key={t.id} className="border border-surface-border rounded-lg overflow-hidden">
                <div className="flex items-center justify-between p-3 bg-surface-sunken/50">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <Switch checked={t.enabled} onCheckedChange={() => toggleTrigger(t.id)} />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-text-primary truncate">{t.label}</p>
                      <p className="text-xs text-text-tertiary truncate">
                        {t.triggerType === "automatic"
                          ? `Auto: ${triggerEvents.find((e) => e.value === t.triggerEvent)?.label || t.triggerEvent}`
                          : "Manual send only"}
                      </p>
                    </div>
                  </div>
                  {isOrgAdmin && (
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditDialog(t)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      {!t.triggerEvent || t.triggerEvent === "custom" ? (
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-danger hover:text-danger" onClick={() => handleDelete(t.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      ) : null}
                    </div>
                  )}
                </div>
                {/* Expandable content preview */}
                <div className="p-3 border-t border-surface-border bg-surface-base">
                  <details className="group">
                    <summary className="flex items-center justify-between cursor-pointer text-sm text-text-secondary">
                      <span>View content</span>
                      <ChevronDown className="w-4 h-4 transition-transform group-open:rotate-180" />
                    </summary>
                    <div className="mt-3 space-y-3 text-sm">
                      <div>
                        <label className="text-xs font-medium text-text-tertiary">Subject</label>
                        <p className="text-text-primary font-mono text-xs bg-surface-sunken p-2 rounded">{t.subject}</p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-text-tertiary">Body</label>
                        <p className="text-text-primary font-mono text-xs bg-surface-sunken p-2 rounded whitespace-pre-wrap max-h-32 overflow-auto">{t.body}</p>
                      </div>
                    </div>
                  </details>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Activity Section */}
        <Card className="border-surface-border shadow-card">
          <CardHeader>
            <CardTitle className="text-base">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {sent.length === 0 && <p className="text-sm text-text-tertiary">No notifications sent yet.</p>}
            {sent.slice(0, 10).map((n) => (
              <div key={n.id} className="flex items-start gap-2 text-sm p-3 rounded-lg border border-surface-border bg-surface-base">
                <Bell className="w-3.5 h-3.5 mt-0.5 text-text-tertiary shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-text-primary font-medium truncate">{n.title}</p>
                  <p className="text-text-tertiary text-xs">
                    to {n.recipientIdentifier} · {new Date(n.createdAt).toLocaleString()}
                  </p>
                </div>
                <Badge variant={n.read ? "default" : "secondary"} className="shrink-0">
                  {n.read ? "Read" : "Unread"}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Create/Edit Trigger Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>{editingTrigger ? "Edit Notification Trigger" : "Create Custom Notification Trigger"}</DialogTitle>
<DialogDescription>
                Define when this notification fires and customize its content. Use placeholders like {"{"}userName{"}"}, {"{"}orgName{"}"}, {"{"}courseTitle{"}"}, etc.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-6 py-6 overflow-y-auto">
              <div className="space-y-1.5">
                <Label htmlFor="label">Trigger Name</Label>
                <Input
                  id="label"
                  value={formData.label}
                  onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                  placeholder="e.g., New hire welcome email"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="triggerType">Trigger Type</Label>
                  <Select value={formData.triggerType} onValueChange={(v) => setFormData({ ...formData, triggerType: v as "automatic" | "manual" })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="automatic">Automatic (system event)</SelectItem>
                      <SelectItem value="manual">Manual (admin sends)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="enabled">Status</Label>
                  <Select value={formData.enabled.toString()} onValueChange={(v) => setFormData({ ...formData, enabled: v === "true" })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Enabled</SelectItem>
                      <SelectItem value="false">Disabled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {formData.triggerType === "automatic" && (
                <div className="space-y-1.5">
                  <Label htmlFor="triggerEvent">System Event</Label>
                  <Select value={formData.triggerEvent || ""} onValueChange={(v) => setFormData({ ...formData, triggerEvent: v || "" })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select trigger event" />
                    </SelectTrigger>
                    <SelectContent>
                      {triggerEvents.map((e) => (
                        <SelectItem key={e.value} value={e.value}>
                          {e.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-text-tertiary">When this event occurs, the notification will be sent automatically.</p>
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="subject">Email Subject</Label>
                <Input
                  id="subject"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="e.g., Welcome to {orgName}!"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="body">Email Body</Label>
                <Textarea
                  id="body"
                  value={formData.body}
                  onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                  placeholder="Write your notification content here..."
                  className="min-h-[200px] font-mono text-sm"
                />
                <p className="text-xs text-text-tertiary">Click a placeholder below to insert it at the cursor position:</p>
                <div className="flex flex-wrap gap-2">
                  {availablePlaceholders.map((ph) => (
                    <Button
                      key={ph}
                      type="button"
                      variant="outline"
                      size="sm"
                      className="text-xs h-7 px-3 font-mono"
                      onClick={() => {
                        const textarea = document.getElementById("body") as HTMLTextAreaElement;
                        if (textarea) {
                          const cursorPos = textarea.selectionStart;
                          const newBody = formData.body.slice(0, cursorPos) + ph + formData.body.slice(cursorPos);
                          setFormData({ ...formData, body: newBody });
                          // Restore focus and cursor position
                          setTimeout(() => {
                            textarea.focus();
                            textarea.setSelectionRange(cursorPos + ph.length, cursorPos + ph.length);
                          }, 0);
                        }
                      }}
                    >
                      {ph}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            <DialogFooter className="flex-row gap-3 border-t border-surface-border pt-4">
              <Button variant="outline" className="flex-1 sm:flex-none" onClick={() => setDialogOpen(false)}>
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button className="flex-1 sm:flex-none gap-2" onClick={handleSubmit} disabled={!formData.label?.trim() || !formData.subject?.trim() || !formData.body?.trim()}>
                <Save className="w-4 h-4" />
                {editingTrigger ? "Save Changes" : "Create Trigger"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppShell>
  );
}