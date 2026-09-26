"use client";

import { useMemo, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCategoriesStore } from "@/lib/store/categories-store";
import type { Category } from "@/lib/store/categories-store";

function CategoryDrawerForm({
  org,
  existing,
  onSaved,
}: {
  org: string;
  existing?: Category;
  onSaved: () => void;
}) {
  const addCategory = useCategoriesStore((s) => s.addCategory);
  const updateCategory = useCategoriesStore((s) => s.updateCategory);
  const categories = useCategoriesStore((s) => s.categories);
  const allCategories = useMemo(() => categories.filter((c) => c.org === org), [categories, org]);

  const [name, setName] = useState(existing?.name ?? "");
  const [description, setDescription] = useState(existing?.description ?? "");
  const [parentId, setParentId] = useState<string>(existing?.parentId ?? "none");
  const [color, setColor] = useState<string>(existing?.color ?? "var(--color-chart-1)");

  const COLOR_OPTIONS = [
    { label: "Blue", value: "var(--color-chart-1)", bg: "#3b82f6" },
    { label: "Purple", value: "var(--color-chart-2)", bg: "#8b5cf6" },
    { label: "Amber", value: "var(--color-chart-3)", bg: "#f59e0b" },
    { label: "Danger", value: "var(--danger)", bg: "#ef4444" },
    { label: "Success", value: "var(--success)", bg: "#10b981" },
    { label: "Teal", value: "#0d9488", bg: "#0d9488" },
    { label: "Indigo", value: "#6366f1", bg: "#6366f1" },
    { label: "Rose", value: "#f43f5e", bg: "#f43f5e" },
  ];

  const handleSave = () => {
    if (!name.trim()) return;
    const payload = {
      name,
      org,
      description,
      parentId: parentId === "none" ? undefined : parentId,
      color,
    };
    if (existing) updateCategory(existing.id, payload);
    else addCategory(payload);
    onSaved();
  };

  return (
    <>
      <SheetHeader>
        <SheetTitle>{existing ? "Edit Category" : "New Category"}</SheetTitle>
      </SheetHeader>
      <div className="flex-1 overflow-y-auto px-6 space-y-4">
        <div className="space-y-1.5">
          <Label>Name</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} autoFocus />
        </div>
        <div className="space-y-1.5">
          <Label>Description</Label>
          <Input value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label>Parent Category</Label>
          <Select value={parentId} onValueChange={(v) => setParentId(v ?? "none")}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None (top-level)</SelectItem>
              {allCategories
                .filter((c) => c.id !== existing?.id)
                .map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Category Color / Accent</Label>
          <div className="flex items-center gap-2 flex-wrap pt-1">
            {COLOR_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setColor(opt.value)}
                className={`w-7 h-7 rounded-full transition-transform border-2 ${
                  color === opt.value ? "scale-110 border-text-primary ring-2 ring-brand-500/30" : "border-transparent hover:scale-105"
                }`}
                style={{ backgroundColor: opt.bg }}
                title={opt.label}
              />
            ))}
          </div>
        </div>
      </div>
      <SheetFooter className="flex-row gap-2">
        <SheetClose render={<Button variant="outline" className="flex-1" />}>Cancel</SheetClose>
        <Button className="flex-1" onClick={handleSave} disabled={!name.trim()}>
          Save
        </Button>
      </SheetFooter>
    </>
  );
}

export function CategoryDrawer({
  open,
  onOpenChange,
  org,
  existing,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  org: string;
  existing?: Category;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md">
        {/* Keyed by target id so switching between "new" and different existing
            categories remounts the form with fresh state instead of needing an
            effect to resync it. */}
        <CategoryDrawerForm key={existing?.id ?? "new"} org={org} existing={existing} onSaved={() => onOpenChange(false)} />
      </SheetContent>
    </Sheet>
  );
}
