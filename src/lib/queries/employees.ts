import { createClient } from "@/lib/supabase/server"
import type { Profile } from "@/types"

export type EmployeeWithStats = Profile & {
  dealsWon: number
  revenueGenerated: number
}

export async function getEmployees(): Promise<EmployeeWithStats[]> {
  const supabase = await createClient()

  const { data: profiles } = await supabase
    .from("profiles")
    .select("*")
    .order("full_name")

  if (!profiles?.length) return []

  // Get IDs of stages that are "closed won"
  const { data: wonStages } = (await supabase
    .from("pipeline_stages")
    .select("id")
    .eq("is_closed_won", true)) as unknown as { data: Array<{ id: string }> | null }

  const wonStageIds = (wonStages ?? []).map((s) => s.id)

  let wonDeals: Array<{ assigned_to: string | null; value: number }> = []
  if (wonStageIds.length > 0) {
    const { data } = await supabase
      .from("deals")
      .select("assigned_to, value")
      .in("stage_id", wonStageIds)
    wonDeals = (data ?? []) as typeof wonDeals
  }

  // Aggregate per employee
  const statsMap = new Map<string, { dealsWon: number; revenueGenerated: number }>()
  for (const deal of wonDeals) {
    if (!deal.assigned_to) continue
    const cur = statsMap.get(deal.assigned_to) ?? { dealsWon: 0, revenueGenerated: 0 }
    statsMap.set(deal.assigned_to, {
      dealsWon: cur.dealsWon + 1,
      revenueGenerated: cur.revenueGenerated + Number(deal.value),
    })
  }

  return (profiles as Profile[]).map((p) => ({
    ...p,
    ...(statsMap.get(p.id) ?? { dealsWon: 0, revenueGenerated: 0 }),
  }))
}
