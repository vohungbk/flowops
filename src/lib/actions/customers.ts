"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { getCurrentProfile } from "@/lib/actions/auth"
import { customerSchema } from "@/lib/validations/customer"
import { ROUTES } from "@/lib/constants"
import type { ActionResult } from "@/types"

function toNull(v: string | undefined | null): string | null {
  return v?.trim() || null
}

// supabase-js TypeScript overloads collapse to `never` on insert/update/delete —
// cast results to this minimal type as the queries file does for select.
type PgMutationResult = { error: { message: string } | null }

const FIELDS = ["company_name", "contact_name", "email", "phone", "industry", "website", "address", "status", "notes"] as const

export async function createCustomer(
  _prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const profile = await getCurrentProfile()
  if (!profile) return { success: false, error: "Not authenticated" }

  const raw = Object.fromEntries(FIELDS.map((k) => [k, formData.get(k) as string]))
  const parsed = customerSchema.safeParse(raw)
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message }

  const supabase = await createClient()
  const { error } = (await (supabase.from("customers") as unknown as {
    insert: (v: object) => Promise<PgMutationResult>
  }).insert({
    company_name: parsed.data.company_name,
    contact_name: toNull(parsed.data.contact_name) ?? "",
    email: toNull(parsed.data.email),
    phone: toNull(parsed.data.phone),
    industry: toNull(parsed.data.industry),
    website: toNull(parsed.data.website),
    address: toNull(parsed.data.address),
    status: parsed.data.status,
    notes: toNull(parsed.data.notes),
    created_by: profile.id,
  }))

  if (error) return { success: false, error: error.message }

  revalidatePath(ROUTES.customers)
  return { success: true, data: null }
}

export async function updateCustomer(
  id: string,
  _prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const profile = await getCurrentProfile()
  if (!profile) return { success: false, error: "Not authenticated" }

  const raw = Object.fromEntries(FIELDS.map((k) => [k, formData.get(k) as string]))
  const parsed = customerSchema.safeParse(raw)
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message }

  const supabase = await createClient()
  const { error } = (await (supabase.from("customers") as unknown as {
    update: (v: object) => { eq: (col: string, val: string) => Promise<PgMutationResult> }
  }).update({
    company_name: parsed.data.company_name,
    contact_name: toNull(parsed.data.contact_name) ?? "",
    email: toNull(parsed.data.email),
    phone: toNull(parsed.data.phone),
    industry: toNull(parsed.data.industry),
    website: toNull(parsed.data.website),
    address: toNull(parsed.data.address),
    status: parsed.data.status,
    notes: toNull(parsed.data.notes),
  }).eq("id", id))

  if (error) return { success: false, error: error.message }

  revalidatePath(`${ROUTES.customers}/${id}`)
  revalidatePath(ROUTES.customers)
  return { success: true, data: null }
}

export async function deleteCustomer(id: string): Promise<ActionResult> {
  const profile = await getCurrentProfile()
  if (!profile) return { success: false, error: "Not authenticated" }

  const supabase = await createClient()
  const { error } = (await (supabase.from("customers") as unknown as {
    delete: () => { eq: (col: string, val: string) => Promise<PgMutationResult> }
  }).delete().eq("id", id))

  if (error) return { success: false, error: error.message }

  revalidatePath(ROUTES.customers)
  return { success: true, data: null }
}
