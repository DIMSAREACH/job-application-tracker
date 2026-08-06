"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { ApplicationInputSchema, ApplicationInput } from "@/lib/schemas";

async function getAuthUserId() {
  const session = await auth();
  return session?.user?.id || null;
}

export async function getApplicationsAction() {
  try {
    const userId = await getAuthUserId();

    const applications = await prisma.application.findMany({
      where: userId ? { userId } : {},
      orderBy: { dateApplied: "desc" },
      include: {
        activities: {
          orderBy: { createdAt: "desc" },
          take: 5,
        },
      },
    });
    return { success: true, data: applications };
  } catch (error) {
    console.error("getApplicationsAction error:", error);
    return { success: false, error: "Failed to fetch applications" };
  }
}

export async function createApplicationAction(input: ApplicationInput) {
  try {
    const userId = await getAuthUserId();
    const validated = ApplicationInputSchema.parse(input);

    const newApp = await prisma.application.create({
      data: {
        ...validated,
        userId: userId || undefined,
        activities: {
          create: {
            type: "INITIAL_LOG",
            description: `Application logged for ${validated.position} at ${validated.company}`,
          },
        },
      },
    });
    revalidatePath("/");
    return { success: true, data: newApp };
  } catch (error) {
    console.error("createApplicationAction error:", error);
    return { success: false, error: "Failed to create application" };
  }
}

export async function bulkCreateApplicationsAction(
  items: Array<{
    company: string;
    position: string;
    location?: string;
    salary?: string;
    jobUrl?: string;
    status: "APPLIED" | "INTERVIEWING" | "OFFER" | "REJECTED";
    interviewed: boolean;
    notes?: string;
    dateApplied: Date;
  }>
) {
  try {
    const userId = await getAuthUserId();
    if (!items || items.length === 0) {
      return { success: false, error: "No applications to import" };
    }

    const createdList = [];
    for (const item of items) {
      const created = await prisma.application.create({
        data: {
          ...item,
          userId: userId || undefined,
          activities: {
            create: {
              type: "INITIAL_LOG",
              description: `Bulk imported application for ${item.position} at ${item.company}`,
            },
          },
        },
      });
      createdList.push(created);
    }

    revalidatePath("/");
    return { success: true, count: createdList.length };
  } catch (error) {
    console.error("bulkCreateApplicationsAction error:", error);
    return { success: false, error: "Failed to import CSV applications" };
  }
}

export async function updateApplicationAction(
  id: string,
  input: Partial<ApplicationInput>
) {
  try {
    const userId = await getAuthUserId();
    const existing = await prisma.application.findFirst({
      where: userId ? { id, userId } : { id },
    });

    if (!existing) return { success: false, error: "Application not found" };

    let nextStatus = input.status ?? existing.status;
    if (input.interviewed === true && existing.status === "APPLIED") {
      nextStatus = "INTERVIEWING";
    }

    const updated = await prisma.application.update({
      where: { id },
      data: {
        ...input,
        status: nextStatus,
        activities: {
          create: {
            type: "UPDATE",
            description: `Updated application details (Status: ${nextStatus})`,
          },
        },
      },
    });
    revalidatePath("/");
    return { success: true, data: updated };
  } catch (error) {
    console.error("updateApplicationAction error:", error);
    return { success: false, error: "Failed to update application" };
  }
}

export async function updateApplicationStatusAction(
  id: string,
  newStatus: "APPLIED" | "INTERVIEWING" | "OFFER" | "REJECTED"
) {
  try {
    const userId = await getAuthUserId();
    const existing = await prisma.application.findFirst({
      where: userId ? { id, userId } : { id },
    });

    if (!existing) return { success: false, error: "Application not found" };

    const interviewed = newStatus === "INTERVIEWING" ? true : existing.interviewed;

    const updated = await prisma.application.update({
      where: { id },
      data: {
        status: newStatus,
        interviewed,
        activities: {
          create: {
            type: "STATUS_CHANGE",
            description: `Status changed from ${existing.status} to ${newStatus}`,
          },
        },
      },
    });
    revalidatePath("/");
    return { success: true, data: updated };
  } catch (error) {
    console.error("updateApplicationStatusAction error:", error);
    return { success: false, error: "Failed to update application status" };
  }
}

export async function toggleInterviewedAction(id: string) {
  try {
    const userId = await getAuthUserId();
    const existing = await prisma.application.findFirst({
      where: userId ? { id, userId } : { id },
    });

    if (!existing) return { success: false, error: "Application not found" };

    const newInterviewedState = !existing.interviewed;
    const nextStatus =
      newInterviewedState && existing.status === "APPLIED"
        ? "INTERVIEWING"
        : existing.status;

    const updated = await prisma.application.update({
      where: { id },
      data: {
        interviewed: newInterviewedState,
        status: nextStatus,
        activities: {
          create: {
            type: "INTERVIEW_TOGGLED",
            description: newInterviewedState
              ? "Marked as interviewed (Interview stamp added)"
              : "Unmarked interviewed stamp",
          },
        },
      },
    });
    revalidatePath("/");
    return { success: true, data: updated };
  } catch (error) {
    console.error("toggleInterviewedAction error:", error);
    return { success: false, error: "Failed to toggle interviewed status" };
  }
}

export async function deleteApplicationAction(id: string) {
  try {
    const userId = await getAuthUserId();
    const existing = await prisma.application.findFirst({
      where: userId ? { id, userId } : { id },
    });

    if (!existing) return { success: false, error: "Application not found" };

    await prisma.application.delete({ where: { id } });
    revalidatePath("/");
    return { success: true, id };
  } catch (error) {
    console.error("deleteApplicationAction error:", error);
    return { success: false, error: "Failed to delete application" };
  }
}
