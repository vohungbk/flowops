import { createClient } from "@/lib/supabase/server"
import type { KpiMetrics, RevenueDataPoint, PipelineStageSummary } from "@/types"

// ─── Shared cast helpers ──────────────────────────────────────────────────────

type CountResult = { count: number | null; data: null }
type QueryOf<T> = { data: T[] | null }

// Raw row shapes used across multiple queries
type StageRow = {
  id: string
  name: string
  order_index: number
  color: string | null
  probability: number
  is_closed_won: boolean
  is_closed_lost: boolean
  created_at: string
}

type DealRow = {
  id: string
  title: string
  value: number
  stage_id: string
  actual_close_date: string | null
}

// ─── KPI metrics ──────────────────────────────────────────────────────────────

export async function getKpiMetrics(): Promise<KpiMetrics> {
  const supabase = await createClient()

  const now = new Date()
  const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString()
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59).toISOString()
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

  const [
    customersResult,
    newCustomersResult,
    activeLeadsResult,
    activitiesResult,
    dealsResult,
    stagesResult,
  ] = (await Promise.all([
    supabase.from("customers").select("*", { count: "exact", head: true }),
    supabase.from("customers").select("*", { count: "exact", head: true }).gte("created_at", startOfThisMonth),
    supabase.from("leads").select("*", { count: "exact", head: true }).not("status", "in", "(converted,disqualified)"),
    supabase.from("activities").select("*", { count: "exact", head: true }).gte("created_at", sevenDaysAgo),
    supabase.from("deals").select("id, value, stage_id, actual_close_date"),
    supabase.from("pipeline_stages").select("id, is_closed_won, is_closed_lost"),
  ])) as unknown as [CountResult, CountResult, CountResult, CountResult, QueryOf<DealRow>, QueryOf<Pick<StageRow, "id" | "is_closed_won" | "is_closed_lost">>]

  const deals = dealsResult.data ?? []
  const stageMap = new Map((stagesResult.data ?? []).map((s) => [s.id, s]))

  const openDeals = deals.filter((d) => {
    const s = stageMap.get(d.stage_id)
    return s && !s.is_closed_won && !s.is_closed_lost
  })
  const wonDeals = deals.filter((d) => stageMap.get(d.stage_id)?.is_closed_won)
  const lostDeals = deals.filter((d) => stageMap.get(d.stage_id)?.is_closed_lost)

  const monthlyRevenue = wonDeals
    .filter((d) => d.actual_close_date && d.actual_close_date >= startOfThisMonth)
    .reduce((s, d) => s + d.value, 0)

  const monthlyRevenueLastMonth = wonDeals
    .filter(
      (d) =>
        d.actual_close_date &&
        d.actual_close_date >= startOfLastMonth &&
        d.actual_close_date <= endOfLastMonth
    )
    .reduce((s, d) => s + d.value, 0)

  const pipelineValue = openDeals.reduce((s, d) => s + d.value, 0)
  const totalClosed = wonDeals.length + lostDeals.length
  const winRate = totalClosed > 0 ? Math.round((wonDeals.length / totalClosed) * 100) : 0
  const avgDealSize = openDeals.length > 0 ? Math.round(pipelineValue / openDeals.length) : 0

  return {
    totalCustomers: customersResult.count ?? 0,
    newCustomersThisMonth: newCustomersResult.count ?? 0,
    totalLeads: activeLeadsResult.count ?? 0,
    activeDeals: openDeals.length,
    monthlyRevenue,
    monthlyRevenueLastMonth,
    pipelineValue,
    winRate,
    avgDealSize,
    activitiesThisWeek: activitiesResult.count ?? 0,
  }
}

// ─── Revenue chart (last N months of closed-won revenue) ─────────────────────

