import type { Lead } from "@/types"

export type ActivityCounts = {
  meeting: number
  call: number
  email: number
  task: number
  note: number
}

export type ScoreBreakdown = {
  completeness: number // max 25 — email, phone, company, job_title
  source: number       // max 25 — referral → other
  status: number       // max 20 — new → converted
  engagement: number   // max 30 — activity count × weight, capped per type
  total: number        // 0–100
}

const SOURCE_SCORES: Record<Lead["source"], number> = {
  referral: 25,
  event: 20,
  linkedin: 15,
  web: 10,
  "cold-outreach": 5,
  other: 5,
}

const STATUS_SCORES: Record<Lead["status"], number> = {
  converted: 20,
  qualified: 20,
  contacted: 10,
  new: 5,
  disqualified: 0,
}

export function calculateLeadScore(
  lead: Pick<Lead, "email" | "phone" | "company" | "job_title" | "source" | "status">,
  counts: ActivityCounts = { meeting: 0, call: 0, email: 0, task: 0, note: 0 }
): ScoreBreakdown {
  const completeness =
    (lead.email ? 10 : 0) +
    (lead.phone ? 5 : 0) +
    (lead.company ? 5 : 0) +
    (lead.job_title ? 5 : 0)

  const source = SOURCE_SCORES[lead.source] ?? 5
  const status = STATUS_SCORES[lead.status] ?? 0

  const rawEngagement =
    Math.min(counts.meeting * 8, 24) +
    Math.min(counts.call * 4, 12) +
    Math.min(counts.email * 3, 12) +
    Math.min(counts.task * 2, 8) +
    Math.min(counts.note * 1, 4)
  const engagement = Math.min(rawEngagement, 30)

  const total = Math.min(completeness + source + status + engagement, 100)

  return { completeness, source, status, engagement, total }
}
