import { createClient } from "@/lib/supabase/server"
import type { AppNotification, Profile } from "@/types"

export type NotificationWithActor = AppNotification & {
  actor: Pick<Profile, "id" | "full_name"> | null
}

export async function getNotifications(limit = 20): Promise<{
  notifications: NotificationWithActor[]
  unreadCount: number
}> {
  const supabase = await createClient()

  const [{ data: recent }, { count: unread }] = await Promise.all([
    supabase
      .from("notifications")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit),
    supabase
      .from("notifications")
      .select("*", { count: "exact", head: true })
      .eq("is_read", false),
  ])

  const rows = (recent ?? []) as AppNotification[]

  const actorIds = [
    ...new Set(rows.map((n) => n.actor_id).filter((id): id is string => id !== null)),
  ]
  let actors: Pick<Profile, "id" | "full_name">[] = []
  if (actorIds.length > 0) {
    const { data } = await supabase
      .from("profiles")
      .select("id, full_name")
      .in("id", actorIds)
    actors = (data ?? []) as typeof actors
  }

  const actorMap = new Map(actors.map((a) => [a.id, a]))

  return {
    notifications: rows.map((n) => ({
      ...n,
      actor: n.actor_id ? (actorMap.get(n.actor_id) ?? null) : null,
    })),
    unreadCount: unread ?? 0,
  }
}
