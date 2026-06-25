"use client"

import { useEffect, useRef } from "react"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import type { StageWithDeals, DealCardData } from "@/lib/queries/deals"
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js"
import type { Tables } from "@/types/database"

type DealRow = Tables<"deals">

async function fetchDealWithJoins(
  dealId: string
): Promise<DealCardData | null> {
  const supabase = createClient()
  const { data } = await supabase
    .from("deals")
    .select(
      "*, customer:customers(id, company_name), assigned_profile:profiles!deals_assigned_to_fkey(id, full_name, avatar_url)"
    )
    .eq("id", dealId)
    .single()
  return (data as unknown as DealCardData) ?? null
}

export function usePipelineRealtime(
  setStages: React.Dispatch<React.SetStateAction<StageWithDeals[]>>
) {
  // Track deal IDs that are in-flight from this client's own mutations
  // so we don't double-apply them when the realtime event arrives.
  const pendingIds = useRef<Set<string>>(new Set())

  function markPending(id: string) {
    pendingIds.current.add(id)
    // Clear after a safe window; realtime events normally arrive < 1 s
    setTimeout(() => pendingIds.current.delete(id), 3000)
  }

  useEffect(() => {
    const supabase = createClient()

    const channel = supabase
      .channel("pipeline-deals")
      .on<DealRow>(
        "postgres_changes",
        { event: "*", schema: "public", table: "deals" },
        async (payload: RealtimePostgresChangesPayload<DealRow>) => {
          // ── DELETE ──────────────────────────────────────────────────────────
          if (payload.eventType === "DELETE") {
            const id = payload.old.id
            if (!id) return
            if (pendingIds.current.has(id)) return
            setStages((prev) =>
              prev.map((stage) => ({
                ...stage,
                deals: stage.deals.filter((d) => d.id !== id),
              }))
            )
            toast.info("A deal was removed by another user.")
            return
          }

          // ── INSERT / UPDATE ──────────────────────────────────────────────
          const id = payload.new.id
          // Skip our own optimistic updates
          if (pendingIds.current.has(id)) return

          const deal = await fetchDealWithJoins(id)
          if (!deal) return

          if (payload.eventType === "INSERT") {
            setStages((prev) =>
              prev.map((stage) => {
                if (stage.id !== deal.stage_id) return stage
                // Guard against duplicates from concurrent optimistic + realtime
                if (stage.deals.some((d) => d.id === id)) return stage
                return { ...stage, deals: [...stage.deals, deal] }
              })
            )
            toast.info(`New deal added: "${deal.title}"`)
          } else {
            // UPDATE — remove from whichever stage holds it, insert in the correct one
            setStages((prev) => {
              const stripped = prev.map((stage) => ({
                ...stage,
                deals: stage.deals.filter((d) => d.id !== id),
              }))
              return stripped.map((stage) => {
                if (stage.id !== deal.stage_id) return stage
                return { ...stage, deals: [...stage.deals, deal] }
              })
            })
            toast.info(`Deal updated: "${deal.title}"`)
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [setStages])

  return { markPending }
}
