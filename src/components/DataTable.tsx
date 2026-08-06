"use client";

import React, { useState } from "react";
import { Application, ApplicationActivity } from "@prisma/client";
import {
  Search,
  ArrowUpDown,
  Building2,
  Calendar,
  ExternalLink,
  Mic,
  Pencil,
  Trash2,
  MapPin,
  DollarSign,
  Download,
  Upload,
  Bell,
  History,
  Tag as TagIcon,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { exportApplicationsToCSV } from "@/lib/csv-utils";
import { isFollowUpNeeded, getFollowUpDays } from "@/lib/reminder-utils";

type ApplicationWithActivities = Application & { activities?: ApplicationActivity[] };

interface DataTableProps {
  applications: ApplicationWithActivities[];
  onToggleInterviewed: (id: string) => void;
  onEdit: (app: Application) => void;
  onDelete: (id: string) => void;
  onOpenImportModal: () => void;
  onViewHistory: (app: ApplicationWithActivities) => void;
}

export function DataTable({
  applications,
  onToggleInterviewed,
  onEdit,
  onDelete,
  onOpenImportModal,
  onViewHistory,
}: DataTableProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [sortField, setSortField] = useState<"dateApplied" | "company" | "position" | "status">("dateApplied");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Filtering
  const filteredApps = applications.filter((app) => {
    const matchesSearch =
      app.company.toLowerCase().includes(search.toLowerCase()) ||
      app.position.toLowerCase().includes(search.toLowerCase()) ||
      (app.location && app.location.toLowerCase().includes(search.toLowerCase())) ||
      (app.tags && app.tags.toLowerCase().includes(search.toLowerCase())) ||
      (app.notes && app.notes.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus = statusFilter === "ALL" || app.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Sorting
  const sortedApps = [...filteredApps].sort((a, b) => {
    let aVal: any = a[sortField];
    let bVal: any = b[sortField];

    if (sortField === "dateApplied") {
      aVal = new Date(a.dateApplied).getTime();
      bVal = new Date(b.dateApplied).getTime();
    } else {
      aVal = String(aVal).toLowerCase();
      bVal = String(bVal).toLowerCase();
    }

    if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
    if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  const toggleSort = (field: "dateApplied" | "company" | "position" | "status") => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "APPLIED":
        return <Badge className="bg-indigo-100/80 text-indigo-900 border-indigo-200 font-semibold dark:bg-indigo-950/60 dark:text-indigo-200 dark:border-indigo-500/30 rounded-full">Applied</Badge>;
      case "INTERVIEWING":
        return <Badge className="bg-amber-100/80 text-amber-900 border-amber-200 font-semibold dark:bg-amber-950/60 dark:text-amber-200 dark:border-amber-500/30 rounded-full">Interviewing</Badge>;
      case "OFFER":
        return <Badge className="bg-emerald-100/80 text-emerald-900 border-emerald-200 font-semibold dark:bg-emerald-950/60 dark:text-emerald-200 dark:border-emerald-500/30 rounded-full">Offer</Badge>;
      case "REJECTED":
        return <Badge className="bg-rose-100/80 text-rose-900 border-rose-200 font-semibold dark:bg-rose-950/60 dark:text-rose-200 dark:border-rose-500/30 rounded-full">Rejected</Badge>;
      default:
        return <Badge variant="outline" className="rounded-full">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      {/* Controls Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Search */}
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
          <Input
            placeholder="Search company, position, tags..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-white border-slate-200 text-slate-900 font-medium placeholder:text-slate-400 dark:bg-slate-900/80 dark:border-slate-800 dark:text-slate-200 dark:placeholder:text-slate-500 focus-visible:ring-indigo-500 shadow-sm rounded-xl"
          />
        </div>

        {/* Status Filter Tabs & CSV Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {/* CSV Tools */}
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              onClick={onOpenImportModal}
              className="gap-1.5 rounded-xl border-slate-200 text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-900 text-xs font-semibold"
              title="Import Applications from CSV"
            >
              <Upload className="h-3.5 w-3.5" />
              <span className="hidden md:inline">Import CSV</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => exportApplicationsToCSV(applications)}
              className="gap-1.5 rounded-xl border-slate-200 text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-900 text-xs font-semibold"
              title="Export Applications to CSV"
            >
              <Download className="h-3.5 w-3.5" />
              <span className="hidden md:inline">Export CSV</span>
            </Button>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1 overflow-x-auto rounded-xl border border-slate-200 bg-white p-1 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
            {["ALL", "APPLIED", "INTERVIEWING", "OFFER", "REJECTED"].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all whitespace-nowrap ${
                  statusFilter === status
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
                }`}
              >
                {status === "ALL" ? "All" : status.charAt(0) + status.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Desktop / Tablet Full Table View (>= sm screens) */}
      <div className="hidden sm:block overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/80 backdrop-blur-md">
        <table className="w-full text-left text-sm text-slate-800 dark:text-slate-200 min-w-[700px]">
          <thead className="border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950/80 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            <tr>
              <th className="px-4 py-3.5 cursor-pointer hover:text-slate-900 dark:hover:text-white" onClick={() => toggleSort("company")}>
                <div className="flex items-center gap-1.5">
                  <span>Company & Position</span>
                  <ArrowUpDown className="h-3.5 w-3.5" />
                </div>
              </th>
              <th className="px-4 py-3.5 cursor-pointer hover:text-slate-900 dark:hover:text-white" onClick={() => toggleSort("status")}>
                <div className="flex items-center gap-1.5">
                  <span>Status</span>
                  <ArrowUpDown className="h-3.5 w-3.5" />
                </div>
              </th>
              <th className="px-4 py-3.5">Interviewed</th>
              <th className="px-4 py-3.5 cursor-pointer hover:text-slate-900 dark:hover:text-white" onClick={() => toggleSort("dateApplied")}>
                <div className="flex items-center gap-1.5">
                  <span>Date Applied</span>
                  <ArrowUpDown className="h-3.5 w-3.5" />
                </div>
              </th>
              <th className="px-4 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {sortedApps.length > 0 ? (
              sortedApps.map((app) => {
                const needsFollowUp = isFollowUpNeeded(app);
                const followUpDays = getFollowUpDays(app);
                const tagList = app.tags ? app.tags.split(",").map((t) => t.trim()).filter(Boolean) : [];

                return (
                  <tr key={app.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                    {/* Position & Company */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900 dark:text-slate-100 text-base">{app.position}</span>
                        {needsFollowUp && (
                          <span className="flex items-center gap-1 rounded-full bg-amber-100 text-amber-900 px-2 py-0.5 text-[10px] font-bold dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-500/40">
                            <Bell className="h-3 w-3 text-amber-600" />
                            {followUpDays}d follow-up
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-400 mt-0.5">
                        <span className="flex items-center gap-1">
                          <Building2 className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
                          {app.company}
                        </span>
                        {app.location && <span>• {app.location}</span>}
                        {app.jobUrl && (
                          <a
                            href={app.jobUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline flex items-center gap-0.5"
                          >
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                      {tagList.length > 0 && (
                        <div className="mt-1 flex flex-wrap gap-1">
                          {tagList.map((tag) => (
                            <span
                              key={tag}
                              className="inline-flex items-center gap-1 rounded-md bg-indigo-50/80 border border-indigo-200/60 px-1.5 py-0.2 text-[9px] font-semibold text-indigo-900 dark:bg-indigo-950/40 dark:border-indigo-500/30 dark:text-indigo-300"
                            >
                              <TagIcon className="h-2 w-2 text-indigo-500" />
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3.5">{getStatusBadge(app.status)}</td>

                    {/* Interviewed Stamp */}
                    <td className="px-4 py-3.5">
                      <button
                        onClick={() => onToggleInterviewed(app.id)}
                        className={`flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold border transition-all ${
                          app.interviewed
                            ? "bg-purple-100/80 text-purple-900 border-purple-200 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-500/30"
                            : "bg-slate-100/70 text-slate-500 border-slate-200 dark:bg-slate-800/50 dark:text-slate-400 dark:border-slate-700 hover:text-slate-800 dark:hover:text-slate-200"
                        }`}
                      >
                        <Mic className="h-3 w-3" />
                        <span>{app.interviewed ? "Yes" : "No"}</span>
                      </button>
                    </td>

                    {/* Date Applied */}
                    <td className="px-4 py-3.5 text-xs font-medium text-slate-600 dark:text-slate-400">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                        <span>
                          {new Date(app.dateApplied).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onViewHistory(app)}
                          className="h-8 w-8 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-indigo-400 dark:hover:bg-slate-800"
                          title="View Activity History"
                        >
                          <History className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onEdit(app)}
                          className="h-8 w-8 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-indigo-400 dark:hover:bg-slate-800"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onDelete(app.id)}
                          className="h-8 w-8 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:text-slate-400 dark:hover:text-rose-400 dark:hover:bg-rose-950/40"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-500 dark:text-slate-400 font-medium text-sm">
                  No applications found. Try adjusting your search or filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
