"use client";

import Link from "next/link";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type { Course } from "@/lib/store/courses-store";
import type { MockUser } from "@/lib/mock/users";
import {
  Star,
  Play,
  Clock,
  BookOpen,
  Users,
  Lock,
  Pencil,
  Eye,
  CheckCircle2,
  Sparkles,
  ShoppingBag,
} from "lucide-react";

export const CATEGORY_THUMBNAILS: Record<string, string> = {
  Compliance: "https://images.unsplash.com/photo-1450133064473-71024230f91b?w=800&auto=format&fit=crop&q=80",
  "Technical Skills": "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=80",
  Cybersecurity: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&auto=format&fit=crop&q=80",
  "Cloud Architecture": "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80",
  Leadership: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&auto=format&fit=crop&q=80",
  "Sales Enablement": "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80",
  Onboarding: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&auto=format&fit=crop&q=80",
  "AI & Data": "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&auto=format&fit=crop&q=80",
  default: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80",
};

export function getYouTubeThumbnail(url?: string): string | null {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11
    ? `https://img.youtube.com/vi/${match[2]}/hqdefault.jpg`
    : null;
}

export function resolveCourseThumbnail(course: Course): string {
  if (course.coverImage && course.coverImage.trim().length > 0) {
    return course.coverImage;
  }
  // Try checking the first video lesson for a YouTube URL
  for (const section of course.sections || []) {
    for (const lesson of section.lessons || []) {
      if (lesson.type === "video" && lesson.videoUrl) {
        const ytThumb = getYouTubeThumbnail(lesson.videoUrl);
        if (ytThumb) return ytThumb;
      }
    }
  }
  // Fallback to category themed cover
  const cat = course.category || "default";
  return CATEGORY_THUMBNAILS[cat] || CATEGORY_THUMBNAILS.default;
}

export interface CourseCardProps {
  course: Course;
  user: MockUser;
  mode?: "management" | "catalog" | "learning";
  isEnrolled?: boolean;
  progress?: number;
  editable?: boolean;
  onEnroll?: (courseId: string) => void;
}

