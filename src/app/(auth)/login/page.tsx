import type { Metadata } from "next"
import { Zap, CheckCircle2, BarChart3, Users, Kanban } from "lucide-react"
import { LoginForm } from "@/components/auth/login-form"

export const metadata: Metadata = {
  title: "Sign In",
  description:
    "Sign in to your FlowOps account to manage customers, leads, and your sales pipeline.",
}

const features = [
  {
    icon: Users,
    title: "Customer & Lead Management",
    description: "Centralize all contacts, track interactions, and never lose a deal.",
  },
  {
    icon: Kanban,
    title: "Visual Sales Pipeline",
    description: "Drag-and-drop Kanban board with real-time deal tracking.",
  },
  {
    icon: BarChart3,
    title: "Analytics & Reports",
    description: "Revenue trends, conversion rates, and team performance at a glance.",
  },
  {
    icon: CheckCircle2,
    title: "Activity Tracking",
    description: "Log calls, emails, and meetings — full history for every contact.",
  },
]

export default function LoginPage() {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Left — Brand panel */}
      <div className="hidden lg:flex flex-col justify-between bg-zinc-950 p-10 text-white">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10">
            <Zap className="h-4 w-4 text-white" />
          </div>
          <span className="text-lg font-semibold tracking-tight">FlowOps</span>
        </div>

        <div className="space-y-8">
          <div className="space-y-3">
            <h2 className="text-3xl font-bold leading-tight">
              Manage your business
              <br />
              <span className="text-zinc-400">with confidence.</span>
            </h2>
            <p className="text-zinc-400 text-sm leading-relaxed max-w-sm">
              The CRM built for modern sales teams. Track customers, close deals,
              and grow revenue — all in one place.
            </p>
          </div>

          <div className="space-y-4">
            {features.map((feature) => (
              <div key={feature.title} className="flex items-start gap-3">
                <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-white/10">
                  <feature.icon className="h-3.5 w-3.5 text-white/70" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white/90">{feature.title}</p>
                  <p className="text-xs text-zinc-500 mt-0.5">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-zinc-600">
          © {new Date().getFullYear()} FlowOps. All rights reserved.
        </p>
      </div>

      {/* Right — Form panel */}
      <div className="flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="mb-8 flex items-center gap-2 lg:hidden">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
              <Zap className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-base font-semibold">FlowOps</span>
          </div>

          <LoginForm />
        </div>
      </div>
    </div>
  )
}
