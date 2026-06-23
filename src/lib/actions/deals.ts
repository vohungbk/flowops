"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { getCurrentProfile } from "@/lib/actions/auth"
import { dealSchema } from "@/lib/validations/deal"
import { ROUTES } from "@/lib/constants"
import type { ActionResult } from "@/types"

type PgMutationResult = { error: { message: string } | null }

function toNull(v: string | undefined | null): string | null {
  return v?.trim() || null
}

export async function createDeal(
  _prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const profile = await getCurrentProfile()
  if (!profile) return { success: false, error: "Not authenticated" }

  const raw = {
    title: formData.get("title") as string,
    value: formData.get("value") as string,
    stage_id: formData.get("stage_id") as string,
    customer_id: formData.get("customer_id") as string,
    expected_close_date: formData.get("expected_close_date") as string,
    probability: formData.get("probability") as string,
    notes: formData.get("notes") as string,
  }

  const parsed = dealSchema.safeParse(raw)
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message }

  const supabase = await createClient()
  const { error } = (await (supabase.from("deals") as unknown as {
    insert: (v: object) => Promise<PgMutationResult>
  }).insert({
    title: parsed.data.title,
    value: parsed.data.value,
    stage_id: parsed.data.stage_id,
    customer_id: toNull(parsed.data.customer_id),
    expected_close_date: toNull(parsed.data.expected_close_date),
    probability: parsed.data.probability,
    notes: toNull(parsed.data.notes),
    created_by: profile.id,
  }))

  if (error) return { success: false, error: error.message }

  revalidatePath(ROUTES.pipeline)
  return { success: true, data: null }
}

export async function updateDeal(
  id: string,
  _prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const profile = await getCurrentProfile()
  if (!profile) return { success: false, error: "Not authenticated" }

  const raw = {
    title: formData.get("title") as string,
    value: formData.get("value") as string,
    stage_id: formData.get("stage_id") as string,
    customer_id: formData.get("customer_id") as string,
    expected_close_date: formData.get("expected_close_date") as string,
    probability: formData.get("probability") as string,
    notes: formData.get("notes") as string,
  }

  const parsed = dealSchema.safeParse(raw)
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message }

  const supabase = await createClient()
  const { error } = (await (supabase.from("deals") as unknown as {
    update: (v: object) => { eq: (col: string, val: string) => Promise<PgMutationResult> }
  }).update({
    title: parsed.data.title,
    value: parsed.data.value,
    stage_id: parsed.data.stage_id,
    customer_id: toNull(parsed.data.customer_id),
    expected_close_date: toNull(parsed.data.expected_close_date),
    probability: parsed.data.probability,
    notes: toNull(parsed.data.notes),
  }).eq("id", id))

  if (error) return { success: false, error: error.message }

  revalidatePath(ROUTES.pipeline)
  return { success: true, data: null }
}

export async function deleteDeal(id: string): Promise<ActionResult> {
  const profile = await getCurrentProfile()
  if (!profile) return { success: false, error: "Not authenticated" }

  const supabase = await createClient()
  const { error } = (await (supabase.from("deals") as unknown as {
    delete: () => { eq: (col: string, val: string) => Promise<PgMutationResult> }
  }).delete().eq("id", id))

  if (error) return { success: false, error: error.message }

  revalidatePath(ROUTES.pipeline)
  return { success: true, data: null }
}

export async function moveDeal(dealId: string, stageId: string): Promise<ActionResult> {
  const profile = await getCurrentProfile()
  if (!profile) return { success: false, error: "Not authenticated" }

  const supabase = await createClient()
  const { error } = (await (supabase.from("deals") as unknown as {
    update: (v: object) => { eq: (col: string, val: string) => Promise<PgMutationResult> }
  }).update({ stage_id: stageId }).eq("id", dealId))

  if (error) return { success: false, error: error.message }

  revalidatePath(ROUTES.pipeline)
  return { success: true, data: null }
}
