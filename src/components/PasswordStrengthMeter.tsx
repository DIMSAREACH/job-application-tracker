"use client";

import React from "react";
import { calculatePasswordStrength } from "@/lib/password-utils";
import { Check, X, ShieldCheck } from "lucide-react";

interface PasswordStrengthMeterProps {
  password: string;
}

export function PasswordStrengthMeter({ password }: PasswordStrengthMeterProps) {
  if (!password) return null;

  const strength = calculatePasswordStrength(password);

  return (
    <div className="mt-2 space-y-2 rounded-2xl border border-slate-200/80 bg-slate-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-900/60">
      {/* Strength Bar Header */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs font-semibold">
          <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
            <ShieldCheck className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>Password Strength:</span>
          </div>
          <span className={`font-bold ${strength.color.split(" ")[1]}`}>
            {strength.label}
          </span>
        </div>

        {/* Progress Bar Container */}
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
          <div
            className={`h-full transition-all duration-300 ${strength.color.split(" ")[0]}`}
            style={{ width: `${strength.progress}%` }}
          />
        </div>
      </div>

      {/* Rules Checklist */}
      <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[11px] font-medium text-slate-600 dark:text-slate-400 pt-1">
        <div className="flex items-center gap-1">
          {strength.checks.hasMinLength ? (
            <Check className="h-3 w-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
          ) : (
            <X className="h-3 w-3 text-slate-400 shrink-0" />
          )}
          <span className={strength.checks.hasMinLength ? "text-slate-900 dark:text-slate-200 font-semibold" : ""}>
            At least 8 characters
          </span>
        </div>

        <div className="flex items-center gap-1">
          {strength.checks.hasUppercase ? (
            <Check className="h-3 w-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
          ) : (
            <X className="h-3 w-3 text-slate-400 shrink-0" />
          )}
          <span className={strength.checks.hasUppercase ? "text-slate-900 dark:text-slate-200 font-semibold" : ""}>
            Uppercase letter (A-Z)
          </span>
        </div>

        <div className="flex items-center gap-1">
          {strength.checks.hasLowercase ? (
            <Check className="h-3 w-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
          ) : (
            <X className="h-3 w-3 text-slate-400 shrink-0" />
          )}
          <span className={strength.checks.hasLowercase ? "text-slate-900 dark:text-slate-200 font-semibold" : ""}>
            Lowercase letter (a-z)
          </span>
        </div>

        <div className="flex items-center gap-1">
          {strength.checks.hasNumber ? (
            <Check className="h-3 w-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
          ) : (
            <X className="h-3 w-3 text-slate-400 shrink-0" />
          )}
          <span className={strength.checks.hasNumber ? "text-slate-900 dark:text-slate-200 font-semibold" : ""}>
            Number (0-9)
          </span>
        </div>

        <div className="flex items-center gap-1 col-span-2">
          {strength.checks.hasSpecial ? (
            <Check className="h-3 w-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
          ) : (
            <X className="h-3 w-3 text-slate-400 shrink-0" />
          )}
          <span className={strength.checks.hasSpecial ? "text-slate-900 dark:text-slate-200 font-semibold" : ""}>
            Special character (!@#$%^&*)
          </span>
        </div>
      </div>
    </div>
  );
}
