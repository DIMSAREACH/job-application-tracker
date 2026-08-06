"use client";

import React from "react";
import { Briefcase, Plus, LayoutGrid, Table } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { UserProfileMenu } from "@/components/UserProfileMenu";

interface NavbarProps {
  onOpenAddModal: () => void;
  viewMode: "kanban" | "table";
  onViewModeChange: (mode: "kanban" | "table") => void;
  totalApps: number;
  userName?: string | null;
  userEmail?: string | null;
  userImage?: string | null;
  onProfileUpdated?: () => void;
}

export function Navbar({
  onOpenAddModal,
  viewMode,
  onViewModeChange,
  totalApps,
  userName,
  userEmail,
  userImage,
  onProfileUpdated,
}: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/95 transition-colors duration-300 shadow-sm">
      <div className="mx-auto flex h-16 w-full max-w-[1440px] items-center justify-between px-3 sm:px-6 lg:px-8 gap-2">
        {/* Brand Header Left */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          <img src="/logo.png" alt="Job Application Tracker Logo" className="h-10 w-10 sm:h-11 sm:w-11 shrink-0 object-contain drop-shadow-md" />

          <div className="hidden sm:flex flex-col justify-center">
            <h1 className="text-base lg:text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100 whitespace-nowrap">
              Job Application Tracker
            </h1>
            <p className="hidden md:block text-[11px] sm:text-xs font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap">
              {totalApps} {totalApps === 1 ? "application" : "applications"} tracked
            </p>
          </div>
        </div>

        {/* Action Toolbar Right */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* View Switcher Segmented Control */}
          <div className="flex items-center rounded-xl border border-slate-200 bg-slate-100/80 p-1 dark:border-slate-800 dark:bg-slate-900/80">
            <button
              onClick={() => onViewModeChange("kanban")}
              className={`flex items-center gap-1.5 rounded-lg px-2 sm:px-3 py-1 text-xs font-semibold transition-all ${
                viewMode === "kanban"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
              }`}
              title="Kanban Board View"
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              <span className="hidden md:inline">Board</span>
            </button>
            <button
              onClick={() => onViewModeChange("table")}
              className={`flex items-center gap-1.5 rounded-lg px-2 sm:px-3 py-1 text-xs font-semibold transition-all ${
                viewMode === "table"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
              }`}
              title="Data Table View"
            >
              <Table className="h-3.5 w-3.5" />
              <span className="hidden md:inline">Table</span>
            </button>
          </div>

          {/* Add Application Button */}
          <Button
            onClick={onOpenAddModal}
            className="gap-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 font-semibold text-white shadow-sm shadow-indigo-500/20 hover:from-indigo-500 hover:to-purple-500 h-9 px-2.5 sm:px-3.5 text-xs rounded-xl"
          >
            <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
            <span className="hidden sm:inline">Add Application</span>
            <span className="sm:hidden">Add</span>
          </Button>

          {/* Theme Toggle Button */}
          <ThemeToggle />

          {/* User Profile Avatar Dropdown */}
          <UserProfileMenu
            userName={userName}
            userEmail={userEmail}
            userImage={userImage}
            onProfileUpdated={onProfileUpdated}
          />
        </div>
      </div>
    </header>
  );
}
