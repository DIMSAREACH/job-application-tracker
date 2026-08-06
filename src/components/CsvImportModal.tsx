"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { parseCSVToApplications } from "@/lib/csv-utils";
import { bulkCreateApplicationsAction } from "@/actions/application-actions";
import { Upload, FileSpreadsheet, Loader2, CheckCircle2 } from "lucide-react";

interface CsvImportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function CsvImportModal({
  open,
  onOpenChange,
  onSuccess,
}: CsvImportModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successCount, setSuccessCount] = useState<number | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg("");
    setSuccessCount(null);
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        const parsed = parseCSVToApplications(text);
        if (parsed.length === 0) {
          setErrorMsg("Could not parse applications from CSV file. Please ensure it has Company and Position columns.");
        } else {
          setParsedData(parsed);
        }
      };
      reader.readAsText(selectedFile);
    }
  };

  const handleImport = async () => {
    if (parsedData.length === 0) return;
    setLoading(true);
    setErrorMsg("");

    const res = await bulkCreateApplicationsAction(parsedData);
    setLoading(false);

    if (res.success && res.count) {
      setSuccessCount(res.count);
      setTimeout(() => {
        setFile(null);
        setParsedData([]);
        setSuccessCount(null);
        onOpenChange(false);
        onSuccess();
      }, 1200);
    } else {
      setErrorMsg(res.error || "Failed to bulk import applications");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] sm:max-w-[560px] rounded-3xl border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100">
        <DialogHeader className="pb-2">
          <DialogTitle className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            Bulk Import Applications via CSV
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {errorMsg && (
            <div className="rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs font-semibold text-rose-700 dark:bg-rose-500/10 dark:border-rose-500/20 dark:text-rose-400">
              {errorMsg}
            </div>
          )}

          {successCount !== null ? (
            <div className="flex flex-col items-center justify-center py-6 text-center space-y-2">
              <CheckCircle2 className="h-12 w-12 text-emerald-500 animate-bounce" />
              <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Successfully Imported {successCount} Applications!
              </h4>
            </div>
          ) : (
            <>
              <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
                Upload a CSV file containing your job search records. Expected headers: <code className="font-semibold text-indigo-600 dark:text-indigo-400">Company, Position, Stage, Interviewed, Location, Salary, Job URL, Date Applied, Notes</code>
              </p>

              {/* Upload Drop Area */}
              <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-slate-300 dark:border-slate-800 rounded-2xl cursor-pointer bg-slate-50/50 dark:bg-slate-900/50 hover:border-indigo-500/80 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-8 h-8 mb-2 text-indigo-600 dark:text-indigo-400" />
                  <p className="mb-1 text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {file ? file.name : "Click to select or drag CSV file"}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {parsedData.length > 0 ? `${parsedData.length} records ready` : "CSV up to 10MB"}
                  </p>
                </div>
                <input
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>

              {/* Preview List if parsed */}
              {parsedData.length > 0 && (
                <div className="max-h-36 overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-800 p-2.5 space-y-1.5 text-xs bg-white dark:bg-slate-900">
                  <div className="font-bold text-slate-800 dark:text-slate-200 mb-1">Previewing First 3 Entries:</div>
                  {parsedData.slice(0, 3).map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center text-[11px] border-b border-slate-100 dark:border-slate-800 pb-1">
                      <span className="font-semibold text-slate-900 dark:text-slate-100">{item.company} — {item.position}</span>
                      <span className="text-slate-500">{item.status}</span>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          <DialogFooter className="pt-3 border-t border-slate-100 dark:border-slate-800/80 gap-2 sm:gap-0">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="rounded-xl text-slate-600 font-semibold hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-900"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleImport}
              disabled={loading || parsedData.length === 0}
              className="rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 font-semibold text-white shadow-md shadow-indigo-500/20 hover:from-indigo-500 hover:to-purple-500 px-5"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Import {parsedData.length > 0 ? `${parsedData.length} Applications` : ""}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
