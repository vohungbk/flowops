import { createClient } from "@/lib/supabase/server"
import { PAGINATION_PAGE_SIZE } from "@/lib/constants"
import type { Customer, Profile, Tag, Deal, PipelineStage, Activity } from "@/types"

export async function getTags(): Promise<Tag[]> {
  const supabase = await createClient()
  const { data } = (await supabase
    .from("tags")
    .select("*")
    .order("name")) as unknown as { data: Tag[] | null }
  return data ?? []
}

export type GetCustomersParams = {
  search?: string
  status?: string
  page?: number
}

export async function getCustomers({
  search,
  status,
  page = 1,
}: GetCustomersParams = {}): Promise<{
  data: Customer[]
  total: number
  page: number
  pageSize: number
}> {
  const supabase = await createClient()
  const pageSize = PAGINATION_PAGE_SIZE
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  let query = supabase
    .from("customers")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to)

  if (search?.trim()) {
    const term = search.trim()
    query = query.or(
      `company_name.ilike.%${term}%,contact_name.ilike.%${term}%,email.ilike.%${term}%`
    )
  }

  if (status && status !== "all") {
    query = query.eq("status", status as Customer["status"])
  }

  const { data, count } = await query

  return {
    data: (data ?? []) as Customer[],
    total: count ?? 0,
    page,
    pageSize,
  }
}

// ─── Customer detail ──────────────────────────────────────────────────────────

export type CustomerDetail = Customer & {
  assigned_profile: Pick<Profile, "id" | "full_name" | "avatar_url"> | null
  tags: Tag[]
}

export type CustomerDeal = Deal & {
  stage: Pick<PipelineStage, "id" | "name" | "color" | "is_closed_won" | "is_closed_lost">
}

export type CustomerActivity = Activity

export async function getCustomerById(id: string): Promise<{
  customer: CustomerDetail | null
  deals: CustomerDeal[]
  activities: CustomerActivity[]
}> {
  const supabase = await createClient()

  // supabase-js alias syntax ("stage:pipeline_stages(...)") isn't typed by its
  // TypeScript overloads — the inferred return type collapses to `never` and
  // propagates through Promise.all.  Cast each result explicitly instead.
  type TagRow = { tags: Tag | null }
  type ProfileRow = Pick<Profile, "id" | "full_name" | "avatar_url">
  type QueryOf<T> = { data: T[] | null }
  type SingleOf<T> = { data: T | null }

  const { data: customerData, error: customerError } = (await supabase
    .from("customers")
    .select("*")
    .eq("id", id)
    .single()) as unknown as SingleOf<Customer> & { error: unknown }

  if (customerError || !customerData) {
    return { customer: null, deals: [], activities: [] }
  }

  const [tagsResult, dealsResult, activitiesResult] = (await Promise.all([
    supabase.from("customer_tags").select("tags(id, name, color)").eq("customer_id", id),
    supabase
      .from("deals")
      .select("*, stage:pipeline_stages(id, name, color, is_closed_won, is_closed_lost)")
      .eq("customer_id", id)
      .order("created_at", { ascending: false }),
    supabase.from("activities").select("*").eq("customer_id", id).order("created_at", { ascending: false }),
  ])) as unknown as [QueryOf<TagRow>, QueryOf<CustomerDeal>, QueryOf<Activity>]

  let assigned_profile: ProfileRow | null = null
  if (customerData.assigned_to) {
    const { data } = (await supabase
      .from("profiles")
      .select("id, full_name, avatar_url")
      .eq("id", customerData.assigned_to)
      .single()) as unknown as SingleOf<ProfileRow>
    assigned_profile = data
  }

  const tags = (tagsResult.data ?? [])
    .map((ct) => ct.tags)
    .filter((t): t is Tag => t !== null)

  return {
    customer: { ...customerData, assigned_profile, tags },
    deals: dealsResult.data ?? [],
    activities: activitiesResult.data ?? [],
  }
}
