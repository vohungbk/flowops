"use client"

import { useActionState, useState, useEffect } from "react"
import { Loader2, Mail, Lock, Zap, ArrowRight, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { signIn, signUp, signInWithMagicLink } from "@/lib/actions/auth"
import type { ActionResult } from "@/types"

const initialState: ActionResult = { success: false, error: "" }

type FormMode = "login" | "signup" | "magic-link"

export function LoginForm() {
  const [mode, setMode] = useState<FormMode>("login")
  const [magicLinkSent, setMagicLinkSent] = useState(false)

  const [loginState, loginAction, loginPending] = useActionState(signIn, initialState)
  const [signupState, signupAction, signupPending] = useActionState(signUp, initialState)
  const [magicState, magicAction, magicPending] = useActionState(
    signInWithMagicLink,
    initialState
  )

  useEffect(() => {
    if (magicState.success) setMagicLinkSent(true)
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
        <Button variant="ghost" size="sm" onClick={() => { setMagicLinkSent(false); setMode("login") }}>
          Back to sign in
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          {mode === "signup" ? "Create an account" : "Welcome back"}
        </h1>
        <p className="text-sm text-muted-foreground">
          {mode === "signup"
            ? "Sign up to get started with FlowOps"
            : "Sign in to your FlowOps account"}
        </p>
      </div>

      {/* Login form */}
      {mode === "login" && (
        <form action={loginAction} className="flex flex-col gap-4">
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

          {!loginState.success && loginState.error && (
            <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {loginState.error}
            </p>
          )}

          <Button type="submit" disabled={loginPending} className="w-full gap-2">
            {loginPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
            Sign in
          </Button>
        </form>
      )}

      {/* Signup form */}
      {mode === "signup" && (
        <form action={signupAction} className="flex flex-col gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="full_name">Full name</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="full_name"
                name="full_name"
                type="text"
                placeholder="John Doe"
                autoComplete="name"
                className="pl-9"
                required
                minLength={2}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="signup-email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="signup-email"
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
            <Label htmlFor="signup-password">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="signup-password"
                name="password"
                type="password"
                placeholder="Min. 6 characters"
                autoComplete="new-password"
                className="pl-9"
                required
                minLength={6}
              />
            </div>
          </div>

          {!signupState.success && signupState.error && (
            <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {signupState.error}
            </p>
          )}

          <Button type="submit" disabled={signupPending} className="w-full gap-2">
            {signupPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
            Create account
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
            {magicPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
            Send magic link
          </Button>
        </form>
      )}

      {/* Divider + secondary action */}
      {mode !== "magic-link" && (
        <>
          <div className="flex items-center gap-3">
            <Separator className="flex-1" />
            <span className="text-xs text-muted-foreground">or</span>
            <Separator className="flex-1" />
          </div>
          <Button
            variant="outline"
            className="w-full gap-2"
            onClick={() => setMode("magic-link")}
          >
            <Zap className="h-4 w-4" />
            Continue with magic link
          </Button>
        </>
      )}

      {mode === "magic-link" && (
        <Button variant="ghost" size="sm" className="w-full" onClick={() => setMode("login")}>
          Back to sign in
        </Button>
      )}

      {/* Login ↔ Signup toggle */}
      <p className="text-center text-sm text-muted-foreground">
        {mode === "signup" ? (
          <>
            Already have an account?{" "}
            <button
              type="button"
              className="font-medium text-foreground underline underline-offset-4 hover:text-primary"
              onClick={() => setMode("login")}
            >
              Sign in
            </button>
          </>
        ) : (
          <>
            Don&apos;t have an account?{" "}
            <button
              type="button"
              className="font-medium text-foreground underline underline-offset-4 hover:text-primary"
              onClick={() => setMode("signup")}
            >
              Sign up
            </button>
          </>
        )}
      </p>
    </div>
  )
}
