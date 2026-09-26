"use client"
import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { useRoleGuard } from "@/lib/hooks/use-role-guard";
import { AppShell } from "@/components/layout/AppShell";
import { AddUserDialog } from "@/components/users/AddUserDialog";
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
import { ROLE_LABELS } from "@/lib/permissions";
import { Plus, Search, Download, Edit, Trash2, MoreHorizontal, UserCheck, UserX } from "lucide-react";
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

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selected, setSelected] = useState<string[]>([]);
  const [orgStepOpen, setOrgStepOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
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
      const matchesRole = roleFilter === "all" || d.role === roleFilter;
      const matchesStatus = statusFilter === "all" || d.status === statusFilter;
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
    const header = ["First Name", "Last Name", "Email", "User Type", "Department", "Status", "Registered"];
    const csv = [
      header.join(","),
      ...rows.map((r) =>
        [r.firstName, r.lastName, r.email, ROLE_LABELS[r.role], r.department ?? "", r.status, r.registeredAt].join(",")
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
    if (user.role === "super-admin" || user.role === "lms-admin") setOrgStepOpen(true);
    else setDialogOpen(true);
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

        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-tertiary" />
            <Input
              placeholder="Search name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8"
            />
          </div>
          <Select value={roleFilter} onValueChange={(v) => setRoleFilter(v ?? "all")}>
            <SelectTrigger>
              <SelectValue placeholder="User type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All user types</SelectItem>
              {Object.entries(ROLE_LABELS).map(([role, label]) => (
                <SelectItem key={role} value={role}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v ?? "all")}>
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Suspended">Suspended</SelectItem>
            </SelectContent>
          </Select>
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
                    {d.firstName} {d.lastName}
                  </td>
                  <td className="p-3 text-text-secondary">{d.email}</td>
                  <td className="p-3 text-text-secondary">{ROLE_LABELS[d.role]}</td>
                  <td className="p-3 text-text-secondary">{d.registeredAt}</td>
                  <td className="p-3">
                    <Badge variant={d.status === "Active" ? "default" : "outline"}>{d.status}</Badge>
                  </td>
                  <td className="p-3">
                    <DropdownMenu>
                      <DropdownMenuTrigger>
                        <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                          <MoreHorizontal className="w-4 h-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
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
                        <DropdownMenuItem
                          onClick={() => {
                            console.log("Edit user:", d.id);
                          }}
                        >
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
              Want to restrict this user to a specific organization? Create the
              organization first so they receive the correct registration link and
              dedicated login.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" render={<Link href={`/${user.role}/organization`} />} onClick={() => setOrgStepOpen(false)}>
              Create organization
            </Button>
            <Button
              onClick={() => {
                setOrgStepOpen(false);
                setDialogOpen(true);
              }}
            >
              Skip
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AddUserDialog open={dialogOpen} onOpenChange={setDialogOpen} org={user.org} />
    </AppShell>
  );
}
