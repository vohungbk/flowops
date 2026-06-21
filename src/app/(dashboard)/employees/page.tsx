import { UserCog } from "lucide-react"

export default function EmployeesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Employees</h1>
        <p className="text-muted-foreground">Manage your team members.</p>
      </div>
      <div className="flex items-center gap-3 rounded-lg border border-dashed p-8 text-muted-foreground">
        <UserCog className="h-5 w-5" />
        <span className="text-sm">Employee management coming soon.</span>
      </div>
    </div>
  )
}
