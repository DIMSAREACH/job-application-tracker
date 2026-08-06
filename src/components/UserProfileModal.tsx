"use client";

import React, { useState, useEffect, useCallback } from "react";
import Cropper from "react-easy-crop";
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
  ZoomIn,
  ZoomOut,
  Crop,
  X,
} from "lucide-react";
import { PasswordStrengthMeter } from "@/components/PasswordStrengthMeter";

/* ─── Canvas crop helper ──────────────────────────────────────────────────── */
interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

async function getCroppedDataUrl(
  imageSrc: string,
  cropArea: CropArea,
  outputSize = 160
): Promise<string> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.src = imageSrc;
    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = outputSize;
      canvas.height = outputSize;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(
        image,
        cropArea.x,
        cropArea.y,
        cropArea.width,
        cropArea.height,
        0,
        0,
        outputSize,
        outputSize
      );
      resolve(canvas.toDataURL("image/jpeg", 0.7));
    };
    image.onerror = reject;
  });
}

/* ─── Props ───────────────────────────────────────────────────────────────── */
interface UserProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProfileUpdated?: () => void;
}

/* ─── Component ───────────────────────────────────────────────────────────── */
export function UserProfileModal({
  open,
  onOpenChange,
  onProfileUpdated,
}: UserProfileModalProps) {
  /* profile fields */
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [image, setImage] = useState<string | null>(null);

  /* password fields */
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  /* UI state */
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  /* ── Crop state ── */
  const [cropSrc, setCropSrc] = useState<string | null>(null);   // raw uploaded image
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<CropArea | null>(null);
  const [cropping, setCropping] = useState(false);               // show crop dialog?

  /* ── Load profile ── */
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
      setCropSrc(null);
      setCropping(false);
    }
  }, [open]);

  /* ── File picked → open crop dialog ── */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setCropSrc(reader.result as string);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setCropping(true);
    };
    reader.readAsDataURL(file);
  };


  const onCropComplete = useCallback((_: unknown, pixels: CropArea) => {
    setCroppedAreaPixels(pixels);
  }, []);

  /* ── Confirm crop → set image ── */
  const handleCropConfirm = async () => {
    if (!cropSrc || !croppedAreaPixels) return;
    try {
      const cropped = await getCroppedDataUrl(cropSrc, croppedAreaPixels, 320);
      setImage(cropped);
      setCropping(false);
      setCropSrc(null);
    } catch {
      setErrorMsg("Failed to crop image. Please try again.");
    }
  };

  /* ── Submit profile ── */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    if (newPassword && newPassword !== confirmPassword) {
      setLoading(false);
      setErrorMsg("New passwords do not match.");
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
      setTimeout(() => onOpenChange(false), 1200);
    } else {
      setErrorMsg(res.error || "Failed to update profile");
    }
  };

  const initials = name
    ? name.split(" ").map((p) => p[0]).join("").substring(0, 2).toUpperCase()
    : "U";

  /* ══════════════════════════════════════════════════════════════════════════
     CROP DIALOG — shown on top while cropping
  ══════════════════════════════════════════════════════════════════════════ */
  if (cropping && cropSrc) {
    return (
      <Dialog open={open} onOpenChange={() => { setCropping(false); setCropSrc(null); }}>
        <DialogContent className="w-[95vw] sm:max-w-[520px] rounded-3xl border-slate-200 bg-white text-slate-900 shadow-2xl dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 p-0 overflow-hidden">
          <DialogHeader className="px-6 pt-6 pb-3 border-b border-slate-100 dark:border-slate-800">
            <DialogTitle className="flex items-center gap-2 text-lg font-bold">
              <Crop className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              Crop Profile Photo
            </DialogTitle>
          </DialogHeader>

          {/* Crop viewport */}
          <div className="relative w-full bg-black" style={{ height: 340 }}>
            <Cropper
              image={cropSrc}
              crop={crop}
              zoom={zoom}
              aspect={1}
              cropShape="round"
              showGrid={false}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
            />
          </div>

          {/* Zoom slider */}
          <div className="flex items-center gap-3 px-6 py-4 border-t border-slate-100 dark:border-slate-800">
            <ZoomOut className="h-4 w-4 text-slate-500 shrink-0" />
            <input
              type="range"
              min={1}
              max={3}
              step={0.05}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="flex-1 accent-indigo-600 cursor-pointer h-1.5 rounded-full"
            />
            <ZoomIn className="h-4 w-4 text-slate-500 shrink-0" />
          </div>

          <DialogFooter className="px-6 pb-6 flex gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => { setCropping(false); setCropSrc(null); }}
              className="flex-1 rounded-xl font-semibold text-slate-600 dark:text-slate-400"
            >
              <X className="h-4 w-4 mr-1" /> Cancel
            </Button>
            <Button
              type="button"
              onClick={handleCropConfirm}
              className="flex-1 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 font-semibold text-white hover:from-indigo-500 hover:to-purple-500"
            >
              <Crop className="h-4 w-4 mr-1.5" /> Apply Crop
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  /* ══════════════════════════════════════════════════════════════════════════
     MAIN PROFILE MODAL
  ══════════════════════════════════════════════════════════════════════════ */
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] sm:max-w-[540px] max-h-[90vh] overflow-y-auto rounded-3xl border-slate-200 bg-white text-slate-900 shadow-2xl dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 p-6 sm:p-8">
        <DialogHeader className="pb-2">
          <DialogTitle className="text-xl sm:text-2xl font-bold tracking-tight flex items-center gap-2 text-slate-900 dark:text-slate-100">
            <Sparkles className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            Edit Profile &amp; Account
          </DialogTitle>
        </DialogHeader>

        {fetching ? (
          <div className="flex h-48 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Alerts */}
            {errorMsg && (
              <div className="rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs font-semibold text-rose-700 dark:bg-rose-500/10 dark:border-rose-500/20 dark:text-rose-400">
                {errorMsg}
              </div>
            )}
            {successMsg && (
              <div className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs font-semibold text-emerald-800 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-300">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                {successMsg}
              </div>
            )}

            {/* ── Avatar Upload Section ── */}
            <div className="flex flex-col items-center space-y-3 rounded-2xl border border-indigo-100 bg-gradient-to-b from-indigo-50/60 to-slate-50/40 p-5 dark:border-indigo-900/40 dark:from-indigo-950/30 dark:to-slate-900/20">
              <div className="relative group">
                {/* Avatar circle */}
                <div className="h-24 w-24 overflow-hidden rounded-full border-4 border-indigo-500/30 group-hover:border-indigo-500/60 bg-gradient-to-tr from-indigo-600 to-purple-600 shadow-lg flex items-center justify-center text-3xl font-extrabold text-white transition-all">
                  {image ? (
                    <img src={image} alt="Profile Avatar" className="h-full w-full object-cover" />
                  ) : (
                    <span>{initials}</span>
                  )}
                </div>

                {/* Camera badge */}
                <label
                  htmlFor="avatar-upload"
                  className="absolute bottom-0.5 right-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-white shadow-md hover:bg-indigo-500 cursor-pointer transition-all border-2 border-white dark:border-slate-900 group-hover:scale-110"
                  title="Upload & crop profile picture"
                >
                  <Camera className="h-4 w-4" />
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="flex flex-col items-center gap-1">
                <div className="flex items-center gap-2 text-xs">
                  <label
                    htmlFor="avatar-upload"
                    className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                  >
                    Upload &amp; Crop Photo
                  </label>
                  {image && (
                    <>
                      <span className="text-slate-300 dark:text-slate-700">•</span>
                      <button
                        type="button"
                        onClick={() => setImage(null)}
                        className="flex items-center gap-1 font-semibold text-rose-600 dark:text-rose-400 hover:underline cursor-pointer"
                      >
                        <Trash2 className="h-3 w-3" />
                        Remove
                      </button>
                    </>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 dark:text-slate-500">
                  PNG, JPG or GIF · Circular crop applied
                </p>

              </div>
            </div>

            {/* ── Full Name ── */}
            <div>
              <label className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative mt-1.5">
                <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Jane Doe"
                  className="h-11 pl-10 rounded-xl bg-slate-50/50 border-slate-200 text-slate-900 font-medium dark:bg-slate-900 dark:border-slate-800 dark:text-white focus-visible:ring-indigo-500"
                />
              </div>
            </div>

            {/* ── Email (read only) ── */}
            <div>
              <label className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                Email Address
                <span className="ml-2 text-[10px] font-normal text-slate-400">(cannot be changed)</span>
              </label>
              <div className="relative mt-1.5">
                <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  disabled
                  value={email}
                  className="h-11 pl-10 rounded-xl bg-slate-100 border-slate-200 text-slate-500 font-medium dark:bg-slate-900/40 dark:border-slate-800 dark:text-slate-400 cursor-not-allowed"
                />
              </div>
            </div>

            {/* ── Passwords ── */}
            <div className="rounded-2xl border border-slate-100 dark:border-slate-800/60 p-4 space-y-4">
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Change Password (optional)
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* New Password */}
                <div>
                  <label className="text-xs font-semibold text-slate-800 dark:text-slate-200">New Password</label>
                  <div className="relative mt-1.5">
                    <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Min 6 chars"
                      className="h-11 pl-10 pr-9 rounded-xl bg-slate-50/50 border-slate-200 text-slate-900 font-medium dark:bg-slate-900 dark:border-slate-800 dark:text-white focus-visible:ring-indigo-500"
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 transition-colors">
                      {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="text-xs font-semibold text-slate-800 dark:text-slate-200">Confirm Password</label>
                  <div className="relative mt-1.5">
                    <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter"
                      className={`h-11 pl-10 pr-9 rounded-xl bg-slate-50/50 border-slate-200 text-slate-900 font-medium dark:bg-slate-900 dark:border-slate-800 dark:text-white focus-visible:ring-indigo-500 ${
                        confirmPassword && newPassword !== confirmPassword ? "border-rose-400 focus-visible:ring-rose-500" : ""
                      }`}
                    />
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 transition-colors">
                      {showConfirmPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                  {confirmPassword && newPassword !== confirmPassword && (
                    <p className="mt-1 text-[11px] font-semibold text-rose-500">Passwords do not match</p>
                  )}
                </div>
              </div>

              <PasswordStrengthMeter password={newPassword} />
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
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
