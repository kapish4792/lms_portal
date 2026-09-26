export interface FilterOption {
  value: string;
  label: string;
}

export const FILTER_OPTIONS = {
  courseStatus: [
    { value: "all", label: "All statuses" },
    { value: "published", label: "Published" },
    { value: "draft", label: "Draft" },
  ],
  userStatus: [
    { value: "all", label: "All statuses" },
    { value: "Active", label: "Active" },
    { value: "Suspended", label: "Suspended" },
  ],
  price: [
    { value: "all", label: "All" },
    { value: "free", label: "Free" },
    { value: "paid", label: "Paid" },
  ],
  category: [
    { value: "all", label: "All categories" },
  ],
  userRole: [
    { value: "all", label: "All user types" },
  ],
} as const;

export type FilterOptionKey = keyof typeof FILTER_OPTIONS;

export function getFilterOptions(key: FilterOptionKey): readonly FilterOption[] {
  return FILTER_OPTIONS[key];
}

export function getFilterValue(key: FilterOptionKey, filterKey: string): string | undefined {
  const options = FILTER_OPTIONS[key];
  const option = options.find((opt) => opt.value === filterKey);
  return option?.value;
}

export function getFilterLabel(key: FilterOptionKey, filterKey: string): string | undefined {
  const options = FILTER_OPTIONS[key];
  const option = options.find((opt) => opt.value === filterKey);
  return option?.label;
}