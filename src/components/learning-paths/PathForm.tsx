"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLearningPathsStore } from "@/lib/store/learning-paths-store";
import type { LearningPath, PathStep, CompletionType } from "@/lib/store/learning-paths-store";
import { useCoursesStore } from "@/lib/store/courses-store";
import { useCategoriesStore } from "@/lib/store/categories-store";
import type { MockUser } from "@/lib/mock/users";
import { Plus, Trash2, ArrowUp, ArrowDown, BookOpen, ClipboardCheck } from "lucide-react";

const FALLBACK_CATEGORIES = ["Compliance", "Technical Skills", "Leadership", "Sales Enablement", "Onboarding"];

let idCounter = 0;
const nextId = (prefix: string) => `${prefix}-${Date.now()}-${idCounter++}`;

export function PathForm({ user, existing }: { user: MockUser; existing?: LearningPath }) {
  const router = useRouter();
  const addPath = useLearningPathsStore((s) => s.addPath);
  const updatePath = useLearningPathsStore((s) => s.updatePath);
  const allCourses = useCoursesStore((s) => s.courses);
  const allCategories = useCategoriesStore((s) => s.categories);
  const courses = useMemo(() => allCourses.filter((c) => c.org === user.org), [allCourses, user.org]);
  const categoryOptions = useMemo(() => {
    const list = allCategories.filter((c) => c.org === user.org).map((c) => c.name);
    return list.length > 0 ? list : FALLBACK_CATEGORIES;
  }, [allCategories, user.org]);

  const [title, setTitle] = useState(existing?.title ?? "");
  const [description, setDescription] = useState(existing?.description ?? "");
  const [category, setCategory] = useState(existing?.category ?? categoryOptions[0] ?? "Compliance");
  const [steps, setSteps] = useState<PathStep[]>(existing?.steps ?? []);
  const [pickerCourseId, setPickerCourseId] = useState<string>(courses[0]?.id ?? "");

  const moveStep = (index: number, dir: -1 | 1) =>
    setSteps((prev) => {
      const next = [...prev];
      const target = index + dir;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });

  const removeStep = (id: string) => setSteps((prev) => prev.filter((s) => s.id !== id));

  const addCourseStep = () => {
    if (!pickerCourseId) return;
    setSteps((prev) => [...prev, { id: nextId("s"), type: "course", courseId: pickerCourseId }]);
  };

  const addTaskStep = () => {
    setSteps((prev) => [
      ...prev,
      {
        id: nextId("s"),
        type: "task",
        title: "New task",
        dueDayFromEnrollment: 1,
        assignee: "New hire",
        completionType: "checkbox",
      },
    ]);
  };

  const updateTaskStep = (id: string, patch: Partial<Extract<PathStep, { type: "task" }>>) =>
    setSteps((prev) => prev.map((s) => (s.id === id && s.type === "task" ? { ...s, ...patch } : s)));

  const handleSave = () => {
    const payload = {
      title: title || "Untitled path",
      description,
      category,
      department: user.department,
      org: user.org,
      steps,
    };
    if (existing) {
      updatePath(existing.id, payload);
      router.push(`/${user.role}/learning-paths`);
    } else {
      addPath(payload);
      router.push(`/${user.role}/learning-paths`);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <Card className="border-surface-border shadow-card">
        <CardHeader>
          <CardTitle className="text-base">Path Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. New Engineer Onboarding Pathway" />
          <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Short description" />
          <Select value={category} onValueChange={(v) => setCategory(v ?? categoryOptions[0] ?? "Compliance")}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categoryOptions.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card className="border-surface-border shadow-card">
        <CardHeader>
          <CardTitle className="text-base">Steps</CardTitle>
          <p className="text-xs text-text-tertiary">
            Each step unlocks only after the previous one is completed — courses and tasks can be mixed
            (Onboarding Journey Builder).
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          {steps.map((step, index) => (
            <div key={step.id} className="rounded-lg border border-surface-border p-3 space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-surface-sunken flex items-center justify-center text-xs font-medium shrink-0">
                  {index + 1}
                </span>
                {step.type === "course" ? (
                  <>
                    <BookOpen className="w-4 h-4 text-brand-600 shrink-0" />
                    <span className="text-sm font-medium text-text-primary flex-1">
                      {courses.find((c) => c.id === step.courseId)?.title ?? "Unknown course"}
                    </span>
                  </>
                ) : (
                  <>
                    <ClipboardCheck className="w-4 h-4 text-accent-600 shrink-0" />
                    <Input
                      value={step.title}
                      onChange={(e) => updateTaskStep(step.id, { title: e.target.value })}
                      className="h-7 flex-1"
                    />
                  </>
                )}
                <Button size="icon-sm" variant="ghost" onClick={() => moveStep(index, -1)}>
                  <ArrowUp className="w-3.5 h-3.5" />
                </Button>
                <Button size="icon-sm" variant="ghost" onClick={() => moveStep(index, 1)}>
                  <ArrowDown className="w-3.5 h-3.5" />
                </Button>
                <Button size="icon-sm" variant="ghost" onClick={() => removeStep(step.id)}>
                  <Trash2 className="w-3.5 h-3.5 text-danger" />
                </Button>
              </div>

              {step.type === "task" && (
                <div className="grid grid-cols-3 gap-2 pl-8">
                  <label className="text-xs text-text-tertiary">
                    Due (days after enrollment)
                    <Input
                      type="number"
                      min={0}
                      value={step.dueDayFromEnrollment}
                      onChange={(e) => updateTaskStep(step.id, { dueDayFromEnrollment: Number(e.target.value) })}
                      className="h-7 mt-1"
                    />
                  </label>
                  <label className="text-xs text-text-tertiary">
                    Assignee
                    <Input
                      value={step.assignee}
                      onChange={(e) => updateTaskStep(step.id, { assignee: e.target.value })}
                      className="h-7 mt-1"
                    />
                  </label>
                  <label className="text-xs text-text-tertiary">
                    Completion
                    <Select
                      value={step.completionType}
                      onValueChange={(v) => updateTaskStep(step.id, { completionType: (v ?? "checkbox") as CompletionType })}
                    >
                      <SelectTrigger className="w-full h-7 mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="checkbox">Checkbox</SelectItem>
                        <SelectItem value="upload">Document upload</SelectItem>
                      </SelectContent>
                    </Select>
                  </label>
                </div>
              )}
            </div>
          ))}
          {steps.length === 0 && (
            <p className="text-sm text-text-tertiary text-center py-4">No steps yet — add a course or task below.</p>
          )}

          <div className="flex items-center gap-2 pt-2 flex-wrap">
            <Select value={pickerCourseId} onValueChange={(v) => setPickerCourseId(v ?? "")}>
              <SelectTrigger className="w-56">
                <SelectValue placeholder="Select a course" />
              </SelectTrigger>
              <SelectContent>
                {courses.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button size="sm" variant="outline" className="gap-1.5" onClick={addCourseStep} disabled={!pickerCourseId}>
              <Plus className="w-3.5 h-3.5" />
              Add course step
            </Button>
            <Button size="sm" variant="outline" className="gap-1.5" onClick={addTaskStep}>
              <Plus className="w-3.5 h-3.5" />
              Add task step
            </Button>
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleSave}>Save path</Button>
    </div>
  );
}
