"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { signOut, auth } from "@/auth";

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

export async function logoutUserAction() {
  await signOut({ redirectTo: "/login" });
}
