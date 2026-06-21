import { Kanban } from "lucide-react"

export default function PipelinePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Sales Pipeline</h1>
        <p className="text-muted-foreground">Visualize your deals across stages.</p>
      </div>
      <div className="flex items-center gap-3 rounded-lg border border-dashed p-8 text-muted-foreground">
        <Kanban className="h-5 w-5" />
        <span className="text-sm">Kanban pipeline coming soon.</span>
      </div>
    </div>
  )
}
