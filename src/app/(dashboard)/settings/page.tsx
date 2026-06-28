import type { Metadata } from "next"
import Link from "next/link"
import { Kanban, User, Users, Bell, Tag } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

export const metadata: Metadata = {
  title: "Settings",
  description: "Configure your FlowOps workspace — pipeline stages, profile, team, and notifications.",
}

const sections = [
  {
    href: "/settings/pipeline",
    icon: Kanban,
    title: "Pipeline Stages",
    description: "Customize stage names, colors, and win probabilities.",
    available: true,
  },
  {
    href: "/settings/profile",
    icon: User,
    title: "Profile",
    description: "Update your name, avatar, and contact information.",
    available: false,
  },
  {
    href: "/settings/team",
    icon: Users,
    title: "Team",
    description: "Manage team members, roles, and invitations.",
    available: false,
  },
  {
    href: "/settings/tags",
    icon: Tag,
    title: "Tags",
    description: "Create and manage tags used to classify customers and leads.",
    available: false,
  },
  {
    href: "/settings/notifications",
    icon: Bell,
    title: "Notifications",
    description: "Control which alerts and digests you receive.",
    available: false,
  },
]

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">Configure your workspace.</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {sections.map(({ href, icon: Icon, title, description, available }) => {
          const content = (
            <Card
              className={
                available
                  ? "cursor-pointer transition-colors hover:bg-muted/50"
                  : "opacity-50"
              }
            >
              <CardContent className="flex items-start gap-4 p-5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                  <Icon className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{title}</p>
                    {!available && (
                      <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                        Soon
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
                </div>
              </CardContent>
            </Card>
          )

          return available ? (
            <Link key={href} href={href}>
              {content}
            </Link>
          ) : (
            <div key={href}>{content}</div>
          )
        })}
      </div>
    </div>
  )
}
