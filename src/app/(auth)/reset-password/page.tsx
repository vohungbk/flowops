import { Zap } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { ResetPasswordForm } from "@/components/auth/reset-password-form"

export default async function ResetPasswordPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <div className="flex min-h-screen items-center justify-center p-8">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
            <Zap className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-base font-semibold">FlowOps</span>
        </div>
        <ResetPasswordForm hasSession={!!user} />
      </div>
    </div>
  )
}
