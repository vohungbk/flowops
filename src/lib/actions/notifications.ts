"use server"

import { createClient } from "@/lib/supabase/server"

export async function markNotificationsRead(ids: string[] | "all"): Promise<void> {
  const supabase = await createClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const col = supabase.from("notifications") as any
  if (ids === "all") {
    await col.update({ is_read: true }).eq("is_read", false)
  } else if (ids.length > 0) {
    await col.update({ is_read: true }).in("id", ids)
  }
}
