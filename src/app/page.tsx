"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useCoursesStore, type Course } from "@/lib/store/courses-store";
import { useAuthStore } from "@/lib/store/auth-store";
import { useEnrollmentsStore } from "@/lib/store/enrollments-store";
import { resolveCourseThumbnail, CATEGORY_THUMBNAILS } from "@/components/courses/CourseCard";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { motion } from "framer-motion";
import { HomeHeader } from "@/components/home/HomeHeader";
import { HomeFooter } from "@/components/home/HomeFooter";
import { cn } from "@/lib/utils";
import {
  BookOpen,
  Search,
  Star,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Video,
  Award,
  Users,
  Clock,
  Layers,
  ShoppingBag,
  Zap,
  HelpCircle,
  Play,
  PlayCircle,
  X,
  TrendingUp,
} from "lucide-react";

export default function HomePage() {
  const router = useRouter();
  const courses = useCoursesStore((s) => s.courses);
  const currentUser = useAuthStore((s) => s.currentUser);
  const enroll = useEnrollmentsStore((s) => s.enroll);
  const getEnrollment = useEnrollmentsStore((s) => s.getEnrollment);

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [priceFilter, setPriceFilter] = useState<"Any Price" | "Free" | "Paid">("Any Price");
  const [previewCourse, setPreviewCourse] = useState<Course | null>(null);

  const handleCourseAction = (course: Course) => {
    if (currentUser) {
      const userKey = currentUser.identifier || "learner@lms.dev";
      enroll(userKey, course.id);
      router.push(`/${currentUser.role}/courses/${course.id}/player`);
    } else {
      router.push(`/auth/login?courseId=${course.id}`);
    }
  };

  // Derive unique categories
  const categories = useMemo(() => {
    const list = Array.from(new Set(courses.map((c) => c.category).filter(Boolean)));
    return ["All Categories", ...list];
  }, [courses]);

  // Filtered courses
  const filteredCourses = useMemo(() => {
    return courses.filter((c) => {
      if (c.status !== "published") return false;
      const matchesSearch =
        !search.trim() ||
        c.title.toLowerCase().includes(search.toLowerCase()) ||
        c.category.toLowerCase().includes(search.toLowerCase()) ||
        (c.objectives && c.objectives.some((obj) => obj.toLowerCase().includes(search.toLowerCase())));

      const matchesCategory = selectedCategory === "All Categories" || c.category === selectedCategory;
      const price = c.price ?? 0;
      const matchesPrice =
        priceFilter === "Any Price" ||
        (priceFilter === "Free" ? price === 0 : price > 0);

      return matchesSearch && matchesCategory && matchesPrice;
    });
  }, [courses, search, selectedCategory, priceFilter]);

  return (
    <div className="min-h-screen flex flex-col bg-surface-base text-text-primary selection:bg-primary/20">
      {/* Extracted Header Component */}
      <HomeHeader />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 border-b border-surface-border bg-linear-to-b from-surface-sunken/40 to-surface-base">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Messaging */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <motion.div
                initial={{ opacity: 0, y: -6, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Next-Gen Workforce & Individual Learning</span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1, ease: [0.21, 0.47, 0.32, 0.98] }}
                className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-text-primary leading-[1.15]"
              >
                Master High-Impact Skills with{" "}
                <motion.span
                  initial={{ opacity: 0, filter: "blur(4px)" }}
                  animate={{ opacity: 1, filter: "blur(0px)" }}
                  transition={{ duration: 0.6, delay: 0.28, ease: "easeOut" }}
                  className="bg-linear-to-r from-primary via-brand-600 to-[color-mix(in_oklch,var(--primary),purple_30%)] bg-clip-text text-transparent inline-block"
                >
                  Verified Courses
                </motion.span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.22, ease: "easeOut" }}
                className="text-lg sm:text-xl text-text-secondary max-w-2xl mx-auto lg:mx-0 leading-relaxed"
              >
                Elevate your career with industry-tailored courses. Learn through interactive video lectures, timestamped notes, accredited certifications, and live instructor Q&A.
              </motion.p>

              {/* CTAs */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.32, ease: "easeOut" }}
                className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2"
              >
                <Button
                  size="lg"
                  className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-6 text-base font-semibold shadow-md gap-2"
                  render={<a href="#catalog" />}
                >
                  <span>Explore Courses to Purchase</span>
                  <ArrowRight className="w-5 h-5" />
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto border-surface-border hover:bg-surface-raised px-6 py-6 text-base font-medium"
                  render={<Link href="/auth/signup" />}
                >
                  Create Learner Account
                </Button>
              </motion.div>

              {/* Trust badges */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.45, delay: 0.42 }}
                className="pt-6 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-text-tertiary"
              >
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  Instant course enrollment
                </span>
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-brand-600" />
                  30-day money-back guarantee
                </span>
                <span className="flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-warning" />
                  Accredited certificates
                </span>
              </motion.div>
            </div>

            {/* Right Column: Hero Visual Card */}
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.55, delay: 0.2, ease: [0.21, 0.47, 0.32, 0.98] }}
              className="lg:col-span-5"
            >
              <div className="relative mx-auto max-w-md lg:max-w-none">
                {/* Glow backdrop */}
                <div className="absolute -inset-2 rounded-3xl bg-linear-to-tr from-primary/30 to-brand-300/30 blur-2xl opacity-60" />

                <Card className="relative border-surface-border shadow-2xl bg-surface-base/95 overflow-hidden">
                  <div className="bg-surface-sunken p-4 border-b border-surface-border flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-400" />
                      <div className="w-3 h-3 rounded-full bg-amber-400" />
                      <div className="w-3 h-3 rounded-full bg-emerald-400" />
                      <span className="text-xs font-mono text-text-tertiary ml-2">course-player.lms.dev</span>
                    </div>
                    <Badge variant="outline" className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40">
                      LIVE STREAM
                    </Badge>
                  </div>

                  <div className="p-5 space-y-4">
                    {/* Mock Video Preview */}
                    <div className="relative aspect-video rounded-xl bg-slate-900 flex items-center justify-center text-white overflow-hidden group">
                      <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent" />
                      <PlayCircle className="w-14 h-14 text-white/90 group-hover:scale-110 group-hover:text-primary transition-all z-10" />
                      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs z-10">
                        <span className="font-semibold text-white truncate max-w-[200px]">
                          Lesson 1: Secure Architecture & Zero-Trust
                        </span>
                        <span className="bg-black/60 px-2 py-0.5 rounded-sm font-mono text-[11px]">18:42</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-text-secondary font-medium">Interactive Learning Feature</span>
                        <span className="text-brand-600 font-bold">Press &apos;B&apos; to Bookmark Note</span>
                      </div>
                      <div className="p-3 rounded-lg bg-surface-sunken border border-surface-border text-xs text-text-secondary flex items-start gap-2.5">
                        <Zap className="w-4 h-4 text-warning shrink-0 mt-0.5" />
                        <span>
                          Timestamped notes automatically sync with video playback for effortless exam review.
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-surface-border text-center">
                      <div className="p-2 rounded-lg bg-surface-sunken/60">
                        <p className="text-base font-bold text-text-primary">50K+</p>
                        <p className="text-[10px] text-text-tertiary uppercase font-semibold">Learners</p>
                      </div>
                      <div className="p-2 rounded-lg bg-surface-sunken/60">
                        <p className="text-base font-bold text-text-primary">99.4%</p>
                        <p className="text-[10px] text-text-tertiary uppercase font-semibold">Completion</p>
                      </div>
                      <div className="p-2 rounded-lg bg-surface-sunken/60">
                        <p className="text-base font-bold text-text-primary">4.9 ★</p>
                        <p className="text-[10px] text-text-tertiary uppercase font-semibold">Avg Rating</p>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Available Courses To Purchase Section (#catalog) */}
      <section id="catalog" className="py-16 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        {/* Section Header */}
        <ScrollReveal>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-brand-600 mb-2">
                <ShoppingBag className="w-4 h-4" /> Available For Purchase & Enrollment
              </div>
              <h2 className="text-3xl font-extrabold tracking-tight text-text-primary">
                Featured Academy Courses
              </h2>
              <p className="text-text-secondary text-sm mt-1 max-w-xl">
                Choose from verified certification programs and deep-dive technical curriculums. Purchase individually or access with your team.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-text-tertiary font-medium">
                Showing {filteredCourses.length} of {courses.length} courses
              </span>
            </div>
          </div>
        </ScrollReveal>

        {/* Filters and Search Bar */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 mb-8 p-4 rounded-2xl bg-surface-sunken border border-surface-border">
          {/* Search box */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
            <Input
              placeholder="Search courses by keyword, topic, or objective..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-8 bg-surface-base border-surface-border text-sm"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-primary"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all",
                  selectedCategory === cat
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "bg-surface-base text-text-secondary hover:text-text-primary border border-surface-border"
                )}
              >
                {cat === "All Categories" ? "All Categories" : cat}
              </button>
            ))}
          </div>

          {/* Price toggle */}
          <div className="flex items-center gap-1 bg-surface-base border border-surface-border rounded-lg p-1 shrink-0">
            {(["Any Price", "Free", "Paid"] as const).map((tier) => (
              <button
                key={tier}
                onClick={() => setPriceFilter(tier)}
                className={cn(
                  "px-2.5 py-1 text-xs font-medium rounded-md capitalize transition-all",
                  priceFilter === tier
                    ? "bg-primary/10 text-primary font-bold"
                    : "text-text-secondary hover:text-text-primary"
                )}
              >
                {tier}
              </button>
            ))}
          </div>
        </div>

        {/* Course Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => {
            const lessonCount = course.sections.reduce((acc, s) => acc + s.lessons.length, 0);
            const price = course.price ?? 0;
            const originalPrice = price > 0 ? Math.round(price * 1.6) : null;
            const rating = course.rating || 4.8;
            const isBestseller = (course.enrolled || 0) >= 300 || rating >= 4.85;
            const isHighestRated = rating >= 4.9;
            const userKey = currentUser?.identifier || "learner@lms.dev";
            const enrollment = currentUser ? getEnrollment(userKey, course.id) : undefined;
            const isEnrolled = !!enrollment;

            return (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "0px 0px -20px 0px" }}
                transition={{ duration: 0.32, ease: "easeOut" }}
                className="group flex flex-col justify-between bg-surface-base rounded-2xl border border-surface-border overflow-hidden hover:shadow-xl hover:border-primary/40 transition-colors duration-300"
              >
                <div>
                  {/* 1. MEDIA THUMBNAIL (16:9 Aspect Ratio) */}
                  <div
                    onClick={() => handleCourseAction(course)}
                    className="relative aspect-video w-full overflow-hidden bg-surface-sunken cursor-pointer select-none"
                  >
                    <img
                      src={resolveCourseThumbnail(course)}
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                    />

                    {/* Hover Dark Overlay with Play Circle */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[2px]">
                      <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                        <Play className="w-5 h-5 fill-current translate-x-0.5" />
                      </div>
                    </div>

                    {/* Top-Left Ribbon Badges */}
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

                    {/* Bottom-Right Lesson Counter Overlay */}
                    <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/75 backdrop-blur-xs text-white text-[11px] font-mono font-medium flex items-center gap-1.5 shadow-sm">
                      <Clock className="w-3 h-3 text-primary" />
                      <span>{lessonCount} lessons</span>
                    </div>
                  </div>

                  {/* 2. CARD BODY */}
                  <div className="p-4 space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-primary truncate">
                        {course.category}
                      </span>
                      <span className="text-xs text-text-tertiary">
                        {course.enrolled || 0} learners
                      </span>
                    </div>

                    <h3
                      onClick={() => handleCourseAction(course)}
                      className="font-bold text-text-primary group-hover:text-primary transition-colors text-base leading-snug line-clamp-2 cursor-pointer"
                    >
                      {course.title}
                    </h3>

                    <p className="text-xs text-text-secondary truncate">
                      {course.department ? `${course.department} · ` : ""}
                      {course.org || "Acme Academy"}
                    </p>

                    {/* Udemy Star Rating & Reviews */}
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
                                : "text-text-tertiary/30"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-[11px] text-text-tertiary">
                        ({course.enrolled || 0})
                      </span>
                    </div>

                    {/* Objectives list */}
                    {course.objectives && course.objectives.length > 0 && (
                      <div className="space-y-1 pt-1">
                        <ul className="text-xs text-text-secondary space-y-1">
                          {course.objectives.slice(0, 2).map((obj, i) => (
                            <li key={i} className="flex items-start gap-1.5 line-clamp-1">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                              <span className="truncate">{obj}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>

                {/* 3. CARD ACTIONS & PRICING */}
                <div className="p-4 pt-0 border-t border-surface-border mt-3 space-y-3">
                  <div className="flex items-baseline justify-between pt-3">
                    <div className="flex items-baseline gap-2">
                      <span className="text-lg font-black text-text-primary">
                        {price > 0 ? `$${price}` : "FREE"}
                      </span>
                      {originalPrice && (
                        <span className="text-xs text-text-tertiary line-through font-mono">
                          ${originalPrice}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPreviewCourse(course)}
                      className="text-xs font-semibold border-surface-border hover:bg-surface-sunken"
                    >
                      Quick Syllabus
                    </Button>

                    <Button
                      size="sm"
                      onClick={() => handleCourseAction(course)}
                      className="text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs cursor-pointer"
                    >
                      {isEnrolled
                        ? "Continue Course"
                        : currentUser
                        ? price === 0
                          ? "Enroll Free"
                          : `Enroll ($${price})`
                        : price === 0
                        ? "Enroll Free"
                        : `Buy ($${price})`}
                    </Button>
                  </div>
                </div>
              </motion.div>
            );
          })}

          {filteredCourses.length === 0 && (
            <div className="col-span-full py-16 text-center space-y-3 bg-surface-sunken/40 rounded-2xl border border-surface-border">
              <ShoppingBag className="w-10 h-10 text-text-tertiary mx-auto" />
              <h3 className="text-base font-semibold text-text-primary">No matching courses found</h3>
              <p className="text-xs text-text-secondary max-w-sm mx-auto">
                Try searching with different keywords or clear the category and price filters.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearch("");
                  setSelectedCategory("All Categories");
                  setPriceFilter("Any Price");
                }}
              >
                Reset Filters
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Platform Features Section */}
      <section id="features" className="py-20 border-t border-surface-border bg-surface-sunken/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
              <Badge variant="outline" className="text-primary border-primary/30 font-semibold text-xs">
                ENGINEERED FOR EXCELLENCE
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-text-primary">
                Everything You Need for Serious Learning
              </h2>
              <p className="text-text-secondary text-sm sm:text-base">
                Say goodbye to shallow tutorials. Our platform gives you enterprise-grade tooling designed for real knowledge acquisition and retention.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <ScrollReveal delay={0.05} className="p-6 rounded-2xl bg-surface-base border border-surface-border shadow-xs space-y-3">
              <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                <Video className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-text-primary">Distraction-Free Player</h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                Adaptive HLS streaming with instant keyboard shortcuts, speed control up to 2x, and timestamped personal notes.
              </p>
            </ScrollReveal>

            <ScrollReveal delay={0.1} className="p-6 rounded-2xl bg-surface-base border border-surface-border shadow-xs space-y-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-text-primary">Certified Credentials</h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                Pass interactive evaluations to earn verifiable digital credentials ready to share with employers and recruiters.
              </p>
            </ScrollReveal>

            <ScrollReveal delay={0.15} className="p-6 rounded-2xl bg-surface-base border border-surface-border shadow-xs space-y-3">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center font-bold">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-text-primary">Instructor Q&A Forum</h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                Direct community discussions per lesson with verified instructor replies and helpful community upvoting.
              </p>
            </ScrollReveal>

            <ScrollReveal delay={0.2} className="p-6 rounded-2xl bg-surface-base border border-surface-border shadow-xs space-y-3">
              <div className="w-12 h-12 rounded-xl bg-sky-500/10 text-sky-600 flex items-center justify-center font-bold">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-text-primary">Structured Learning Paths</h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                Sequential progression that guides you step-by-step from foundational concepts to advanced production architecture.
              </p>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Pricing / Access Tiers Section */}
      <section id="pricing" className="py-20 border-t border-surface-border bg-surface-base">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-text-primary">
                Simple, Transparent Pricing
              </h2>
              <p className="text-text-secondary text-sm sm:text-base">
                Purchase individual courses for lifetime access or power your entire organization.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Tier 1: Single Course */}
            <ScrollReveal delay={0.05}>
              <Card className="border-surface-border p-6 flex flex-col justify-between space-y-6 h-full">
                <div className="space-y-4">
                  <Badge variant="outline" className="text-xs font-semibold">Individual</Badge>
                  <h3 className="text-xl font-bold">Course Purchase</h3>
                  <p className="text-xs text-text-secondary">
                    Pay once for any course and get lifetime on-demand access.
                  </p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold">$39-$129</span>
                    <span className="text-xs text-text-tertiary">/ one-time</span>
                  </div>
                  <ul className="text-xs text-text-secondary space-y-2 pt-2">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      Lifetime access to selected course
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      Digital Certificate upon completion
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      Lesson Q&A with instructors
                    </li>
                  </ul>
                </div>

                <Button
                  variant="outline"
                  className="w-full font-semibold"
                  render={<a href="#catalog" />}
                >
                  Browse Catalog
                </Button>
              </Card>
            </ScrollReveal>

            {/* Tier 2: All Access Pro (Popular) */}
            <ScrollReveal delay={0.1}>
              <Card className="border-primary relative p-6 flex flex-col justify-between space-y-6 shadow-xl ring-2 ring-primary/20 overflow-visible h-full">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                  <Badge className="bg-primary text-primary-foreground font-bold text-xs uppercase tracking-wider px-3 py-1.5 shadow-lg">
                    Most Popular
                  </Badge>
                </div>

                <div className="space-y-4 pt-2">
                  <Badge variant="outline" className="text-xs font-semibold text-primary">All-Access</Badge>
                  <h3 className="text-xl font-bold">Learner Pro</h3>
                  <p className="text-xs text-text-secondary">
                    Unlimited access to all courses, learning tracks, and upcoming releases.
                  </p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold">$29</span>
                    <span className="text-xs text-text-tertiary">/ month</span>
                  </div>
                  <ul className="text-xs text-text-secondary space-y-2 pt-2">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      Access to 200+ courses & tracks
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      All professional certifications
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      Interactive labs & source code
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      Priority instructor feedback
                    </li>
                  </ul>
                </div>

                <Button
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-bold"
                  render={<Link href="/auth/signup" />}
                >
                  Start 7-Day Free Trial
                </Button>
              </Card>
            </ScrollReveal>

            {/* Tier 3: Enterprise */}
            <ScrollReveal delay={0.15}>
              <Card className="border-surface-border p-6 flex flex-col justify-between space-y-6 h-full">
                <div className="space-y-4">
                  <Badge variant="outline" className="text-xs font-semibold">Organizations</Badge>
                  <h3 className="text-xl font-bold">Enterprise Team</h3>
                  <p className="text-xs text-text-secondary">
                    Dedicated tenant, compliance tracking, and automated onboarding.
                  </p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold">$49</span>
                    <span className="text-xs text-text-tertiary">/ seat / month</span>
                  </div>
                  <ul className="text-xs text-text-secondary space-y-2 pt-2">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      Centralized manager dashboard
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      SSO (SAML, Okta, Azure AD)
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      SCORM / xAPI export & reports
                    </li>
                  </ul>
                </div>

                <Button
                  variant="outline"
                  className="w-full font-semibold"
                  render={<Link href="/auth/login" />}
                >
                  Contact Enterprise Sales
                </Button>
              </Card>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Global Call to Action Banner */}
      <section className="py-16 bg-primary text-primary-foreground relative overflow-hidden">
        <ScrollReveal className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6 relative z-10">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Ready to Take Your Skills to the Next Level?
          </h2>
          <p className="text-primary-foreground/80 max-w-2xl mx-auto text-sm sm:text-base">
            Join thousands of ambitious engineers, leaders, and specialists learning on LMS Portal today.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Button
              size="lg"
              className="bg-white text-primary hover:bg-white/90 font-bold px-8 py-6 text-base shadow-lg"
              render={<Link href="/auth/signup" />}
            >
              Sign Up & Purchase Course
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-white/30 text-white hover:bg-white/10 px-8 py-6 text-base font-semibold"
              render={<Link href="/auth/login" />}
            >
              Log In to Existing Account
            </Button>
          </div>
        </ScrollReveal>
      </section>

      {/* Course Quick Preview Modal */}
      {previewCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in-0">
          <div className="bg-surface-base border border-surface-border rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-6 border-b border-surface-border flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <Badge variant="outline">{previewCourse.category}</Badge>
                  <span className="text-xs text-text-tertiary">
                    {previewCourse.sections.length} sections • {previewCourse.sections.reduce((acc, s) => acc + s.lessons.length, 0)} lessons
                  </span>
                </div>
                <h3 className="text-xl font-bold text-text-primary">
                  {previewCourse.title}
                </h3>
              </div>
              <button
                onClick={() => setPreviewCourse(null)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-text-tertiary hover:text-text-primary hover:bg-surface-sunken"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body: Syllabus */}
            <div className="p-6 overflow-y-auto space-y-6">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-text-tertiary mb-2">
                  Learning Objectives
                </h4>
                <ul className="text-xs text-text-secondary space-y-1.5">
                  {previewCourse.objectives.map((obj, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{obj}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-text-tertiary mb-3">
                  Curriculum & Syllabus
                </h4>
                <div className="space-y-3">
                  {previewCourse.sections.map((sec, idx) => (
                    <div key={sec.id} className="rounded-xl border border-surface-border bg-surface-sunken/50 p-4">
                      <p className="font-semibold text-sm text-text-primary mb-2">
                        Section {idx + 1}: {sec.title}
                      </p>
                      <ul className="space-y-2">
                        {sec.lessons.map((lesson, lIdx) => (
                          <li
                            key={lesson.id}
                            className="flex items-center justify-between text-xs text-text-secondary bg-surface-base p-2.5 rounded-lg border border-surface-border"
                          >
                            <span className="flex items-center gap-2 truncate">
                              <PlayCircle className="w-4 h-4 text-primary shrink-0" />
                              <span className="font-medium text-text-primary">
                                {idx + 1}.{lIdx + 1} {lesson.title}
                              </span>
                            </span>
                            <span className="text-[10px] uppercase font-bold text-text-tertiary px-1.5 py-0.5 bg-surface-sunken rounded">
                              {lesson.type}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-surface-sunken border-t border-surface-border flex items-center justify-between">
              <div>
                <span className="text-xs text-text-secondary">Full Lifetime Access:</span>
                <p className="text-xl font-extrabold text-text-primary">
                  {(previewCourse.price ?? 0) === 0 ? "FREE" : `$${previewCourse.price}`}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setPreviewCourse(null)}>
                  Close
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    const c = previewCourse;
                    setPreviewCourse(null);
                    handleCourseAction(c);
                  }}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold cursor-pointer"
                >
                  {(previewCourse.price ?? 0) === 0
                    ? "Enroll Free"
                    : currentUser
                    ? `Enroll Now ($${previewCourse.price})`
                    : `Buy & Learn ($${previewCourse.price})`}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Extracted Footer Component */}
      <HomeFooter />
    </div>
  );
}