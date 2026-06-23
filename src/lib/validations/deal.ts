import { z } from "zod"

export const dealSchema = z.object({
  title: z.string().min(1, "Deal title is required"),
  value: z.coerce.number().min(0).default(0),
  stage_id: z.string().min(1, "Stage is required"),
  customer_id: z.string().optional(),
  expected_close_date: z.string().optional(),
  probability: z.coerce.number().min(0).max(100).default(0),
  notes: z.string().optional(),
})

export type DealInput = z.infer<typeof dealSchema>
