"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { FilterIcon, CheckIcon, XIcon, SearchIcon } from "lucide-react";

interface MultiSelectProps {
  options: string[];
  value: string[];
  onValueChange: (value: string[]) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  searchable?: boolean;
  maxSelected?: number;
}

function MultiSelect({
  options,
  value,
  onValueChange,
  placeholder = "Select options...",
  className,
  disabled = false,
  searchable = true,
  maxSelected,
}: MultiSelectProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [triggerWidth, setTriggerWidth] = React.useState(0);
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const contentRef = React.useRef<HTMLDivElement>(null);

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

  return (
    <div className={cn("relative w-full", className)} ref={contentRef}>
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex flex-wrap items-center gap-1.5 w-full min-h-[40px] px-3 py-2 text-sm rounded-lg border bg-input/20 transition-colors outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-50",
          "border-surface-border text-text-primary placeholder:text-text-tertiary",
          "dark:bg-input/30"
        )}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        {value.length === 0 ? (
          <span className="flex-1 text-text-tertiary">{placeholder}</span>
        ) : (
          <span className="flex-1 flex flex-wrap gap-1.5">
            {value.map((v) => (
              <span
                key={v}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-primary/10 text-primary border border-primary/20"
              >
                {v}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeSelected(v);
                  }}
                  className="w-4 h-4 flex items-center justify-center rounded hover:bg-primary/20"
                >
                  <XIcon className="w-2.5 h-2.5" />
                </button>
              </span>
            ))}
          </span>
        )}
        <FilterIcon
          className={cn(
            "pointer-events-none shrink-0 size-4 text-text-tertiary transition-transform",
            isOpen && "rotate-180"
          )}
        />
      </button>

      {isOpen && (
        <div
          className="absolute z-50 w-full mt-1.5 max-h-96 overflow-hidden rounded-lg border border-surface-border bg-popover text-popover-foreground shadow-md ring-1 ring-foreground/10 animate-in fade-in-100 zoom-in-95"
          style={{ minWidth: Math.max(triggerWidth || 0, 320) }}
        >
          {searchable && (
            <div className="relative px-3 py-2 border-b border-surface-border sticky top-0 bg-popover z-10">
              <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 size-3.5 text-text-tertiary" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search categories..."
                className="w-full pl-10 pr-3 py-2 text-sm rounded-lg border border-surface-border bg-surface-base text-text-primary placeholder:text-text-tertiary outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                autoFocus
              />
            </div>
          )}

          <div className="max-h-[320px] overflow-y-auto px-2 py-1.5">
            {filteredOptions.length === 0 ? (
              <div className="px-2 py-3 text-center text-sm text-text-tertiary">
                {searchable && searchQuery
                  ? `No categories match "${searchQuery}"`
                  : "No categories available"}
              </div>
            ) : (
              <ul role="listbox" className="space-y-0.5 px-1">
                {filteredOptions.map((option) => {
                  const isSelected = selectedSet.has(option);
                  return (
                    <li
                      key={option}
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => toggleOption(option)}
                      className={cn(
                        "relative flex items-center gap-3 px-3 py-2.5 text-sm rounded-md cursor-pointer transition-colors group",
                        isSelected
                          ? "bg-primary/10 text-primary font-medium"
                          : "text-text-secondary hover:bg-surface-sunken hover:text-text-primary"
                      )}
                    >
                      <div className="relative flex items-center justify-center shrink-0">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}}
                          className="absolute opacity-0 pointer-events-none"
                          aria-hidden="true"
                        />
                        <div className={cn(
                          "w-4.5 h-4.5 rounded border-2 flex items-center justify-center transition-all",
                          isSelected
                            ? "bg-primary border-primary"
                            : "border-surface-border hover:border-primary/50"
                        )}>
                          {isSelected && <CheckIcon className="w-3 h-3 text-primary-foreground" />}
                        </div>
                      </div>
                      <span className="flex-1 truncate">{option}</span>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {value.length > 0 && (
            <div className="border-t border-surface-border px-2 py-1.5 sticky bottom-0 bg-popover">
              <button
                type="button"
                onClick={() => onValueChange([])}
                className="w-full text-xs font-medium text-danger hover:text-danger/80"
              >
                Clear all ({value.length})
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export { MultiSelect };