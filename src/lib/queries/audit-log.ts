import { createClient } from "@/lib/supabase/server"
import { PAGINATION_PAGE_SIZE } from "@/lib/constants"
import type { AuditLog, Profile } from "@/types"

export type AuditLogWithUser = AuditLog & {
  user: Pick<Profile, "id" | "full_name" | "avatar_url"> | null
}

export type GetAuditLogsParams = {
  action?: string
  entityType?: string
  userId?: string
  period?: string
  page?: number
}

export async function getAuditLogs({
  action,
  entityType,
  userId,
  period,
  page = 1,
}: GetAuditLogsParams = {}): Promise<{
  data: AuditLogWithUser[]
  total: number
  page: number
  pageSize: number
}> {
  const supabase = await createClient()
  const pageSize = PAGINATION_PAGE_SIZE
  const rangeFrom = (page - 1) * pageSize
  const rangeTo = rangeFrom + pageSize - 1

  let query = supabase
    .from("audit_logs")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(rangeFrom, rangeTo)

  if (action && action !== "all") query = query.eq("action", action)
  if (entityType && entityType !== "all") query = query.eq("entity_type", entityType)
  if (userId && userId !== "all") query = query.eq("user_id", userId)

  if (period && period !== "all") {
    const now = new Date()
    let cutoff: Date
    if (period === "today") {
      cutoff = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    } else if (period === "week") {
      cutoff = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    } else {
      cutoff = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    }
    query = query.gte("created_at", cutoff.toISOString())
  }

  const { data, count } = await query
  const logs = (data ?? []) as AuditLog[]

  // Fetch profile data for each unique user in this page
  const userIds = [...new Set(logs.map((l) => l.user_id))]
  let profiles: Pick<Profile, "id" | "full_name" | "avatar_url">[] = []
  if (userIds.length > 0) {
    const { data: profileRows } = await supabase
      .from("profiles")
      .select("id, full_name, avatar_url")
      .in("id", userIds)
    profiles = (profileRows ?? []) as typeof profiles
  }

  const profileMap = new Map(profiles.map((p) => [p.id, p]))

  return {
    data: logs.map((log) => ({
      ...log,
      user: profileMap.get(log.user_id) ?? null,
    })),
    total: count ?? 0,
    page,
    pageSize,
  }
}

export async function getProfilesForSelect(): Promise<
  Pick<Profile, "id" | "full_name">[]
> {
  const supabase = await createClient()
  const { data } = await supabase
    .from("profiles")
    .select("id, full_name")
    .order("full_name")
  return (data ?? []) as Pick<Profile, "id" | "full_name">[]
}
