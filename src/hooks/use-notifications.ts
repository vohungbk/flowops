"use client"

import { useEffect, useRef, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import type { NotificationWithActor } from "@/lib/queries/notifications"

export function useNotifications(
  initial: NotificationWithActor[],
  initialUnread: number
) {
  const [notifications, setNotifications] = useState(initial)
  const [unreadCount, setUnreadCount] = useState(initialUnread)
  // Track IDs we optimistically marked read so Realtime UPDATE echoes don't re-decrement
  const pendingReadIds = useRef<Set<string>>(new Set())

  useEffect(() => {
    const supabase = createClient()

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return

      const channel = supabase
        .channel("user-notifications")
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "notifications",
            filter: `user_id=eq.${user.id}`,
          },
          async (payload) => {
            const row = payload.new as NotificationWithActor
            // Fetch actor name if present
            if (row.actor_id) {
              const { data } = await supabase
                .from("profiles")
                .select("id, full_name")
                .eq("id", row.actor_id)
                .single()
              row.actor = data as Pick<{ id: string; full_name: string }, "id" | "full_name"> | null
            } else {
              row.actor = null
            }
            setNotifications((prev) => [row, ...prev].slice(0, 20))
            setUnreadCount((prev) => prev + 1)
          }
        )
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "notifications",
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            const updated = payload.new as { id: string; is_read: boolean }
            // Ignore echoes of our own optimistic updates
            if (updated.is_read && pendingReadIds.current.has(updated.id)) {
              pendingReadIds.current.delete(updated.id)
              return
            }
            setNotifications((prev) =>
              prev.map((n) =>
                n.id === updated.id ? { ...n, is_read: updated.is_read } : n
              )
            )
          }
        )
        .subscribe()

      return () => { supabase.removeChannel(channel) }
    })
  }, [])

  function optimisticMarkAllRead(ids: string[]) {
    ids.forEach((id) => pendingReadIds.current.add(id))
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
    setUnreadCount(0)
  }

  return { notifications, unreadCount, optimisticMarkAllRead }
}
