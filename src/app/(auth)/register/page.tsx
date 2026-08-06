"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { registerUserAction } from "@/actions/auth-actions";
import { signIn } from "next-auth/react";
import { Briefcase, Lock, Mail, User, Loader2, UserPlus, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordStrengthMeter } from "@/components/PasswordStrengthMeter";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleGeneratePassword = (genPassword: string) => {
    setPassword(genPassword);
    setConfirmPassword(genPassword);
    setShowPassword(true);
    setShowConfirmPassword(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    if (password !== confirmPassword) {
      setLoading(false);
      setErrorMsg("Passwords do not match. Please check and try again.");
      return;
    }

    const res = await registerUserAction({ name, email, password });

    if (!res.success) {
      setLoading(false);
      setErrorMsg(res.error || "Failed to register account");
      return;
    }

    // Auto sign in after registration
    const signInRes = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (signInRes?.error) {
      router.push("/login");
    } else {
      router.push("/");
      router.refresh();
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 px-4 py-12 text-slate-900 dark:text-slate-100 selection:bg-indigo-500 selection:text-white transition-colors duration-300">
      <div className="w-full max-w-md space-y-7 rounded-3xl border border-slate-200 bg-white p-7 sm:p-9 shadow-2xl dark:border-slate-800 dark:bg-slate-900/90 backdrop-blur-2xl">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/30">
            <Briefcase className="h-7 w-7 text-white" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Create an account
          </h2>
          <p className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300">
            Start tracking your job application progress
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMsg && (
            <div className="rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs font-semibold text-rose-700 dark:bg-rose-500/10 dark:border-rose-500/20 dark:text-rose-400">
              {errorMsg}
            </div>
          )}

          {/* Full Name */}
          <div>
            <label className="text-xs font-semibold text-slate-800 dark:text-slate-200">
              Full Name
            </label>
            <div className="relative mt-1.5">
              <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-400" />
              <Input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jane Doe"
                className="h-11 pl-10 rounded-xl bg-slate-50/50 border-slate-200 text-slate-900 font-medium placeholder:text-slate-400 focus:bg-white dark:bg-slate-950 dark:border-slate-800 dark:text-white dark:placeholder:text-slate-400 focus-visible:ring-indigo-500"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="text-xs font-semibold text-slate-800 dark:text-slate-200">
              Email Address
            </label>
            <div className="relative mt-1.5">
              <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-400" />
              <Input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="h-11 pl-10 rounded-xl bg-slate-50/50 border-slate-200 text-slate-900 font-medium placeholder:text-slate-400 focus:bg-white dark:bg-slate-950 dark:border-slate-800 dark:text-white dark:placeholder:text-slate-400 focus-visible:ring-indigo-500"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="text-xs font-semibold text-slate-800 dark:text-slate-200">
              Password
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
            <PasswordStrengthMeter
              password={password}
              onGeneratePassword={handleGeneratePassword}
            />
          </div>

          {/* Confirm Password */}
          <div>
            <label className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center justify-between">
              <span>Confirm Password</span>
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
                placeholder="Re-enter your password"
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
            {confirmPassword && password !== confirmPassword && (
              <p className="mt-1 text-[11px] font-semibold text-rose-500">
                Passwords do not match
              </p>
            )}
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="h-11 w-full gap-2 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 hover:from-indigo-500 hover:to-purple-500 transition-all mt-2"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
            Create Account
          </Button>
        </form>

        <div className="text-center text-xs font-medium text-slate-600 dark:text-slate-300 pt-1">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
