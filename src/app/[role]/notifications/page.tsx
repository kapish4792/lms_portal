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
import { useNotificationsStore, type NotificationItem } from "@/lib/store/notifications-store";
import {
  Bell,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  ChevronDown,
  Eye,
  Mail,
  Clock,
  RotateCcw,
} from "lucide-react";

export default function NotificationsSettingsPage() {
  const params = useParams<{ role: string }>();
  const user = useRoleGuard(params.role);
  const allTriggers = useNotificationsStore((s) => s.triggers);
  const allInbox = useNotificationsStore((s) => s.inbox);
  const toggleTrigger = useNotificationsStore((s) => s.toggleTrigger);
  const addTrigger = useNotificationsStore((s) => s.addTrigger);
  const updateTrigger = useNotificationsStore((s) => s.updateTrigger);
  const deleteTrigger = useNotificationsStore((s) => s.deleteTrigger);
  const resetToSeedData = useNotificationsStore((s) => s.resetToSeedData);

  const triggers = useMemo(() => {
    const list = allTriggers.filter((t) => t.org === user?.org);
    if (list.length > 0) return list;
    return allTriggers.filter((t) => t.org === "ESSCI" || t.org === "LMS Platform");
  }, [allTriggers, user?.org]);

  const sent = useMemo(() => {
    const list = allInbox.filter((n) => n.org === user?.org);
    if (list.length > 0) return list;
    return allInbox;
  }, [allInbox, user?.org]);

  // State for dialogs
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<NotificationItem | null>(null);
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Notifications</h1>
            <p className="text-text-secondary mt-1">
              {user.role === "super-admin" || user.role === "lms-admin"
                ? "Platform default triggers — new organizations seed from these."
                : `Customize automated triggers and view dispatch activity for ${user.org}.`}
            </p>
          </div>
          {sent.length === 0 && (
            <Button variant="outline" size="sm" onClick={() => resetToSeedData()} className="gap-2">
              <RotateCcw className="w-4 h-4" />
              Reset Demo Notifications
            </Button>
          )}
        </div>

        {/* Automated Triggers Section */}
        <Card className="border-surface-border shadow-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base">Automated Triggers</CardTitle>
              <p className="text-xs text-text-tertiary mt-0.5">
                Templates and lifecycle event dispatches configured for your organization
              </p>
            </div>
            {isOrgAdmin && (
              <Button size="sm" className="gap-2" onClick={openCreateDialog}>
                <Plus className="w-4 h-4" />
                Create Custom Trigger
              </Button>
            )}
          </CardHeader>
          <CardContent className="space-y-3">
            {triggers.length === 0 && (
              <div className="text-center py-8 space-y-2">
                <p className="text-sm text-text-tertiary">
                  No notification triggers configured. Create one or load defaults to get started.
                </p>
                <Button variant="outline" size="sm" onClick={() => resetToSeedData()} className="gap-1.5">
                  <RotateCcw className="w-3.5 h-3.5" />
                  Load Default Triggers
                </Button>
              </div>
            )}
            {triggers.map((t) => (
              <div key={t.id} className="border border-surface-border rounded-lg overflow-hidden transition-all hover:border-surface-border-strong">
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
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditDialog(t)} title="Edit trigger">
                        <Edit className="w-4 h-4" />
                      </Button>
                      {!t.triggerEvent || t.triggerEvent === "custom" ? (
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-danger hover:text-danger" onClick={() => handleDelete(t.id)} title="Delete trigger">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      ) : null}
                    </div>
                  )}
                </div>
                {/* Expandable content preview */}
                <div className="p-3 border-t border-surface-border bg-surface-base">
                  <details className="group">
                    <summary className="flex items-center justify-between cursor-pointer text-xs font-medium text-text-secondary hover:text-text-primary py-0.5">
                      <span className="flex items-center gap-1.5">
                        <Eye className="w-3.5 h-3.5 text-text-tertiary" />
                        View message template content
                      </span>
                      <ChevronDown className="w-4 h-4 transition-transform group-open:rotate-180" />
                    </summary>
                    <div className="mt-3 space-y-3 text-sm pt-2 border-t border-surface-border/50">
                      <div>
                        <label className="text-[11px] font-semibold text-text-tertiary uppercase tracking-wider block mb-1">Subject</label>
                        <p className="text-text-primary font-mono text-xs bg-surface-sunken p-2.5 rounded border border-surface-border select-all">{t.subject}</p>
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-text-tertiary uppercase tracking-wider block mb-1">Email Body</label>
                        <p className="text-text-primary font-mono text-xs bg-surface-sunken p-2.5 rounded border border-surface-border whitespace-pre-wrap max-h-48 overflow-auto leading-relaxed select-all">{t.body}</p>
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
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base">Recent Activity</CardTitle>
              <p className="text-xs text-text-tertiary mt-0.5">
                Sent notifications and delivery status logs
              </p>
            </div>
            {sent.length > 0 && (
              <Badge variant="outline" className="text-xs">
                {sent.length} notifications logged
              </Badge>
            )}
          </CardHeader>
          <CardContent className="space-y-3">
            {sent.length === 0 ? (
              <div className="text-center py-8 space-y-2">
                <Bell className="w-8 h-8 text-text-tertiary mx-auto opacity-40" />
                <p className="text-sm text-text-secondary">No notifications logged yet.</p>
                <Button variant="outline" size="sm" onClick={() => resetToSeedData()} className="gap-1.5">
                  <RotateCcw className="w-3.5 h-3.5" />
                  Load Sample Notifications
                </Button>
              </div>
            ) : (
              sent.slice(0, 10).map((n) => (
                <div
                  key={n.id}
                  onClick={() => setSelectedNotification(n)}
                  className="group flex flex-col sm:flex-row sm:items-start justify-between gap-3 text-sm p-3.5 rounded-lg border border-surface-border bg-surface-base hover:border-surface-border-strong hover:bg-surface-sunken/40 cursor-pointer transition-colors"
                >
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5 text-primary">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-text-primary font-medium truncate">{n.title}</p>
                        <Badge variant={n.read ? "secondary" : "default"} className="text-[10px] h-4 px-1.5">
                          {n.read ? "Delivered (Read)" : "Delivered (Unread)"}
                        </Badge>
                      </div>
                      <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed">
                        {n.body}
                      </p>
                      <p className="text-text-tertiary text-[11px] flex items-center gap-1.5 pt-0.5">
                        <span>To: <strong className="text-text-secondary font-medium">{n.recipientIdentifier}</strong></span>
                        <span>·</span>
                        <span>{new Date(n.createdAt).toLocaleString()}</span>
                      </p>
                    </div>
                  </div>
                  <div className="sm:self-center shrink-0 flex items-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-surface-border">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs gap-1.5 w-full sm:w-auto"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedNotification(n);
                      }}
                    >
                      <Eye className="w-3.5 h-3.5" />
                      View Content
                    </Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* View Notification Content Dialog */}
        <Dialog open={!!selectedNotification} onOpenChange={(open) => !open && setSelectedNotification(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <Badge variant={selectedNotification?.read ? "secondary" : "default"} className="text-xs">
                  {selectedNotification?.read ? "Read" : "Unread"}
                </Badge>
                <span className="text-xs text-text-tertiary flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {selectedNotification ? new Date(selectedNotification.createdAt).toLocaleString() : ""}
                </span>
              </div>
              <DialogTitle className="text-lg font-semibold text-text-primary">
                {selectedNotification?.title}
              </DialogTitle>
              <DialogDescription className="text-xs text-text-tertiary">
                Recipient: <span className="font-mono text-text-secondary">{selectedNotification?.recipientIdentifier}</span> ({selectedNotification?.org})
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-2">
              <div>
                <label className="text-xs font-semibold text-text-tertiary uppercase tracking-wider block mb-1">
                  Message Content
                </label>
                <div className="p-4 rounded-lg bg-surface-sunken border border-surface-border text-sm text-text-primary whitespace-pre-wrap leading-relaxed max-h-[350px] overflow-y-auto">
                  {selectedNotification?.body}
                </div>
              </div>
            </div>

            <DialogFooter className="border-t border-surface-border pt-3">
              <Button variant="default" size="sm" onClick={() => setSelectedNotification(null)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

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