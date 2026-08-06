"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Application } from "@prisma/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateApplicationAction } from "@/actions/application-actions";
import { CustomStageSelect, ApplicationStage } from "@/components/CustomStageSelect";
import { TagSelectDropdown } from "@/components/TagSelectDropdown";
import { Mic, Loader2, Check, Tag } from "lucide-react";

const FormSchema = z.object({
  company: z.string().min(1, "Company name is required"),
  position: z.string().min(1, "Position title is required"),
  location: z.string().optional(),
  salary: z.string().optional(),
  jobUrl: z.string().url("Invalid URL format").optional().or(z.literal("")),
  status: z.enum(["APPLIED", "INTERVIEWING", "OFFER", "REJECTED"]),
  interviewed: z.boolean(),
  notes: z.string().optional(),
  tags: z.string().optional(),
  dateApplied: z.string(),
});

type FormValues = z.infer<typeof FormSchema>;

interface EditApplicationModalProps {
  application: Application | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function EditApplicationModal({
  application,
  open,
  onOpenChange,
  onSuccess,
}: EditApplicationModalProps) {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
  });

  const interviewedValue = watch("interviewed");
  const statusValue = watch("status");

  useEffect(() => {
    if (application) {
      const formattedDate = new Date(application.dateApplied)
        .toISOString()
        .split("T")[0];
      reset({
        company: application.company,
        position: application.position,
        location: application.location || "",
        salary: application.salary || "",
        jobUrl: application.jobUrl || "",
        status: application.status as any,
        interviewed: application.interviewed,
        notes: application.notes || "",
        tags: application.tags || "",
        dateApplied: formattedDate,
      });
    }
  }, [application, reset]);

  if (!application) return null;

  const onSubmit = async (values: FormValues) => {
    setLoading(true);
    setErrorMsg("");

    const res = await updateApplicationAction(application.id, {
      ...values,
      dateApplied: new Date(values.dateApplied),
    });

    setLoading(false);

    if (res.success) {
      onOpenChange(false);
      onSuccess();
    } else {
      setErrorMsg(res.error || "Failed to update application");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] sm:max-w-[680px] max-h-[90vh] overflow-y-auto rounded-3xl border-slate-200 bg-white text-slate-900 shadow-2xl dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 p-6 sm:p-8">
        <DialogHeader className="pb-2">
          <DialogTitle className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Edit Application — <span className="text-indigo-600 dark:text-indigo-400">{application.company}</span>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {errorMsg && (
            <div className="rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs font-semibold text-rose-700 dark:bg-rose-500/10 dark:border-rose-500/20 dark:text-rose-400">
              {errorMsg}
            </div>
          )}

          {/* Company & Position */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Company Name <span className="text-rose-500">*</span>
              </label>
              <Input
                {...register("company")}
                className="mt-1.5 rounded-xl border-slate-200 bg-slate-50/50 text-sm font-medium text-slate-900 focus:bg-white dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 focus-visible:ring-indigo-500"
              />
              {errors.company && (
                <p className="mt-1 text-[11px] font-semibold text-rose-500">{errors.company.message}</p>
              )}
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Position Title <span className="text-rose-500">*</span>
              </label>
              <Input
                {...register("position")}
                className="mt-1.5 rounded-xl border-slate-200 bg-slate-50/50 text-sm font-medium text-slate-900 focus:bg-white dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 focus-visible:ring-indigo-500"
              />
              {errors.position && (
                <p className="mt-1 text-[11px] font-semibold text-rose-500">{errors.position.message}</p>
              )}
            </div>
          </div>

          {/* Location & Salary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Location</label>
              <Input
                {...register("location")}
                className="mt-1.5 rounded-xl border-slate-200 bg-slate-50/50 text-sm font-medium text-slate-900 focus:bg-white dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 focus-visible:ring-indigo-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Salary</label>
              <Input
                {...register("salary")}
                className="mt-1.5 rounded-xl border-slate-200 bg-slate-50/50 text-sm font-medium text-slate-900 focus:bg-white dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 focus-visible:ring-indigo-500"
              />
            </div>
          </div>

          {/* Job URL & Tags */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Job URL</label>
              <Input
                {...register("jobUrl")}
                className="mt-1.5 rounded-xl border-slate-200 bg-slate-50/50 text-sm font-medium text-slate-900 focus:bg-white dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 focus-visible:ring-indigo-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <Tag className="h-3 w-3 text-indigo-500" />
                <span>Tags / Labels</span>
              </label>
              <div className="mt-1.5">
                <TagSelectDropdown
                  value={watch("tags") || ""}
                  onChange={(val) => setValue("tags", val)}
                  placeholder="Remote, Referral, Full-time..."
                />
              </div>
            </div>
          </div>

          {/* Date Applied & Stage */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Date Applied</label>
              <Input
                type="date"
                {...register("dateApplied")}
                className="mt-1.5 rounded-xl border-slate-200 bg-slate-50/50 text-sm font-medium text-slate-900 focus:bg-white dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 focus-visible:ring-indigo-500 cursor-pointer"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Application Stage
              </label>
              <div className="mt-1.5">
                <CustomStageSelect
                  value={statusValue}
                  onChange={(val: ApplicationStage) => setValue("status", val)}
                />
              </div>
            </div>
          </div>

          {/* Interviewed Toggle */}
          <div>
            <button
              type="button"
              onClick={() => setValue("interviewed", !interviewedValue)}
              className={`flex h-10 w-full items-center justify-between rounded-xl border px-3.5 text-xs font-semibold transition-all ${
                interviewedValue
                  ? "bg-purple-50 text-purple-900 border-purple-200 dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-500/30 shadow-sm"
                  : "bg-slate-50/50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-900 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-800 dark:hover:text-slate-100"
              }`}
            >
              <div className="flex items-center gap-2">
                <Mic className={`h-4 w-4 ${interviewedValue ? "text-purple-600 dark:text-purple-400" : "text-slate-400"}`} />
                <span>{interviewedValue ? "Interview Completed" : "Mark as Interviewed"}</span>
              </div>
              {interviewedValue && <Check className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />}
            </button>
          </div>

          {/* Notes */}
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Notes / Details</label>
            <textarea
              {...register("notes")}
              rows={3}
              className="mt-1.5 w-full rounded-2xl border border-slate-200 bg-slate-50/50 p-3 text-xs font-medium text-slate-900 focus:bg-white dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            />
          </div>

          <DialogFooter className="pt-4 border-t border-slate-100 dark:border-slate-800/80 gap-2 sm:gap-0">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="rounded-xl text-slate-600 font-semibold hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-900"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 font-semibold text-white shadow-md shadow-indigo-500/20 hover:from-indigo-500 hover:to-purple-500 px-6"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update Application
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
