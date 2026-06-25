"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { getCurrentProfile } from "@/lib/actions/auth"
import { ROUTES } from "@/lib/constants"
import type { ActionResult } from "@/types"
import { z } from "zod"

const stageSchema = z.object({
  name: z.string().min(1, "Stage name is required"),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Invalid color"),
  probability: z.coerce.number().min(0).max(100).default(0),
})

type PgMutationResult = { error: { message: string } | null }

export async function updatePipelineStage(
  id: string,
  _prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const profile = await getCurrentProfile()
  if (!profile) return { success: false, error: "Not authenticated" }

  const raw = {
    name: formData.get("name") as string,
    color: formData.get("color") as string,
    probability: formData.get("probability") as string,
  }

  const parsed = stageSchema.safeParse(raw)
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message }

  const supabase = await createClient()
  const { error } = (await (supabase.from("pipeline_stages") as unknown as {
    update: (v: object) => { eq: (col: string, val: string) => Promise<PgMutationResult> }
  }).update({
    name: parsed.data.name,
    color: parsed.data.color,
    probability: parsed.data.probability,
  }).eq("id", id))

  if (error) return { success: false, error: error.message }

  revalidatePath(ROUTES.pipeline)
  revalidatePath(`${ROUTES.settings}/pipeline`)
  return { success: true, data: null }
}

export async function swapStageOrder(
  stageAId: string,
  stageAOrder: number,
  stageBId: string,
  stageBOrder: number
): Promise<ActionResult> {
  const profile = await getCurrentProfile()
  if (!profile) return { success: false, error: "Not authenticated" }

  const supabase = await createClient()

  const [resA, resB] = await Promise.all([
    (supabase.from("pipeline_stages") as unknown as {
      update: (v: object) => { eq: (col: string, val: string) => Promise<PgMutationResult> }
    }).update({ order_index: stageBOrder }).eq("id", stageAId),
    (supabase.from("pipeline_stages") as unknown as {
      update: (v: object) => { eq: (col: string, val: string) => Promise<PgMutationResult> }
    }).update({ order_index: stageAOrder }).eq("id", stageBId),
  ])

  if (resA.error) return { success: false, error: resA.error.message }
  if (resB.error) return { success: false, error: resB.error.message }

  revalidatePath(ROUTES.pipeline)
  revalidatePath(`${ROUTES.settings}/pipeline`)
  return { success: true, data: null }
}
