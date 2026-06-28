import type { Metadata } from "next"
import { KanbanBoard } from "@/components/pipeline/kanban-board"
import { getPipelineData, getCustomersForSelect } from "@/lib/queries/deals"

export const metadata: Metadata = {
  title: "Pipeline",
  description: "Visual Kanban board for managing deals through your sales stages.",
}

export default async function PipelinePage() {
  const [stages, customers] = await Promise.all([
    getPipelineData(),
    getCustomersForSelect(),
  ])

  return <KanbanBoard stages={stages} customers={customers} />
}
