"use client";

import React from "react";
import { Application } from "@prisma/client";
import { Send, Users, Award, XCircle, Mic, TrendingUp, Layers, Bell } from "lucide-react";
import { isFollowUpNeeded } from "@/lib/reminder-utils";

interface DashboardSummaryProps {
  applications: Application[];
}

export function DashboardSummary({ applications }: DashboardSummaryProps) {
  const total = applications.length;
  const applied = applications.filter((a) => a.status === "APPLIED").length;
  const interviewing = applications.filter((a) => a.status === "INTERVIEWING").length;
  const offers = applications.filter((a) => a.status === "OFFER").length;
  const rejected = applications.filter((a) => a.status === "REJECTED").length;
  const interviewedCount = applications.filter((a) => a.interviewed).length;
  const followUpCount = applications.filter(isFollowUpNeeded).length;

  const responseRate = total > 0 ? Math.round(((interviewing + offers + rejected) / total) * 100) : 0;

  const metrics = [
    {
      title: "Total Tracked",
      value: total,
      icon: Layers,
      color: "bg-indigo-50/80 border-indigo-200/80 text-indigo-900 dark:bg-indigo-950/30 dark:border-indigo-500/20 dark:text-indigo-300",
    },
    {
      title: "Applied",
      value: applied,
      icon: Send,
      color: "bg-slate-100/70 border-slate-200 text-slate-800 dark:bg-slate-900/60 dark:border-slate-800 dark:text-slate-300",
    },
    {
      title: "Interviewing",
      value: interviewing,
      icon: Users,
      color: "bg-amber-50/80 border-amber-200/80 text-amber-900 dark:bg-amber-950/30 dark:border-amber-500/20 dark:text-amber-300",
    },
    {
      title: "Offers",
      value: offers,
      icon: Award,
      color: "bg-emerald-50/80 border-emerald-200/80 text-emerald-900 dark:bg-emerald-950/30 dark:border-emerald-500/20 dark:text-emerald-300",
    },
    {
      title: "Rejected",
      value: rejected,
      icon: XCircle,
      color: "bg-rose-50/80 border-rose-200/80 text-rose-900 dark:bg-rose-950/30 dark:border-rose-500/20 dark:text-rose-300",
    },
    {
      title: "Follow-Up Alert",
      value: followUpCount,
      icon: Bell,
      color: followUpCount > 0
        ? "bg-orange-50/90 border-orange-300 text-orange-950 dark:bg-orange-950/40 dark:border-orange-500/40 dark:text-orange-300 shadow-sm animate-pulse"
        : "bg-slate-100/70 border-slate-200 text-slate-800 dark:bg-slate-900/60 dark:border-slate-800 dark:text-slate-300",
    },
    {
      title: "Response Rate",
      value: `${responseRate}%`,
      icon: TrendingUp,
      color: "bg-cyan-50/80 border-cyan-200/80 text-cyan-900 dark:bg-cyan-950/30 dark:border-cyan-500/20 dark:text-cyan-300",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-2.5 sm:gap-3.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7">
      {metrics.map((metric, idx) => {
        const Icon = metric.icon;
        const isLastOdd = idx === metrics.length - 1;
        return (
          <div
            key={metric.title}
            className={`flex flex-col justify-between rounded-2xl border p-3.5 sm:p-4 shadow-sm transition-all hover:scale-[1.01] ${metric.color} ${
              isLastOdd ? "col-span-2 sm:col-span-1" : ""
            }`}
          >
            <div className="flex items-center justify-between gap-1">
              <span className="text-[11px] sm:text-xs font-semibold tracking-wide text-slate-700 dark:text-slate-300 truncate">
                {metric.title}
              </span>
              <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 opacity-80 shrink-0" />
            </div>
            <div className="mt-2 sm:mt-2.5 flex items-baseline">
              <span className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                {metric.value}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
