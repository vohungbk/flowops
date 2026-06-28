import type { Metadata } from "next"
import { getPipelineData } from "@/lib/queries/deals"
import { PipelineStageConfig } from "@/components/pipeline/pipeline-stage-config"
import { ChevronLeft } from "lucide-react"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Pipeline Stages",
  description: "Add, reorder, and configure the stages in your sales pipeline.",
}

export default async function PipelineSettingsPage() {
  const stages = await getPipelineData()
  const stagesOnly = stages.map(({ deals: _, ...stage }) => stage)

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/settings"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          Settings
        </Link>
        <h1 className="mt-2 text-2xl font-bold tracking-tight">Pipeline Stages</h1>
        <p className="text-sm text-muted-foreground">
          Customize the stages in your sales pipeline.
        </p>
      </div>

      <PipelineStageConfig stages={stagesOnly} />
    </div>
  )
}
