import { LayoutDashboard } from "lucide-react"

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here's your business overview.</p>
      </div>
      <div className="flex items-center gap-3 rounded-lg border border-dashed p-8 text-muted-foreground">
        <LayoutDashboard className="h-5 w-5" />
        <span className="text-sm">Dashboard content coming soon — KPI cards, charts, activity feed.</span>
      </div>
    </div>
  )
}
