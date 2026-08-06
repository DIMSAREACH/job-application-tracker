"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Briefcase, Lock, Mail, Loader2, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 px-4 py-12 text-slate-900 dark:text-slate-100 selection:bg-indigo-500 selection:text-white transition-colors duration-300">
      <div className="w-full max-w-md space-y-7 rounded-3xl border border-slate-200 bg-white p-7 sm:p-9 shadow-2xl dark:border-slate-800 dark:bg-slate-900/90 backdrop-blur-2xl">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/30">
            <Briefcase className="h-7 w-7 text-white" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Welcome back
          </h2>
          <p className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300">
            Sign in to access your job application pipeline
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {errorMsg && (
            <div className="rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs font-semibold text-rose-700 dark:bg-rose-500/10 dark:border-rose-500/20 dark:text-rose-400">
              {errorMsg}
            </div>
          )}

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

          <div>
            <label className="text-xs font-semibold text-slate-800 dark:text-slate-200">
              Password
            </label>
            <div className="relative mt-1.5">
              <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-400" />
              <Input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="h-11 pl-10 rounded-xl bg-slate-50/50 border-slate-200 text-slate-900 font-medium placeholder:text-slate-400 focus:bg-white dark:bg-slate-950 dark:border-slate-800 dark:text-white dark:placeholder:text-slate-400 focus-visible:ring-indigo-500"
              />
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

        <div className="text-center text-xs font-medium text-slate-600 dark:text-slate-300 pt-1">
          Don't have an account?{" "}
          <Link href="/register" className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
            Create account
          </Link>
        </div>
      </div>
    </div>
  );
}
