import { createClient } from "@/lib/supabase/server"
import { PAGINATION_PAGE_SIZE } from "@/lib/constants"
import type { Lead, Profile, Activity } from "@/types"

export type GetLeadsParams = {
  search?: string
  status?: string
  source?: string
  page?: number
}

export async function getLeads({
  search,
  status,
  source,
  page = 1,
}: GetLeadsParams = {}): Promise<{
  data: Lead[]
  total: number
  page: number
  pageSize: number
}> {
  const supabase = await createClient()
  const pageSize = PAGINATION_PAGE_SIZE
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  let query = supabase
    .from("leads")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to)

  if (search?.trim()) {
    const term = search.trim()
    query = query.or(
      `first_name.ilike.%${term}%,last_name.ilike.%${term}%,email.ilike.%${term}%,company.ilike.%${term}%`
    )
  }

  if (status && status !== "all") {
    query = query.eq("status", status as Lead["status"])
  }

  if (source && source !== "all") {
    query = query.eq("source", source as Lead["source"])
  }

  const { data, count } = await query

  return {
    data: (data ?? []) as Lead[],
    total: count ?? 0,
    page,
    pageSize,
  }
}

// ─── Lead detail ──────────────────────────────────────────────────────────────

export type LeadDetail = Lead & {
  assigned_profile: Pick<Profile, "id" | "full_name" | "avatar_url"> | null
}

export type LeadActivity = Activity

export async function getLeadById(id: string): Promise<{
  lead: LeadDetail | null
  activities: LeadActivity[]
}> {
  const supabase = await createClient()

  type ProfileRow = Pick<Profile, "id" | "full_name" | "avatar_url">
  type SingleOf<T> = { data: T | null; error: unknown }
  type QueryOf<T> = { data: T[] | null }

  const { data: leadData, error: leadError } = (await supabase
    .from("leads")
    .select("*")
    .eq("id", id)
    .single()) as unknown as SingleOf<Lead>

  if (leadError || !leadData) {
    return { lead: null, activities: [] }
  }

  const [activitiesResult] = (await Promise.all([
    supabase
      .from("activities")
      .select("*")
      .eq("lead_id", id)
      .order("created_at", { ascending: false }),
  ])) as unknown as [QueryOf<Activity>]

  let assigned_profile: ProfileRow | null = null
  if (leadData.assigned_to) {
    const { data } = (await supabase
      .from("profiles")
      .select("id, full_name, avatar_url")
      .eq("id", leadData.assigned_to)
      .single()) as unknown as SingleOf<ProfileRow>
    assigned_profile = data
  }

  return {
    lead: { ...leadData, assigned_profile },
    activities: activitiesResult.data ?? [],
  }
}
