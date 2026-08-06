"use client";

import React, { useMemo } from "react";
import { Application } from "@prisma/client";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import {
  TrendingUp,
  PieChart as PieIcon,
  BarChart3,
  Activity,
  ArrowUpRight,
  Sparkles,
  CheckCircle2,
  Clock,
} from "lucide-react";

interface DashboardAnalyticsProps {
  applications: Application[];
  onSelectApp?: (app: Application) => void;
}

const STATUS_COLORS = {
  APPLIED: "#6366f1", // Indigo
  INTERVIEWING: "#f59e0b", // Amber
  OFFER: "#10b981", // Emerald
  REJECTED: "#ef4444", // Rose
};

export function DashboardAnalytics({ applications, onSelectApp }: DashboardAnalyticsProps) {
  const total = applications.length;

  // Status Distribution Data for Donut Chart
  const statusData = useMemo(() => {
    const counts: Record<string, number> = {
      APPLIED: 0,
      INTERVIEWING: 0,
      OFFER: 0,
      REJECTED: 0,
    };
    applications.forEach((a) => {
      if (counts[a.status] !== undefined) {
        counts[a.status]++;
      }
    });

    return [
      { name: "Applied", value: counts.APPLIED, color: STATUS_COLORS.APPLIED },
      { name: "Interviewing", value: counts.INTERVIEWING, color: STATUS_COLORS.INTERVIEWING },
      { name: "Offers", value: counts.OFFER, color: STATUS_COLORS.OFFER },
      { name: "Rejected", value: counts.REJECTED, color: STATUS_COLORS.REJECTED },
    ].filter((d) => d.value > 0);
  }, [applications]);

  // Activity over recent days (Grouped by date)
  const activityData = useMemo(() => {
    const daysMap: Record<string, { date: string; count: number }> = {};

    // Get past 7 days
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      daysMap[key] = { date: key, count: 0 };
    }

    applications.forEach((app) => {
      const appDate = new Date(app.dateApplied || app.createdAt);
      const key = appDate.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      if (daysMap[key]) {
        daysMap[key].count++;
      }
    });

    return Object.values(daysMap);
  }, [applications]);

  // Conversion Metrics
  const interviewingCount = applications.filter((a) => a.status === "INTERVIEWING").length;
  const offersCount = applications.filter((a) => a.status === "OFFER").length;
  const rejectedCount = applications.filter((a) => a.status === "REJECTED").length;

  const interviewRate = total > 0 ? Math.round(((interviewingCount + offersCount) / total) * 100) : 0;
  const offerRate = total > 0 ? Math.round((offersCount / total) * 100) : 0;
  const activeCount = applications.filter((a) => a.status === "APPLIED" || a.status === "INTERVIEWING").length;

  // Recent 4 applications
  const recentApps = useMemo(() => {
    return [...applications]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 4);
  }, [applications]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

      {/* ── Donut Chart: Application Status Distribution ── */}
      <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-md shadow-slate-200/40 dark:border-slate-800 dark:bg-slate-900/90 dark:shadow-2xl flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/80 dark:text-indigo-400">
                <PieIcon className="h-4 w-4" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Status Breakdown</h3>
            </div>
            <span className="text-xs font-semibold text-slate-400">{total} Total</span>
          </div>

          {/* Donut Chart Viewport */}
          <div className="relative h-48 my-3">
            {statusData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(15, 23, 42, 0.9)",
                      borderColor: "rgba(51, 65, 85, 0.5)",
                      borderRadius: "12px",
                      color: "#fff",
                      fontSize: "12px",
                      fontWeight: "bold",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-xs text-slate-400 font-medium">
                No application data available
              </div>
            )}

            {/* Donut Center Label */}
            {statusData.length > 0 && (
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-extrabold text-slate-900 dark:text-white">{total}</span>
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Apps</span>
              </div>
            )}
          </div>
        </div>

        {/* Status Legend List */}
        <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
          {[
            { label: "Applied", count: applications.filter((a) => a.status === "APPLIED").length, color: "bg-indigo-500" },
            { label: "Interviewing", count: interviewingCount, color: "bg-amber-500" },
            { label: "Offer Received", count: offersCount, color: "bg-emerald-500" },
            { label: "Rejected", count: rejectedCount, color: "bg-rose-500" },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-1.5 truncate">
                <span className={`h-2.5 w-2.5 rounded-full ${item.color} shrink-0`} />
                <span className="truncate">{item.label}</span>
              </div>
              <span className="font-bold text-slate-900 dark:text-white ml-1">{item.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Bar Chart: Recent Application Activity ── */}
      <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-md shadow-slate-200/40 dark:border-slate-800 dark:bg-slate-900/90 dark:shadow-2xl flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950/80 dark:text-purple-400">
                <BarChart3 className="h-4 w-4" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">7-Day Activity Trend</h3>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-purple-500/10 px-2.5 py-0.5 text-[11px] font-bold text-purple-600 dark:text-purple-400 border border-purple-500/20">
              <TrendingUp className="h-3 w-3" />
              <span>Weekly Log</span>
            </span>
          </div>

          {/* Bar Chart Viewport */}
          <div className="h-48 my-3">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activityData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.15)" />
                <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: "#94a3b8" }} />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: "#94a3b8" }} />
                <Tooltip
                  cursor={{ fill: "rgba(99, 102, 241, 0.05)" }}
                  contentStyle={{
                    backgroundColor: "rgba(15, 23, 42, 0.9)",
                    borderColor: "rgba(51, 65, 85, 0.5)",
                    borderRadius: "12px",
                    color: "#fff",
                    fontSize: "12px",
                    fontWeight: "bold",
                  }}
                />
                <Bar dataKey="count" fill="#818cf8" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Funnel Metrics Row */}
        <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <div className="flex flex-col">
            <span className="text-[11px] font-semibold text-slate-400">Interview Rate</span>
            <span className="text-lg font-extrabold text-amber-600 dark:text-amber-400">{interviewRate}%</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] font-semibold text-slate-400">Offer Rate</span>
            <span className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400">{offerRate}%</span>
          </div>
        </div>
      </div>

      {/* ── Recent Activity / Applications Stream Widget ── */}
      <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-md shadow-slate-200/40 dark:border-slate-800 dark:bg-slate-950/90 dark:shadow-2xl flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/80 dark:text-emerald-400">
                <Activity className="h-4 w-4" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Recent Pipeline Activity</h3>
            </div>
            <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">{activeCount} Active</span>
          </div>

          {/* Activity Feed */}
          {recentApps.length > 0 ? (
            <div className="flex flex-col gap-3">
              {recentApps.map((app) => (
                <div
                  key={app.id}
                  onClick={() => onSelectApp && onSelectApp(app)}
                  className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50/60 p-3 hover:border-indigo-300 hover:bg-indigo-50/30 dark:border-slate-800/80 dark:bg-slate-900/60 dark:hover:border-indigo-500/40 transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-xs font-bold text-white shadow-sm">
                      {app.company.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {app.company}
                      </h4>
                      <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 truncate">
                        {app.position}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end shrink-0 ml-2">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold border ${
                        app.status === "APPLIED"
                          ? "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800"
                          : app.status === "INTERVIEWING"
                          ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800"
                          : app.status === "OFFER"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800"
                          : "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800"
                      }`}
                    >
                      {app.status}
                    </span>
                    <span className="mt-1 text-[10px] font-semibold text-slate-400 flex items-center gap-1">
                      <Clock className="h-2.5 w-2.5" />
                      {new Date(app.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex h-36 items-center justify-center text-xs text-slate-400 font-medium">
              No recent activity yet
            </div>
          )}
        </div>

        {/* Footer info strip */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1 font-semibold text-indigo-600 dark:text-indigo-400">
            <Sparkles className="h-3.5 w-3.5" /> Live Data Connected
          </span>
          <span className="text-[11px] font-medium">Auto Updates</span>
        </div>
      </div>
    </div>
  );
}
