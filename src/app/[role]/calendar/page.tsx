"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { useRoleGuard } from "@/lib/hooks/use-role-guard";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useCalendarStore, type CalendarEvent, type EventType } from "@/lib/store/calendar-store";
import { useCoursesStore } from "@/lib/store/courses-store";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  Plus,
  Search,
  Video,
  AlertCircle,
  FileCheck2,
  Users,
  MapPin,
  Download,
  Trash2,
  CalendarCheck,
  Sparkles,
  BookOpen,
  CheckCircle2,
  Share2,
  SlidersHorizontal,
  X,
} from "lucide-react";

type CalendarViewMode = "month" | "week" | "day" | "agenda";

const EVENT_TYPE_CONFIG: Record<
  EventType,
  { label: string; badgeClass: string; chipClass: string; icon: typeof CalendarIcon }
> = {
  live_session: {
    label: "Live Session",
    badgeClass: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-900/50",
    chipClass: "bg-blue-500/15 text-blue-700 dark:text-blue-300 border-l-4 border-blue-500",
    icon: Video,
  },
  deadline: {
    label: "Course Deadline",
    badgeClass: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900/50",
    chipClass: "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-l-4 border-rose-500",
    icon: AlertCircle,
  },
  assessment: {
    label: "Assessment / Exam",
    badgeClass: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900/50",
    chipClass: "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-l-4 border-amber-500",
    icon: FileCheck2,
  },
  office_hours: {
    label: "Office Hours",
    badgeClass: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/50",
    chipClass: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-l-4 border-emerald-500",
    icon: Users,
  },
  event: {
    label: "Platform Event",
    badgeClass: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-900/50",
    chipClass: "bg-purple-500/15 text-purple-700 dark:text-purple-300 border-l-4 border-purple-500",
    icon: Sparkles,
  },
};

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function CalendarPage() {
  const params = useParams<{ role: string }>();
  const user = useRoleGuard(params.role);

  const events = useCalendarStore((s) => s.events);
  const addEvent = useCalendarStore((s) => s.addEvent);
  const deleteEvent = useCalendarStore((s) => s.deleteEvent);
  const courses = useCoursesStore((s) => s.courses);

  // Active navigation date (Defaulting to September 2026 based on seed data)
  const [currentDate, setCurrentDate] = useState(() => new Date("2026-09-26T00:00:00"));
  const [viewMode, setViewMode] = useState<CalendarViewMode>("month");

  // Filter & Search states
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<string>("All Event Types");
  const [filterCourse, setFilterCourse] = useState<string>("All Courses");

  // Modals state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [dayDetailsModal, setDayDetailsModal] = useState<{ dateStr: string; events: CalendarEvent[] } | null>(null);

  // New Event Form fields
  const [newTitle, setNewTitle] = useState("");
  const [newType, setNewType] = useState<EventType>("live_session");
  const [newDate, setNewDate] = useState("2026-10-01");
  const [newStartTime, setNewStartTime] = useState("10:00");
  const [newEndTime, setNewEndTime] = useState("11:30");
  const [newCourseTitle, setNewCourseTitle] = useState("");
  const [newInstructorName, setNewInstructorName] = useState("");
  const [newLocationType, setNewLocationType] = useState<"virtual" | "physical" | "asynchronous">("virtual");
  const [newLocationDetail, setNewLocationDetail] = useState("https://zoom.us/j/sample");
  const [newDescription, setNewDescription] = useState("");
  const [newAudience, setNewAudience] = useState<"all" | "learners" | "instructors" | "group">("all");
  const [newPriority, setNewPriority] = useState<"low" | "medium" | "high">("medium");

  const scopedCourses = useMemo(
    () => (user ? courses.filter((c) => c.org === user.org) : []),
    [courses, user]
  );

  const scopedEvents = useMemo(
    () => (user ? events.filter((e) => e.org === user.org) : []),
    [events, user]
  );

  const filteredEvents = useMemo(() => {
    return scopedEvents.filter((e) => {
      const matchesSearch =
        !search.trim() ||
        e.title.toLowerCase().includes(search.toLowerCase()) ||
        e.description.toLowerCase().includes(search.toLowerCase()) ||
        (e.courseTitle && e.courseTitle.toLowerCase().includes(search.toLowerCase())) ||
        (e.instructorName && e.instructorName.toLowerCase().includes(search.toLowerCase()));

      const matchesType = filterType === "All Event Types" || e.type === filterType;
      const matchesCourse = filterCourse === "All Courses" || e.courseTitle === filterCourse;

      return matchesSearch && matchesType && matchesCourse;
    });
  }, [scopedEvents, search, filterType, filterCourse]);

  if (!user) return null;

  const canManageEvents =
    user.role === "instructor" ||
    user.role === "org-admin" ||
    user.role === "super-admin" ||
    user.role === "lms-admin" ||
    user.role === "dept-head";

  // Navigation handlers
  const handlePrev = () => {
    const next = new Date(currentDate);
    if (viewMode === "month") {
      next.setMonth(next.getMonth() - 1);
    } else if (viewMode === "week") {
      next.setDate(next.getDate() - 7);
    } else if (viewMode === "day") {
      next.setDate(next.getDate() - 1);
    } else {
      next.setMonth(next.getMonth() - 1);
    }
    setCurrentDate(next);
  };

  const handleNext = () => {
    const next = new Date(currentDate);
    if (viewMode === "month") {
      next.setMonth(next.getMonth() + 1);
    } else if (viewMode === "week") {
      next.setDate(next.getDate() + 7);
    } else if (viewMode === "day") {
      next.setDate(next.getDate() + 1);
    } else {
      next.setMonth(next.getMonth() + 1);
    }
    setCurrentDate(next);
  };

  const handleToday = () => {
    setCurrentDate(new Date("2026-09-26T00:00:00"));
  };

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    // Calculate duration
    let durationMinutes = 60;
    try {
      const [sh, sm] = newStartTime.split(":").map(Number);
      const [eh, em] = newEndTime.split(":").map(Number);
      const diff = (eh * 60 + em) - (sh * 60 + sm);
      if (diff > 0) durationMinutes = diff;
    } catch {
      durationMinutes = 60;
    }

    addEvent({
      title: newTitle.trim(),
      description: newDescription.trim() || "No additional description provided.",
      type: newType,
      date: newDate,
      startTime: newStartTime,
      endTime: newEndTime,
      durationMinutes,
      courseTitle: newCourseTitle || undefined,
      instructorName: newInstructorName || user.name,
      locationType: newLocationType,
      locationDetail: newLocationDetail.trim() || undefined,
      org: user.org,
      audience: newAudience,
      priority: newPriority,
    });

    // Reset and close
    setNewTitle("");
    setNewDescription("");
    setCreateModalOpen(false);
  };

  // Download .ics file helper
  const downloadIcs = (eventItem: CalendarEvent) => {
    const formatDateForIcs = (dateStr: string, timeStr: string) => {
      const [yearStr, monthStr, dayStr] = dateStr.split("-");
      const [hour, min] = timeStr.split(":");
      return `${yearStr}${monthStr}${dayStr}T${hour}${min}00Z`;
    };

    const dtStart = formatDateForIcs(eventItem.date, eventItem.startTime);
    const dtEnd = formatDateForIcs(eventItem.date, eventItem.endTime);

    const icsContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//LMS Platform//Calendar System//EN",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
      "BEGIN:VEVENT",
      `UID:${eventItem.id}@lms.dev`,
      `DTSTAMP:${dtStart}`,
      `DTSTART:${dtStart}`,
      `DTEND:${dtEnd}`,
      `SUMMARY:${eventItem.title}`,
      `DESCRIPTION:${eventItem.description.replace(/\n/g, "\\n")}`,
      `LOCATION:${eventItem.locationDetail || eventItem.locationType}`,
      "STATUS:CONFIRMED",
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");

    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${eventItem.title.replace(/[^a-zA-Z0-9]/g, "_")}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Month grid calculations
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const startDayIndex = firstDayOfMonth.getDay(); // 0 for Sun
  const totalDaysInMonth = new Date(year, month + 1, 0).getDate();

  const calendarDays: Array<{
    dayNumber: number;
    dateStr: string;
    isCurrentMonth: boolean;
    isToday: boolean;
    events: CalendarEvent[];
  }> = [];

  // Previous month padding
  const totalDaysInPrevMonth = new Date(year, month, 0).getDate();
  for (let i = startDayIndex - 1; i >= 0; i--) {
    const d = totalDaysInPrevMonth - i;
    const prevMonth = month === 0 ? 11 : month - 1;
    const prevYear = month === 0 ? year - 1 : year;
    const dateStr = `${prevYear}-${String(prevMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    calendarDays.push({
      dayNumber: d,
      dateStr,
      isCurrentMonth: false,
      isToday: dateStr === "2026-09-26",
      events: filteredEvents.filter((e) => e.date === dateStr),
    });
  }

  // Current month days
  for (let d = 1; d <= totalDaysInMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    calendarDays.push({
      dayNumber: d,
      dateStr,
      isCurrentMonth: true,
      isToday: dateStr === "2026-09-26",
      events: filteredEvents.filter((e) => e.date === dateStr),
    });
  }

  // Next month padding to reach a complete multiple of 7 (up to 35 or 42 cells)
  const remainingCells = 42 - calendarDays.length;
  if (remainingCells > 0 && remainingCells < 7) {
    for (let d = 1; d <= remainingCells; d++) {
      const nextMonth = month === 11 ? 0 : month + 1;
      const nextYear = month === 11 ? year + 1 : year;
      const dateStr = `${nextYear}-${String(nextMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      calendarDays.push({
        dayNumber: d,
        dateStr,
        isCurrentMonth: false,
        isToday: dateStr === "2026-09-26",
        events: filteredEvents.filter((e) => e.date === dateStr),
      });
    }
  }

  // Distinct courses for filter
  const uniqueCourseTitles = Array.from(
    new Set(scopedEvents.map((e) => e.courseTitle).filter(Boolean))
  ) as string[];

  // Today & Upcoming events for sidebar
  const todayStr = "2026-09-26";
  const todayEvents = scopedEvents.filter((e) => e.date === todayStr);
  const upcomingDeadlines = scopedEvents
    .filter((e) => e.type === "deadline" || e.priority === "high")
    .slice(0, 4);

  return (
    <AppShell user={user}>
      <div className="p-6 space-y-6 w-full pb-12">
        {/* Top Header Card */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card border border-border p-6 rounded-xl shadow-xs">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-2 rounded-lg bg-primary/10 text-primary">
                <CalendarIcon className="w-5 h-5" />
              </span>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                Training & Event Calendar
              </h1>
            </div>
            <p className="text-sm text-muted-foreground">
              Track upcoming live webinars, assignment deadlines, proctored exams, and instructor office hours.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* View Switcher */}
            <div className="inline-flex bg-muted p-1 rounded-lg border border-border/50 text-xs font-medium">
              {(["month", "week", "day", "agenda"] as CalendarViewMode[]).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setViewMode(mode)}
                  className={`px-3 py-1.5 rounded-md capitalize transition-all ${
                    viewMode === mode
                      ? "bg-background text-foreground shadow-xs font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>

            {/* Schedule Event button (Admin/Instructor) */}
            {canManageEvents && (
              <Button
                onClick={() => {
                  setNewTitle("");
                  setNewCourseTitle(scopedCourses[0]?.title ?? "");
                  setCreateModalOpen(true);
                }}
                className="gap-2 h-10 px-4 font-semibold"
              >
                <Plus className="w-4 h-4" />
                Schedule Event
              </Button>
            )}
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex items-center gap-3 flex-wrap rounded-xl border border-surface-border bg-surface-sunken/40 p-3">
          <div className="relative flex-1 min-w-55 sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-tertiary" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by event title, course, or instructor..."
              className="h-9 pl-9 bg-surface-base"
            />
          </div>

          <div className="hidden sm:block h-6 w-px bg-surface-border" />

          <div className="flex items-center gap-2 flex-wrap">
            <SlidersHorizontal className="hidden sm:block w-3.5 h-3.5 text-text-tertiary shrink-0" />
            <Select value={filterType} onValueChange={(val) => setFilterType(val || "All Event Types")}>
              <SelectTrigger size="sm" className="w-48 bg-surface-base">
                <SelectValue placeholder="All Event Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All Event Types">All Event Types</SelectItem>
                <SelectItem value="live_session">Live Sessions / ILT</SelectItem>
                <SelectItem value="deadline">Course Deadlines</SelectItem>
                <SelectItem value="assessment">Assessments & Exams</SelectItem>
                <SelectItem value="office_hours">Office Hours</SelectItem>
                <SelectItem value="event">Platform Events</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterCourse} onValueChange={(val) => setFilterCourse(val || "All Courses")}>
              <SelectTrigger size="sm" className="w-48 bg-surface-base">
                <SelectValue placeholder="All Courses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All Courses">All Courses</SelectItem>
                {uniqueCourseTitles.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {(search || filterType !== "All Event Types" || filterCourse !== "All Courses") && (
              <Button
                variant="ghost"
                size="sm"
                className="h-9 gap-1.5 text-text-tertiary hover:text-text-primary"
                onClick={() => {
                  setSearch("");
                  setFilterType("All Event Types");
                  setFilterCourse("All Courses");
                }}
              >
                <X className="w-3.5 h-3.5" />
                Clear
              </Button>
            )}
          </div>
        </div>

        {/* Main Grid: Left Calendar View + Right Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Calendar Display Canvas */}
          <div className="lg:col-span-8 xl:col-span-9 space-y-4">
            {/* Month / Week / Day Navigator Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-card border border-border p-4 rounded-xl shadow-xs">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 bg-muted/60 p-0.5 rounded-lg border border-border/60">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handlePrev}
                    className="h-8 w-8 p-0"
                    aria-label="Previous Period"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleNext}
                    className="h-8 w-8 p-0"
                    aria-label="Next Period"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleToday}
                  className="h-8 px-3 font-medium text-xs"
                >
                  Today
                </Button>

                <h2 className="text-lg md:text-xl font-bold tracking-tight text-foreground ml-2">
                  {MONTH_NAMES[month]} {year}
                </h2>
              </div>

              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5 font-medium">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Live
                </span>
                <span className="flex items-center gap-1.5 font-medium">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Deadline
                </span>
                <span className="flex items-center gap-1.5 font-medium">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Exam
                </span>
                <span className="flex items-center gap-1.5 font-medium">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Office Hrs
                </span>
              </div>
            </div>

            {/* 1. MONTH VIEW */}
            {viewMode === "month" && (
              <div className="bg-card border border-border rounded-xl shadow-xs overflow-hidden">
                {/* Day of week headers */}
                <div className="grid grid-cols-7 border-b border-border bg-muted/40 text-center py-2.5 text-xs font-semibold text-muted-foreground">
                  {DAY_NAMES.map((day) => (
                    <div key={day} className="tracking-wide uppercase">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar month cells */}
                <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-border">
                  {calendarDays.map((cell, idx) => {
                    const isSunday = idx % 7 === 0;
                    const isSaturday = idx % 7 === 6;

                    return (
                      <div
                        key={idx}
                        onClick={() => {
                          if (cell.events.length > 0) {
                            setDayDetailsModal({ dateStr: cell.dateStr, events: cell.events });
                          }
                        }}
                        className={`min-h-[110px] md:min-h-[130px] p-2 flex flex-col transition-colors cursor-pointer group ${
                          cell.isCurrentMonth
                            ? isSunday || isSaturday
                              ? "bg-card hover:bg-muted/30"
                              : "bg-card hover:bg-muted/40"
                            : "bg-muted/15 text-muted-foreground/60 hover:bg-muted/25"
                        } ${cell.isToday ? "ring-2 ring-inset ring-primary/40 bg-primary/5" : ""}`}
                      >
                        {/* Day Number Header */}
                        <div className="flex items-center justify-between mb-1.5">
                          <span
                            className={`text-xs font-semibold px-1.5 py-0.5 rounded-md ${
                              cell.isToday
                                ? "bg-primary text-primary-foreground font-bold"
                                : cell.isCurrentMonth
                                ? "text-foreground group-hover:text-primary transition-colors"
                                : "text-muted-foreground/60"
                            }`}
                          >
                            {cell.dayNumber}
                          </span>

                          {cell.events.length > 0 && (
                            <span className="text-[10px] font-medium text-muted-foreground">
                              {cell.events.length} {cell.events.length === 1 ? "event" : "events"}
                            </span>
                          )}
                        </div>

                        {/* Event Pills */}
                        <div className="space-y-1 flex-1 overflow-hidden">
                          {cell.events.slice(0, 3).map((evt) => {
                            const conf = EVENT_TYPE_CONFIG[evt.type] || EVENT_TYPE_CONFIG.event;
                            return (
                              <div
                                key={evt.id}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedEvent(evt);
                                }}
                                className={`text-[11px] leading-tight px-1.5 py-1 rounded-sm border truncate font-medium flex items-center gap-1 shadow-2xs hover:brightness-95 transition-all ${conf.chipClass}`}
                                title={`${evt.startTime} - ${evt.title}`}
                              >
                                <span className="font-semibold text-[10px] opacity-80 shrink-0">
                                  {evt.startTime}
                                </span>
                                <span className="truncate">{evt.title}</span>
                              </div>
                            );
                          })}

                          {cell.events.length > 3 && (
                            <div className="text-[10px] font-medium text-primary hover:underline px-1">
                              +{cell.events.length - 3} more...
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 2. WEEK VIEW */}
            {viewMode === "week" && (
              <div className="bg-card border border-border rounded-xl shadow-xs overflow-hidden">
                <div className="p-4 border-b border-border bg-muted/20 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-foreground">
                    Weekly Schedule Overview
                  </h3>
                  <Badge variant="outline" className="text-xs">
                    {filteredEvents.length} total scheduled items
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-7 divide-y md:divide-y-0 md:divide-x divide-border">
                  {DAY_NAMES.map((dayName, index) => {
                    // Find matching calendar day in week
                    const matchingDay = calendarDays.find(
                      (c, i) => i % 7 === index && c.isCurrentMonth
                    );
                    const dayEvents = matchingDay ? matchingDay.events : [];

                    return (
                      <div key={dayName} className="p-3 min-h-[300px] flex flex-col bg-card">
                        <div className="border-b border-border pb-2 mb-3 text-center">
                          <div className="text-xs font-bold uppercase text-muted-foreground">
                            {dayName}
                          </div>
                          <div
                            className={`text-sm font-extrabold mt-0.5 inline-block px-2 py-0.5 rounded-full ${
                              matchingDay?.isToday
                                ? "bg-primary text-primary-foreground"
                                : "text-foreground"
                            }`}
                          >
                            {matchingDay?.dayNumber ?? "-"}
                          </div>
                        </div>

                        <div className="space-y-2 flex-1">
                          {dayEvents.length === 0 ? (
                            <div className="text-center py-8 text-[11px] text-muted-foreground/60 italic">
                              No events
                            </div>
                          ) : (
                            dayEvents.map((evt) => {
                              const conf = EVENT_TYPE_CONFIG[evt.type] || EVENT_TYPE_CONFIG.event;
                              const IconComponent = conf.icon;
                              return (
                                <div
                                  key={evt.id}
                                  onClick={() => setSelectedEvent(evt)}
                                  className={`p-2 rounded-lg border text-xs cursor-pointer shadow-2xs hover:shadow-xs transition-all ${conf.chipClass}`}
                                >
                                  <div className="flex items-center gap-1 text-[10px] font-semibold opacity-90 mb-1">
                                    <IconComponent className="w-3 h-3" />
                                    <span>{evt.startTime} - {evt.endTime}</span>
                                  </div>
                                  <div className="font-semibold text-foreground text-xs leading-snug line-clamp-2">
                                    {evt.title}
                                  </div>
                                  {evt.courseTitle && (
                                    <div className="text-[10px] text-muted-foreground mt-1 truncate">
                                      {evt.courseTitle}
                                    </div>
                                  )}
                                </div>
                              );
                            })
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 3. DAY VIEW */}
            {viewMode === "day" && (
              <div className="bg-card border border-border rounded-xl shadow-xs p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-border pb-4">
                  <div>
                    <h3 className="text-lg font-bold text-foreground">
                      Schedule for {MONTH_NAMES[month]} {currentDate.getDate()}, {year}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Comprehensive hourly schedule and upcoming action items
                    </p>
                  </div>
                  <Badge variant="outline" className="px-3 py-1 font-semibold">
                    {
                      filteredEvents.filter(
                        (e) =>
                          e.date ===
                          `${year}-${String(month + 1).padStart(2, "0")}-${String(
                            currentDate.getDate()
                          ).padStart(2, "0")}`
                      ).length
                    }{" "}
                    Events
                  </Badge>
                </div>

                <div className="space-y-3">
                  {(() => {
                    const selectedDateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(
                      currentDate.getDate()
                    ).padStart(2, "0")}`;
                    const dayEvents = filteredEvents.filter((e) => e.date === selectedDateStr);

                    if (dayEvents.length === 0) {
                      return (
                        <div className="text-center py-16 bg-muted/20 rounded-xl border border-dashed border-border">
                          <CalendarCheck className="w-10 h-10 text-muted-foreground mx-auto mb-2 opacity-50" />
                          <p className="font-semibold text-sm text-foreground">No events scheduled for this day</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Enjoy your clear schedule or click below to add a session.
                          </p>
                          {canManageEvents && (
                            <Button
                              onClick={() => {
                                setNewDate(selectedDateStr);
                                setCreateModalOpen(true);
                              }}
                              variant="outline"
                              size="sm"
                              className="mt-4 gap-2"
                            >
                              <Plus className="w-4 h-4" />
                              Schedule for this day
                            </Button>
                          )}
                        </div>
                      );
                    }

                    return dayEvents.map((evt) => {
                      const conf = EVENT_TYPE_CONFIG[evt.type] || EVENT_TYPE_CONFIG.event;
                      const IconComp = conf.icon;
                      return (
                        <div
                          key={evt.id}
                          className="p-4 rounded-xl border border-border bg-card shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-primary/40 transition-all"
                        >
                          <div className="flex items-start gap-3.5">
                            <div className={`p-2.5 rounded-lg shrink-0 mt-0.5 ${conf.badgeClass}`}>
                              <IconComp className="w-5 h-5" />
                            </div>
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-bold text-base text-foreground">{evt.title}</span>
                                <Badge variant="outline" className={`text-[10px] ${conf.badgeClass}`}>
                                  {conf.label}
                                </Badge>
                                {evt.priority === "high" && (
                                  <Badge variant="destructive" className="text-[10px]">
                                    High Priority
                                  </Badge>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground line-clamp-2">{evt.description}</p>
                              <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1 flex-wrap">
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3.5 h-3.5" />
                                  {evt.startTime} - {evt.endTime} ({evt.durationMinutes} min)
                                </span>
                                {evt.courseTitle && (
                                  <span className="flex items-center gap-1 font-medium text-foreground">
                                    <BookOpen className="w-3.5 h-3.5 text-primary" />
                                    {evt.courseTitle}
                                  </span>
                                )}
                                {evt.locationDetail && (
                                  <span className="flex items-center gap-1">
                                    <MapPin className="w-3.5 h-3.5" />
                                    {evt.locationDetail}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                            {evt.locationType === "virtual" && evt.locationDetail && (
                              <Button
                                size="sm"
                                onClick={() => window.open(evt.locationDetail, "_blank")}
                                className="gap-1.5 h-9"
                              >
                                <Video className="w-4 h-4" />
                                Join Meeting
                              </Button>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => downloadIcs(evt)}
                              className="h-9 gap-1"
                              title="Download .ics calendar file"
                            >
                              <Download className="w-4 h-4" />
                              .ics
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedEvent(evt)}
                              className="h-9"
                            >
                              Details
                            </Button>
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>
            )}

            {/* 4. AGENDA / LIST VIEW */}
            {viewMode === "agenda" && (
              <div className="bg-card border border-border rounded-xl shadow-xs p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-border pb-4">
                  <div>
                    <h3 className="text-lg font-bold text-foreground">Agenda & Chronological Timeline</h3>
                    <p className="text-xs text-muted-foreground">
                      All scheduled learning events, milestones, and deadlines
                    </p>
                  </div>
                  <Badge variant="outline" className="px-3 py-1 font-semibold">
                    {filteredEvents.length} Items Listed
                  </Badge>
                </div>

                <div className="space-y-4">
                  {filteredEvents.length === 0 ? (
                    <div className="text-center py-16 bg-muted/20 rounded-xl border border-dashed border-border">
                      <p className="font-semibold text-sm text-foreground">No events match your search criteria</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Try resetting your search query or filters.
                      </p>
                    </div>
                  ) : (
                    filteredEvents
                      .slice()
                      .sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime))
                      .map((evt) => {
                        const conf = EVENT_TYPE_CONFIG[evt.type] || EVENT_TYPE_CONFIG.event;
                        return (
                          <div
                            key={evt.id}
                            className="p-4 rounded-xl border border-border bg-card shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-primary/40 transition-all"
                          >
                            <div className="flex items-start gap-3.5">
                              <div className="flex flex-col items-center justify-center bg-muted/60 border border-border/80 px-3 py-2 rounded-lg text-center shrink-0 min-w-[65px]">
                                <span className="text-[10px] font-bold uppercase text-muted-foreground">
                                  {new Date(evt.date).toLocaleDateString("en-US", { month: "short" })}
                                </span>
                                <span className="text-lg font-extrabold text-foreground">
                                  {evt.date.split("-")[2]}
                                </span>
                              </div>

                              <div className="space-y-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-bold text-base text-foreground">{evt.title}</span>
                                  <Badge variant="outline" className={`text-[10px] ${conf.badgeClass}`}>
                                    {conf.label}
                                  </Badge>
                                </div>
                                <p className="text-xs text-muted-foreground line-clamp-1">{evt.description}</p>
                                <div className="flex items-center gap-3 text-xs text-muted-foreground pt-1 flex-wrap">
                                  <span className="flex items-center gap-1 font-medium text-foreground">
                                    <Clock className="w-3.5 h-3.5 text-primary" />
                                    {evt.startTime} - {evt.endTime}
                                  </span>
                                  {evt.courseTitle && (
                                    <span className="flex items-center gap-1">
                                      <BookOpen className="w-3.5 h-3.5" />
                                      {evt.courseTitle}
                                    </span>
                                  )}
                                  {evt.instructorName && (
                                    <span className="flex items-center gap-1">
                                      <Users className="w-3.5 h-3.5" />
                                      {evt.instructorName}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                              {evt.locationType === "virtual" && evt.locationDetail && (
                                <Button
                                  size="sm"
                                  onClick={() => window.open(evt.locationDetail, "_blank")}
                                  className="gap-1.5 h-9"
                                >
                                  <Video className="w-4 h-4" />
                                  Join
                                </Button>
                              )}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => downloadIcs(evt)}
                                className="h-9 gap-1"
                              >
                                <Download className="w-4 h-4" />
                                .ics
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedEvent(evt)}
                                className="h-9"
                              >
                                View
                              </Button>
                            </div>
                          </div>
                        );
                      })
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Sidebar: Today's Widget & Upcoming Deadlines */}
          <div className="lg:col-span-4 xl:col-span-3 space-y-6">
            {/* Today at a Glance Card */}
            <Card className="shadow-xs">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-bold flex items-center gap-2">
                    <Clock className="w-4 h-4 text-primary" />
                    Today at a Glance
                  </CardTitle>
                  <Badge variant="secondary" className="text-xs">
                    Sep 26, 2026
                  </Badge>
                </div>
                <CardDescription className="text-xs">
                  Activities scheduled for today
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {todayEvents.length === 0 ? (
                  <div className="text-center py-6 text-xs text-muted-foreground bg-muted/20 rounded-lg border border-dashed border-border">
                    <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-1.5" />
                    No urgent events scheduled for today.
                  </div>
                ) : (
                  todayEvents.map((evt) => (
                    <div
                      key={evt.id}
                      onClick={() => setSelectedEvent(evt)}
                      className="p-3 rounded-lg border border-border bg-muted/30 hover:bg-muted/60 transition-all cursor-pointer"
                    >
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-bold text-foreground">{evt.startTime}</span>
                        <Badge variant="outline" className="text-[10px]">
                          {evt.type.replace("_", " ")}
                        </Badge>
                      </div>
                      <p className="font-semibold text-xs text-foreground truncate">{evt.title}</p>
                      {evt.courseTitle && (
                        <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                          {evt.courseTitle}
                        </p>
                      )}
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Upcoming Deadlines Widget */}
            <Card className="shadow-xs">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-500" />
                  Upcoming Deadlines
                </CardTitle>
                <CardDescription className="text-xs">
                  Important compliance and capstone milestones
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2.5">
                {upcomingDeadlines.map((evt) => (
                  <div
                    key={evt.id}
                    onClick={() => setSelectedEvent(evt)}
                    className="p-3 rounded-lg border border-border/80 bg-rose-500/5 hover:bg-rose-500/10 transition-all cursor-pointer"
                  >
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-bold text-rose-600 dark:text-rose-400">
                        Due: {evt.date}
                      </span>
                      <Badge variant="outline" className="text-[10px] border-rose-200 text-rose-600">
                        {evt.priority.toUpperCase()}
                      </Badge>
                    </div>
                    <p className="font-semibold text-xs text-foreground line-clamp-1">{evt.title}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
                      {evt.courseTitle || "General Training"}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Calendar Export & Sync Widget */}
            <Card className="shadow-xs">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Share2 className="w-4 h-4 text-primary" />
                  Calendar Sync
                </CardTitle>
                <CardDescription className="text-xs">
                  Subscribe to this calendar in your favorite app
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // Export all events into one multi-event ics
                    const icsEvents = filteredEvents.map((evt) => {
                      const dtStart = `${evt.date.replace(/-/g, "")}T${evt.startTime.replace(":", "")}00Z`;
                      const dtEnd = `${evt.date.replace(/-/g, "")}T${evt.endTime.replace(":", "")}00Z`;
                      return [
                        "BEGIN:VEVENT",
                        `UID:${evt.id}@lms.dev`,
                        `DTSTAMP:${dtStart}`,
                        `DTSTART:${dtStart}`,
                        `DTEND:${dtEnd}`,
                        `SUMMARY:${evt.title}`,
                        `DESCRIPTION:${evt.description.replace(/\n/g, "\\n")}`,
                        `LOCATION:${evt.locationDetail || evt.locationType}`,
                        "STATUS:CONFIRMED",
                        "END:VEVENT",
                      ].join("\r\n");
                    }).join("\r\n");

                    const fullIcs = [
                      "BEGIN:VCALENDAR",
                      "VERSION:2.0",
                      "PRODID:-//LMS Platform//Multi-Event Calendar//EN",
                      "CALSCALE:GREGORIAN",
                      "METHOD:PUBLISH",
                      icsEvents,
                      "END:VCALENDAR",
                    ].join("\r\n");

                    const blob = new Blob([fullIcs], { type: "text/calendar;charset=utf-8;" });
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement("a");
                    link.href = url;
                    link.download = `LMS_Calendar_All_Events_${user.org.replace(/\s+/g, "_")}.ics`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    URL.revokeObjectURL(url);
                  }}
                  className="w-full justify-center gap-2 h-9 text-xs font-semibold"
                >
                  <Download className="w-4 h-4" />
                  Export All Events (.ics)
                </Button>
                <p className="text-[11px] text-muted-foreground text-center pt-1">
                  Compatible with Apple Calendar, Google Calendar & Microsoft Outlook.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* MODAL: Create New Event */}
      <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
        <DialogContent className="max-w-2xl sm:max-w-3xl p-6 sm:p-8">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-primary" />
              Schedule New Calendar Event
            </DialogTitle>
            <DialogDescription className="text-xs">
              Create a new live training session, assignment milestone, or proctored exam.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateEvent} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Event Title *</Label>
              <Input
                required
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. Q4 Cloud Security Live Webinar"
                className="h-10"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Event Type</Label>
                <Select value={newType} onValueChange={(val) => val && setNewType(val as EventType)}>
                  <SelectTrigger className="h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="live_session">Live Session / ILT</SelectItem>
                    <SelectItem value="deadline">Course Deadline</SelectItem>
                    <SelectItem value="assessment">Assessment / Exam</SelectItem>
                    <SelectItem value="office_hours">Office Hours</SelectItem>
                    <SelectItem value="event">Platform Event</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Associated Course</Label>
                <Select value={newCourseTitle} onValueChange={(val) => setNewCourseTitle(val || "")}>
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Select Course" />
                  </SelectTrigger>
                  <SelectContent>
                    {scopedCourses.map((c) => (
                      <SelectItem key={c.id} value={c.title}>
                        {c.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Date</Label>
                <Input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="h-10"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Start Time</Label>
                <Input
                  type="time"
                  value={newStartTime}
                  onChange={(e) => setNewStartTime(e.target.value)}
                  className="h-10"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">End Time</Label>
                <Input
                  type="time"
                  value={newEndTime}
                  onChange={(e) => setNewEndTime(e.target.value)}
                  className="h-10"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Location / Delivery</Label>
                <Select
                  value={newLocationType}
                  onValueChange={(v) => v && setNewLocationType(v as "virtual" | "physical" | "asynchronous")}
                >
                  <SelectTrigger className="h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="virtual">Virtual (Zoom / Teams)</SelectItem>
                    <SelectItem value="physical">In-Person Classroom</SelectItem>
                    <SelectItem value="asynchronous">Self-Paced / Async</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Priority Level</Label>
                <Select
                  value={newPriority}
                  onValueChange={(v) => v && setNewPriority(v as "low" | "medium" | "high")}
                >
                  <SelectTrigger className="h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low Priority</SelectItem>
                    <SelectItem value="medium">Medium Priority</SelectItem>
                    <SelectItem value="high">High Priority</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Meeting URL or Room Details</Label>
              <Input
                value={newLocationDetail}
                onChange={(e) => setNewLocationDetail(e.target.value)}
                placeholder="https://zoom.us/j/... or Room 302"
                className="h-10"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Description & Agenda</Label>
              <Input
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="Brief description of what learners should prepare..."
                className="h-10"
              />
            </div>

            <DialogFooter className="pt-3 gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCreateModalOpen(false)}
                className="h-10 font-medium"
              >
                Cancel
              </Button>
              <Button type="submit" className="h-10 font-semibold px-5">
                Save & Broadcast Event
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* MODAL: Event Details & Action View */}
      <Dialog open={!!selectedEvent} onOpenChange={(open) => !open && setSelectedEvent(null)}>
        {selectedEvent && (
          <DialogContent className="max-w-lg sm:max-w-xl md:max-w-2xl p-6 sm:p-7">
            <DialogHeader>
              <div className="flex items-center gap-2 mb-1">
                <Badge
                  variant="outline"
                  className={EVENT_TYPE_CONFIG[selectedEvent.type]?.badgeClass}
                >
                  {EVENT_TYPE_CONFIG[selectedEvent.type]?.label}
                </Badge>
                {selectedEvent.priority === "high" && (
                  <Badge variant="destructive" className="text-[10px]">
                    High Priority
                  </Badge>
                )}
              </div>
              <DialogTitle className="text-xl font-bold text-foreground">
                {selectedEvent.title}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                {selectedEvent.description}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-3 border-y border-border text-xs">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <CalendarIcon className="w-3.5 h-3.5" /> Date:
                </span>
                <span className="font-semibold text-foreground">{selectedEvent.date}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" /> Time:
                </span>
                <span className="font-semibold text-foreground">
                  {selectedEvent.startTime} - {selectedEvent.endTime} ({selectedEvent.durationMinutes} min)
                </span>
              </div>

              {selectedEvent.courseTitle && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5" /> Associated Course:
                  </span>
                  <span className="font-semibold text-foreground text-right max-w-[200px] truncate">
                    {selectedEvent.courseTitle}
                  </span>
                </div>
              )}

              {selectedEvent.instructorName && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5" /> Host / Instructor:
                  </span>
                  <span className="font-semibold text-foreground">{selectedEvent.instructorName}</span>
                </div>
              )}

              {selectedEvent.locationDetail && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" /> Location / Link:
                  </span>
                  <span className="font-medium text-foreground truncate max-w-[220px]">
                    {selectedEvent.locationDetail}
                  </span>
                </div>
              )}
            </div>

            <DialogFooter className="pt-2 flex flex-col sm:flex-row gap-2">
              {selectedEvent.locationType === "virtual" && selectedEvent.locationDetail && (
                <Button
                  onClick={() => window.open(selectedEvent.locationDetail, "_blank")}
                  className="gap-2 h-10 font-semibold flex-1"
                >
                  <Video className="w-4 h-4" />
                  Join Meeting
                </Button>
              )}

              <Button
                variant="outline"
                onClick={() => downloadIcs(selectedEvent)}
                className="gap-1.5 h-10 font-medium"
              >
                <Download className="w-4 h-4" />
                Add to Calendar (.ics)
              </Button>

              {canManageEvents && (
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => {
                    deleteEvent(selectedEvent.id);
                    setSelectedEvent(null);
                  }}
                  className="h-10 w-10 shrink-0"
                  title="Delete event"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>

      {/* MODAL: Day Details Summary (when clicking a date with events) */}
      <Dialog open={!!dayDetailsModal} onOpenChange={(open) => !open && setDayDetailsModal(null)}>
        {dayDetailsModal && (
          <DialogContent className="max-w-lg sm:max-w-xl md:max-w-2xl p-6 sm:p-7">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-primary" />
                Events for {dayDetailsModal.dateStr}
              </DialogTitle>
              <DialogDescription className="text-xs">
                {dayDetailsModal.events.length} item(s) scheduled on this day
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-2.5 py-2 max-h-[360px] overflow-y-auto">
              {dayDetailsModal.events.map((evt) => {
                const conf = EVENT_TYPE_CONFIG[evt.type] || EVENT_TYPE_CONFIG.event;
                return (
                  <div
                    key={evt.id}
                    onClick={() => {
                      setDayDetailsModal(null);
                      setSelectedEvent(evt);
                    }}
                    className={`p-3 rounded-lg border text-xs cursor-pointer hover:shadow-xs transition-all ${conf.chipClass}`}
                  >
                    <div className="flex items-center justify-between text-[10px] font-semibold mb-1">
                      <span>{evt.startTime} - {evt.endTime}</span>
                      <Badge variant="outline" className={`text-[9px] ${conf.badgeClass}`}>
                        {conf.label}
                      </Badge>
                    </div>
                    <p className="font-bold text-foreground text-xs">{evt.title}</p>
                    {evt.courseTitle && (
                      <p className="text-[11px] text-muted-foreground mt-0.5">{evt.courseTitle}</p>
                    )}
                  </div>
                );
              })}
            </div>

            <DialogFooter className="pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDayDetailsModal(null)}
                className="h-9 w-full"
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </AppShell>
  );
}
