"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useRoleGuard } from "@/lib/hooks/use-role-guard";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useOrganizationsStore } from "@/lib/store/organizations-store";
import { NAV_ITEMS } from "@/lib/permissions";
import { Plus, Building2, ChevronRight } from "lucide-react";

function CreateOrgDialog({
  open,
  onOpenChange,
  parentId,
  isSuperAdmin,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  parentId?: string;
  isSuperAdmin: boolean;
}) {
  const addOrganization = useOrganizationsStore((s) => s.addOrganization);
  const [name, setName] = useState("");
  const [subdomain, setSubdomain] = useState("");
  const [allowSubOrgs, setAllowSubOrgs] = useState(false);

  const handleCreate = () => {
    if (!name.trim() || !subdomain.trim()) return;
    addOrganization({
      name,
      subdomain,
      parentId,
      allowSubOrgs: isSuperAdmin ? allowSubOrgs : false,
      enabledModules: NAV_ITEMS.map((n) => n.id),
    });
    setName("");
    setSubdomain("");
    setAllowSubOrgs(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{parentId ? "Create sub-organization" : "Create organization"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label>Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Acme EMEA" />
          </div>
          <div className="space-y-1.5">
            <Label>Subdomain</Label>
            <Input value={subdomain} onChange={(e) => setSubdomain(e.target.value)} placeholder="acme-emea" />
          </div>
          {isSuperAdmin && (
            <label className="flex items-center justify-between rounded-lg border border-surface-border px-3 py-2.5">
              <span className="text-sm text-text-primary">Allow sub-organization creation</span>
              <Switch checked={allowSubOrgs} onCheckedChange={(c: boolean) => setAllowSubOrgs(c)} />
            </label>
          )}
        </div>
        <DialogFooter>
          <Button onClick={handleCreate}>Create</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function OrganizationManagementPage() {
  const params = useParams<{ role: string }>();
  const user = useRoleGuard(params.role);
  const organizations = useOrganizationsStore((s) => s.organizations);
  const toggleModule = useOrganizationsStore((s) => s.toggleModule);
  const [createOpen, setCreateOpen] = useState(false);
  const [createParentId, setCreateParentId] = useState<string | undefined>();
  const [moduleEditorOrgId, setModuleEditorOrgId] = useState<string | null>(null);

  if (!user) return null;

  const isSuperAdmin = user.role === "super-admin" || user.role === "lms-admin";
  const myOrg = organizations.find((o) => o.name === user.org);
  const subOrgs = myOrg ? organizations.filter((o) => o.parentId === myOrg.id) : [];
  const topLevelOrgs = organizations.filter((o) => !o.parentId);

  if (isSuperAdmin) {
    return (
      <AppShell user={user}>
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-2xl font-bold text-text-primary">Organization Management</h1>
              <p className="text-text-secondary mt-1">Super Admin — full tenant hierarchy and module governance</p>
            </div>
            <Button
              className="gap-2"
              onClick={() => {
                setCreateParentId(undefined);
                setCreateOpen(true);
              }}
            >
              <Plus className="w-4 h-4" />
              Create organization
            </Button>
          </div>

          <div className="space-y-3">
            {topLevelOrgs.map((org) => {
              const children = organizations.filter((o) => o.parentId === org.id);
              return (
                <Card key={org.id} className="border-surface-border shadow-card">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      <div className="flex items-center gap-3">
                        <Building2 className="w-5 h-5 text-brand-600" />
                        <div>
                          <p className="font-semibold text-text-primary">{org.name}</p>
                          <p className="text-xs text-text-tertiary">{org.subdomain}.lms.com</p>
                        </div>
                        {org.allowSubOrgs && <Badge variant="outline">Sub-orgs allowed</Badge>}
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => setModuleEditorOrgId(moduleEditorOrgId === org.id ? null : org.id)}>
                          {moduleEditorOrgId === org.id ? "Hide modules" : "Manage modules"}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={!org.allowSubOrgs}
                          onClick={() => {
                            setCreateParentId(org.id);
                            setCreateOpen(true);
                          }}
                        >
                          Add sub-org
                        </Button>
                      </div>
                    </div>

                    {moduleEditorOrgId === org.id && (
                      <div className="grid sm:grid-cols-2 gap-1.5 pt-2 border-t border-surface-divider">
                        {NAV_ITEMS.map((item) => (
                          <label key={item.id} className="flex items-center gap-2 text-sm px-2 py-1 rounded-md hover:bg-surface-sunken">
                            <input
                              type="checkbox"
                              checked={org.enabledModules.includes(item.id)}
                              onChange={() => toggleModule(org.id, item.id)}
                            />
                            {item.label}
                          </label>
                        ))}
                      </div>
                    )}

                    {children.length > 0 && (
                      <div className="pl-6 space-y-1.5 pt-1">
                        {children.map((child) => (
                          <div key={child.id} className="flex items-center gap-2 text-sm text-text-secondary">
                            <ChevronRight className="w-3.5 h-3.5 text-text-tertiary" />
                            {child.name} <span className="text-text-tertiary">({child.subdomain}.lms.com)</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        <CreateOrgDialog open={createOpen} onOpenChange={setCreateOpen} parentId={createParentId} isSuperAdmin />
      </AppShell>
    );
  }

  // Org Admin view: only their own tenant.
  return (
    <AppShell user={user}>
      <div className="p-6 space-y-4 max-w-2xl">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Organization Management</h1>
          <p className="text-text-secondary mt-1">Your organization&apos;s identity and sub-organizations</p>
        </div>

        {myOrg && (
          <Card className="border-surface-border shadow-card">
            <CardContent className="p-4 space-y-1">
              <p className="font-semibold text-text-primary">{myOrg.name}</p>
              <p className="text-sm text-text-tertiary">{myOrg.subdomain}.lms.com</p>
            </CardContent>
          </Card>
        )}

        {myOrg?.allowSubOrgs && (
          <Card className="border-surface-border shadow-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Sub-Organizations</CardTitle>
              <Button
                size="sm"
                className="gap-1.5"
                onClick={() => {
                  setCreateParentId(myOrg.id);
                  setCreateOpen(true);
                }}
              >
                <Plus className="w-3.5 h-3.5" />
                Create Sub-Organization
              </Button>
            </CardHeader>
            <CardContent className="space-y-1.5">
              {subOrgs.length === 0 && <p className="text-sm text-text-tertiary">None yet.</p>}
              {subOrgs.map((s) => (
                <div key={s.id} className="text-sm text-text-secondary">
                  {s.name} <span className="text-text-tertiary">({s.subdomain}.lms.com)</span>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
        {/* Sub-org creation is entirely absent (not disabled) when allowSubOrgs is false — §3.10 */}

        <CreateOrgDialog open={createOpen} onOpenChange={setCreateOpen} parentId={createParentId} isSuperAdmin={false} />
      </div>
    </AppShell>
  );
}