export async function getRevenueChartData(months = 12): Promise<RevenueDataPoint[]> {
  const supabase = await createClient()

  const now = new Date()
  const startDate = new Date(now.getFullYear(), now.getMonth() - months + 1, 1).toISOString()

  const [dealsResult, stagesResult] = (await Promise.all([
    supabase
      .from("deals")
      .select("value, actual_close_date, stage_id")
      .gte("actual_close_date", startDate)
      .not("actual_close_date", "is", null),
    supabase.from("pipeline_stages").select("id").eq("is_closed_won", true),
  ])) as unknown as [
    QueryOf<Pick<DealRow, "value" | "actual_close_date" | "stage_id">>,
    QueryOf<{ id: string }>,
  ]

  const wonStageIds = new Set((stagesResult.data ?? []).map((s) => s.id))

  // Build ordered month buckets
  const buckets: Record<string, number> = {}
  const labels: { key: string; month: string }[] = []
  for (let i = 0; i < months; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - months + 1 + i, 1)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
    const label = d.toLocaleDateString("en-US", { month: "short", year: "2-digit" })
    buckets[key] = 0
    labels.push({ key, month: label })
  }

  for (const deal of dealsResult.data ?? []) {
    if (!deal.actual_close_date || !wonStageIds.has(deal.stage_id)) continue
    const d = new Date(deal.actual_close_date)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
    if (key in buckets) buckets[key] += deal.value
  }

  return labels.map(({ key, month }) => ({ month, revenue: buckets[key] }))
}

// ─── Pipeline chart (deals per stage) ────────────────────────────────────────

export async function getPipelineChartData(): Promise<PipelineStageSummary[]> {
  const supabase = await createClient()

  const [stagesResult, dealsResult] = (await Promise.all([
    supabase.from("pipeline_stages").select("*").order("order_index"),
    supabase.from("deals").select("stage_id, value"),
  ])) as unknown as [QueryOf<StageRow>, QueryOf<{ stage_id: string; value: number }>]

  const stages = stagesResult.data ?? []
  const deals = dealsResult.data ?? []

  const countMap: Record<string, { count: number; value: number }> = {}
  for (const d of deals) {
    if (!countMap[d.stage_id]) countMap[d.stage_id] = { count: 0, value: 0 }
    countMap[d.stage_id].count += 1
    countMap[d.stage_id].value += d.value
  }

  return stages.map((stage) => ({
    ...stage,
    dealCount: countMap[stage.id]?.count ?? 0,
    totalValue: countMap[stage.id]?.value ?? 0,
  }))
}

// ─── Recent activities ────────────────────────────────────────────────────────

export type RecentActivityRow = {
  id: string
  type: "call" | "email" | "meeting" | "note" | "task"
  subject: string
  created_at: string
  customer_name: string | null
  lead_first_name: string | null
  lead_last_name: string | null
}

export async function getRecentActivities(limit = 8): Promise<RecentActivityRow[]> {
  const supabase = await createClient()

  type RawRow = {
    id: string
    type: "call" | "email" | "meeting" | "note" | "task"
    subject: string
    created_at: string
    customer: { company_name: string } | null
    lead: { first_name: string; last_name: string | null } | null
  }

  const { data } = (await supabase
    .from("activities")
    .select("id, type, subject, created_at, customer:customers(company_name), lead:leads(first_name, last_name)")
    .order("created_at", { ascending: false })
    .limit(limit)) as unknown as QueryOf<RawRow>

  return (data ?? []).map((row) => ({
    id: row.id,
    type: row.type,
    subject: row.subject,
    created_at: row.created_at,
    customer_name: row.customer?.company_name ?? null,
    lead_first_name: row.lead?.first_name ?? null,
    lead_last_name: row.lead?.last_name ?? null,
  }))
}

// ─── Lead source breakdown ───────────────────────────────────────────────────

export type LeadSourceDataPoint = {
  source: string
  label: string
  count: number
}

export async function getLeadSourceBreakdown(): Promise<LeadSourceDataPoint[]> {
  const supabase = await createClient()

  type SourceRow = { source: string }
  const { data } = (await supabase
    .from("leads")
    .select("source")) as unknown as QueryOf<SourceRow>

  const SOURCE_LABELS: Record<string, string> = {
    web: "Website",
    referral: "Referral",
    linkedin: "LinkedIn",
    event: "Event",
    "cold-outreach": "Cold Outreach",
    other: "Other",
  }

  const counts: Record<string, number> = {}
  for (const row of data ?? []) {
    counts[row.source] = (counts[row.source] ?? 0) + 1
  }

  return Object.entries(counts)
    .map(([source, count]) => ({
      source,
      label: SOURCE_LABELS[source] ?? source,
      count,
    }))
    .sort((a, b) => b.count - a.count)
}

// ─── Conversion funnel (lead statuses) ───────────────────────────────────────

export type FunnelDataPoint = {
  status: string
  label: string
  count: number
}

