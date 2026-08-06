import { z } from "zod";

export const ApplicationInputSchema = z.object({
  company: z.string().min(1, "Company name is required"),
  position: z.string().min(1, "Position title is required"),
  location: z.string().optional(),
  salary: z.string().optional(),
  jobUrl: z.string().url("Invalid URL format").optional().or(z.literal("")),
  status: z.enum(["APPLIED", "INTERVIEWING", "OFFER", "REJECTED"]),
  interviewed: z.boolean().default(false),
  notes: z.string().optional(),
  tags: z.string().optional(),
  dateApplied: z.date(),
});

export type ApplicationInput = z.infer<typeof ApplicationInputSchema>;
