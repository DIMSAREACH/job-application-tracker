"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Lock, Mail, Loader2, LogIn, Eye, EyeOff, Briefcase, TrendingUp, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (res?.error) {
      setErrorMsg("Invalid email or password. Please try again.");
    } else {
      router.push("/");
      router.refresh();
    }
  };

  return (
    <div className="flex min-h-screen text-slate-900 dark:text-slate-100 selection:bg-indigo-500 selection:text-white">

      {/* ── Left Panel: Background Image with overlay ── */}
      <div
        className="relative hidden lg:flex lg:w-1/2 xl:w-3/5 flex-col items-center justify-center overflow-hidden"
        style={{
          backgroundImage: "url('/image.png')",

          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Dark gradient overlay — lighter so image shows through */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/50 via-slate-900/40 to-blue-950/55" />


        {/* Floating glassmorphism card */}
        <div className="relative z-10 flex flex-col items-center text-center px-12 max-w-xl">
          <div className="mb-6 h-28 w-28 overflow-hidden rounded-full bg-white/10 shadow-2xl ring-4 ring-white/20 backdrop-blur-sm">
            <img src="/logo.png" alt="Job Tracker" className="h-full w-full object-cover" />
          </div>
          <h1 className="text-4xl xl:text-5xl font-bold text-white tracking-tight leading-tight drop-shadow-lg">
            Job Application<br />
            <span className="bg-gradient-to-r from-blue-200 to-indigo-200 bg-clip-text text-transparent">
              Command Center
            </span>
          </h1>
          <p className="mt-4 text-base text-slate-200 leading-relaxed drop-shadow-md">
            Manage Your Career. Plan Your Path. Track every application from first contact to offer.
          </p>

          {/* Feature bullets */}
          <div className="mt-8 flex flex-col gap-3 self-start text-left">
            {[
              "Track all job applications in one place",
              "Monitor interviews & offer statuses",
              "Import & export CSV data instantly",
            ].map((feat) => (
              <div key={feat} className="flex items-center gap-3 text-slate-200 text-sm font-medium">
                <CheckCircle2 className="h-5 w-5 text-indigo-400 shrink-0" />
                {feat}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom branding strip */}
        <div className="absolute bottom-6 left-0 right-0 z-10 flex items-center justify-center gap-2 text-xs text-slate-400">
          <TrendingUp className="h-3.5 w-3.5 text-indigo-400" />
          <span>Trusted by job seekers worldwide</span>
        </div>
      </div>

      {/* ── Right Panel: Login Form ── */}
      <div className="flex flex-1 flex-col items-center justify-center bg-white dark:bg-slate-950 px-6 py-12 sm:px-10">
        {/* Mobile logo — only shows on small screens */}
        <div className="mb-6 flex flex-col items-center lg:hidden">
          <div className="h-20 w-20 overflow-hidden rounded-full bg-white shadow-xl ring-2 ring-slate-200 dark:ring-slate-700">
            <img src="/logo.png" alt="Job Tracker" className="h-full w-full object-cover" />
          </div>
          <p className="mt-3 text-xs font-semibold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
            Job Tracker
          </p>
        </div>

        <div className="w-full max-w-sm space-y-7">
          {/* Heading */}
          <div className="space-y-1">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Welcome back 👋
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Sign in to access your application pipeline
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMsg && (
              <div className="rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs font-semibold text-rose-700 dark:bg-rose-500/10 dark:border-rose-500/20 dark:text-rose-400">
                {errorMsg}
              </div>
            )}

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                Email Address
              </label>
              <div className="relative mt-1.5">
                <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="h-11 pl-10 rounded-xl bg-slate-50 border-slate-200 text-slate-900 font-medium placeholder:text-slate-400 focus:bg-white dark:bg-slate-900 dark:border-slate-800 dark:text-white dark:placeholder:text-slate-500 focus-visible:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative mt-1.5">
                <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="h-11 pl-10 pr-10 rounded-xl bg-slate-50 border-slate-200 text-slate-900 font-medium placeholder:text-slate-400 focus:bg-white dark:bg-slate-900 dark:border-slate-800 dark:text-white dark:placeholder:text-slate-500 focus-visible:ring-indigo-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="h-11 w-full gap-2 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 hover:from-indigo-500 hover:to-purple-500 transition-all mt-2"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />}
              Sign In
            </Button>
          </form>

          <p className="text-center text-xs font-medium text-slate-500 dark:text-slate-400">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
              Create account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
