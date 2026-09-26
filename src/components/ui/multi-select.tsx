"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { ChevronDown, Check, X, Search, Plus } from "lucide-react";

interface MultiSelectProps {
  options: string[];
  value: string[];
  onValueChange: (value: string[]) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  className?: string;
  disabled?: boolean;
  searchable?: boolean;
  maxSelected?: number;
  onCreateOption?: (option: string) => void;
}

function MultiSelect({
  options,
  value,
  onValueChange,
  placeholder = "Select options...",
  searchPlaceholder = "Search categories...",
  className,
  disabled = false,
  searchable = true,
  maxSelected,
  onCreateOption,
}: MultiSelectProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [triggerWidth, setTriggerWidth] = React.useState(0);
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const contentRef = React.useRef<HTMLDivElement>(null);
  const searchInputRef = React.useRef<HTMLInputElement>(null);

  const filteredOptions = React.useMemo(() => {
    if (!searchable || !searchQuery.trim()) return options;
    return options.filter((opt) =>
      opt.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [options, searchQuery, searchable]);

  const selectedSet = new Set(value);

  const toggleOption = (option: string) => {
    if (disabled) return;
    const newSelected = new Set(selectedSet);
    if (newSelected.has(option)) {
      newSelected.delete(option);
    } else if (!maxSelected || newSelected.size < maxSelected) {
      newSelected.add(option);
    }
    onValueChange(Array.from(newSelected));
  };

  const removeSelected = (option: string) => {
    if (disabled) return;
    const newSelected = new Set(selectedSet);
    newSelected.delete(option);
    onValueChange(Array.from(newSelected));
  };

  React.useLayoutEffect(() => {
    if (triggerRef.current) {
      setTriggerWidth(triggerRef.current.offsetWidth);
    }
  }, [isOpen]);

  React.useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node) &&
        contentRef.current &&
        !contentRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchQuery("");
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const trimmed = searchQuery.trim();
      if (!trimmed) return;

      const exactMatch = options.find((opt) => opt.toLowerCase() === trimmed.toLowerCase());
      if (exactMatch) {
        toggleOption(exactMatch);
        setSearchQuery("");
      } else if (filteredOptions.length === 1) {
        toggleOption(filteredOptions[0]);
        setSearchQuery("");
      } else if (onCreateOption) {
        onCreateOption(trimmed);
        setSearchQuery("");
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
      setSearchQuery("");
    }
  };

  const isExactOptionMatch = Boolean(
    searchQuery.trim() &&
    options.some((o) => o.toLowerCase() === searchQuery.trim().toLowerCase())
  );

  return (
    <div className={cn("relative w-full", className)} ref={contentRef}>
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex flex-wrap items-center gap-1.5 w-full min-h-[42px] px-3 py-2 text-sm rounded-xl border border-border bg-background transition-colors outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-50 text-foreground text-left cursor-pointer",
          isOpen && "border-primary ring-1 ring-primary/20"
        )}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        {value.length === 0 ? (
          <span className="flex-1 text-xs text-muted-foreground select-none">{placeholder}</span>
        ) : (
          <span className="flex-1 flex flex-wrap gap-1.5">
            {value.map((v) => (
              <span
                key={v}
                className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-primary/10 text-primary border border-primary/20"
              >
                <span>{v}</span>
                <span
                  role="button"
                  tabIndex={0}
                  onClick={(e) => {
                    e.stopPropagation();
                    removeSelected(v);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.stopPropagation();
                      removeSelected(v);
                    }
                  }}
                  className="w-3.5 h-3.5 flex items-center justify-center rounded hover:bg-primary/20 cursor-pointer"
                  title={`Remove ${v}`}
                >
                  <X className="w-3 h-3" />
                </span>
              </span>
            ))}
          </span>
        )}
        <ChevronDown
          className={cn(
            "pointer-events-none shrink-0 w-4 h-4 text-muted-foreground transition-transform duration-200 ml-auto",
            isOpen && "rotate-180"
          )}
        />
      </button>

      {isOpen && (
        <div
          className="absolute z-50 w-full mt-1.5 max-h-96 overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-xl animate-in fade-in-100 zoom-in-95"
          style={{ minWidth: Math.max(triggerWidth || 0, 300) }}
        >
          {searchable && (
            <div className="relative p-2 border-b border-border sticky top-0 bg-card z-10">
              <Search className="absolute left-4.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={searchPlaceholder}
                className="w-full pl-8 pr-7 py-1.5 text-xs rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}

          <div className="max-h-[280px] overflow-y-auto p-1.5">
            {onCreateOption && searchQuery.trim() && !isExactOptionMatch && (
              <button
                type="button"
                onClick={() => {
                  onCreateOption(searchQuery.trim());
                  setSearchQuery("");
                }}
                className="flex items-center gap-2 w-full px-3 py-2 text-xs font-semibold text-primary hover:bg-primary/10 rounded-lg transition-colors text-left mb-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 shrink-0" />
                <span>Create &quot;{searchQuery.trim()}&quot;</span>
              </button>
            )}

            {filteredOptions.length === 0 && (!onCreateOption || !searchQuery.trim() || isExactOptionMatch) ? (
              <div className="px-3 py-4 text-center text-xs text-muted-foreground">
                {searchable && searchQuery
                  ? `No categories match "${searchQuery}"`
                  : "No categories available"}
              </div>
            ) : (
              <ul role="listbox" className="space-y-0.5">
                {filteredOptions.map((option) => {
                  const isSelected = selectedSet.has(option);
                  return (
                    <li
                      key={option}
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => toggleOption(option)}
                      className={cn(
                        "flex items-center gap-2.5 px-3 py-2 text-xs rounded-lg cursor-pointer transition-colors group select-none",
                        isSelected
                          ? "bg-primary/10 text-primary font-medium"
                          : "text-foreground hover:bg-muted"
                      )}
                    >
                      <div
                        className={cn(
                          "w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors",
                          isSelected
                            ? "bg-primary border-primary text-primary-foreground"
                            : "border-border bg-background group-hover:border-primary/50"
                        )}
                      >
                        {isSelected && <Check className="w-3 h-3 text-primary-foreground stroke-[2.5]" />}
                      </div>
                      <span className="flex-1 truncate">{option}</span>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {value.length > 0 && (
            <div className="border-t border-border px-3 py-2 sticky bottom-0 bg-card flex items-center justify-between text-xs">
              <span className="text-muted-foreground text-[11px]">
                {value.length} selected
              </span>
              <button
                type="button"
                onClick={() => onValueChange([])}
                className="font-medium text-destructive hover:underline cursor-pointer text-[11px]"
              >
                Clear all
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export { MultiSelect };