import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const ApplicationUpdateSchema = z.object({
  company: z.string().min(1).optional(),
  position: z.string().min(1).optional(),
  location: z.string().optional().nullable(),
  salary: z.string().optional().nullable(),
  jobUrl: z.string().optional().nullable(),
  status: z.enum(["APPLIED", "INTERVIEWING", "OFFER", "REJECTED"]).optional(),
  interviewed: z.boolean().optional(),
  notes: z.string().optional().nullable(),
  dateApplied: z.coerce.date().optional(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validatedData = ApplicationUpdateSchema.parse(body);

    const existingApp = await prisma.application.findUnique({
      where: { id },
    });

    if (!existingApp) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    // Auto-advance status logic: if interviewed becomes true and current status is APPLIED
    let nextStatus = validatedData.status ?? existingApp.status;
    if (validatedData.interviewed === true && existingApp.status === "APPLIED") {
      nextStatus = "INTERVIEWING";
    }

    const updatedApp = await prisma.application.update({
      where: { id },
      data: {
        ...validatedData,
        status: nextStatus,
        activities: {
          create: {
            type: "UPDATE",
            description: `Updated application details (Status: ${nextStatus})`,
          },
        },
      },
      include: { activities: true },
    });

    return NextResponse.json(updatedApp);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    console.error("PATCH /api/applications/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to update application" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const existingApp = await prisma.application.findUnique({
      where: { id },
    });

    if (!existingApp) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    await prisma.application.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error("DELETE /api/applications/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to delete application" },
      { status: 500 }
    );
  }
}
