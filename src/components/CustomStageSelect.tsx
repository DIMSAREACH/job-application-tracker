"use client";

import React, { useState, useRef, useEffect } from "react";
import { Send, Users, Award, XCircle, ChevronDown, Check } from "lucide-react";

export type ApplicationStage = "APPLIED" | "INTERVIEWING" | "OFFER" | "REJECTED";

interface CustomStageSelectProps {
  value: ApplicationStage;
  onChange: (value: ApplicationStage) => void;
}

const STAGES: {
  id: ApplicationStage;
  label: string;
  icon: React.ElementType;
  badgeClass: string;
}[] = [
  {
    id: "APPLIED",
    label: "Applied",
    icon: Send,
    badgeClass: "bg-indigo-100/80 text-indigo-900 border-indigo-200 dark:bg-indigo-950/60 dark:text-indigo-200 dark:border-indigo-500/30",
  },
  {
    id: "INTERVIEWING",
    label: "Interviewing",
    icon: Users,
    badgeClass: "bg-amber-100/80 text-amber-900 border-amber-200 dark:bg-amber-950/60 dark:text-amber-200 dark:border-amber-500/30",
  },
  {
    id: "OFFER",
    label: "Offer",
    icon: Award,
    badgeClass: "bg-emerald-100/80 text-emerald-900 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-200 dark:border-emerald-500/30",
  },
  {
    id: "REJECTED",
    label: "Rejected",
    icon: XCircle,
    badgeClass: "bg-rose-100/80 text-rose-900 border-rose-200 dark:bg-rose-950/60 dark:text-rose-200 dark:border-rose-500/30",
  },
];

export function CustomStageSelect({ value, onChange }: CustomStageSelectProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedStage = STAGES.find((s) => s.id === value) || STAGES[0];
  const SelectedIcon = selectedStage.icon;

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
    <div ref={containerRef} className="relative w-full">
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-900 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 hover:border-indigo-500/80 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
      >
        <div className="flex items-center gap-2">
          <span className={`flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-semibold ${selectedStage.badgeClass}`}>
            <SelectedIcon className="h-3.5 w-3.5" />
            <span>{selectedStage.label}</span>
          </span>
        </div>
        <ChevronDown className={`h-4 w-4 text-slate-500 dark:text-slate-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      {/* Popover Menu */}
      {open && (
        <div className="absolute left-0 top-full z-50 mt-1.5 w-full rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl dark:border-slate-800 dark:bg-slate-950 backdrop-blur-xl">
          {STAGES.map((stage) => {
            const Icon = stage.icon;
            const isSelected = stage.id === value;

            return (
              <button
                key={stage.id}
                type="button"
                onClick={() => {
                  onChange(stage.id);
                  setOpen(false);
                }}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-semibold transition-all ${
                  isSelected
                    ? "bg-indigo-50/80 text-indigo-950 dark:bg-indigo-950/60 dark:text-indigo-200"
                    : "text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className={`flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-semibold ${stage.badgeClass}`}>
                    <Icon className="h-3.5 w-3.5" />
                    <span>{stage.label}</span>
                  </span>
                </div>
                {isSelected && <Check className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
