"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  LayoutGrid,
  Table,
  Plus,
  BarChart2,
  History,
  Sparkles,
  Upload,
  Download,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Settings,
  Briefcase,
  Layers,
  Menu,
  X,
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { logoutUserAction } from "@/actions/auth-actions";

interface SidebarProps {
  viewMode: "kanban" | "table";
  onViewModeChange: (mode: "kanban" | "table") => void;
  onOpenAddModal: () => void;
  onOpenImportModal: () => void;
  onOpenHistoryModal: () => void;
  onExportCSV: () => void;
  onOpenProfileModal: () => void;
  totalApps: number;
  userName?: string | null;
  userEmail?: string | null;
  userImage?: string | null;
}

export function Sidebar({
  viewMode,
  onViewModeChange,
  onOpenAddModal,
  onOpenImportModal,
  onOpenHistoryModal,
  onExportCSV,
  onOpenProfileModal,
  totalApps,
  userName,
  userEmail,
  userImage,
}: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const displayName = userName || "User Account";
  const displayEmail = userEmail || "user@example.com";
  const initials = displayName
    .split(" ")
    .map((p) => p[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  const navItems = [
    {
      id: "board",
      label: "Kanban Board",
      icon: LayoutGrid,
      active: viewMode === "kanban",
      onClick: () => onViewModeChange("kanban"),
    },
    {
      id: "table",
      label: "Data Table",
      icon: Table,
      active: viewMode === "table",
      onClick: () => onViewModeChange("table"),
    },
    {
      id: "history",
      label: "Activity Logs",
      icon: History,
      active: false,
      onClick: onOpenHistoryModal,
    },
  ];

  return (
    <>
      {/* ── Mobile Top Header (only visible on mobile screens < lg) ── */}
      <div className="lg:hidden sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/95 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
          >
            <Menu className="h-5 w-5" />
          </button>
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="Logo" className="h-8 w-8 rounded-full shadow-sm ring-1 ring-slate-200 dark:ring-slate-700" />
            <span className="font-bold text-sm text-slate-900 dark:text-white">Job Tracker</span>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            onClick={onOpenAddModal}
            className="flex h-9 items-center gap-1.5 rounded-xl bg-indigo-600 px-3 text-xs font-bold text-white shadow-sm hover:bg-indigo-500"
          >
            <Plus className="h-4 w-4" />
            <span>Add</span>
          </button>
        </div>
      </div>

      {/* ── Mobile Backdrop Overlay ── */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="lg:hidden fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm transition-opacity"
        />
      )}

      {/* ── Desktop Sidebar Container ── */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col border-r border-slate-200 bg-white text-slate-900 shadow-md dark:border-slate-800/80 dark:bg-slate-950 dark:text-slate-100 transition-all duration-300 ${
          collapsed ? "lg:w-20" : "lg:w-64"
        } ${
          mobileOpen ? "translate-x-0 w-72" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* ── Header: Logo + Title + Collapse Toggle ── */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-slate-100 dark:border-slate-800/80 shrink-0">
          <Link href="/" className="flex items-center gap-3 overflow-hidden min-w-0">
            <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-white shadow-sm ring-2 ring-indigo-500/20">
              <img src="/logo.png" alt="Job Tracker Logo" className="h-full w-full object-cover" />
            </div>
            {(!collapsed || mobileOpen) && (
              <div className="flex flex-col truncate">
                <span className="text-sm font-extrabold tracking-tight text-slate-900 dark:text-white truncate">
                  Job Tracker
                </span>
                <span className="text-[11px] font-semibold text-slate-400 truncate">
                  {totalApps} {totalApps === 1 ? "App" : "Apps"} Tracked
                </span>
              </div>
            )}
          </Link>

          {/* Desktop Collapse Button */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>

          {/* Mobile Close Button */}
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* ── Quick Add Application Button ── */}
        <div className="p-3 shrink-0">
          <button
            onClick={() => {
              onOpenAddModal();
              setMobileOpen(false);
            }}
            className={`flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 font-extrabold text-white shadow-md shadow-indigo-500/25 hover:from-indigo-500 hover:to-purple-500 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer ${
              collapsed && !mobileOpen ? "h-11 w-11 p-0 mx-auto" : "w-full h-11 px-4 text-xs"
            }`}
            title="Log New Job Application"
          >
            <Plus className="h-4 w-4 shrink-0" />
            {(!collapsed || mobileOpen) && <span>Add Application</span>}
          </button>
        </div>

        {/* ── Navigation Items ── */}
        <div className="flex-1 overflow-y-auto p-3 space-y-6">
          {/* Main Navigation Group */}
          <div className="space-y-1">
            {(!collapsed || mobileOpen) && (
              <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                Views &amp; Tools
              </div>
            )}

            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    item.onClick();
                    setMobileOpen(false);
                  }}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-bold transition-all cursor-pointer ${
                    item.active
                      ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/70 dark:text-indigo-300 shadow-sm"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900/80 dark:hover:text-white"
                  } ${collapsed && !mobileOpen ? "justify-center px-0" : ""}`}
                  title={item.label}
                >
                  <Icon className={`h-4 w-4 shrink-0 ${item.active ? "text-indigo-600 dark:text-indigo-400" : ""}`} />
                  {(!collapsed || mobileOpen) && <span>{item.label}</span>}
                </button>
              );
            })}
          </div>

          {/* Data Actions Group */}
          <div className="space-y-1">
            {(!collapsed || mobileOpen) && (
              <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                Data Management
              </div>
            )}

            <button
              onClick={() => {
                onOpenImportModal();
                setMobileOpen(false);
              }}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-900 transition-colors cursor-pointer ${
                collapsed && !mobileOpen ? "justify-center px-0" : ""
              }`}
              title="Import CSV"
            >
              <Upload className="h-4 w-4 text-indigo-500 shrink-0" />
              {(!collapsed || mobileOpen) && <span>Import CSV</span>}
            </button>

            <button
              onClick={() => {
                onExportCSV();
                setMobileOpen(false);
              }}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-900 transition-colors cursor-pointer ${
                collapsed && !mobileOpen ? "justify-center px-0" : ""
              }`}
              title="Export CSV"
            >
              <Download className="h-4 w-4 text-purple-500 shrink-0" />
              {(!collapsed || mobileOpen) && <span>Export CSV</span>}
            </button>
          </div>
        </div>

        {/* ── Footer: Theme Toggle & User Profile Card ── */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-800/80 shrink-0 space-y-2">
          {/* Theme Toggle row */}
          <div className={`flex items-center justify-between px-2 ${collapsed && !mobileOpen ? "justify-center" : ""}`}>
            {(!collapsed || mobileOpen) && (
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Theme</span>
            )}
            <ThemeToggle />
          </div>

          {/* User Profile Footer Button */}
          <div
            onClick={() => {
              onOpenProfileModal();
              setMobileOpen(false);
            }}
            className={`flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/80 p-2.5 hover:bg-slate-100 dark:border-slate-800/80 dark:bg-slate-900/60 dark:hover:bg-slate-900 transition-colors cursor-pointer ${
              collapsed && !mobileOpen ? "justify-center p-2" : ""
            }`}
            title="Edit Profile & Account"
          >
            <div className="relative flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 text-xs font-bold text-white shadow-sm">
              {userImage ? (
                <img src={userImage} alt={displayName} className="h-full w-full object-cover" />
              ) : (
                <span>{initials}</span>
              )}
            </div>

            {(!collapsed || mobileOpen) && (
              <div className="flex flex-col truncate min-w-0">
                <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {displayName}
                </span>
                <span className="text-[10px] text-slate-400 truncate">{displayEmail}</span>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
