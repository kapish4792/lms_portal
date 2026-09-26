"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { useRoleGuard } from "@/lib/hooks/use-role-guard";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
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
import { useConferencesStore, type ConferenceSession } from "@/lib/store/conferences-store";
import { useCoursesStore } from "@/lib/store/courses-store";
import {
  Video,
  Calendar,
  Clock,
  Users,
  MapPin,
  Plus,
  Search,
  ExternalLink,
  Download,
  Building,
  Trash2,
} from "lucide-react";

export default function ConferencesPage() {
  const params = useParams<{ role: string }>();
  const user = useRoleGuard(params.role);

  const conferences = useConferencesStore((s) => s.conferences);
  const addConference = useConferencesStore((s) => s.addConference);
  const registerAttendee = useConferencesStore((s) => s.registerAttendee);
  const cancelConference = useConferencesStore((s) => s.cancelConference);
  const courses = useCoursesStore((s) => s.courses);

  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [modalOpen, setModalOpen] = useState(false);

  // New session state
  const [title, setTitle] = useState("");
  const [courseTitle, setCourseTitle] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("10:00");
  const [duration, setDuration] = useState("60");
  const [locationType, setLocationType] = useState<"virtual" | "physical">("virtual");
  const [locationDetail, setLocationDetail] = useState("https://zoom.us/j/sample");
  const [capacity, setCapacity] = useState("50");

  const scoped = useMemo(
    () => (user ? conferences.filter((c) => c.org === user.org) : []),
    [conferences, user]
  );

  const scopedCourses = useMemo(
    () => (user ? courses.filter((c) => c.org === user.org) : []),
    [courses, user]
  );

  const filtered = scoped.filter((c) => {
    const matchesSearch =
      !search.trim() ||
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.courseTitle.toLowerCase().includes(search.toLowerCase()) ||
      c.instructorName.toLowerCase().includes(search.toLowerCase());
    const matchesType = filterType === "all" || c.locationType === filterType;
    return matchesSearch && matchesType;
  });

  if (!user) return null;

  const canSchedule = user.role === "instructor" || user.role === "org-admin" || user.role === "super-admin" || user.role === "lms-admin";

  const handleCreateSession = () => {
    if (!title.trim()) return;
    addConference({
      title,
      courseTitle: courseTitle || (scopedCourses[0]?.title ?? "General Training"),
      instructorName: `${user.name}`,
      date: date || new Date().toISOString().split("T")[0],
      startTime,
      durationMinutes: parseInt(duration) || 60,
      locationType,
      locationDetail,
      capacity: parseInt(capacity) || 50,
      status: "upcoming",
      org: user.org,
    });
    setModalOpen(false);
    setTitle("");
  };

  const downloadIcs = (session: ConferenceSession) => {
    const icsData = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//LMS Platform//ILT Session//EN",
      "BEGIN:VEVENT",
      `SUMMARY:${session.title}`,
      `DESCRIPTION:Course: ${session.courseTitle}\\nInstructor: ${session.instructorName}\\nLocation: ${session.locationDetail}`,
      `LOCATION:${session.locationDetail}`,
      `DTSTART:${session.date.replace(/-/g, "")}T${session.startTime.replace(":", "")}00Z`,
      `DURATION:PT${session.durationMinutes}M`,
      "STATUS:CONFIRMED",
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");

    const blob = new Blob([icsData], { type: "text/calendar;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${session.title.toLowerCase().replace(/[^a-z0-9]/g, "-")}.ics`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AppShell user={user}>
      <div className="p-6 space-y-6 w-full pb-12">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-text-primary">Instructor-Led Training & Virtual Classrooms</h1>
              <Badge variant="outline">Module 13 (ILT)</Badge>
            </div>
            <p className="text-text-secondary mt-1">
              Synchronous webinars, live workshops, and physical room attendance governance (§3.18)
            </p>
          </div>

          {canSchedule && (
            <Button className="gap-2" onClick={() => setModalOpen(true)}>
              <Plus className="w-4 h-4" />
              Schedule Conference / Webinar
            </Button>
          )}
        </div>

        {/* Filter & Search Bar */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-tertiary" />
            <Input
              placeholder="Search webinars, rooms, instructors..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8"
            />
          </div>

          <div className="flex items-center gap-2">
            <Select value={filterType} onValueChange={(v) => setFilterType(v ?? "all")}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Formats</SelectItem>
                <SelectItem value="virtual">Virtual (Zoom/Teams)</SelectItem>
                <SelectItem value="physical">Physical Room</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Session Cards Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((s) => {
            const isFull = s.registeredCount >= s.capacity;
            const fillPercent = Math.min(100, Math.round((s.registeredCount / s.capacity) * 100));

            return (
              <Card key={s.id} className="border-surface-border shadow-card flex flex-col justify-between">
                <CardHeader className="space-y-2 pb-3">
                  <div className="flex items-center justify-between gap-2">
                    <Badge
                      variant="outline"
                      className={
                        s.locationType === "virtual"
                          ? "bg-blue-500/10 text-blue-500 border-blue-500/20"
                          : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                      }
                    >
                      {s.locationType === "virtual" ? (
                        <>
                          <Video className="w-3 h-3 mr-1" /> Virtual Webinar
                        </>
                      ) : (
                        <>
                          <Building className="w-3 h-3 mr-1" /> On-Site Classroom
                        </>
                      )}
                    </Badge>
                    <Badge variant={s.status === "cancelled" ? "destructive" : "default"}>{s.status}</Badge>
                  </div>

                  <CardTitle className="text-base font-semibold text-text-primary leading-snug">{s.title}</CardTitle>
                  <CardDescription className="text-xs">
                    Linked Course: <span className="font-medium text-text-secondary">{s.courseTitle}</span>
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4 pt-1 flex-1">
                  <div className="space-y-2 text-xs text-text-secondary">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-text-tertiary shrink-0" />
                      <span>{s.date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-text-tertiary shrink-0" />
                      <span>
                        {s.startTime} UTC ({s.durationMinutes} mins)
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-text-tertiary shrink-0" />
                      <span className="truncate">{s.locationDetail}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-text-tertiary shrink-0" />
                      <span>Instructor: {s.instructorName}</span>
                    </div>
                  </div>

                  {/* Attendance Capacity Progress */}
                  <div className="space-y-1.5 pt-2 border-t border-surface-border">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-text-tertiary">Enrollment Capacity</span>
                      <span className="font-semibold text-text-primary">
                        {s.registeredCount} / {s.capacity} {isFull && "(Full)"}
                      </span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-surface-sunken overflow-hidden">
                      <div
                        className={`h-full rounded-full ${isFull ? "bg-amber-500" : "bg-brand-500"}`}
                        style={{ width: `${fillPercent}%` }}
                      />
                    </div>
                    {s.waitlistCount > 0 && (
                      <p className="text-[11px] text-amber-500">Waitlist: {s.waitlistCount} learner(s)</p>
                    )}
                  </div>
                </CardContent>

                <CardFooter className="border-t border-surface-border p-3 bg-surface-sunken/40 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" className="gap-1 text-xs" onClick={() => downloadIcs(s)}>
                      <Download className="w-3.5 h-3.5" />
                      .ics Calendar
                    </Button>
                    {canSchedule && s.status === "upcoming" && (
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="text-text-tertiary hover:text-danger"
                        title="Cancel Session"
                        onClick={() => cancelConference(s.id)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    )}
                  </div>

                  {s.locationType === "virtual" ? (
                    <Button
                      size="sm"
                      className="gap-1 text-xs"
                      onClick={() => window.open(s.locationDetail, "_blank")}
                      disabled={s.status === "cancelled"}
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Join Room
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs"
                      onClick={() => registerAttendee(s.id)}
                      disabled={s.status === "cancelled"}
                    >
                      {isFull ? "Join Waitlist" : "Register Attendance"}
                    </Button>
                  )}
                </CardFooter>
              </Card>
            );
          })}

          {filtered.length === 0 && (
            <div className="col-span-full py-16 text-center text-text-tertiary">
              No training sessions scheduled. Create your first webinar or on-site session.
            </div>
          )}
        </div>

        {/* Schedule Session Modal */}
        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogContent className="max-w-2xl sm:max-w-3xl p-6 sm:p-8">
            <DialogHeader>
              <DialogTitle>Schedule Instructor-Led Training</DialogTitle>
              <DialogDescription>
                Coordinate live webinars via Zoom/Teams or reserve physical training rooms.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <div className="space-y-1.5">
                <Label>Session Title</Label>
                <Input
                  placeholder="e.g. Q4 Cloud Security Deep Dive"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label>Linked Course</Label>
                <Select value={courseTitle} onValueChange={(v) => setCourseTitle(v ?? "")}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select course" />
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

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Date</Label>
                  <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label>Start Time (UTC)</Label>
                  <Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Duration (Minutes)</Label>
                  <Input type="number" value={duration} onChange={(e) => setDuration(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label>Maximum Capacity</Label>
                  <Input type="number" value={capacity} onChange={(e) => setCapacity(e.target.value)} />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Format / Location Type</Label>
                <Select
                  value={locationType}
                  onValueChange={(v) => {
                    if (v === "virtual" || v === "physical") {
                      setLocationType(v);
                    }
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="virtual">Virtual (Zoom / MS Teams)</SelectItem>
                    <SelectItem value="physical">Physical Training Room</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>{locationType === "virtual" ? "Meeting URL" : "Room Location & Building"}</Label>
                <Input
                  value={locationDetail}
                  onChange={(e) => setLocationDetail(e.target.value)}
                  placeholder={locationType === "virtual" ? "https://zoom.us/j/..." : "Building A, Room 204"}
                />
              </div>
            </div>

            <DialogFooter>
              <Button onClick={handleCreateSession} disabled={!title.trim()}>
                Create & Publish Session
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppShell>
  );
}
