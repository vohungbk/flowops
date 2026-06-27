"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { getCurrentProfile } from "@/lib/actions/auth"
import { recalculateLeadScore } from "@/lib/actions/leads"
import { ROUTES } from "@/lib/constants"
import type { ActionResult } from "@/types"
import { z } from "zod"

const activitySchema = z.object({
  type: z.enum(["call", "email", "meeting", "note", "task"]),
  subject: z.string().min(1, "Subject is required"),
  description: z.string().optional(),
  outcome: z.string().optional(),
  customer_id: z.string().optional(),
  lead_id: z.string().optional(),
})

function toNull(v: string | undefined | null): string | null {
  return v?.trim() || null
}

type PgMutationResult = { error: { message: string } | null }

export async function createActivity(
  _prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const profile = await getCurrentProfile()
  if (!profile) return { success: false, error: "Not authenticated" }

  const raw = {
    type: formData.get("type") as string,
    subject: formData.get("subject") as string,
    description: formData.get("description") as string || undefined,
    outcome: formData.get("outcome") as string || undefined,
    customer_id: formData.get("customer_id") as string || undefined,
    lead_id: formData.get("lead_id") as string || undefined,
  }

  const parsed = activitySchema.safeParse(raw)
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message }

  const supabase = await createClient()
  const { error } = (await (supabase.from("activities") as unknown as {
    insert: (v: object) => Promise<PgMutationResult>
  }).insert({
    type: parsed.data.type,
    subject: parsed.data.subject,
    description: toNull(parsed.data.description),
    outcome: toNull(parsed.data.outcome),
    customer_id: toNull(parsed.data.customer_id),
    lead_id: toNull(parsed.data.lead_id),
    assigned_to: profile.id,
    created_by: profile.id,
  }))

  if (error) return { success: false, error: error.message }

  if (parsed.data.customer_id) {
    revalidatePath(`${ROUTES.customers}/${parsed.data.customer_id}`)
  }
  if (parsed.data.lead_id) {
    await recalculateLeadScore(parsed.data.lead_id)
    revalidatePath(`${ROUTES.leads}/${parsed.data.lead_id}`)
  }

  return { success: true, data: null }
}
