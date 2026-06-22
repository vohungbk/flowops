import { z } from "zod"

export const customerSchema = z.object({
  company_name: z.string().min(1, "Company name is required"),
  contact_name: z.string().optional(),
  email: z.union([z.string().email("Invalid email address"), z.literal("")]).optional(),
  phone: z.string().optional(),
  industry: z.string().optional(),
  website: z.string().optional(),
  address: z.string().optional(),
  status: z.enum(["active", "inactive", "churned"]),
  notes: z.string().optional(),
})

export type CustomerInput = z.infer<typeof customerSchema>
