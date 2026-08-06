"use client";

import React from "react";
import { Application, ApplicationActivity } from "@prisma/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { History, Calendar, Clock, ArrowRight, Mic, Edit, PlusCircle } from "lucide-react";

interface ApplicationHistoryModalProps {
  application: (Application & { activities?: ApplicationActivity[] }) | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ApplicationHistoryModal({
  application,
  open,
  onOpenChange,
}: ApplicationHistoryModalProps) {
  if (!application) return null;

  const activities = application.activities || [];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "INITIAL_LOG":
        return <PlusCircle className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />;
      case "STATUS_CHANGE":
        return <ArrowRight className="h-4 w-4 text-amber-600 dark:text-amber-400" />;
      case "INTERVIEW_TOGGLED":
        return <Mic className="h-4 w-4 text-purple-600 dark:text-purple-400" />;
      case "UPDATE":
        return <Edit className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />;
      default:
        return <Clock className="h-4 w-4 text-slate-500" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] sm:max-w-[560px] max-h-[85vh] overflow-y-auto rounded-3xl border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100">
        <DialogHeader className="pb-2">
          <DialogTitle className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <History className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            Activity Timeline — <span className="text-indigo-600 dark:text-indigo-400">{application.company}</span>
          </DialogTitle>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
            {application.position} • Applied on {new Date(application.dateApplied).toLocaleDateString()}
          </p>
        </DialogHeader>

        {/* Timeline Log List */}
        <div className="py-3 space-y-4">
          {activities.length > 0 ? (
            <div className="relative pl-6 border-l-2 border-slate-200 dark:border-slate-800 space-y-6">
              {activities.map((act) => (
                <div key={act.id} className="relative group">
                  {/* Bullet Node */}
                  <div className="absolute -left-[31px] top-0 flex h-6 w-6 items-center justify-center rounded-full border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-sm">
                    {getActivityIcon(act.type)}
                  </div>

                  <div className="flex flex-col space-y-0.5">
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                      {act.description}
                    </span>
                    <div className="flex items-center gap-1 text-[11px] font-medium text-slate-500 dark:text-slate-400">
                      <Calendar className="h-3 w-3" />
                      <span>
                        {new Date(act.createdAt).toLocaleString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-xs font-medium text-slate-500 dark:text-slate-400">
              No activity logs recorded yet.
            </div>
          )}
        </div>

        <DialogFooter className="pt-3 border-t border-slate-100 dark:border-slate-800/80">
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="rounded-xl text-slate-600 font-semibold hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-900"
          >
            Close History
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
