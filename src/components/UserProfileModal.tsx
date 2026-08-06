"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  getCurrentUserProfileAction,
  updateUserProfileAction,
} from "@/actions/auth-actions";
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Camera,
  Trash2,
  Loader2,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { PasswordStrengthMeter } from "@/components/PasswordStrengthMeter";

interface UserProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProfileUpdated?: () => void;
}

export function UserProfileModal({
  open,
  onOpenChange,
  onProfileUpdated,
}: UserProfileModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [image, setImage] = useState<string | null>(null);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const loadProfile = async () => {
    setFetching(true);
    setErrorMsg("");
    setSuccessMsg("");
    const res = await getCurrentUserProfileAction();
    if (res.success && res.data) {
      setName(res.data.name || "");
      setEmail(res.data.email || "");
      setImage(res.data.image || null);
    }
    setFetching(false);
  };

  useEffect(() => {
    if (open) {
      loadProfile();
      setNewPassword("");
      setConfirmPassword("");
      setShowPassword(false);
      setShowConfirmPassword(false);
    }
  }, [open]);

  const handleGeneratePassword = (genPassword: string) => {
    setNewPassword(genPassword);
    setConfirmPassword(genPassword);
    setShowPassword(true);
    setShowConfirmPassword(true);
  };

  // Handle local image file upload & conversion to Data URL
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setErrorMsg("Image size must be less than 2MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    if (newPassword && newPassword !== confirmPassword) {
      setLoading(false);
      setErrorMsg("New passwords do not match. Please verify and try again.");
      return;
    }

    const res = await updateUserProfileAction({
      name,
      image,
      newPassword: newPassword || undefined,
    });

    setLoading(false);

    if (res.success) {
      setSuccessMsg("Profile updated successfully!");
      setNewPassword("");
      setConfirmPassword("");
      if (onProfileUpdated) onProfileUpdated();
      setTimeout(() => {
        onOpenChange(false);
      }, 1000);
    } else {
      setErrorMsg(res.error || "Failed to update profile");
    }
  };

  const initials = name
    ? name
        .split(" ")
        .map((p) => p[0])
        .join("")
        .substring(0, 2)
        .toUpperCase()
    : "U";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] sm:max-w-[540px] max-h-[90vh] overflow-y-auto rounded-3xl border-slate-200 bg-white text-slate-900 shadow-2xl dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 p-6 sm:p-8">
        <DialogHeader className="pb-2">
          <DialogTitle className="text-xl sm:text-2xl font-bold tracking-tight flex items-center gap-2 text-slate-900 dark:text-slate-100">
            <Sparkles className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            <span>Edit Profile & Account</span>
          </DialogTitle>
        </DialogHeader>

        {fetching ? (
          <div className="flex h-48 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {errorMsg && (
              <div className="rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs font-semibold text-rose-700 dark:bg-rose-500/10 dark:border-rose-500/20 dark:text-rose-400">
                {errorMsg}
              </div>
            )}

            {successMsg && (
              <div className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs font-semibold text-emerald-800 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-300">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Profile Avatar Upload Section */}
            <div className="flex flex-col items-center justify-center space-y-3 rounded-2xl border border-indigo-100 bg-indigo-50/50 p-4 dark:border-indigo-900/40 dark:bg-indigo-950/30">
              <div className="relative group">
                <div className="h-20 w-20 overflow-hidden rounded-full border-2 border-indigo-500/40 bg-gradient-to-tr from-indigo-600 to-purple-600 shadow-md flex items-center justify-center text-2xl font-extrabold text-white">
                  {image ? (
                    <img
                      src={image}
                      alt="Profile Avatar"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span>{initials}</span>
                  )}
                </div>

                <label
                  htmlFor="avatar-upload"
                  className="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full bg-indigo-600 text-white shadow-md hover:bg-indigo-500 cursor-pointer transition-all border-2 border-white dark:border-slate-900"
                  title="Upload profile picture"
                >
                  <Camera className="h-3.5 w-3.5" />
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <label
                  htmlFor="avatar-upload"
                  className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                >
                  Upload New Photo
                </label>
                {image && (
                  <>
                    <span className="text-slate-300 dark:text-slate-700">•</span>
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="flex items-center gap-1 font-semibold text-rose-600 dark:text-rose-400 hover:underline cursor-pointer"
                    >
                      <Trash2 className="h-3 w-3" />
                      <span>Remove</span>
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Full Name */}
            <div>
              <label className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative mt-1.5">
                <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-400" />
                <Input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Jane Doe"
                  className="h-11 pl-10 rounded-xl bg-slate-50/50 border-slate-200 text-slate-900 font-medium dark:bg-slate-900 dark:border-slate-800 dark:text-white focus-visible:ring-indigo-500"
                />
              </div>
            </div>

            {/* Email Address (Read Only) */}
            <div>
              <label className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                Email Address
              </label>
              <div className="relative mt-1.5">
                <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-400" />
                <Input
                  disabled
                  value={email}
                  className="h-11 pl-10 rounded-xl bg-slate-100 border-slate-200 text-slate-500 font-medium dark:bg-slate-900/40 dark:border-slate-800 dark:text-slate-400 cursor-not-allowed"
                />
              </div>
            </div>

            {/* New Password & Confirm New Password Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* New Password */}
              <div>
                <label className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  New Password
                </label>
                <div className="relative mt-1.5">
                  <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-400" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min 6 chars"
                    className="h-11 pl-10 pr-9 rounded-xl bg-slate-50/50 border-slate-200 text-slate-900 font-medium dark:bg-slate-900 dark:border-slate-800 dark:text-white focus-visible:ring-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors"
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-3.5 w-3.5" />
                    ) : (
                      <Eye className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm New Password */}
              <div>
                <label className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  Confirm Password
                </label>
                <div className="relative mt-1.5">
                  <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-400" />
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter"
                    className={`h-11 pl-10 pr-9 rounded-xl bg-slate-50/50 border-slate-200 text-slate-900 font-medium dark:bg-slate-900 dark:border-slate-800 dark:text-white focus-visible:ring-indigo-500 ${
                      confirmPassword && newPassword !== confirmPassword
                        ? "border-rose-400 focus-visible:ring-rose-500"
                        : ""
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors"
                    title={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-3.5 w-3.5" />
                    ) : (
                      <Eye className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Password Strength Meter */}
            <PasswordStrengthMeter
              password={newPassword}
              onGeneratePassword={handleGeneratePassword}
            />

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
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
