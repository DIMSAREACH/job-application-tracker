"use client";

import React, { useState, useEffect, useOptimistic, useTransition } from "react";
import { Application, ApplicationActivity } from "@prisma/client";
import { useSession } from "next-auth/react";
import {
  getApplicationsAction,
  updateApplicationStatusAction,
  toggleInterviewedAction,
} from "@/actions/application-actions";
import { getCurrentUserProfileAction } from "@/actions/auth-actions";
import { Navbar } from "@/components/Navbar";
import { DashboardSummary } from "@/components/DashboardSummary";
import { DashboardAnalytics } from "@/components/DashboardAnalytics";
import { KanbanBoard } from "@/components/KanbanBoard";
import { DataTable } from "@/components/DataTable";
import { AddApplicationModal } from "@/components/AddApplicationModal";
import { EditApplicationModal } from "@/components/EditApplicationModal";
import { DeleteConfirmModal } from "@/components/DeleteConfirmModal";
import { CsvImportModal } from "@/components/CsvImportModal";
import { ApplicationHistoryModal } from "@/components/ApplicationHistoryModal";
import { Loader2, Plus, Sparkles, Download, Upload, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { exportApplicationsToCSV } from "@/lib/csv-utils";

type ApplicationWithActivities = Application & { activities?: ApplicationActivity[] };

export default function DashboardPage() {
  const { data: session } = useSession();
  const [applications, setApplications] = useState<ApplicationWithActivities[]>([]);
  const [userProfile, setUserProfile] = useState<{ name?: string | null; email?: string | null; image?: string | null } | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastSynced, setLastSynced] = useState<Date | null>(null);
  const [viewMode, setViewMode] = useState<"kanban" | "table">("kanban");

  // Modal States
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [editingApp, setEditingApp] = useState<Application | null>(null);
  const [historyApp, setHistoryApp] = useState<ApplicationWithActivities | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [, startTransition] = useTransition();

  // Optimistic UI for fluid drag-and-drop & toggles
  const [optimisticApps, setOptimisticApps] = useOptimistic(
    applications,
    (state, action: { type: "STATUS"; id: string; status: any } | { type: "TOGGLE_INTERVIEW"; id: string }) => {
      if (action.type === "STATUS") {
        return state.map((app) => {
          if (app.id === action.id) {
            const isInterviewed = action.status === "INTERVIEWING" ? true : app.interviewed;
            return { ...app, status: action.status, interviewed: isInterviewed };
          }
          return app;
        });
      }
      if (action.type === "TOGGLE_INTERVIEW") {
        return state.map((app) => {
          if (app.id === action.id) {
            const nextInterviewed = !app.interviewed;
            const nextStatus = nextInterviewed && app.status === "APPLIED" ? "INTERVIEWING" : app.status;
            return { ...app, interviewed: nextInterviewed, status: nextStatus };
          }
          return app;
        });
      }
      return state;
    }
  );

  const fetchApplications = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    else setRefreshing(true);

    const res = await getApplicationsAction();
    if (res.success && res.data) {
      setApplications(res.data as ApplicationWithActivities[]);
      setLastSynced(new Date());
    }
    if (showLoading) setLoading(false);
    else setRefreshing(false);
  };

  const fetchUserProfile = async () => {
    const res = await getCurrentUserProfileAction();
    if (res.success && res.data) {
      setUserProfile(res.data);
    }
  };

  useEffect(() => {
    fetchApplications(true);
    fetchUserProfile();

    // Auto-refresh when tab gains focus
    const handleFocus = () => {
      fetchApplications(false);
    };
    window.addEventListener("focus", handleFocus);

    // Auto-refresh silently every 30 seconds
    const interval = setInterval(() => {
      fetchApplications(false);
    }, 30000);

    return () => {
      window.removeEventListener("focus", handleFocus);
      clearInterval(interval);
    };
  }, []);

  // Handlers
  const handleStatusChange = async (
    id: string,
    newStatus: "APPLIED" | "INTERVIEWING" | "OFFER" | "REJECTED"
  ) => {
    startTransition(() => {
      setOptimisticApps({ type: "STATUS", id, status: newStatus });
    });
    const res = await updateApplicationStatusAction(id, newStatus);
    if (res.success) {
      fetchApplications(false);
    }
  };

  const handleToggleInterviewed = async (id: string) => {
    startTransition(() => {
      setOptimisticApps({ type: "TOGGLE_INTERVIEW", id });
    });
    const res = await toggleInterviewedAction(id);
    if (res.success) {
      fetchApplications(false);
    }
  };

  const currentUserName = userProfile?.name || session?.user?.name;
  const currentUserEmail = userProfile?.email || session?.user?.email;
  const currentUserImage = userProfile?.image || session?.user?.image;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 selection:bg-indigo-500 selection:text-white transition-colors duration-300">
      {/* Header Navigation */}
      <Navbar
        onOpenAddModal={() => setAddModalOpen(true)}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        totalApps={optimisticApps.length}
        userName={currentUserName}
        userEmail={currentUserEmail}
        userImage={currentUserImage}
        onProfileUpdated={fetchUserProfile}
      />

      {/* Main Container */}
      <main className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* ── Hero Banner Card ── */}
        <div className="relative overflow-hidden rounded-3xl border border-slate-200/90 bg-gradient-to-r from-white via-indigo-50/30 to-purple-50/40 p-5 sm:p-7 shadow-lg shadow-indigo-500/5 dark:border-slate-800 dark:from-slate-900 dark:via-slate-900/95 dark:to-indigo-950/40 dark:shadow-2xl transition-all" suppressHydrationWarning>
          {/* Glowing background ambient mesh */}
          <div className="pointer-events-none absolute -top-20 -right-20 h-72 w-72 rounded-full bg-gradient-to-br from-indigo-500/15 to-purple-500/10 blur-3xl dark:from-indigo-500/20 dark:to-purple-500/15" />
          <div className="pointer-events-none absolute -bottom-16 -left-16 h-56 w-56 rounded-full bg-gradient-to-tr from-purple-500/15 to-blue-500/10 blur-2xl dark:from-purple-500/20 dark:to-blue-500/15" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">

            {/* Left — Avatar Badge, Greeting & Status */}
            <div className="flex items-start sm:items-center gap-3.5 sm:gap-4 min-w-0">
              {/* Sparkles Icon Badge */}
              <div className="flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 shadow-md shadow-indigo-500/30 ring-4 ring-indigo-100/80 dark:ring-indigo-950/80">
                <Sparkles className="h-5 w-5 text-white" />
              </div>

              <div className="min-w-0 space-y-1">
                {/* Auto-sync active pill */}
                <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 sm:px-3 py-0.5 text-[10px] sm:text-[11px] font-bold text-emerald-600 dark:text-emerald-400 shadow-sm">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                  <span className="tracking-wide">Auto-Sync Active</span>
                </div>

                <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
                  {currentUserName ? (
                    <>
                      Welcome back,{" "}
                      <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent dark:from-indigo-400 dark:to-purple-300">
                        {currentUserName}
                      </span>{" "}
                      👋
                    </>
                  ) : (
                    "Your Application Pipeline"
                  )}
                </h2>

                <p className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300 leading-relaxed">
                  Track submissions, monitor interviews, export data, and manage your career journey.
                </p>
              </div>
            </div>

            {/* Right — Responsive Action Toolbar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full lg:w-auto shrink-0">
              {/* Primary Action Button (Full width on mobile) */}
              <button
                onClick={() => setAddModalOpen(true)}
                className="flex h-11 sm:h-10 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 px-5 text-xs font-extrabold text-white shadow-md shadow-indigo-500/25 hover:from-indigo-500 hover:to-purple-500 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer w-full sm:w-auto order-1 sm:order-2"
              >
                <Plus className="h-4 w-4" />
                <span>Add Application</span>
              </button>

              {/* Secondary Actions Row */}
              <div className="flex items-center gap-2 w-full sm:w-auto order-2 sm:order-1">
                {/* Refresh */}
                <button
                  onClick={() => fetchApplications(false)}
                  disabled={refreshing}
                  title={lastSynced ? `Last synced: ${lastSynced.toLocaleTimeString("en-GB")}` : "Refresh"}
                  suppressHydrationWarning
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm hover:border-indigo-400 hover:text-indigo-600 active:scale-95 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-indigo-500 dark:hover:text-indigo-400 transition-all disabled:opacity-50 cursor-pointer"
                >
                  <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin text-indigo-600" : ""}`} />
                </button>

                {/* Import CSV */}
                <button
                  onClick={() => setImportModalOpen(true)}
                  className="flex-1 sm:flex-initial flex h-10 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-bold text-slate-700 shadow-sm hover:border-indigo-400 hover:text-indigo-600 active:scale-95 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-indigo-500 dark:hover:text-indigo-400 transition-all cursor-pointer"
                >
                  <Upload className="h-4 w-4 text-indigo-500 shrink-0" />
                  <span>Import</span>
                </button>

                {/* Export CSV */}
                <button
                  onClick={() => exportApplicationsToCSV(optimisticApps)}
                  className="flex-1 sm:flex-initial flex h-10 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-bold text-slate-700 shadow-sm hover:border-indigo-400 hover:text-indigo-600 active:scale-95 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-indigo-500 dark:hover:text-indigo-400 transition-all cursor-pointer"
                >
                  <Download className="h-4 w-4 text-purple-500 shrink-0" />
                  <span>Export</span>
                </button>
              </div>
            </div>
          </div>
        </div>


        {/* Dashboard Summary Cards */}
        <DashboardSummary applications={optimisticApps} />

        {/* Dashboard Analytics & Visualizations */}
        <DashboardAnalytics applications={optimisticApps} onSelectApp={setEditingApp} />

        {/* Core View (Kanban / Table) */}
        {loading && optimisticApps.length === 0 ? (
          <div className="flex h-64 items-center justify-center rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/40">
            <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400 font-semibold text-sm">
              <Loader2 className="h-5 w-5 animate-spin text-indigo-600" />
              Loading your application database...
            </div>
          </div>
        ) : optimisticApps.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900/40">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-600 dark:bg-indigo-500/10 dark:border-indigo-500/20 dark:text-indigo-400 mb-4">
              <Plus className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">No applications logged yet</h3>
            <p className="mt-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 max-w-md">
              Start building your job search momentum by adding your first application or importing a CSV file above.
            </p>
            <div className="mt-6 flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => setImportModalOpen(true)}
                className="gap-2 rounded-xl border-slate-300 dark:border-slate-800 font-semibold"
              >
                <Upload className="h-4 w-4" />
                Import CSV
              </Button>
              <Button
                onClick={() => setAddModalOpen(true)}
                className="gap-2 bg-indigo-600 font-semibold text-white hover:bg-indigo-500 rounded-xl"
              >
                <Plus className="h-4 w-4" />
                Add Application
              </Button>
            </div>
          </div>
        ) : viewMode === "kanban" ? (
          <KanbanBoard
            applications={optimisticApps}
            onStatusChange={handleStatusChange}
            onToggleInterviewed={handleToggleInterviewed}
            onEdit={(app) => setEditingApp(app)}
            onDelete={(id) => setDeletingId(id)}
            onViewHistory={(app) => setHistoryApp(app)}
          />
        ) : (
          <DataTable
            applications={optimisticApps}
            onToggleInterviewed={handleToggleInterviewed}
            onEdit={(app) => setEditingApp(app)}
            onDelete={(id) => setDeletingId(id)}
            onOpenImportModal={() => setImportModalOpen(true)}
            onViewHistory={(app) => setHistoryApp(app)}
          />
        )}
      </main>

      {/* Modals */}
      <AddApplicationModal
        open={addModalOpen}
        onOpenChange={setAddModalOpen}
        onSuccess={fetchApplications}
      />

      <CsvImportModal
        open={importModalOpen}
        onOpenChange={setImportModalOpen}
        onSuccess={fetchApplications}
      />

      <EditApplicationModal
        application={editingApp}
        open={Boolean(editingApp)}
        onOpenChange={(open) => !open && setEditingApp(null)}
        onSuccess={fetchApplications}
      />

      <ApplicationHistoryModal
        application={historyApp}
        open={Boolean(historyApp)}
        onOpenChange={(open) => !open && setHistoryApp(null)}
      />

      <DeleteConfirmModal
        id={deletingId}
        open={Boolean(deletingId)}
        onOpenChange={(open) => !open && setDeletingId(null)}
        onSuccess={fetchApplications}
      />
    </div>
  );
}
