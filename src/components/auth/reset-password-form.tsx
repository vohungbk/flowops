"use client"

import { useActionState } from "react"
import { Loader2, Mail, Lock, ArrowRight, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { requestPasswordReset, updatePassword } from "@/lib/actions/auth"
import type { ActionResult } from "@/types"

const initialState: ActionResult = { success: false, error: "" }

export function ResetPasswordForm({ hasSession }: { hasSession: boolean }) {
  const [resetState, resetAction, resetPending] = useActionState(
    requestPasswordReset,
    initialState
  )
  const [updateState, updateAction, updatePending] = useActionState(
    updatePassword,
    initialState
  )

  if (!hasSession) {
    if (resetState.success) {
      return (
        <div className="flex flex-col items-center gap-4 text-center py-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <CheckCircle className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="font-semibold">Check your email</p>
            <p className="text-sm text-muted-foreground mt-1">
              We sent you a password reset link. Click it to set a new password.
            </p>
          </div>
          <a
            href="/login"
            className="text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground"
          >
            Back to sign in
          </a>
        </div>
      )
    }

    return (
      <div className="flex flex-col gap-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Reset password</h1>
          <p className="text-sm text-muted-foreground">
            Enter your email and we&apos;ll send you a reset link.
          </p>
        </div>

        <form action={resetAction} className="flex flex-col gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@company.com"
                autoComplete="email"
                className="pl-9"
                required
              />
            </div>
          </div>

          {!resetState.success && resetState.error && (
            <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {resetState.error}
            </p>
          )}

          <Button type="submit" disabled={resetPending} className="w-full gap-2">
            {resetPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ArrowRight className="h-4 w-4" />
            )}
            Send reset link
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          Remember your password?{" "}
          <a
            href="/login"
            className="font-medium text-foreground underline underline-offset-4 hover:text-primary"
          >
            Sign in
          </a>
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Set new password</h1>
        <p className="text-sm text-muted-foreground">
          Choose a strong password for your account.
        </p>
      </div>

      <form action={updateAction} className="flex flex-col gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="password">New password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Min. 8 characters"
              autoComplete="new-password"
              className="pl-9"
              required
              minLength={8}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="confirmPassword">Confirm password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="Repeat your password"
              autoComplete="new-password"
              className="pl-9"
              required
              minLength={8}
            />
          </div>
        </div>

        {!updateState.success && updateState.error && (
          <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {updateState.error}
          </p>
        )}

        <Button type="submit" disabled={updatePending} className="w-full gap-2">
          {updatePending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ArrowRight className="h-4 w-4" />
          )}
          Update password
        </Button>
      </form>
    </div>
  )
}
