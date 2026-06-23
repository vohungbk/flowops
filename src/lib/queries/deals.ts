import { createClient } from "@/lib/supabase/server"
import type { Deal, PipelineStage, Customer, Profile } from "@/types"

export type DealCardData = Deal & {
  customer: Pick<Customer, "id" | "company_name"> | null
  assigned_profile: Pick<Profile, "id" | "full_name" | "avatar_url"> | null
}

export type StageWithDeals = PipelineStage & {
  deals: DealCardData[]
}

type SingleOf<T> = { data: T | null; error: unknown }
type QueryOf<T> = { data: T[] | null }

type RawDeal = Deal & {
  customer: Pick<Customer, "id" | "company_name"> | null
  assigned_profile: Pick<Profile, "id" | "full_name" | "avatar_url"> | null
}

export async function getPipelineData(): Promise<StageWithDeals[]> {
  const supabase = await createClient()

  const [stagesResult, dealsResult] = (await Promise.all([
    supabase
      .from("pipeline_stages")
      .select("*")
      .order("order_index", { ascending: true }),
    supabase
      .from("deals")
      .select("*, customer:customers(id, company_name), assigned_profile:profiles!deals_assigned_to_fkey(id, full_name, avatar_url)")
      .order("created_at", { ascending: true }),
  ])) as unknown as [QueryOf<PipelineStage>, QueryOf<RawDeal>]

  const stages = stagesResult.data ?? []
  const deals = dealsResult.data ?? []

  const dealsByStage: Record<string, DealCardData[]> = {}
  for (const stage of stages) {
    dealsByStage[stage.id] = []
  }
  for (const deal of deals) {
    if (dealsByStage[deal.stage_id]) {
      dealsByStage[deal.stage_id].push(deal as DealCardData)
    }
  }

  return stages.map((stage) => ({
    ...stage,
    deals: dealsByStage[stage.id] ?? [],
  }))
}

export async function getDealById(id: string): Promise<DealCardData | null> {
  const supabase = await createClient()

  const { data, error } = (await supabase
    .from("deals")
    .select("*, customer:customers(id, company_name), assigned_profile:profiles!deals_assigned_to_fkey(id, full_name, avatar_url)")
    .eq("id", id)
    .single()) as unknown as SingleOf<DealCardData>

  if (error || !data) return null
  return data
}

// Minimal list for select dropdowns
export async function getCustomersForSelect(): Promise<
  Pick<Customer, "id" | "company_name">[]
> {
  const supabase = await createClient()
  const { data } = (await supabase
    .from("customers")
    .select("id, company_name")
    .eq("status", "active")
    .order("company_name")) as unknown as QueryOf<
    Pick<Customer, "id" | "company_name">
  >
  return data ?? []
}
