import React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface BrandLogoProps {
  /** Size variant */
  size?: "sm" | "md" | "lg" | "xl";
  /** Whether to show text next to the logo image */
  showText?: boolean;
  /** Whether to show subtitle "Skilling India in Electronics" */
  showSubtitle?: boolean;
  /** Whether the sidebar is collapsed (shows only mark) */
  isCollapsed?: boolean;
  /** Additional container styling */
  className?: string;
  /** Custom text container styling */
  textClassName?: string;
}

export function BrandLogo({
  size = "md",
  showText = true,
  showSubtitle = true,
  isCollapsed = false,
  className,
  textClassName,
}: BrandLogoProps) {
  const sizeConfig = {
    sm: {
      box: "w-8 h-8 rounded-lg p-0.5",
      img: 32,
      title: "text-sm",
      sub: "text-[9px]",
    },
    md: {
      box: "w-10 h-10 rounded-xl p-1",
      img: 40,
      title: "text-base sm:text-lg",
      sub: "text-[10px] sm:text-[11px]",
    },
    lg: {
      box: "w-12 h-12 rounded-xl p-1.5",
      img: 48,
      title: "text-lg sm:text-xl",
      sub: "text-xs",
    },
    xl: {
      box: "w-16 h-16 rounded-2xl p-2",
      img: 64,
      title: "text-2xl sm:text-3xl",
      sub: "text-sm",
    },
  }[size];

  return (
    <div className={cn("flex items-center gap-2.5 select-none min-w-0 group/brand", className)}>
      {/* Crisp White Logo Capsule */}
      <div
        className={cn(
          "bg-white flex items-center justify-center shrink-0 shadow-xs border border-border/50 ring-1 ring-black/5 transition-transform duration-200 group-hover/brand:scale-105",
          sizeConfig.box
        )}
      >
        <Image
          src="/logo.jpg"
          alt="ESSCI - Skilling India in Electronics"
          width={sizeConfig.img}
          height={sizeConfig.img}
          className="w-full h-full object-contain"
          priority
        />
      </div>

      {/* Brand Text Details */}
      {showText && !isCollapsed && (
        <div className={cn("min-w-0 flex flex-col justify-center leading-tight", textClassName)}>
          <span className={cn("font-black tracking-tight text-foreground truncate", sizeConfig.title)}>
            ESSCI
          </span>
          {showSubtitle && (
            <span className={cn("font-bold text-primary truncate tracking-tight", sizeConfig.sub)}>
              Skilling India in Electronics
            </span>
          )}
        </div>
      )}
    </div>
  );
}
