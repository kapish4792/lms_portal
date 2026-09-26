"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { useRoleGuard } from "@/lib/hooks/use-role-guard";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent } from "@/components/ui/card";
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
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { CategoryDrawer } from "@/components/categories/CategoryDrawer";
import { useCategoriesStore } from "@/lib/store/categories-store";
import type { Category } from "@/lib/store/categories-store";
import { useCoursesStore } from "@/lib/store/courses-store";
import { useRouter } from "next/navigation";
import { Plus, FolderTree, MoreVertical, Search, LayoutGrid, List, Edit2, Copy, Trash2, ExternalLink, X } from "lucide-react";
import { Pagination } from "@/components/ui/pagination";

export default function CategoriesPage() {
  const router = useRouter();
  const params = useParams<{ role: string }>();
  const user = useRoleGuard(params.role);
  const categories = useCategoriesStore((s) => s.categories);
  const addCategory = useCategoriesStore((s) => s.addCategory);
  const deleteCategory = useCategoriesStore((s) => s.deleteCategory);
  const courses = useCoursesStore((s) => s.courses);

  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<Category | undefined>();
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(15);

  const canManage = user
    ? ["lms-admin", "super-admin", "org-admin", "manager", "dept-head"].includes(user.role)
    : false;

  const scoped = useMemo(
    () => (user ? categories.filter((c) => c.org === user.org) : []),
    [categories, user]
  );
  const filtered = useMemo(() => scoped.filter((c) => !search.trim() || c.name.toLowerCase().includes(search.toLowerCase())), [scoped, search]);

  const courseCount = (categoryName: string) =>
    user ? courses.filter((c) => c.org === user.org && c.category === categoryName).length : 0;

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filtered.slice(start, start + itemsPerPage);
  }, [filtered, currentPage, itemsPerPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  if (!user) return null;

  const handleDuplicate = (c: Category) => {
    addCategory({
      name: `${c.name} (Copy)`,
      org: c.org,
      description: c.description,
      parentId: c.parentId,
      color: c.color,
    });
  };

  const confirmDelete = () => {
    if (deleteTarget) deleteCategory(deleteTarget.id);
    setDeleteTarget(null);
  };

  const renderDropdown = (c: Category) => (
    <DropdownMenu>
      <DropdownMenuTrigger render={
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-primary/10 text-text-tertiary hover:text-primary transition-colors">
          <MoreVertical className="w-4 h-4" />
        </Button>
      } />
      <DropdownMenuContent align="end" className="w-50 min-w-[200px] p-1">
        <DropdownMenuItem
          onClick={() => router.push(`/${user.role}/courses?category=${encodeURIComponent(c.name)}`)}
          className="flex items-center gap-2 !pl-2 py-2 text-sm"
          inset={false}
        >
          <ExternalLink className="w-4 h-4 text-text-tertiary" />
          <span>View courses ({courseCount(c.name)})</span>
        </DropdownMenuItem>
        {canManage && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                setEditing(c);
                setDrawerOpen(true);
              }}
              className="flex items-center gap-2 !pl-2 py-2 text-sm"
              inset={false}
            >
              <Edit2 className="w-4 h-4 text-text-tertiary" />
              <span>Edit category</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleDuplicate(c)}
              className="flex items-center gap-2 !pl-2 py-2 text-sm"
              inset={false}
            >
              <Copy className="w-4 h-4 text-text-tertiary" />
              <span>Duplicate category</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              variant="destructive"
              onClick={() => setDeleteTarget(c)}
              className="flex items-center gap-2 !pl-2 py-2 text-sm"
              inset={false}
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete category</span>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <AppShell user={user}>
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Course Categories</h1>
            <p className="text-text-secondary mt-1">
              {scoped.length} categor{scoped.length === 1 ? "y" : "ies"} at {user.org}
              {!canManage && " · browse-only"}
            </p>
          </div>
          {canManage && (
            <Button
              className="gap-2"
              onClick={() => {
                setEditing(undefined);
                setDrawerOpen(true);
              }}
            >
              <Plus className="w-4 h-4" />
              New category
            </Button>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="relative w-full sm:w-64 flex items-center">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-tertiary" />
            <Input
              placeholder="Search categories..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 pl-9 pr-8 bg-surface-base"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-primary"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center rounded-lg border border-surface-border p-1 bg-surface-sunken">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="icon-sm"
              onClick={() => setViewMode("grid")}
              title="Grid view"
            >
              <LayoutGrid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="icon-sm"
              onClick={() => setViewMode("list")}
              title="List view"
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {viewMode === "grid" ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {paginatedData.map((c) => (
              <Card key={c.id} className="border-surface-border shadow-card">
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                      style={{ backgroundColor: c.color ? `color-mix(in oklch, ${c.color}, transparent 85%)` : undefined }}
                    >
                      <FolderTree className="w-5 h-5" style={{ color: c.color }} />
                    </div>
                    {renderDropdown(c)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-text-primary">{c.name}</h3>
                    {c.parentId && (
                      <p className="text-xs text-text-tertiary mt-0.5">
                        Sub-category of {scoped.find((p) => p.id === c.parentId)?.name}
                      </p>
                    )}
                  </div>
                  {c.description && <p className="text-sm text-text-secondary">{c.description}</p>}
                  <Badge variant="outline">{courseCount(c.name)} courses</Badge>
                </CardContent>
              </Card>
            ))}
            {filtered.length === 0 && (
              <p className="text-text-tertiary col-span-full text-center py-10">No categories match this search.</p>
            )}
          </div>
        ) : (
          <div className="rounded-xl border border-surface-border bg-surface-base overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-surface-border text-left text-text-tertiary">
                  <th className="px-4 py-3 font-medium">Category Name</th>
                  <th className="px-4 py-3 font-medium">Hierarchy</th>
                  <th className="px-4 py-3 font-medium">Description</th>
                  <th className="px-4 py-3 font-medium">Assigned Courses</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {paginatedData.map((c) => (
                  <tr key={c.id} className="hover:bg-surface-sunken/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-7 h-7 rounded-md flex items-center justify-center shrink-0"
                          style={{ backgroundColor: c.color ? `color-mix(in oklch, ${c.color}, transparent 85%)` : undefined }}
                        >
                          <FolderTree className="w-4 h-4" style={{ color: c.color }} />
                        </div>
                        <span className="font-medium text-text-primary">{c.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-text-secondary">
                      {c.parentId ? (
                        <span className="text-xs bg-surface-sunken px-2 py-0.5 rounded border border-surface-border">
                          Sub of {scoped.find((p) => p.id === c.parentId)?.name}
                        </span>
                      ) : (
                        <span className="text-xs text-text-tertiary">Top-level</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-text-secondary max-w-xs truncate">
                      {c.description || <span className="text-text-tertiary italic">No description</span>}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="outline">{courseCount(c.name)} courses</Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {renderDropdown(c)}
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-10 text-center text-text-tertiary">
                      No categories match this search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        <Pagination
          totalItems={filtered.length}
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
          onPageChange={handlePageChange}
          onItemsPerPageChange={handleItemsPerPageChange}
        />
      </div>

      <CategoryDrawer open={drawerOpen} onOpenChange={setDrawerOpen} org={user.org} existing={editing} />

      <Dialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete &ldquo;{deleteTarget?.name}&rdquo;?</DialogTitle>
            <DialogDescription>
              {deleteTarget && courseCount(deleteTarget.name) > 0
                ? `${courseCount(deleteTarget.name)} course(s) are still assigned to this category. Deleting it won&apos;t reassign them — they&apos;ll keep the old category name until edited.`
                : "This category has no courses assigned. This can&apos;t be undone."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
