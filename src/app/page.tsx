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
import { KanbanBoard } from "@/components/KanbanBoard";
import { DataTable } from "@/components/DataTable";
import { AddApplicationModal } from "@/components/AddApplicationModal";
import { EditApplicationModal } from "@/components/EditApplicationModal";
import { DeleteConfirmModal } from "@/components/DeleteConfirmModal";
import { CsvImportModal } from "@/components/CsvImportModal";
import { ApplicationHistoryModal } from "@/components/ApplicationHistoryModal";
import { Loader2, Plus, Sparkles, Download, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { exportApplicationsToCSV } from "@/lib/csv-utils";

type ApplicationWithActivities = Application & { activities?: ApplicationActivity[] };

export default function DashboardPage() {
  const { data: session } = useSession();
  const [applications, setApplications] = useState<ApplicationWithActivities[]>([]);
  const [userProfile, setUserProfile] = useState<{ name?: string | null; email?: string | null; image?: string | null } | null>(null);
  const [loading, setLoading] = useState(true);
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

  const fetchApplications = async (showLoading = false) => {
    if (showLoading) setLoading(true);
    const res = await getApplicationsAction();
    if (res.success && res.data) {
      setApplications(res.data as ApplicationWithActivities[]);
    }
    if (showLoading) setLoading(false);
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

    // Auto-refresh when tab becomes active / focused
    const handleFocus = () => fetchApplications(false);
    window.addEventListener("focus", handleFocus);

    // Periodic silent background auto-refresh every 30s
    const interval = setInterval(() => fetchApplications(false), 30000);

    return () => {
      window.removeEventListener("focus", handleFocus);
      clearInterval(interval);
    };
  }, []);

  // Handlers with smooth optimistic updates and silent revalidation
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
        {/* Top Header Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-3xl border border-indigo-200/80 bg-gradient-to-r from-indigo-100/70 via-purple-50/60 to-slate-100 p-6 sm:p-8 shadow-sm dark:border-indigo-500/20 dark:from-indigo-950/40 dark:via-purple-950/20 dark:to-slate-900/60 dark:shadow-lg backdrop-blur-xl">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-indigo-700 dark:text-indigo-400 uppercase tracking-widest">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Job Search Command Center</span>
            </div>
            <h2 className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              {currentUserName ? `Welcome back, ${currentUserName}` : "Track your application pipeline"}
            </h2>
            <p className="mt-1 text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300">
              Log submissions, monitor interview progress, export/import CSVs, and inspect activity history logs.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start sm:self-center">
            <Button
              variant="outline"
              onClick={() => setImportModalOpen(true)}
              className="gap-1.5 rounded-xl border-slate-300 bg-white/80 dark:bg-slate-900/80 dark:border-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200"
            >
              <Upload className="h-4 w-4" />
              <span>Import CSV</span>
            </Button>

            <Button
              variant="outline"
              onClick={() => exportApplicationsToCSV(optimisticApps)}
              className="gap-1.5 rounded-xl border-slate-300 bg-white/80 dark:bg-slate-900/80 dark:border-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200"
            >
              <Download className="h-4 w-4" />
              <span>Export CSV</span>
            </Button>

            <Button
              onClick={() => setAddModalOpen(true)}
              size="lg"
              className="gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold shadow-md shadow-indigo-500/20 hover:from-indigo-500 hover:to-purple-500 rounded-xl"
            >
              <Plus className="h-5 w-5" />
              Add Application
            </Button>
          </div>
        </div>

        {/* Dashboard Summary Cards */}
        <DashboardSummary applications={optimisticApps} />

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
        onSuccess={() => fetchApplications(false)}
      />

      <CsvImportModal
        open={importModalOpen}
        onOpenChange={setImportModalOpen}
        onSuccess={() => fetchApplications(false)}
      />

      <EditApplicationModal
        application={editingApp}
        open={Boolean(editingApp)}
        onOpenChange={(open) => !open && setEditingApp(null)}
        onSuccess={() => fetchApplications(false)}
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
        onSuccess={() => fetchApplications(false)}
      />
    </div>

  );
}
