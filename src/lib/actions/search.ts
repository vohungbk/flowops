"use server"

import { createClient } from "@/lib/supabase/server"

export type SearchResult = {
  type: "customer" | "lead" | "deal"
  id: string
  label: string
  sub: string
  href: string
}

type CustomerRow = { id: string; company_name: string; contact_name: string; email: string | null }
type LeadRow = { id: string; first_name: string; last_name: string; email: string | null; company: string | null }
type DealRow = { id: string; title: string }

export async function searchEntities(query: string): Promise<SearchResult[]> {
  const q = query.trim()
  if (!q || q.length < 2) return []

  const supabase = await createClient()
  const like = `%${q}%`

  const [{ data: customers }, { data: leads }, { data: deals }] = await Promise.all([
    supabase
      .from("customers")
      .select("id, company_name, contact_name, email")
      .or(`company_name.ilike.${like},contact_name.ilike.${like},email.ilike.${like}`)
      .limit(4) as unknown as Promise<{ data: CustomerRow[] | null }>,
    supabase
      .from("leads")
      .select("id, first_name, last_name, email, company")
      .or(`first_name.ilike.${like},last_name.ilike.${like},email.ilike.${like},company.ilike.${like}`)
      .limit(4) as unknown as Promise<{ data: LeadRow[] | null }>,
    supabase
      .from("deals")
      .select("id, title")
      .ilike("title", like)
      .limit(4) as unknown as Promise<{ data: DealRow[] | null }>,
  ])

  const results: SearchResult[] = []

  for (const c of customers ?? []) {
    results.push({
      type: "customer",
      id: c.id,
      label: c.company_name,
      sub: c.contact_name ?? c.email ?? "",
      href: `/customers/${c.id}`,
    })
  }

  for (const l of leads ?? []) {
    results.push({
      type: "lead",
      id: l.id,
      label: `${l.first_name} ${l.last_name}`.trim(),
      sub: l.company ?? l.email ?? "",
      href: `/leads/${l.id}`,
    })
  }

  for (const d of deals ?? []) {
    results.push({
      type: "deal",
      id: d.id,
      label: d.title,
      sub: "Deal",
      href: `/pipeline`,
    })
  }

  return results
}
