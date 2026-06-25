"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { getCurrentProfile } from "@/lib/actions/auth"
import { ROUTES } from "@/lib/constants"
import type { ActionResult, UserRole } from "@/types"

type PgMutationResult = { error: { message: string } | null }

export async function inviteEmployee(
  _prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const profile = await getCurrentProfile()
  if (!profile || profile.role !== "admin")
    return { success: false, error: "Only admins can invite employees" }

  const email = (formData.get("email") as string)?.trim()
  const full_name = (formData.get("full_name") as string)?.trim()
  const role = ((formData.get("role") as string) || "employee") as UserRole
  const department = (formData.get("department") as string)?.trim() || null

  if (!email) return { success: false, error: "Email is required" }
  if (!full_name) return { success: false, error: "Full name is required" }

  const admin = createAdminClient()
  const { data, error } = await admin.auth.admin.inviteUserByEmail(email, {
    data: { full_name },
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
  })

  if (error) return { success: false, error: error.message }

  // The handle_new_user trigger creates the profile on auth.users insert.
  // Update it immediately with the requested role and department.
  if (data.user?.id) {
    const supabase = await createClient()
    await (supabase.from("profiles") as unknown as {
      update: (v: object) => { eq: (col: string, val: string) => Promise<PgMutationResult> }
    }).update({ role, department }).eq("id", data.user.id)
  }

  revalidatePath(ROUTES.employees)
  return { success: true, data: null }
}

export async function updateEmployeeRole(
  id: string,
  role: UserRole
): Promise<ActionResult> {
  const profile = await getCurrentProfile()
  if (!profile || profile.role !== "admin")
    return { success: false, error: "Only admins can change roles" }
  if (id === profile.id)
    return { success: false, error: "You cannot change your own role" }

  const supabase = await createClient()
  const { error } = (await (supabase.from("profiles") as unknown as {
    update: (v: object) => { eq: (col: string, val: string) => Promise<PgMutationResult> }
  }).update({ role }).eq("id", id))

  if (error) return { success: false, error: error.message }

  revalidatePath(ROUTES.employees)
  return { success: true, data: null }
}

export async function toggleEmployeeStatus(
  id: string,
  isActive: boolean
): Promise<ActionResult> {
  const profile = await getCurrentProfile()
  if (!profile || profile.role !== "admin")
    return { success: false, error: "Only admins can change employee status" }
  if (id === profile.id)
    return { success: false, error: "You cannot deactivate yourself" }

  const supabase = await createClient()
  const { error } = (await (supabase.from("profiles") as unknown as {
    update: (v: object) => { eq: (col: string, val: string) => Promise<PgMutationResult> }
  }).update({ is_active: isActive }).eq("id", id))

  if (error) return { success: false, error: error.message }

  revalidatePath(ROUTES.employees)
  return { success: true, data: null }
}
