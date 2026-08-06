"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { signOut, auth } from "@/auth";
import { sendPasswordResetEmail } from "@/lib/mail";
import crypto from "crypto";

const RegisterSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export async function registerUserAction(input: z.infer<typeof RegisterSchema>) {
  try {
    const validated = RegisterSchema.parse(input);
    const email = validated.email.toLowerCase();

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return { success: false, error: "An account with this email already exists" };
    }

    const hashedPassword = await bcrypt.hash(validated.password, 10);

    const newUser = await prisma.user.create({
      data: {
        name: validated.name,
        email,
        password: hashedPassword,
      },
    });

    return { success: true, data: { id: newUser.id, email: newUser.email } };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0].message };
    }
    console.error("registerUserAction error:", error);
    return { success: false, error: "Failed to register user" };
  }
}

export async function getCurrentUserProfileAction() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
      },
    });

    return { success: true, data: user };
  } catch (error) {
    console.error("getCurrentUserProfileAction error:", error);
    return { success: false, error: "Failed to fetch user profile" };
  }
}

export async function updateUserProfileAction(input: {
  name?: string;
  image?: string | null;
  newPassword?: string;
}) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const updateData: any = {};
    if (input.name !== undefined) updateData.name = input.name;
    if (input.image !== undefined) updateData.image = input.image;

    if (input.newPassword && input.newPassword.trim().length >= 6) {
      updateData.password = await bcrypt.hash(input.newPassword, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
      },
    });

    return { success: true, data: updatedUser };
  } catch (error) {
    console.error("updateUserProfileAction error:", error);
    return { success: false, error: "Failed to update profile settings" };
  }
}

export async function requestPasswordResetAction(email: string) {
  try {
    const cleanEmail = email.toLowerCase().trim();
    if (!cleanEmail || !cleanEmail.includes("@")) {
      return { success: false, error: "Invalid email address" };
    }

    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (!user) {
      // Return success to avoid leaking account existence
      return { success: true };
    }

    const token = crypto.randomUUID();
    const expires = new Date(Date.now() + 3600 * 1000); // 1 hour token expiration

    // Delete existing tokens for this email
    await prisma.passwordResetToken.deleteMany({
      where: { email: cleanEmail },
    });

    // Create new token
    await prisma.passwordResetToken.create({
      data: {
        email: cleanEmail,
        token,
        expires,
      },
    });

    // Send email via Resend
    await sendPasswordResetEmail(cleanEmail, token);

    return { success: true };
  } catch (error) {
    console.error("requestPasswordResetAction error:", error);
    return { success: false, error: "Failed to process password reset request" };
  }
}

export async function resetPasswordWithTokenAction(token: string, newPassword: string) {
  try {
    if (!token) {
      return { success: false, error: "Missing password reset token" };
    }

    if (!newPassword || newPassword.trim().length < 6) {
      return { success: false, error: "Password must be at least 6 characters" };
    }

    const resetTokenRecord = await prisma.passwordResetToken.findUnique({
      where: { token },
    });

    if (!resetTokenRecord) {
      return { success: false, error: "Invalid or expired reset token" };
    }

    if (resetTokenRecord.expires < new Date()) {
      await prisma.passwordResetToken.delete({ where: { id: resetTokenRecord.id } });
      return { success: false, error: "Reset token has expired. Please request a new link." };
    }

    const user = await prisma.user.findUnique({
      where: { email: resetTokenRecord.email },
    });

    if (!user) {
      return { success: false, error: "User account no longer exists" };
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { email: resetTokenRecord.email },
      data: { password: hashedPassword },
    });

    // Delete used token
    await prisma.passwordResetToken.delete({
      where: { id: resetTokenRecord.id },
    });

    return { success: true };
  } catch (error) {
    console.error("resetPasswordWithTokenAction error:", error);
    return { success: false, error: "Failed to reset password" };
  }
}

export async function logoutUserAction() {
  await signOut({ redirectTo: "/login" });
}
