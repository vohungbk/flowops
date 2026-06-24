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

  type CustomerRow = {
    company_name: string
    contact_name: string
    email: string | null
    phone: string | null
    website: string | null
    industry: string | null
    status: string
    address: string | null
    notes: string | null
    created_at: string
  }

  const { data } = (await supabase
    .from("customers")
    .select("company_name, contact_name, email, phone, website, industry, status, address, notes, created_at")
    .order("created_at", { ascending: false })) as unknown as { data: CustomerRow[] | null }

  const rows = (data ?? []).map((c) => ({
    company_name: c.company_name,
    contact_name: c.contact_name,
    email: c.email ?? "",
    phone: c.phone ?? "",
    website: c.website ?? "",
    industry: c.industry ?? "",
    status: c.status,
    address: c.address ?? "",
    notes: c.notes ?? "",
    created_at: c.created_at,
  }))

  const csv = toCSV(rows as Record<string, unknown>[])
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="customers-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  })
}
