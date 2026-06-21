"use client"

import { useActionState, useState, useEffect } from "react"
import { Loader2, Mail, Lock, Zap, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { signIn, signInWithMagicLink } from "@/lib/actions/auth"
import type { ActionResult } from "@/types"

const initialState: ActionResult = { success: false, error: "" }

export function LoginForm() {
  const [mode, setMode] = useState<"password" | "magic-link">("password")
  const [magicLinkSent, setMagicLinkSent] = useState(false)

  const [passwordState, passwordAction, passwordPending] = useActionState(
    signIn,
    initialState
  )
  const [magicState, magicAction, magicPending] = useActionState(
    signInWithMagicLink,
    initialState
  )

  // Watch for successful magic link send
  useEffect(() => {
    if (magicState.success) {
      setMagicLinkSent(true)
    }
  }, [magicState])

  if (magicLinkSent) {
    return (
      <div className="flex flex-col items-center gap-4 text-center py-8">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <Mail className="h-6 w-6 text-primary" />
        </div>
        <div>
          <p className="font-semibold">Check your email</p>
          <p className="text-sm text-muted-foreground mt-1">
            We sent a magic link to your inbox. Click it to sign in.
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setMagicLinkSent(false)
            setMode("password")
          }}
        >
          Back to sign in
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
        <p className="text-sm text-muted-foreground">
          Sign in to your FlowOps account
        </p>
      </div>

      {/* Password form */}
      {mode === "password" && (
        <form action={passwordAction} className="flex flex-col gap-4">
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

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <a
                href="/reset-password"
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Forgot password?
              </a>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                autoComplete="current-password"
                className="pl-9"
                required
                minLength={6}
              />
            </div>
          </div>

          {!passwordState.success && passwordState.error && (
            <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {passwordState.error}
            </p>
          )}

          <Button type="submit" disabled={passwordPending} className="w-full gap-2">
            {passwordPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ArrowRight className="h-4 w-4" />
            )}
            Sign in
          </Button>
        </form>
      )}

      {/* Magic link form */}
      {mode === "magic-link" && (
        <form action={magicAction} className="flex flex-col gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="magic-email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="magic-email"
                name="email"
                type="email"
                placeholder="you@company.com"
                autoComplete="email"
                className="pl-9"
                required
              />
            </div>
          </div>

          {!magicState.success && magicState.error && (
            <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {magicState.error}
            </p>
          )}

          <Button type="submit" disabled={magicPending} className="w-full gap-2">
            {magicPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Zap className="h-4 w-4" />
            )}
            Send magic link
          </Button>
        </form>
      )}

      <div className="flex items-center gap-3">
        <Separator className="flex-1" />
        <span className="text-xs text-muted-foreground">or</span>
        <Separator className="flex-1" />
      </div>

      <Button
        variant="outline"
        className="w-full gap-2"
        onClick={() => setMode(mode === "password" ? "magic-link" : "password")}
      >
        {mode === "password" ? (
          <>
            <Zap className="h-4 w-4" />
            Continue with magic link
          </>
        ) : (
          <>
            <Lock className="h-4 w-4" />
            Continue with password
          </>
        )}
      </Button>

      <p className="text-center text-xs text-muted-foreground">
        By signing in, you agree to our{" "}
        <a href="#" className="underline underline-offset-4 hover:text-foreground">
          Terms of Service
        </a>{" "}
        and{" "}
        <a href="#" className="underline underline-offset-4 hover:text-foreground">
          Privacy Policy
        </a>
        .
      </p>
    </div>
  )
}
