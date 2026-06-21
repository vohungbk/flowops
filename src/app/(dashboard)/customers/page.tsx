import { Users } from "lucide-react"

export default function CustomersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Customers</h1>
        <p className="text-muted-foreground">Manage your customer relationships.</p>
      </div>
      <div className="flex items-center gap-3 rounded-lg border border-dashed p-8 text-muted-foreground">
        <Users className="h-5 w-5" />
        <span className="text-sm">Customer list coming soon.</span>
      </div>
    </div>
  )
}
