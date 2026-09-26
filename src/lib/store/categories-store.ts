import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Category {
  id: string;
  name: string;
  org: string;
  parentId?: string;
  description?: string;
  color?: string;
}

// Matches the hardcoded lists CourseForm.tsx and the Course Store catalog used
// before this module existed, so migrating Course.category (a string) needs no
// data migration right now — it just needs to keep matching a Category.name.
const seedCategories = (): Category[] => [
  { id: "cat-1", name: "Compliance", org: "Acme Corp", color: "var(--danger)" },
  { id: "cat-2", name: "Technical Skills", org: "Acme Corp", color: "var(--color-chart-1)" },
  { id: "cat-3", name: "Leadership", org: "Acme Corp", color: "var(--color-chart-2)" },
  { id: "cat-4", name: "Sales Enablement", org: "Acme Corp", color: "var(--color-chart-3)" },
  { id: "cat-5", name: "Onboarding", org: "Acme Corp", color: "var(--success)" },
];

interface CategoriesState {
  categories: Category[];
  addCategory: (category: Omit<Category, "id">) => string;
  updateCategory: (id: string, patch: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
}

export const useCategoriesStore = create<CategoriesState>()(
  persist(
    (set) => ({
      categories: seedCategories(),
      addCategory: (category) => {
        const id = `cat-${Date.now()}`;
        set((state) => ({ categories: [...state.categories, { ...category, id }] }));
        return id;
      },
      updateCategory: (id, patch) =>
        set((state) => ({
          categories: state.categories.map((c) => (c.id === id ? { ...c, ...patch } : c)),
        })),
      deleteCategory: (id) => set((state) => ({ categories: state.categories.filter((c) => c.id !== id) })),
    }),
    { name: "lms-categories-store" }
  )
);
