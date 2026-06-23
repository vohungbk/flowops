import { KanbanBoard } from "@/components/pipeline/kanban-board"
import { getPipelineData, getCustomersForSelect } from "@/lib/queries/deals"

export default async function PipelinePage() {
  const [stages, customers] = await Promise.all([
    getPipelineData(),
    getCustomersForSelect(),
  ])

  return <KanbanBoard stages={stages} customers={customers} />
}
