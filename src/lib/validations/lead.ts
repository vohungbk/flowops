import { z } from "zod"

export const leadSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().optional(),
  email: z.union([z.string().email("Invalid email address"), z.literal("")]).optional(),
  phone: z.string().optional(),
  company: z.string().optional(),
  job_title: z.string().optional(),
  source: z.enum(["web", "referral", "linkedin", "event", "cold-outreach", "other"]),
  status: z.enum(["new", "contacted", "qualified", "disqualified", "converted"]),
  score: z.coerce.number().min(0).max(100).default(0),
  notes: z.string().optional(),
})

export type LeadInput = z.infer<typeof leadSchema>
