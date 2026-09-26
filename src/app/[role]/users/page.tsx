"use client"
import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { useRoleGuard } from "@/lib/hooks/use-role-guard";
import { AppShell } from "@/components/layout/AppShell";
import { EditUserDialog } from "@/components/users/EditUserDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import Link from "next/link";
import { useUsersStore } from "@/lib/store/users-store";
import type { DirectoryUser } from "@/lib/store/users-store";
import { useOrganizationsStore } from "@/lib/store/organizations-store";
import { ROLE_LABELS } from "@/lib/permissions";
import { Plus, Search, Download, Edit, Trash2, MoreHorizontal, UserCheck, UserX, SlidersHorizontal, X } from "lucide-react";
import { Pagination } from "@/components/ui/pagination";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

export default function UsersDirectoryPage() {
  const params = useParams<{ role: string }>();
  const user = useRoleGuard(params.role);
  const directory = useUsersStore((s) => s.directory);
  const setStatus = useUsersStore((s) => s.setStatus);
  const updateUser = useUsersStore((s) => s.updateUser);
  const organizations = useOrganizationsStore((s) => s.organizations);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("All User Types");
  const [statusFilter, setStatusFilter] = useState<string>("All Status");
  const [selected, setSelected] = useState<string[]>([]);
  const [orgStepOpen, setOrgStepOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedOrgId, setSelectedOrgId] = useState<string>("");
  const [editingUser, setEditingUser] = useState<DirectoryUser | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(15);

  const scoped = useMemo(
    () => (user ? directory.filter((d) => d.org === user.org) : []),
    [directory, user]
  );

  const filtered = useMemo(() => {
    return scoped.filter((d) => {
      const matchesSearch =
        !search.trim() ||
        `${d.firstName} ${d.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
        d.email.toLowerCase().includes(search.toLowerCase());
      const matchesRole = roleFilter === "All User Types" || d.role === roleFilter;
      const matchesStatus = statusFilter === "All Status" || d.status === statusFilter;
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [scoped, search, roleFilter, statusFilter]);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filtered.slice(start, start + itemsPerPage);
  }, [filtered, currentPage, itemsPerPage]);

  if (!user) return null;

  const toggleAll = (checked: boolean) => setSelected(checked ? paginatedData.map((d) => d.id) : []);
  const toggleOne = (id: string, checked: boolean) =>
    setSelected((prev) => (checked ? [...prev, id] : prev.filter((x) => x !== id)));

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setSelected([]);
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
    setSelected([]);
  };

  const exportCsv = () => {
    const rows = filtered.filter((d) => selected.length === 0 || selected.includes(d.id));
    const header = ["First Name", "Last Name", "Email", "User Type", "Department", "Status", "Registered", "Date of Birth"];
    const csv = [
      header.join(","),
      ...rows.map((r) =>
        [r.firstName, r.lastName, r.email, ROLE_LABELS[r.role], r.department ?? "", r.status, r.registeredAt, r.dob ?? ""].join(",")
      ),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "users.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleAddUserClick = () => {
    if (user.role === "super-admin" || user.role === "lms-admin") {
      setSelectedOrgId("");
      setOrgStepOpen(true);
    } else {
      setEditingUser(null);
      setDialogOpen(true);
    }
  };

  const handleEditUser = (u: DirectoryUser) => {
    setEditingUser(u);
    setDialogOpen(true);
  };

  return (
    <AppShell user={user}>
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Users</h1>
            <p className="text-text-secondary mt-1">
              {scoped.length} user{scoped.length === 1 ? "" : "s"} at {user.org}
            </p>
          </div>
          <Button className="gap-2" onClick={handleAddUserClick}>
            <Plus className="w-4 h-4" />
            Add user
          </Button>
        </div>

        <div className="flex items-center gap-3 flex-wrap rounded-xl border border-surface-border bg-surface-sunken/40 p-3">
          <div className="relative flex-1 min-w-55 sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-tertiary" />
            <Input
              placeholder="Search name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 pl-9 bg-surface-base"
            />
          </div>

          <div className="hidden sm:block h-6 w-px bg-surface-border" />

          <div className="flex items-center gap-2 flex-wrap">
            <SlidersHorizontal className="hidden sm:block w-3.5 h-3.5 text-text-tertiary shrink-0" />
            <Select value={roleFilter} onValueChange={(v) => setRoleFilter(v ?? "All User Types")}>
              <SelectTrigger size="sm" className="w-37.5 bg-surface-base">
                <SelectValue placeholder="User type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All User Types">All User Types</SelectItem>
                {Object.entries(ROLE_LABELS).map(([role, label]) => (
                  <SelectItem key={role} value={role}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v ?? "All Status")}>
              <SelectTrigger size="sm" className="w-32.5 bg-surface-base">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All Status">All Statuses</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>

            {(search || roleFilter !== "All User Types" || statusFilter !== "All Status") && (
              <Button
                variant="ghost"
                size="sm"
                className="h-9 gap-1.5 text-text-tertiary hover:text-text-primary"
                onClick={() => {
                  setSearch("");
                  setRoleFilter("All User Types");
                  setStatusFilter("All Status");
                }}
              >
                <X className="w-3.5 h-3.5" />
                Clear
              </Button>
            )}
          </div>
        </div>

        {selected.length > 0 && (
          <div className="flex items-center gap-2 rounded-lg border border-surface-border bg-surface-sunken px-3 py-2">
            <span className="text-sm text-text-secondary mr-2">{selected.length} selected</span>
            <Button size="sm" variant="outline" onClick={() => setStatus(selected, "Active")}>
              Activate
            </Button>
            <Button size="sm" variant="outline" onClick={() => setStatus(selected, "Suspended")}>
              Deactivate
            </Button>
            <Button size="sm" variant="outline" className="gap-1.5" onClick={exportCsv}>
              <Download className="w-3.5 h-3.5" />
              Export CSV
            </Button>
          </div>
        )}

        <div className="rounded-xl border border-surface-border bg-surface-base overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-border text-left text-text-tertiary">
                <th className="p-3 w-10">
                  <input
                    type="checkbox"
                    checked={paginatedData.length > 0 && selected.length === paginatedData.length}
                    onChange={(e) => toggleAll(e.target.checked)}
                  />
                </th>
                <th className="p-3 font-medium">Name</th>
                <th className="p-3 font-medium">Email</th>
                <th className="p-3 font-medium">User Type</th>
                <th className="p-3 font-medium">Registered</th>
                <th className="p-3 font-medium">Status</th>
                <th className="p-3 font-medium w-32">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((d) => (
                <tr key={d.id} className="border-b border-surface-divider last:border-0">
                  <td className="p-3">
                    <input
                      type="checkbox"
                      checked={selected.includes(d.id)}
                      onChange={(e) => toggleOne(d.id, e.target.checked)}
                    />
                  </td>
                  <td className="p-3 font-medium text-text-primary">
                    <div>{d.firstName} {d.lastName}</div>
                    {d.dob && (
                      <div className="text-[11px] font-normal text-text-tertiary">
                        DOB: {d.dob}
                      </div>
                    )}
                  </td>
                  <td className="p-3 text-text-secondary">{d.email}</td>
                  <td className="p-3 text-text-secondary">{ROLE_LABELS[d.role]}</td>
                  <td className="p-3 text-text-secondary">{d.registeredAt}</td>
                  <td className="p-3">
                    <Badge variant={d.status === "Active" ? "default" : "outline"}>{d.status}</Badge>
                  </td>
                  <td className="p-3">
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={
                          <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                            <MoreHorizontal className="w-4 h-4" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        }
                      />
                      <DropdownMenuContent align="end">
                        {d.status === "Active" ? (
                          <DropdownMenuItem
                            onClick={() => setStatus([d.id], "Suspended")}
                          >
                            <UserX className="w-4 h-4 mr-2" />
                            Deactivate
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem
                            onClick={() => setStatus([d.id], "Active")}
                          >
                            <UserCheck className="w-4 h-4 mr-2" />
                            Activate
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleEditUser(d)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          variant="destructive"
                          onClick={() => {
                            console.log("Delete user:", d.id);
                          }}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-text-tertiary">
                    No users match these filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          totalItems={filtered.length}
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
          onPageChange={handlePageChange}
          onItemsPerPageChange={handleItemsPerPageChange}
        />
      </div>

      <Dialog open={orgStepOpen} onOpenChange={setOrgStepOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Before you add a user</DialogTitle>
            <DialogDescription>
              Select an existing organization, create a new one, or skip to add the
              user to your current organization ({user.org}).
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-1.5">
              <label htmlFor="org-select" className="text-sm font-medium text-text-primary">
                Existing Organization
              </label>
              <Select value={selectedOrgId} onValueChange={(v) => setSelectedOrgId(v ?? "")}>
                <SelectTrigger id="org-select" className="w-full">
                  <SelectValue placeholder="Select an organization..." />
                </SelectTrigger>
                <SelectContent>
                  {organizations.map((org) => (
                    <SelectItem key={org.id} value={org.id}>
                      {org.name} ({org.subdomain})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-text-tertiary">
                Or choose an action below
              </p>
            </div>
          </div>
          <DialogFooter className="flex-col gap-2 sm:flex-row">
            <Button
              variant="outline"
              render={<Link href={`/${user.role}/organization`} />}
              onClick={() => setOrgStepOpen(false)}
              className="w-full sm:w-auto"
            >
              Create organization
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setEditingUser(null);
                setOrgStepOpen(false);
                setDialogOpen(true);
              }}
              className="w-full sm:w-auto"
            >
              Add to current org ({user.org})
            </Button>
            <Button
              onClick={() => {
                if (!selectedOrgId) return;
                setEditingUser(null);
                setOrgStepOpen(false);
                setDialogOpen(true);
              }}
              disabled={!selectedOrgId}
              className="w-full sm:w-auto"
            >
              Add to selected org
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <EditUserDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        user={editingUser}
        currentUserRole={user.role}
        currentUserOrg={user.org}
      />
    </AppShell>
  );
}
