"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { getCurrentProfile } from "@/lib/actions/auth"
import { leadSchema } from "@/lib/validations/lead"
import { ROUTES } from "@/lib/constants"
import type { ActionResult } from "@/types"

function toNull(v: string | undefined | null): string | null {
  return v?.trim() || null
}

type PgMutationResult = { error: { message: string } | null }

const FIELDS = [
  "first_name",
  "last_name",
  "email",
  "phone",
  "company",
  "job_title",
  "source",
  "status",
  "score",
  "notes",
] as const

export async function createLead(
  _prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const profile = await getCurrentProfile()
  if (!profile) return { success: false, error: "Not authenticated" }

  const raw = Object.fromEntries(FIELDS.map((k) => [k, formData.get(k) as string]))
  const parsed = leadSchema.safeParse(raw)
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message }

  const supabase = await createClient()
  const { error } = (await (supabase.from("leads") as unknown as {
    insert: (v: object) => Promise<PgMutationResult>
  }).insert({
    first_name: parsed.data.first_name,
    last_name: toNull(parsed.data.last_name),
    email: toNull(parsed.data.email),
    phone: toNull(parsed.data.phone),
    company: toNull(parsed.data.company),
    job_title: toNull(parsed.data.job_title),
    source: parsed.data.source,
    status: parsed.data.status,
    score: parsed.data.score,
    notes: toNull(parsed.data.notes),
    created_by: profile.id,
  }))

  if (error) return { success: false, error: error.message }

  revalidatePath(ROUTES.leads)
  return { success: true, data: null }
}

export async function updateLead(
  id: string,
  _prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const profile = await getCurrentProfile()
  if (!profile) return { success: false, error: "Not authenticated" }

  const raw = Object.fromEntries(FIELDS.map((k) => [k, formData.get(k) as string]))
  const parsed = leadSchema.safeParse(raw)
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message }

  const supabase = await createClient()
  const { error } = (await (supabase.from("leads") as unknown as {
    update: (v: object) => { eq: (col: string, val: string) => Promise<PgMutationResult> }
  }).update({
    first_name: parsed.data.first_name,
    last_name: toNull(parsed.data.last_name),
    email: toNull(parsed.data.email),
    phone: toNull(parsed.data.phone),
    company: toNull(parsed.data.company),
    job_title: toNull(parsed.data.job_title),
    source: parsed.data.source,
    status: parsed.data.status,
    score: parsed.data.score,
    notes: toNull(parsed.data.notes),
  }).eq("id", id))

  if (error) return { success: false, error: error.message }

  revalidatePath(`${ROUTES.leads}/${id}`)
  revalidatePath(ROUTES.leads)
  return { success: true, data: null }
}

export async function deleteLead(id: string): Promise<ActionResult> {
  const profile = await getCurrentProfile()
  if (!profile) return { success: false, error: "Not authenticated" }

  const supabase = await createClient()
  const { error } = (await (supabase.from("leads") as unknown as {
    delete: () => { eq: (col: string, val: string) => Promise<PgMutationResult> }
  }).delete().eq("id", id))

  if (error) return { success: false, error: error.message }

  revalidatePath(ROUTES.leads)
  return { success: true, data: null }
}

export async function convertLead(id: string): Promise<ActionResult<{ customerId: string }>> {
  const profile = await getCurrentProfile()
  if (!profile) return { success: false, error: "Not authenticated" }

  const supabase = await createClient()

  type SingleOf<T> = { data: T | null; error: { message: string } | null }
  type LeadRow = {
    first_name: string
    last_name: string | null
    email: string | null
    phone: string | null
    company: string | null
  }

  const { data: lead, error: fetchError } = (await supabase
    .from("leads")
    .select("first_name, last_name, email, phone, company")
    .eq("id", id)
    .single()) as unknown as SingleOf<LeadRow>

  if (fetchError || !lead) return { success: false, error: "Lead not found" }

  const contactName = [lead.first_name, lead.last_name].filter(Boolean).join(" ")
  const companyName = lead.company || contactName

  // Insert customer
  type InsertResult = { data: { id: string }[] | null; error: { message: string } | null }
  const { data: customerData, error: insertError } = (await (supabase.from("customers") as unknown as {
    insert: (v: object) => { select: (cols: string) => Promise<InsertResult> }
  }).insert({
    company_name: companyName,
    contact_name: contactName,
    email: lead.email,
    phone: lead.phone,
    status: "active",
    created_by: profile.id,
  }).select("id"))

  if (insertError || !customerData?.[0]) {
    return { success: false, error: insertError?.message ?? "Failed to create customer" }
  }

  const customerId = customerData[0].id

  // Mark lead as converted + link to customer
  const { error: updateError } = (await (supabase.from("leads") as unknown as {
    update: (v: object) => { eq: (col: string, val: string) => Promise<PgMutationResult> }
  }).update({
    status: "converted",
    converted_to_customer_id: customerId,
  }).eq("id", id))

  if (updateError) return { success: false, error: updateError.message }

  revalidatePath(ROUTES.leads)
  revalidatePath(ROUTES.customers)
  return { success: true, data: { customerId } }
}