export function CourseCard({
  course,
  user,
  mode = "management",
  isEnrolled = false,
  progress = 0,
  editable = true,
  onEnroll,
}: CourseCardProps) {
  const [imgError, setImgError] = useState(false);
  const fallbackSrc = CATEGORY_THUMBNAILS[course.category] || CATEGORY_THUMBNAILS.default;
  const thumbnailSrc = imgError ? fallbackSrc : resolveCourseThumbnail(course);

  const totalLessons = (course.sections || []).reduce(
    (acc, s) => acc + (s.lessons?.length || 0),
    0
  );

  const rating = course.rating || 4.7;
  const price = course.price ?? 0;
  const originalPrice = price > 0 ? Math.round(price * 1.6) : null;

  // Badge Determination (Udemy Style Ribbon)
  const isBestseller = (course.enrolled || 0) >= 300 || rating >= 4.85;
  const isHighestRated = rating >= 4.9;

  return (
    <div className="group flex flex-col h-full bg-card rounded-2xl border border-border overflow-hidden hover:shadow-xl hover:border-primary/40 transition-all duration-300">
      {/* 1. MEDIA THUMBNAIL (16:9 Aspect Ratio) */}
      <div className="relative aspect-video w-full overflow-hidden bg-muted select-none">
        <img
          src={thumbnailSrc}
          alt={course.title}
          onError={() => setImgError(true)}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
        />

        {/* Hover Dark Overlay with Center Play Circle */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[2px]">
          <div className="w-12 h-12 rounded-full bg-primary/95 text-primary-foreground flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
            <Play className="w-5 h-5 fill-current translate-x-0.5" />
          </div>
        </div>

        {/* Top-Left Udemy Style Badge */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 flex-wrap">
          {isEnrolled ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-emerald-500 text-white shadow-md">
              <CheckCircle2 className="w-3 h-3" /> Enrolled
            </span>
          ) : isHighestRated ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-amber-400 text-slate-950 shadow-md">
              <Sparkles className="w-3 h-3 fill-current" /> Highest Rated
            </span>
          ) : isBestseller ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-[#eceb98] text-slate-900 shadow-md">
              ★ Bestseller
            </span>
          ) : null}

          {course.type === "practice-test" && (
            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-600 text-white shadow-md">
              Practice Exam
            </span>
          )}
        </div>

        {/* Bottom-Right Video / Lecture Counter Overlay */}
        <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/75 backdrop-blur-xs text-white text-[11px] font-mono font-medium flex items-center gap-1.5 shadow-sm">
          <Clock className="w-3 h-3 text-primary" />
          <span>{totalLessons} lessons</span>
        </div>
      </div>

      {/* 2. CARD BODY & CONTENT */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-2">
          {/* Category & Status Row */}
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-primary truncate">
              {course.category}
            </span>
            {mode === "management" && (
              <Badge
                variant={course.status === "published" ? "default" : "outline"}
                className={`text-[10px] uppercase font-bold px-2 py-0.5 ${
                  course.status === "published"
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                    : "text-muted-foreground border-border"
                }`}
              >
                {course.status}
              </Badge>
            )}
          </div>

          {/* Course Title */}
          <h3 className="font-bold text-foreground group-hover:text-primary transition-colors text-sm sm:text-base leading-snug line-clamp-2">
            {course.title}
          </h3>

          {/* Instructor / Department / Org */}
          <p className="text-xs text-muted-foreground truncate">
            {course.department ? `${course.department} · ` : ""}
            {course.org || "Acme Corp"}
          </p>

          {/* Udemy Star Rating & Reviews Row */}
          <div className="flex items-center gap-1.5 pt-0.5">
            <span className="text-xs font-black text-amber-500 font-mono">
              {rating.toFixed(1)}
            </span>
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-3 h-3 ${
                    star <= Math.round(rating)
                      ? "text-amber-400 fill-amber-400"
                      : "text-muted-foreground/30"
                  }`}
                />
              ))}
            </div>
            <span className="text-[11px] text-muted-foreground">
              ({course.enrolled || 0})
            </span>
          </div>

          {/* Enrollment Progress Bar (when enrolled) */}
          {isEnrolled && (
            <div className="pt-1.5 space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-muted-foreground font-medium">Your Progress</span>
                <span className="font-bold font-mono text-foreground">
                  {Math.round(progress)}%
                </span>
              </div>
              <Progress value={progress} className="h-1.5 bg-muted" />
            </div>
          )}

          {/* Read-only notification if not editable */}
          {mode === "management" && !editable && (
            <div className="flex items-center gap-1.5 text-[11px] text-amber-600 dark:text-amber-400 bg-amber-500/10 rounded-lg p-2">
              <Lock className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Department-locked ({course.department})</span>
            </div>
          )}
        </div>

        {/* 3. CARD FOOTER: PRICE & ACTION CONTROLS */}
        <div className="pt-3 border-t border-border space-y-3">
          {/* Price Row (for Catalog Mode) */}
          {mode === "catalog" && (
            <div className="flex items-baseline gap-2">
              <span className="text-base font-black text-foreground">
                {price > 0 ? `$${price}` : "Free"}
              </span>
              {originalPrice && (
                <span className="text-xs text-muted-foreground line-through font-mono">
                  ${originalPrice}
                </span>
              )}
            </div>
          )}

          {/* Action Buttons based on Mode */}
          {mode === "management" && (
            <div className="grid grid-cols-2 gap-2">
              <Button
                size="sm"
                variant="outline"
                className="h-8.5 text-xs font-semibold border-border hover:bg-muted"
                render={<Link href={`/${user.role}/courses/${course.id}`} />}
              >
                {editable ? (
                  <>
                    <Pencil className="w-3.5 h-3.5 mr-1 text-primary" /> Edit
                  </>
                ) : (
                  <>
                    <Eye className="w-3.5 h-3.5 mr-1" /> View
                  </>
                )}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-8.5 text-xs font-semibold hover:bg-primary/10 hover:text-primary"
                render={<Link href={`/${user.role}/courses/${course.id}/player`} />}
              >
                <Play className="w-3.5 h-3.5 mr-1 fill-current" /> Preview
              </Button>
            </div>
          )}

          {mode === "catalog" && (
            <div>
              {isEnrolled ? (
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full h-9 text-xs font-bold border-primary text-primary hover:bg-primary/10"
                  render={<Link href={`/${user.role}/courses/${course.id}/player`} />}
                >
                  <Play className="w-3.5 h-3.5 mr-1.5 fill-current" />
                  {progress >= 100 ? "Review Course" : "Continue Learning"}
                </Button>
              ) : (
                <Button
                  size="sm"
                  onClick={() => onEnroll?.(course.id)}
                  className="w-full h-9 text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm cursor-pointer"
                >
                  <ShoppingBag className="w-3.5 h-3.5 mr-1.5" />
                  {price > 0 ? `Enroll Now · $${price}` : "Enroll for Free"}
                </Button>
              )}
            </div>
          )}

          {mode === "learning" && (
            <Button
              size="sm"
              variant="default"
              className="w-full h-9 text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90"
              render={<Link href={`/${user.role}/courses/${course.id}/player`} />}
            >
              <Play className="w-3.5 h-3.5 mr-1.5 fill-current" />
              {progress >= 100 ? "Review Course" : progress > 0 ? "Resume Learning" : "Start Course"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
