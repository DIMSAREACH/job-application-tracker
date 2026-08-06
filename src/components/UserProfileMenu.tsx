"use client";

import React, { useState, useRef, useEffect } from "react";
import { LogOut, Sparkles, Settings } from "lucide-react";

import { logoutUserAction } from "@/actions/auth-actions";
import { UserProfileModal } from "@/components/UserProfileModal";

interface UserProfileMenuProps {
  userName?: string | null;
  userEmail?: string | null;
  userImage?: string | null;
  onProfileUpdated?: () => void;
}

export function UserProfileMenu({
  userName,
  userEmail,
  userImage,
  onProfileUpdated,
}: UserProfileMenuProps) {
  const [open, setOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const displayName = userName || "User Account";
  const displayEmail = userEmail || "user@example.com";

  // Generate 2-letter initials
  const initials = displayName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      <div ref={containerRef} className="relative shrink-0" suppressHydrationWarning>
        {/* Trigger Button - Clean Circular Profile Photo with Pulse Online Badge */}
        <button
          onClick={() => setOpen(!open)}
          className="relative flex h-10 w-10 items-center justify-center rounded-full bg-white dark:bg-slate-900 p-0.5 shadow-md border-2 border-indigo-500/30 hover:border-indigo-500 dark:border-indigo-400/30 dark:hover:border-indigo-400 hover:scale-105 transition-all cursor-pointer shrink-0"
          title={`${displayName} (Online) - Profile & Settings`}
        >
          <div className="flex h-full w-full overflow-hidden items-center justify-center rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 text-xs font-bold text-white shadow-inner" suppressHydrationWarning>
            {userImage ? (
              <img
                src={userImage}
                alt={displayName}
                className="h-full w-full object-cover"
              />
            ) : (
              <span>{initials || "U"}</span>
            )}
          </div>

          {/* Prominent Glowing Online Indicator */}
          <span className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-950" />
          </span>
        </button>

        {/* Popover Dropdown Menu */}
        {open && (
          <div className="absolute right-0 top-full z-50 mt-2 w-64 rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl dark:border-slate-800 dark:bg-slate-950 backdrop-blur-xl">
            {/* Header Card */}
            <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/80 p-3 dark:border-slate-800/80 dark:bg-slate-900/60 mb-1">
              <div className="relative flex h-10 w-10 shrink-0 items-center justify-center">
                <div className="flex h-full w-full overflow-hidden items-center justify-center rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 text-sm font-extrabold text-white shadow-md">
                  {userImage ? (
                    <img
                      src={userImage}
                      alt={displayName}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span>{initials || "U"}</span>
                  )}
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900" />
              </div>
              <div className="flex flex-col truncate">
                <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {displayName}
                </span>
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 truncate">
                  {displayEmail}
                </span>
                <div className="mt-1 flex items-center gap-1.5">
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Online</span>
                  </span>
                  <span className="flex items-center gap-1 text-[10px] font-semibold text-indigo-600 dark:text-indigo-400">
                    <Sparkles className="h-3 w-3" />
                    <span>Member</span>
                  </span>
                </div>
              </div>
            </div>


            <div className="my-1 border-t border-slate-100 dark:border-slate-800/60" />

            {/* Action: Edit Profile & Settings */}
            <button
              onClick={() => {
                setOpen(false);
                setProfileModalOpen(true);
              }}
              className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors cursor-pointer"
            >
              <Settings className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              <span>Edit Profile & Account</span>
            </button>

            {/* Action: Sign Out */}
            <button
              onClick={() => {
                setOpen(false);
                logoutUserAction();
              }}
              className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out Account</span>
            </button>
          </div>
        )}
      </div>

      {/* User Profile Modal */}
      <UserProfileModal
        open={profileModalOpen}
        onOpenChange={setProfileModalOpen}
        onProfileUpdated={onProfileUpdated}
      />
    </>
  );
}
