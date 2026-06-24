import { Trophy } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { RepLeaderboardRow } from "@/lib/queries/analytics"

function formatCurrency(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`
  return `$${n.toLocaleString()}`
}

function initials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()
}

interface RepLeaderboardProps {
  data: RepLeaderboardRow[]
}

export function RepLeaderboard({ data }: RepLeaderboardProps) {
  const hasData = data.length > 0

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle>Rep Leaderboard</CardTitle>
            <CardDescription className="mt-0.5">Performance by team member</CardDescription>
          </div>
          {hasData && (
            <div className="shrink-0 text-right">
              <p className="text-xs text-muted-foreground">Members</p>
              <p className="text-sm font-semibold">{data.length}</p>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {!hasData ? (
          <div className="flex h-64 flex-col items-center justify-center gap-2 text-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted">
              <Trophy className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium">No team data yet</p>
            <p className="max-w-xs text-xs text-muted-foreground">
              Assign deals to team members to see performance here.
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {/* Header */}
            <div className="grid grid-cols-[1fr_auto_auto_auto] gap-2 px-2 pb-1 text-xs text-muted-foreground">
              <span>Rep</span>
              <span className="w-16 text-right">Active</span>
              <span className="w-16 text-right">Won</span>
              <span className="w-20 text-right">Revenue</span>
            </div>

            {data.map((rep, index) => (
              <div
                key={rep.id}
                className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-2 rounded-lg px-2 py-2 hover:bg-muted/50 transition-colors"
              >
                {/* Rep info */}
                <div className="flex min-w-0 items-center gap-2.5">
                  <span className="w-4 shrink-0 text-center text-xs font-medium text-muted-foreground">
                    {index + 1}
                  </span>
                  <Avatar className="h-7 w-7 shrink-0">
                    <AvatarImage src={rep.avatar_url ?? undefined} alt={rep.full_name} />
                    <AvatarFallback className="text-xs">{initials(rep.full_name)}</AvatarFallback>
                  </Avatar>
                  <span className="truncate text-sm font-medium">{rep.full_name}</span>
                </div>

                {/* Active deals */}
                <span className="w-16 text-right text-sm text-muted-foreground">
                  {rep.active_deals}
                </span>

                {/* Deals won */}
                <span className="w-16 text-right text-sm font-medium text-emerald-600 dark:text-emerald-400">
                  {rep.deals_won}
                </span>

                {/* Revenue */}
                <span className="w-20 text-right text-sm font-semibold">
                  {formatCurrency(rep.revenue)}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
