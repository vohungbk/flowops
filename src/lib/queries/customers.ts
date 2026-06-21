import { createClient } from "@/lib/supabase/server"
import { PAGINATION_PAGE_SIZE } from "@/lib/constants"
import type { Customer } from "@/types"

export type GetCustomersParams = {
  search?: string
  status?: string
  page?: number
}

export async function getCustomers({
  search,
  status,
  page = 1,
}: GetCustomersParams = {}): Promise<{
  data: Customer[]
  total: number
  page: number
  pageSize: number
}> {
  const supabase = await createClient()
  const pageSize = PAGINATION_PAGE_SIZE
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  let query = supabase
    .from("customers")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to)

  if (search?.trim()) {
    const term = search.trim()
    query = query.or(
      `company_name.ilike.%${term}%,contact_name.ilike.%${term}%,email.ilike.%${term}%`
    )
  }

  if (status && status !== "all") {
    query = query.eq("status", status as Customer["status"])
  }

  const { data, count } = await query

  return {
    data: (data ?? []) as Customer[],
    total: count ?? 0,
    page,
    pageSize,
  }
}
