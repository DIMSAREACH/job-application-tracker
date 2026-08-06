"use client";

import React from "react";
import { Application } from "@prisma/client";
import { Send, Users, Award, XCircle, TrendingUp, Layers, Bell } from "lucide-react";
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
  const followUpCount = applications.filter(isFollowUpNeeded).length;

  const responseRate = total > 0 ? Math.round(((interviewing + offers + rejected) / total) * 100) : 0;

  const metrics = [
    {
      title: "Total Tracked",
      value: total,
      icon: Layers,
      iconBg: "bg-indigo-100/70 text-indigo-600 dark:bg-indigo-950/80 dark:text-indigo-400",
      borderColor: "border-slate-200/90 dark:border-slate-800",
    },
    {
      title: "Applied",
      value: applied,
      icon: Send,
      iconBg: "bg-blue-100/70 text-blue-600 dark:bg-blue-950/80 dark:text-blue-400",
      borderColor: "border-slate-200/90 dark:border-slate-800",
    },
    {
      title: "Interviewing",
      value: interviewing,
      icon: Users,
      iconBg: "bg-amber-100/70 text-amber-600 dark:bg-amber-950/80 dark:text-amber-400",
      borderColor: "border-slate-200/90 dark:border-slate-800",
    },
    {
      title: "Offers",
      value: offers,
      icon: Award,
      iconBg: "bg-emerald-100/70 text-emerald-600 dark:bg-emerald-950/80 dark:text-emerald-400",
      borderColor: "border-slate-200/90 dark:border-slate-800",
    },
    {
      title: "Rejected",
      value: rejected,
      icon: XCircle,
      iconBg: "bg-rose-100/70 text-rose-600 dark:bg-rose-950/80 dark:text-rose-400",
      borderColor: "border-slate-200/90 dark:border-slate-800",
    },
    {
      title: "Follow-Up Alert",
      value: followUpCount,
      icon: Bell,
      iconBg: followUpCount > 0
        ? "bg-orange-100 text-orange-600 dark:bg-orange-950 dark:text-orange-400 animate-pulse"
        : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400",
      borderColor: followUpCount > 0
        ? "border-orange-300 dark:border-orange-500/40 ring-1 ring-orange-400/20"
        : "border-slate-200/90 dark:border-slate-800",
    },
    {
      title: "Response Rate",
      value: `${responseRate}%`,
      icon: TrendingUp,
      iconBg: "bg-cyan-100/70 text-cyan-600 dark:bg-cyan-950/80 dark:text-cyan-400",
      borderColor: "border-slate-200/90 dark:border-slate-800",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7">
      {metrics.map((metric, idx) => {
        const Icon = metric.icon;
        const isLastOdd = idx === metrics.length - 1;
        return (
          <div
            key={metric.title}
            className={`group flex flex-col justify-between rounded-2xl border ${metric.borderColor} bg-white p-4 shadow-sm hover:shadow-md dark:bg-slate-900/90 transition-all duration-200 hover:-translate-y-0.5 ${
              isLastOdd ? "col-span-2 sm:col-span-1" : ""
            }`}
          >
            <div className="flex items-center justify-between gap-1.5">
              <span className="text-[11px] sm:text-xs font-semibold tracking-wide text-slate-500 dark:text-slate-400 truncate">
                {metric.title}
              </span>
              <div className={`flex h-7 w-7 items-center justify-center rounded-xl ${metric.iconBg} transition-transform group-hover:scale-110 shrink-0`}>
                <Icon className="h-3.5 w-3.5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline">
              <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                {metric.value}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
