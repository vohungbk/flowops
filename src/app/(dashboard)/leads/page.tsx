import { UserPlus } from "lucide-react"

export default function LeadsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Leads</h1>
        <p className="text-muted-foreground">Track and nurture your leads.</p>
      </div>
      <div className="flex items-center gap-3 rounded-lg border border-dashed p-8 text-muted-foreground">
        <UserPlus className="h-5 w-5" />
        <span className="text-sm">Lead management coming soon.</span>
      </div>
    </div>
  )
}
