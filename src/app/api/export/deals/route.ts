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

  type DealRow = {
    title: string
    value: number
    currency: string
    probability: number
    expected_close_date: string | null
    actual_close_date: string | null
    notes: string | null
    created_at: string
    stage: { name: string } | null
    customer: { company_name: string } | null
    assigned_profile: { full_name: string } | null
  }

  const { data } = await supabase
    .from("deals")
    .select(
      "title, value, currency, probability, expected_close_date, actual_close_date, notes, created_at, stage:pipeline_stages(name), customer:customers(company_name), assigned_profile:profiles!assigned_to(full_name)"
    )
    .order("created_at", { ascending: false })

  const rows = ((data ?? []) as unknown as DealRow[]).map((d) => ({
    title: d.title,
    value: d.value,
    currency: d.currency,
    stage: d.stage?.name ?? "",
    customer: d.customer?.company_name ?? "",
    assigned_to: d.assigned_profile?.full_name ?? "",
    probability: d.probability,
    expected_close_date: d.expected_close_date ?? "",
    actual_close_date: d.actual_close_date ?? "",
    notes: d.notes ?? "",
    created_at: d.created_at,
  }))

  const csv = toCSV(rows as Record<string, unknown>[])
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="deals-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  })
}
