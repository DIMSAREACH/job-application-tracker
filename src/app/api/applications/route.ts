import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const ApplicationCreateSchema = z.object({
  company: z.string().min(1, "Company name is required"),
  position: z.string().min(1, "Position title is required"),
  location: z.string().optional(),
  salary: z.string().optional(),
  jobUrl: z.string().url("Invalid URL format").optional().or(z.literal("")),
  status: z.enum(["APPLIED", "INTERVIEWING", "OFFER", "REJECTED"]).default("APPLIED"),
  interviewed: z.boolean().default(false),
  notes: z.string().optional(),
  dateApplied: z.coerce.date().default(() => new Date()),
});

export async function GET() {
  try {
    const applications = await prisma.application.findMany({
      orderBy: { dateApplied: "desc" },
      include: {
        activities: {
          orderBy: { createdAt: "desc" },
          take: 5,
        },
      },
    });
    return NextResponse.json(applications);
  } catch (error) {
    console.error("GET /api/applications error:", error);
    return NextResponse.json(
      { error: "Failed to fetch applications" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = ApplicationCreateSchema.parse(body);

    const newApplication = await prisma.application.create({
      data: {
        ...validatedData,
        activities: {
          create: {
            type: "INITIAL_LOG",
            description: `Application logged for ${validatedData.position} at ${validatedData.company}`,
          },
        },
      },
      include: { activities: true },
    });

    return NextResponse.json(newApplication, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    console.error("POST /api/applications error:", error);
    return NextResponse.json(
      { error: "Failed to create application" },
      { status: 500 }
    );
  }
}
