"use client";

import Link from "next/link";
import { Globe2 } from "lucide-react";
import { HOME_FOOTER_DATA } from "@/lib/mock/home-nav";

export function HomeFooter() {
  return (
    <footer className="border-t border-surface-border bg-surface-sunken py-12 text-sm text-text-secondary select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {HOME_FOOTER_DATA.sections.map((section) => (
            <div key={section.title} className="space-y-3">
              <h4 className="font-bold text-text-primary text-sm">{section.title}</h4>
              <ul className="space-y-2 text-xs">
                {section.links.map((link) => {
                  const isAnchor = link.href.startsWith("#");
                  return (
                    <li key={link.label}>
                      {isAnchor ? (
                        <a
                          href={link.href}
                          className="hover:text-text-primary transition-colors"
                        >
                          {link.label}
                        </a>
                      ) : (
                        <Link
                          href={link.href}
                          className="hover:text-text-primary transition-colors"
                        >
                          {link.label}
                        </Link>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

        {/* Brand & Language Row */}
        <div className="border-t border-surface-border pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-text-tertiary gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-center sm:text-left">
            <p>{HOME_FOOTER_DATA.copyright}</p>
            <p className="hidden sm:inline text-border">•</p>
            <p>{HOME_FOOTER_DATA.tagline}</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-xs text-text-tertiary">
              <Globe2 className="w-3.5 h-3.5" />
              <span>{HOME_FOOTER_DATA.language}</span>
            </div>

            <div className="flex items-center gap-3">
              {HOME_FOOTER_DATA.legalLinks.map((item) => (
                <span
                  key={item.label}
                  className="hover:underline hover:text-text-secondary cursor-pointer transition-colors"
                >
                  {item.label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
