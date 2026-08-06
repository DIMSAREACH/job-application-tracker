"use client";

import React from "react";
import { Application, ApplicationActivity } from "@prisma/client";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import {
  Building2,
  Calendar,
  ExternalLink,
  MapPin,
  Mic,
  Pencil,
  Trash2,
  DollarSign,
  Bell,
  History,
  Tag as TagIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { isFollowUpNeeded, getFollowUpDays } from "@/lib/reminder-utils";

type ApplicationWithActivities = Application & { activities?: ApplicationActivity[] };

interface KanbanBoardProps {
  applications: ApplicationWithActivities[];
  onStatusChange: (id: string, newStatus: "APPLIED" | "INTERVIEWING" | "OFFER" | "REJECTED") => void;
  onToggleInterviewed: (id: string) => void;
  onEdit: (app: Application) => void;
  onDelete: (id: string) => void;
  onViewHistory: (app: ApplicationWithActivities) => void;
}

const COLUMNS: {
  id: "APPLIED" | "INTERVIEWING" | "OFFER" | "REJECTED";
  label: string;
  badgeStyle: string;
  columnBg: string;
}[] = [
  {
    id: "APPLIED",
    label: "Applied",
    badgeStyle: "bg-indigo-100/80 text-indigo-900 border-indigo-200 font-semibold dark:bg-indigo-950/60 dark:text-indigo-200 dark:border-indigo-500/30 rounded-full",
    columnBg: "bg-indigo-50/50 border-indigo-150 dark:bg-indigo-950/20 dark:border-indigo-900/30",
  },
  {
    id: "INTERVIEWING",
    label: "Interviewing",
    badgeStyle: "bg-amber-100/80 text-amber-900 border-amber-200 font-semibold dark:bg-amber-950/60 dark:text-amber-200 dark:border-amber-500/30 rounded-full",
    columnBg: "bg-amber-50/50 border-amber-150 dark:bg-amber-950/20 dark:border-amber-900/30",
  },
  {
    id: "OFFER",
    label: "Offer",
    badgeStyle: "bg-emerald-100/80 text-emerald-900 border-emerald-200 font-semibold dark:bg-emerald-950/60 dark:text-emerald-200 dark:border-emerald-500/30 rounded-full",
    columnBg: "bg-emerald-50/50 border-emerald-150 dark:bg-emerald-950/20 dark:border-emerald-900/30",
  },
  {
    id: "REJECTED",
    label: "Rejected",
    badgeStyle: "bg-rose-100/80 text-rose-900 border-rose-200 font-semibold dark:bg-rose-950/60 dark:text-rose-200 dark:border-rose-500/30 rounded-full",
    columnBg: "bg-rose-50/50 border-rose-150 dark:bg-rose-950/20 dark:border-rose-900/30",
  },
];

export function KanbanBoard({
  applications,
  onStatusChange,
  onToggleInterviewed,
  onEdit,
  onDelete,
  onViewHistory,
}: KanbanBoardProps) {
  const handleDragEnd = (result: DropResult) => {
    const { destination, draggableId } = result;
    if (!destination) return;

    const newStatus = destination.droppableId as
      | "APPLIED"
      | "INTERVIEWING"
      | "OFFER"
      | "REJECTED";
    onStatusChange(draggableId, newStatus);
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {COLUMNS.map((col) => {
          const colApps = applications.filter((app) => app.status === col.id);

          return (
            <div
              key={col.id}
              className={`flex flex-col rounded-2xl border p-3.5 min-h-[350px] sm:min-h-[500px] shadow-sm transition-colors ${col.columnBg}`}
            >
              {/* Header */}
              <div className="mb-3 flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm sm:text-base">{col.label}</h3>
                  <Badge variant="outline" className={col.badgeStyle}>
                    {colApps.length}
                  </Badge>
                </div>
              </div>

              {/* Droppable Container */}
              <Droppable droppableId={col.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`flex-1 space-y-3 rounded-xl transition-colors ${
                      snapshot.isDraggingOver ? "bg-indigo-100/50 dark:bg-slate-900/50 ring-2 ring-indigo-500/30" : ""
                    }`}
                  >
                    {colApps.map((app, index) => {
                      const needsFollowUp = isFollowUpNeeded(app);
                      const followUpDays = getFollowUpDays(app);
                      const tagList = app.tags ? app.tags.split(",").map((t) => t.trim()).filter(Boolean) : [];

                      return (
                        <Draggable key={app.id} draggableId={app.id} index={index}>
                          {(dragProvided, dragSnapshot) => (
                            <div
                              ref={dragProvided.innerRef}
                              {...dragProvided.draggableProps}
                              {...dragProvided.dragHandleProps}
                              className={`group relative rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:border-indigo-400/80 hover:shadow-md dark:border-slate-800 dark:bg-slate-900/90 dark:hover:border-indigo-500/80 ${
                                dragSnapshot.isDragging
                                  ? "scale-[1.02] shadow-xl ring-2 ring-indigo-500/50 z-50 opacity-95"
                                  : ""
                              }`}
                            >
                              {/* 14-Day Follow Up Alert Banner */}
                              {needsFollowUp && (
                                <div className="mb-2.5 flex items-center gap-1.5 rounded-xl bg-amber-50 border border-amber-200 px-2.5 py-1 text-[11px] font-semibold text-amber-900 dark:bg-amber-950/50 dark:border-amber-500/40 dark:text-amber-300">
                                  <Bell className="h-3 w-3 text-amber-600 dark:text-amber-400 animate-bounce shrink-0" />
                                  <span>Follow-Up Alert: {followUpDays} days ago</span>
                                </div>
                              )}

                              {/* Card Header: Position & Company */}
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <h4 className="font-semibold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors leading-snug text-sm sm:text-base">
                                    {app.position}
                                  </h4>
                                  <div className="mt-1 flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-400">
                                    <Building2 className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
                                    <span>{app.company}</span>
                                  </div>
                                </div>

                                {/* Action Menu */}
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onViewHistory(app);
                                    }}
                                    className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-indigo-600 dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-indigo-400 transition-colors"
                                    title="View Activity History"
                                  >
                                    <History className="h-3.5 w-3.5" />
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onEdit(app);
                                    }}
                                    className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-indigo-600 dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-indigo-400 transition-colors"
                                    title="Edit application"
                                  >
                                    <Pencil className="h-3.5 w-3.5" />
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onDelete(app.id);
                                    }}
                                    className="rounded-lg p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:text-slate-500 dark:hover:bg-rose-950/40 dark:hover:text-rose-400 transition-colors"
                                    title="Delete application"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              </div>

                              {/* Tag Labels */}
                              {tagList.length > 0 && (
                                <div className="mt-2 flex flex-wrap gap-1">
                                  {tagList.map((tag) => (
                                    <span
                                      key={tag}
                                      className="inline-flex items-center gap-1 rounded-md bg-indigo-50/80 border border-indigo-200/60 px-2 py-0.5 text-[10px] font-semibold text-indigo-900 dark:bg-indigo-950/40 dark:border-indigo-500/30 dark:text-indigo-300"
                                    >
                                      <TagIcon className="h-2.5 w-2.5 text-indigo-500" />
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                              )}

                              {/* Details (Location, Salary, Link) */}
                              <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs font-medium text-slate-600 dark:text-slate-400">
                                {app.location && (
                                  <div className="flex items-center gap-1">
                                    <MapPin className="h-3 w-3 text-slate-400 dark:text-slate-500 shrink-0" />
                                    <span>{app.location}</span>
                                  </div>
                                )}
                                {app.salary && (
                                  <div className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-semibold">
                                    <DollarSign className="h-3 w-3 shrink-0" />
                                    <span>{app.salary}</span>
                                  </div>
                                )}
                                {app.jobUrl && (
                                  <a
                                    href={app.jobUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={(e) => e.stopPropagation()}
                                    className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
                                  >
                                    <ExternalLink className="h-3 w-3 shrink-0" />
                                    <span>Posting</span>
                                  </a>
                                )}
                              </div>

                              {/* Footer: Date & Interview Stamp Toggle */}
                              <div className="mt-3 flex items-center justify-between border-t border-slate-100 dark:border-slate-800/80 pt-2.5 text-xs">
                                <div className="flex items-center gap-1 font-medium text-slate-500 dark:text-slate-400 text-[11px] sm:text-xs">
                                  <Calendar className="h-3 w-3 text-slate-400 shrink-0" />
                                  <span>
                                    {new Date(app.dateApplied).toLocaleDateString("en-US", {
                                      month: "short",
                                      day: "numeric",
                                    })}
                                  </span>
                                </div>

                                {/* Interviewed Stamp Toggle */}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onToggleInterviewed(app.id);
                                  }}
                                  className={`flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] sm:text-[11px] font-semibold border transition-all ${
                                    app.interviewed
                                      ? "bg-purple-100/80 text-purple-900 border-purple-200 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-500/30 shadow-sm"
                                      : "bg-slate-100/70 text-slate-500 border-slate-200 dark:bg-slate-800/50 dark:text-slate-400 dark:border-slate-700 hover:text-slate-800 dark:hover:text-slate-200"
                                  }`}
                                  title={
                                    app.interviewed
                                      ? "Interview recorded! Click to unmark"
                                      : "Mark first interview completed"
                                  }
                                >
                                  <Mic className="h-3 w-3 shrink-0" />
                                  <span>{app.interviewed ? "Interviewed" : "No interview"}</span>
                                </button>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      );
                    })}
                    {provided.placeholder}
                    {colApps.length === 0 && (
                      <div className="flex h-24 sm:h-32 items-center justify-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800/80 text-xs font-medium text-slate-400 dark:text-slate-500">
                        Drop applications here
                      </div>
                    )}
                  </div>
                )}
              </Droppable>
            </div>
          );
        })}
      </div>
    </DragDropContext>
  );
}
