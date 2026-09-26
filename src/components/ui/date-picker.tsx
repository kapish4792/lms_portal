"use client";

import * as React from "react";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface DatePickerProps {
  value?: string; // YYYY-MM-DD
  onChange?: (date: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
  minYear?: number;
  maxYear?: number;
}

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const DAYS_OF_WEEK = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

export function DatePicker({
  value,
  onChange,
  placeholder = "Pick a date",
  disabled = false,
  className,
  id,
  minYear = 1940,
  maxYear = new Date().getFullYear(),
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);

  // Parse initial selected date
  const parsedDate = React.useMemo(() => {
    if (!value) return null;
    const parts = value.split("-").map(Number);
    if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) {
      return new Date(parts[0], parts[1] - 1, parts[2]);
    }
    const d = new Date(value);
    return isNaN(d.getTime()) ? null : d;
  }, [value]);

  // View state for year and month
  const [viewYear, setViewYear] = React.useState<number>(() => {
    return parsedDate ? parsedDate.getFullYear() : new Date().getFullYear() - 25; // default to ~25 years ago for DOB
  });
  const [viewMonth, setViewMonth] = React.useState<number>(() => {
    return parsedDate ? parsedDate.getMonth() : 0;
  });

  // Sync view when value changes from outside
  React.useEffect(() => {
    if (parsedDate) {
      setViewYear(parsedDate.getFullYear());
      setViewMonth(parsedDate.getMonth());
    }
  }, [parsedDate]);

  // Generate years list
  const years = React.useMemo(() => {
    const list: number[] = [];
    for (let y = maxYear; y >= minYear; y--) {
      list.push(y);
    }
    return list;
  }, [minYear, maxYear]);

  // Calendar day calculation
  const calendarDays = React.useMemo(() => {
    const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

    const days: { date: Date; isCurrentMonth: boolean }[] = [];

    // Prev month days
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
      days.push({
        date: new Date(viewYear, viewMonth - 1, daysInPrevMonth - i),
        isCurrentMonth: false,
      });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        date: new Date(viewYear, viewMonth, i),
        isCurrentMonth: true,
      });
    }

    // Next month days to fill grid (42 cells: 6 rows of 7)
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      days.push({
        date: new Date(viewYear, viewMonth + 1, i),
        isCurrentMonth: false,
      });
    }

    return days;
  }, [viewYear, viewMonth]);

  const handleSelectDay = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const formatted = `${year}-${month}-${day}`;
    onChange?.(formatted);
    setOpen(false);
  };

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((prev) => prev - 1);
    } else {
      setViewMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((prev) => prev + 1);
    } else {
      setViewMonth((prev) => prev + 1);
    }
  };

  const formattedDisplay = React.useMemo(() => {
    if (!parsedDate) return null;
    return parsedDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }, [parsedDate]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <button
            type="button"
            id={id}
            disabled={disabled}
            className={cn(
              "flex h-10 w-full items-center justify-between rounded-lg border border-surface-border bg-surface-base px-3 py-2 text-sm shadow-xs transition-all duration-200 outline-none text-left",
              "hover:border-primary/50",
              "focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20",
              "focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20",
              "data-[popup-open]:border-primary data-[popup-open]:ring-2 data-[popup-open]:ring-primary/20",
              "data-open:border-primary data-open:ring-2 data-open:ring-primary/20",
              "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-surface-sunken",
              !formattedDisplay && "text-text-tertiary",
              className
            )}
          >
            <span className="flex items-center gap-2 truncate">
              <CalendarIcon className="h-4 w-4 shrink-0 text-text-tertiary" />
              <span>{formattedDisplay || placeholder}</span>
            </span>
            {formattedDisplay && !disabled && (
              <span
                role="button"
                tabIndex={0}
                className="p-0.5 rounded hover:bg-surface-sunken text-text-tertiary hover:text-text-primary"
                onClick={(e) => {
                  e.stopPropagation();
                  onChange?.("");
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.stopPropagation();
                    onChange?.("");
                  }
                }}
                title="Clear date"
              >
                <X className="h-3.5 w-3.5" />
              </span>
            )}
          </button>
        }
      />
      <PopoverContent
        align="start"
        sideOffset={6}
        className="w-auto p-3 shadow-lg border border-surface-border bg-surface-base rounded-xl z-50 min-w-[280px]"
      >
        {/* Header: Month and Year Selectors + Navigation */}
        <div className="flex items-center justify-between gap-1 pb-3 mb-2 border-b border-surface-border">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-text-secondary hover:text-text-primary hover:bg-surface-sunken"
            onClick={handlePrevMonth}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <div className="flex items-center gap-1.5">
            {/* Month Dropdown */}
            <select
              value={viewMonth}
              onChange={(e) => setViewMonth(Number(e.target.value))}
              className="text-xs font-semibold bg-surface-sunken text-text-primary border border-surface-border rounded-md px-2 py-1 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 cursor-pointer"
            >
              {MONTH_NAMES.map((month, idx) => (
                <option key={month} value={idx}>
                  {month}
                </option>
              ))}
            </select>

            {/* Year Dropdown */}
            <select
              value={viewYear}
              onChange={(e) => setViewYear(Number(e.target.value))}
              className="text-xs font-semibold bg-surface-sunken text-text-primary border border-surface-border rounded-md px-2 py-1 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 cursor-pointer"
            >
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-text-secondary hover:text-text-primary hover:bg-surface-sunken"
            onClick={handleNextMonth}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Days of Week Header */}
        <div className="grid grid-cols-7 gap-1 text-center mb-1">
          {DAYS_OF_WEEK.map((d) => (
            <div
              key={d}
              className="text-[11px] font-semibold text-text-tertiary h-6 flex items-center justify-center"
            >
              {d}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map(({ date, isCurrentMonth }, idx) => {
            const isSelected =
              parsedDate &&
              parsedDate.getFullYear() === date.getFullYear() &&
              parsedDate.getMonth() === date.getMonth() &&
              parsedDate.getDate() === date.getDate();

            const isToday =
              new Date().getFullYear() === date.getFullYear() &&
              new Date().getMonth() === date.getMonth() &&
              new Date().getDate() === date.getDate();

            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectDay(date)}
                className={cn(
                  "h-8 w-8 text-xs font-medium rounded-lg flex items-center justify-center transition-colors relative",
                  !isCurrentMonth && "text-text-tertiary/40",
                  isCurrentMonth && !isSelected && "text-text-primary hover:bg-surface-sunken hover:text-primary",
                  isSelected && "bg-primary text-primary-foreground font-semibold shadow-xs hover:bg-primary/90",
                  isToday && !isSelected && "border border-primary/40 font-bold text-primary"
                )}
              >
                {date.getDate()}
              </button>
            );
          })}
        </div>

        {/* Quick action footer */}
        <div className="flex items-center justify-between pt-2.5 mt-2 border-t border-surface-border text-xs">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-6 text-[11px] px-2 text-text-tertiary hover:text-text-primary"
            onClick={() => {
              const today = new Date();
              setViewYear(today.getFullYear());
              setViewMonth(today.getMonth());
              handleSelectDay(today);
            }}
          >
            Today
          </Button>
          {parsedDate && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-6 text-[11px] px-2 text-text-tertiary hover:text-danger"
              onClick={() => {
                onChange?.("");
                setOpen(false);
              }}
            >
              Clear
            </Button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
