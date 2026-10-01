"use client";

import Link from "next/link";
import { useState } from "react";
import { BookOpen, Sparkles, ChevronRight, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuthStore } from "@/lib/store/auth-store";
import { HOME_NAV_ITEMS, HOME_ANNOUNCEMENT } from "@/lib/mock/home-nav";

import { BrandLogo } from "@/components/ui/brand-logo";

export function HomeHeader() {
  const currentUser = useAuthStore((s) => s.currentUser);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Top Announcement Bar */}
      {HOME_ANNOUNCEMENT && (
        <div className="bg-primary px-4 py-2 text-center text-xs font-medium text-primary-foreground flex items-center justify-center gap-2 select-none">
          <Sparkles className="w-3.5 h-3.5 shrink-0" />
          <span>{HOME_ANNOUNCEMENT.message}</span>
          <a
            href={HOME_ANNOUNCEMENT.linkHref}
            className="underline font-bold hover:opacity-90 ml-1 shrink-0"
          >
            {HOME_ANNOUNCEMENT.linkText}
          </a>
        </div>
      )}

      {/* Main Navigation Header */}
      <header className="sticky top-0 z-40 w-full border-b border-surface-border bg-surface-base/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Brand */}
          <Link href="/" className="flex items-center shrink-0">
            <BrandLogo size="md" />
          </Link>

          {/* Desktop Nav links from Mock Data */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-text-secondary">
            {HOME_NAV_ITEMS.map((item) => (
              <a
                key={item.id}
                href={item.href}
                className="hover:text-text-primary transition-colors flex items-center gap-1.5"
              >
                <span>{item.label}</span>
                {item.badge && (
                  <span className="text-[10px] font-bold bg-primary/10 text-primary px-1.5 py-0.2 rounded-full">
                    {item.badge}
                  </span>
                )}
              </a>
            ))}
          </nav>

          {/* Action CTAs & Auth Routes */}
          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeToggle />

            {currentUser ? (
              <Button
                variant="outline"
                size="sm"
                className="gap-2 font-medium"
                render={<Link href={`/${currentUser.role}/dashboard`} />}
              >
                <span>Dashboard ({currentUser.name.split(" ")[0]})</span>
                <ChevronRight className="w-4 h-4" />
              </Button>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-text-secondary hover:text-text-primary font-medium"
                  render={<Link href="/auth/login" />}
                >
                  Log In
                </Button>
                <Button
                  size="sm"
                  className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold shadow-xs"
                  render={<Link href="/auth/signup" />}
                >
                  Get Started
                </Button>
              </div>
            )}

            {/* Mobile hamburger button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-sunken"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile dropdown menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-surface-border bg-surface-base px-4 py-4 space-y-3">
            <div className="space-y-1">
              {HOME_NAV_ITEMS.map((item) => (
                <a
                  key={item.id}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-surface-sunken transition-colors"
                >
                  {item.label}
                </a>
              ))}
            </div>

            {!currentUser && (
              <div className="pt-3 border-t border-surface-border grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  render={<Link href="/auth/login" />}
                >
                  Log In
                </Button>
                <Button
                  size="sm"
                  className="w-full bg-primary text-primary-foreground"
                  render={<Link href="/auth/signup" />}
                >
                  Get Started
                </Button>
              </div>
            )}
          </div>
        )}
      </header>
    </>
  );
}
