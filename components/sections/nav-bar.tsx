"use client";

import { cn } from "@/lib/utils";
import { ThemeToggle } from "../ui";
import { useTheme } from "@/context/AppContext";

export default function NavBar() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-10 backdrop-blur-md border-b border-neutral-200 dark:border-neutral-900 bg-white/80 dark:bg-black/80 transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-6 h-16 sm:h-20 flex items-center justify-between gap-4">
        {/* Branding Logo & Status */}
        <div className="flex items-center gap-3">
          {/* Brand Logo */}
          <div className="w-9 h-9 flex items-center justify-center shrink-0">
            <img
              src={isDark ? "/images/logo-dark.svg" : "/images/logo-icon.svg"}
              alt="Aether Downloader"
              className="w-full h-full"
            />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-light tracking-tight leading-none truncate text-neutral-900 dark:text-neutral-100">
              Aether Downloader
            </span>
            <span className="text-[9px] font-mono text-emerald-500 mt-1 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping shrink-0" />
              Extraction Nodes Active
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center gap-8 text-xs font-mono tracking-wider">
          <a
            href="#downloader-section"
            className="transition-colors duration-200 text-zinc-650 hover:text-zinc-900 dark:text-neutral-400 dark:hover:text-neutral-100"
          >
            PARSER
          </a>
          <a
            href="#platform-grid"
            className="transition-colors duration-200 text-zinc-650 hover:text-zinc-900 dark:text-neutral-400 dark:hover:text-neutral-100"
          >
            COMPATIBILITY
          </a>
          <a
            href="#step-guide"
            className="transition-colors duration-200 text-zinc-650 hover:text-zinc-900 dark:text-neutral-400 dark:hover:text-neutral-100"
          >
            WORKFLOW
          </a>
          <a
            href="#faq-accordion"
            className="transition-colors duration-200 text-zinc-650 hover:text-zinc-900 dark:text-neutral-400 dark:hover:text-neutral-100"
          >
            FAQS
          </a>
        </div>

        {/* Theme Toggle Button */}
        <div className="flex items-center gap-2 shrink-0">
          <ThemeToggle isDark={isDark} onToggle={toggleTheme} />
        </div>
      </div>
    </header>
  );
}
