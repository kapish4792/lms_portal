"use client";

import React, { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCertificatesStore } from "@/lib/store/certificates-store";
import { useCoursesStore, Course } from "@/lib/store/courses-store";
import { useUsersStore, DirectoryUser } from "@/lib/store/users-store";
import { useEnrollmentsStore } from "@/lib/store/enrollments-store";
import { MockUser } from "@/lib/mock/users";
import {
  Award,
  CheckCircle2,
  Users,
  AlertCircle,
  Sparkles,
  Search,
  X,
  UserCheck,
  BookOpen,
} from "lucide-react";

interface BulkIssueDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: MockUser;
  onIssued?: (count: number) => void;
}

interface CourseLearnerItem {
  identifier: string;
  name: string;
  email: string;
  department: string;
  isCompleted: boolean;
  progress: number;
  alreadyIssued: boolean;
}

export function BulkIssueDialog({
  open,
  onOpenChange,
  user,
  onIssued,
}: BulkIssueDialogProps) {
  const courses = useCoursesStore((s) => s.courses);
  const directory = useUsersStore((s) => s.directory);
  const enrollments = useEnrollmentsStore((s) => s.enrollments);
  const templates = useCertificatesStore((s) => s.templates);
  const issuedCertificates = useCertificatesStore((s) => s.issuedCertificates);
  const issueBulkCertificates = useCertificatesStore((s) => s.issueBulkCertificates);

  // Search and filter states
  const [courseSearch, setCourseSearch] = useState("");
  const [learnerSearch, setLearnerSearch] = useState("");
  const [learnerFilterTab, setLearnerFilterTab] = useState<"all" | "completed" | "unissued">("all");

  // Helper to get instructor / creator name for a course
  const getCourseCreatorInfo = (authorId: string) => {
    const creator = directory.find(
      (u) => u.email === authorId || u.id === authorId || u.username === authorId
    );
    if (creator) {
      return {
        name: `${creator.firstName} ${creator.lastName}`.trim(),
        email: creator.email,
        role: creator.role,
      };
    }
    return {
      name: authorId.includes("@") ? authorId.split("@")[0] : authorId,
      email: authorId,
      role: "instructor",
    };
  };

  // Filter courses based on user role and search query (matches course title, category, or creator name/email)
  const availableCourses = useMemo(() => {
    const roleFiltered = courses.filter((c: Course) => {
      if (c.org !== user.org) return false;
      if (user.role === "instructor") {
        return c.authorId === user.identifier;
      }
      return true; // Admin and Manager see all courses in their org
    });

    if (!courseSearch.trim()) return roleFiltered;
    const q = courseSearch.toLowerCase();

    return roleFiltered.filter((c: Course) => {
      const creator = getCourseCreatorInfo(c.authorId);
      return (
        c.title.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q) ||
        creator.name.toLowerCase().includes(q) ||
        creator.email.toLowerCase().includes(q) ||
        c.authorId.toLowerCase().includes(q)
      );
    });
  }, [courses, user, courseSearch, directory]);

  const [selectedCourseId, setSelectedCourseId] = useState<string>(
    availableCourses[0]?.id || ""
  );
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(
    templates[0]?.id || ""
  );
  const [selectedLearnerIds, setSelectedLearnerIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedCourse = courses.find((c: Course) => c.id === selectedCourseId);
  const selectedCourseCreator = selectedCourse
    ? getCourseCreatorInfo(selectedCourse.authorId)
    : null;

  // Eligible learners enrolled in the course
  const allCourseLearners = useMemo((): CourseLearnerItem[] => {
    if (!selectedCourseId) return [];

    const courseEnrs = enrollments.filter((e) => e.courseId === selectedCourseId);
    const learnersInOrg = directory.filter(
      (u: DirectoryUser) => u.org === user.org && u.role === "learner"
    );

    return learnersInOrg.map((learner: DirectoryUser) => {
      const enr = courseEnrs.find((e) => e.userId === learner.email);
      const isCompleted = enr ? enr.progress >= 100 || enr.status === "completed" : false;
      const progress = enr ? enr.progress : 0;

      const alreadyIssued = issuedCertificates.some(
        (cert) =>
          cert.courseId === selectedCourseId &&
          cert.learnerIdentifier === learner.email &&
          cert.status === "active"
      );

      return {
        identifier: learner.email,
        name: `${learner.firstName} ${learner.lastName}`.trim(),
        email: learner.email,
        department: learner.department || "General",
        isCompleted,
        progress,
        alreadyIssued,
      };
    });
  }, [selectedCourseId, enrollments, directory, issuedCertificates, user.org]);

  // Filter learners by search and filter tab
  const filteredLearners = useMemo(() => {
    let list = allCourseLearners;

    if (learnerFilterTab === "completed") {
      list = list.filter((l) => l.isCompleted);
    } else if (learnerFilterTab === "unissued") {
      list = list.filter((l) => !l.alreadyIssued);
    }

    if (learnerSearch.trim()) {
      const q = learnerSearch.toLowerCase();
      list = list.filter(
        (l) =>
          l.name.toLowerCase().includes(q) ||
          l.email.toLowerCase().includes(q) ||
          l.department.toLowerCase().includes(q)
      );
    }

    return list;
  }, [allCourseLearners, learnerFilterTab, learnerSearch]);

  const toggleSelectLearner = (id: string) => {
    setSelectedLearnerIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAllCompleted = () => {
    const completedUnissued = allCourseLearners
      .filter((l: CourseLearnerItem) => l.isCompleted && !l.alreadyIssued)
      .map((l: CourseLearnerItem) => l.identifier);
    setSelectedLearnerIds(completedUnissued);
  };

  const handleSelectAllVisible = () => {
    const visibleUnissued = filteredLearners
      .filter((l) => !l.alreadyIssued)
      .map((l) => l.identifier);
    setSelectedLearnerIds((prev) => Array.from(new Set([...prev, ...visibleUnissued])));
  };

  const handleClearSelection = () => {
    setSelectedLearnerIds([]);
  };

  const handleExecuteBulkIssue = () => {
    if (!selectedCourse || !selectedTemplateId || selectedLearnerIds.length === 0)
      return;

    setIsSubmitting(true);

    const learnersToIssue = allCourseLearners
      .filter((l: CourseLearnerItem) => selectedLearnerIds.includes(l.identifier))
      .map((l: CourseLearnerItem) => ({ identifier: l.identifier, name: l.name }));

    const created = issueBulkCertificates({
      learners: learnersToIssue,
      courseId: selectedCourse.id,
      courseTitle: selectedCourse.title,
      templateId: selectedTemplateId,
      issuedBy: user.identifier,
      issuedByName: user.name,
      issuedByRole: user.role,
      org: user.org,
    });

    setIsSubmitting(false);
    onOpenChange(false);
    onIssued?.(created.length);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <Award className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold">
                Bulk Issue Certificates
              </DialogTitle>
              <DialogDescription className="text-xs text-text-tertiary">
                Search course creators, choose certified templates, and batch-issue verifiable credentials to completed learners.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-5 py-3">
          {/* Course Selection with Creator Search */}
          <div className="space-y-2 p-3.5 bg-surface-sunken/40 rounded-xl border border-surface-border">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label className="text-xs font-semibold text-text-primary flex items-center gap-1.5">
                <BookOpen className="h-3.5 w-3.5 text-primary" />
                Select Course & Creator
              </label>

              {/* Course & Creator Search input */}
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-tertiary" />
                <Input
                  placeholder="Search course or creator..."
                  value={courseSearch}
                  onChange={(e) => setCourseSearch(e.target.value)}
                  className="h-8 pl-8 pr-7 text-xs bg-surface-base"
                />
                {courseSearch && (
                  <button
                    type="button"
                    onClick={() => setCourseSearch("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-primary"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
            </div>

            <Select
              value={selectedCourseId}
              onValueChange={(val) => {
                setSelectedCourseId(val || "");
                setSelectedLearnerIds([]);
              }}
            >
              <SelectTrigger className="bg-surface-base">
                <SelectValue placeholder="Choose a course..." />
              </SelectTrigger>
              <SelectContent>
                {availableCourses.map((c: Course) => {
                  const creator = getCourseCreatorInfo(c.authorId);
                  return (
                    <SelectItem key={c.id} value={c.id}>
                      <div className="flex flex-col py-0.5">
                        <span className="font-semibold text-xs text-text-primary">
                          {c.title}
                        </span>
                        <span className="text-[11px] text-text-tertiary">
                          Created by:{" "}
                          <span className="text-text-secondary font-medium">
                            {creator.name}
                          </span>{" "}
                          ({creator.email})
                        </span>
                      </div>
                    </SelectItem>
                  );
                })}
                {availableCourses.length === 0 && (
                  <div className="p-3 text-center text-xs text-text-tertiary">
                    No courses found matching &quot;{courseSearch}&quot;
                  </div>
                )}
              </SelectContent>
            </Select>

            {/* Selected Course Creator Tag */}
            {selectedCourse && selectedCourseCreator && (
              <div className="flex items-center justify-between text-[11px] text-text-tertiary px-1 pt-0.5">
                <div className="flex items-center gap-1.5">
                  <UserCheck className="h-3.5 w-3.5 text-emerald-500" />
                  <span>Course Creator / Author:</span>
                  <span className="font-medium text-text-primary">
                    {selectedCourseCreator.name}
                  </span>
                  <span className="opacity-75">({selectedCourseCreator.email})</span>
                </div>
                <Badge variant="outline" className="text-[10px] py-0 px-1.5">
                  {selectedCourse.category}
                </Badge>
              </div>
            )}
          </div>

          {/* Certificate Design Template selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-text-primary">
              Certificate Design Template
            </label>
            <Select
              value={selectedTemplateId}
              onValueChange={(val) => setSelectedTemplateId(val || "")}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose a design..." />
              </SelectTrigger>
              <SelectContent>
                {templates.map((tpl) => (
                  <SelectItem key={tpl.id} value={tpl.id}>
                    <div className="flex items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: tpl.accentColor }}
                      />
                      <span>{tpl.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Recipient Selection Section with Dedicated Search Bar */}
          <div className="space-y-2.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-text-tertiary" />
                <label className="text-xs font-semibold text-text-primary">
                  Select Recipients ({selectedLearnerIds.length} selected)
                </label>
              </div>

              <div className="flex items-center gap-1.5">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleSelectAllCompleted}
                  className="h-7 text-xs bg-surface-base"
                >
                  <Sparkles className="h-3 w-3 mr-1 text-primary" />
                  Select All Completed
                </Button>
                {filteredLearners.length > 0 && learnerSearch && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleSelectAllVisible}
                    className="h-7 text-xs bg-surface-base"
                  >
                    Select Filtered
                  </Button>
                )}
                {selectedLearnerIds.length > 0 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleClearSelection}
                    className="h-7 text-xs text-text-tertiary hover:bg-surface-sunken"
                  >
                    Clear
                  </Button>
                )}
              </div>
            </div>

            {/* User Search Bar & Filter Tabs */}
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-tertiary" />
                <Input
                  placeholder="Search user by name, email, department..."
                  value={learnerSearch}
                  onChange={(e) => setLearnerSearch(e.target.value)}
                  className="h-8 pl-8 pr-7 text-xs bg-surface-base"
                />
                {learnerSearch && (
                  <button
                    type="button"
                    onClick={() => setLearnerSearch("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-primary"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center gap-1 bg-surface-sunken p-0.5 rounded-lg text-[11px]">
                <button
                  type="button"
                  onClick={() => setLearnerFilterTab("all")}
                  className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                    learnerFilterTab === "all"
                      ? "bg-surface-base text-text-primary shadow-xs"
                      : "text-text-tertiary hover:text-text-primary"
                  }`}
                >
                  All ({allCourseLearners.length})
                </button>
                <button
                  type="button"
                  onClick={() => setLearnerFilterTab("completed")}
                  className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                    learnerFilterTab === "completed"
                      ? "bg-surface-base text-text-primary shadow-xs"
                      : "text-text-tertiary hover:text-text-primary"
                  }`}
                >
                  Completed (
                  {allCourseLearners.filter((l) => l.isCompleted).length})
                </button>
                <button
                  type="button"
                  onClick={() => setLearnerFilterTab("unissued")}
                  className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                    learnerFilterTab === "unissued"
                      ? "bg-surface-base text-text-primary shadow-xs"
                      : "text-text-tertiary hover:text-text-primary"
                  }`}
                >
                  Unissued (
                  {allCourseLearners.filter((l) => !l.alreadyIssued).length})
                </button>
              </div>
            </div>

            {/* Recipient User List */}
            <div className="border border-surface-border rounded-xl divide-y divide-surface-border max-h-60 overflow-y-auto bg-surface-base">
              {filteredLearners.map((learner: CourseLearnerItem) => {
                const isSelected = selectedLearnerIds.includes(learner.identifier);
                return (
                  <div
                    key={learner.identifier}
                    onClick={() => {
                      if (!learner.alreadyIssued) {
                        toggleSelectLearner(learner.identifier);
                      }
                    }}
                    className={`flex items-center justify-between p-3 transition-colors cursor-pointer ${
                      learner.alreadyIssued
                        ? "opacity-60 bg-surface-sunken/40 cursor-not-allowed"
                        : isSelected
                        ? "bg-primary/5"
                        : "hover:bg-surface-sunken"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Checkbox
                        checked={isSelected}
                        disabled={learner.alreadyIssued}
                        onCheckedChange={() => toggleSelectLearner(learner.identifier)}
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-text-primary truncate">
                          {learner.name}
                        </p>
                        <p className="text-[11px] text-text-tertiary truncate">
                          {learner.email} • {learner.department}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {learner.alreadyIssued ? (
                        <Badge
                          variant="secondary"
                          className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-[10px]"
                        >
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Issued
                        </Badge>
                      ) : learner.isCompleted ? (
                        <Badge
                          variant="secondary"
                          className="bg-primary/10 text-primary border border-primary/20 text-[10px]"
                        >
                          100% Completed
                        </Badge>
                      ) : (
                        <span className="text-[11px] text-text-tertiary">
                          {learner.progress}% Progress
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}

              {filteredLearners.length === 0 && (
                <div className="p-6 text-center text-xs text-text-tertiary flex flex-col items-center gap-2">
                  <AlertCircle className="h-6 w-6 text-text-tertiary" />
                  {learnerSearch
                    ? `No learners found matching "${learnerSearch}"`
                    : "No learners found in this filter."}
                </div>
              )}
            </div>
          </div>

          {/* Issuance Authority Notice */}
          <div className="p-3 bg-primary/5 border border-primary/20 rounded-xl flex items-start gap-3">
            <Award className="h-4 w-4 text-primary shrink-0 mt-0.5" />
            <div className="text-[11px] text-text-secondary leading-relaxed">
              <span className="font-semibold text-text-primary">
                Authorized Issuer:
              </span>{" "}
              {user.name} ({user.role.toUpperCase()}). Every certificate generated will record a permanent cryptographic ID, freeze the current template snapshot, and dispatch a real-time notification to the learner.
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            disabled={selectedLearnerIds.length === 0 || isSubmitting}
            onClick={handleExecuteBulkIssue}
          >
            {isSubmitting
              ? "Generating Credentials..."
              : `Issue ${selectedLearnerIds.length} Certificate${
                  selectedLearnerIds.length === 1 ? "" : "s"
                }`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
