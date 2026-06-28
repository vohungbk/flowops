import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { getCurrentProfile } from "@/lib/actions/auth"
import { getEmployees } from "@/lib/queries/employees"
import { EmployeeGrid } from "@/components/employees/employee-grid"
import { ROUTES } from "@/lib/constants"

export const metadata: Metadata = {
  title: "Employees",
  description: "Manage your team members, roles, and access permissions.",
}

export default async function EmployeesPage() {
  const profile = await getCurrentProfile()

  // Employees cannot access this page
  if (!profile || profile.role === "employee") {
    redirect(ROUTES.dashboard)
  }

  const employees = await getEmployees()

  return (
    <div className="space-y-6">
      <EmployeeGrid employees={employees} currentProfile={profile} />
    </div>
  )
}
