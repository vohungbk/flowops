import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

function toCSV(rows: Record<string, unknown>[]): string {
  if (rows.length === 0) return ""
  const headers = Object.keys(rows[0])
  const lines = [
    headers.join(","),
    ...rows.map((row) =>
      headers
        .map((h) => {
          const val = row[h]
          if (val === null || val === undefined) return ""
          const str = String(val).replace(/"/g, '""')
          return str.includes(",") || str.includes('"') || str.includes("\n")
            ? `"${str}"`
            : str
        })
        .join(",")
    ),
  ]
  return lines.join("\n")
}

export async function GET() {
  const supabase = await createClient()

  const { data: user } = await supabase.auth.getUser()
  if (!user.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  type LeadRow = {
    first_name: string
    last_name: string
    email: string | null
    phone: string | null
    company: string | null
    job_title: string | null
    source: string
    status: string
    score: number
    notes: string | null
    created_at: string
  }

  const { data } = (await supabase
    .from("leads")
    .select("first_name, last_name, email, phone, company, job_title, source, status, score, notes, created_at")
    .order("created_at", { ascending: false })) as unknown as { data: LeadRow[] | null }

  const rows = (data ?? []).map((l) => ({
    first_name: l.first_name,
    last_name: l.last_name,
    email: l.email ?? "",
    phone: l.phone ?? "",
    company: l.company ?? "",
    job_title: l.job_title ?? "",
    source: l.source,
    status: l.status,
    score: l.score,
    notes: l.notes ?? "",
    created_at: l.created_at,
  }))

  const csv = toCSV(rows as Record<string, unknown>[])
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="leads-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  })
}