export async function getConversionFunnel(): Promise<FunnelDataPoint[]> {
  const supabase = await createClient()

  type StatusRow = { status: string }
  const { data } = (await supabase
    .from("leads")
    .select("status")) as unknown as QueryOf<StatusRow>

  const STATUS_ORDER = ["new", "contacted", "qualified", "converted", "disqualified"]
  const STATUS_LABELS: Record<string, string> = {
    new: "New",
    contacted: "Contacted",
    qualified: "Qualified",
    converted: "Converted",
    disqualified: "Disqualified",
  }

  const counts: Record<string, number> = {}
  for (const row of data ?? []) {
    counts[row.status] = (counts[row.status] ?? 0) + 1
  }

  return STATUS_ORDER
    .filter((s) => counts[s] !== undefined)
    .map((status) => ({
      status,
      label: STATUS_LABELS[status] ?? status,
      count: counts[status] ?? 0,
    }))
}

// ─── Rep leaderboard ─────────────────────────────────────────────────────────

export type RepLeaderboardRow = {
  id: string
  full_name: string
  avatar_url: string | null
  deals_won: number
  revenue: number
  active_deals: number
}

export async function getRepLeaderboard(): Promise<RepLeaderboardRow[]> {
  const supabase = await createClient()

  type ProfileRow = { id: string; full_name: string; avatar_url: string | null }
  type DealRepRow = { assigned_to: string | null; value: number; stage_id: string }
  type StageRow = { id: string; is_closed_won: boolean; is_closed_lost: boolean }

  const [profilesResult, dealsResult, stagesResult] = (await Promise.all([
    supabase
      .from("profiles")
      .select("id, full_name, avatar_url")
      .eq("is_active", true)
      .in("role", ["employee", "manager"]),
    supabase.from("deals").select("assigned_to, value, stage_id"),
    supabase.from("pipeline_stages").select("id, is_closed_won, is_closed_lost"),
  ])) as unknown as [QueryOf<ProfileRow>, QueryOf<DealRepRow>, QueryOf<StageRow>]

  const stageMap = new Map((stagesResult.data ?? []).map((s) => [s.id, s]))
  const deals = dealsResult.data ?? []

  const stats: Record<string, { deals_won: number; revenue: number; active_deals: number }> = {}
  for (const deal of deals) {
    if (!deal.assigned_to) continue
    if (!stats[deal.assigned_to]) {
      stats[deal.assigned_to] = { deals_won: 0, revenue: 0, active_deals: 0 }
    }
    const stage = stageMap.get(deal.stage_id)
    if (stage?.is_closed_won) {
      stats[deal.assigned_to].deals_won += 1
      stats[deal.assigned_to].revenue += deal.value
    } else if (!stage?.is_closed_lost) {
      stats[deal.assigned_to].active_deals += 1
    }
  }

  return (profilesResult.data ?? [])
    .map((p) => ({
      id: p.id,
      full_name: p.full_name,
      avatar_url: p.avatar_url,
      deals_won: stats[p.id]?.deals_won ?? 0,
      revenue: stats[p.id]?.revenue ?? 0,
      active_deals: stats[p.id]?.active_deals ?? 0,
    }))
    .sort((a, b) => b.revenue - a.revenue)
}

// ─── Top open deals ───────────────────────────────────────────────────────────

export type TopDealRow = {
  id: string
  title: string
  value: number
  stage_name: string
  stage_color: string | null
  company_name: string | null
  expected_close_date: string | null
  probability: number
}

export async function getTopDeals(limit = 5): Promise<TopDealRow[]> {
  const supabase = await createClient()

  type RawRow = {
    id: string
    title: string
    value: number
    expected_close_date: string | null
    probability: number
    stage: { name: string; color: string | null; is_closed_won: boolean; is_closed_lost: boolean }
    customer: { company_name: string } | null
  }

  const { data } = (await supabase
    .from("deals")
    .select(
      "id, title, value, expected_close_date, probability, stage:pipeline_stages(name, color, is_closed_won, is_closed_lost), customer:customers(company_name)"
    )
    .order("value", { ascending: false })
    .limit(limit * 3)) as unknown as QueryOf<RawRow>

  return (data ?? [])
    .filter((d) => !d.stage.is_closed_won && !d.stage.is_closed_lost)
    .slice(0, limit)
    .map((d) => ({
      id: d.id,
      title: d.title,
      value: d.value,
      stage_name: d.stage.name,
      stage_color: d.stage.color,
      company_name: d.customer?.company_name ?? null,
      expected_close_date: d.expected_close_date,
      probability: d.probability,
    }))
}
