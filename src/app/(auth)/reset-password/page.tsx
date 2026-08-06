"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { resetPasswordWithTokenAction } from "@/actions/auth-actions";
import { Briefcase, Lock, Loader2, CheckCircle2, Eye, EyeOff, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordStrengthMeter } from "@/components/PasswordStrengthMeter";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    if (!token) {
      setLoading(false);
      setErrorMsg("Invalid reset link. Token is missing.");
      return;
    }

    if (password !== confirmPassword) {
      setLoading(false);
      setErrorMsg("Passwords do not match. Please verify and try again.");
      return;
    }

    const res = await resetPasswordWithTokenAction(token, password);
    setLoading(false);

    if (res.success) {
      setSubmitted(true);
    } else {
      setErrorMsg(res.error || "Failed to reset password");
    }
  };

  return (
    <div className="w-full max-w-md space-y-7 rounded-3xl border border-slate-200 bg-white p-7 sm:p-9 shadow-2xl dark:border-slate-800 dark:bg-slate-900/90 backdrop-blur-2xl">
      {/* Brand Header */}
      <div className="text-center space-y-2">
        <img src="/logo.png" alt="Job Tracker Logo" className="mx-auto h-24 w-24 object-contain drop-shadow-lg" />

        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          Reset Password
        </h2>
        <p className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300">
          Create a new secure password for your account
        </p>
      </div>

      {submitted ? (
        <div className="space-y-5 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 border border-emerald-200 dark:bg-emerald-950/50 dark:border-emerald-500/40 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Password Reset Complete!
            </h3>
            <p className="text-xs font-medium text-slate-600 dark:text-slate-300">
              Your password has been successfully updated. You can now sign in with your new credentials.
            </p>
          </div>

          <div className="pt-2">
            <Button
              onClick={() => router.push("/login")}
              className="w-full gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 font-semibold text-white shadow-md shadow-indigo-500/20 hover:from-indigo-500 hover:to-purple-500"
            >
              Sign In Now
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {errorMsg && (
            <div className="rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs font-semibold text-rose-700 dark:bg-rose-500/10 dark:border-rose-500/20 dark:text-rose-400">
              {errorMsg}
            </div>
          )}

          {/* New Password */}
          <div>
            <label className="text-xs font-semibold text-slate-800 dark:text-slate-200">
              New Password
            </label>
            <div className="relative mt-1.5">
              <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-400" />
              <Input
                type={showPassword ? "text" : "password"}
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="h-11 pl-10 pr-10 rounded-xl bg-slate-50/50 border-slate-200 text-slate-900 font-medium placeholder:text-slate-400 focus:bg-white dark:bg-slate-950 dark:border-slate-800 dark:text-white dark:placeholder:text-slate-400 focus-visible:ring-indigo-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors"
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>

            {/* Password Strength Meter */}
            <PasswordStrengthMeter password={password} />
          </div>

          {/* Confirm Password */}
          <div>
            <label className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center justify-between">
              <span>Confirm New Password</span>
              {confirmPassword && password === confirmPassword && (
                <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="h-3 w-3" />
                  <span>Passwords Match</span>
                </span>
              )}
            </label>
            <div className="relative mt-1.5">
              <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-400" />
              <Input
                type={showConfirmPassword ? "text" : "password"}
                required
                minLength={6}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter your new password"
                className={`h-11 pl-10 pr-10 rounded-xl bg-slate-50/50 border-slate-200 text-slate-900 font-medium placeholder:text-slate-400 focus:bg-white dark:bg-slate-950 dark:border-slate-800 dark:text-white dark:placeholder:text-slate-400 focus-visible:ring-indigo-500 ${
                  confirmPassword && password !== confirmPassword
                    ? "border-rose-400 focus-visible:ring-rose-500"
                    : ""
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors"
                title={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="h-11 w-full gap-2 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 hover:from-indigo-500 hover:to-purple-500 transition-all mt-2"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />}
            Save New Password
          </Button>
        </form>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 px-4 py-12 text-slate-900 dark:text-slate-100 selection:bg-indigo-500 selection:text-white transition-colors duration-300">
      <Suspense fallback={<div className="flex h-32 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-indigo-600" /></div>}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
