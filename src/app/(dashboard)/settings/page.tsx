import { Settings } from "lucide-react"

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Configure your workspace.</p>
      </div>
      <div className="flex items-center gap-3 rounded-lg border border-dashed p-8 text-muted-foreground">
        <Settings className="h-5 w-5" />
        <span className="text-sm">Settings coming soon.</span>
      </div>
    </div>
  )
}
