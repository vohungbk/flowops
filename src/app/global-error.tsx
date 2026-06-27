"use client"

// global-error replaces the root layout when the layout itself throws.
// It must include its own <html> and <body> tags and re-import global CSS.
import "./globals.css"
import { Inter } from "next/font/google"
import { ServerCrash, RotateCcw } from "lucide-react"

const inter = Inter({ variable: "--font-sans", subsets: ["latin"] })

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="en" className={`${inter.variable} h-full`}>
      <body className="min-h-full antialiased">
        <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10">
            <ServerCrash className="h-8 w-8 text-destructive" />
          </div>

          <h1 className="mt-5 text-xl font-semibold tracking-tight">
            Application error
          </h1>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">
            A critical error occurred and the page could not be rendered.
            Please refresh and try again.
          </p>

          {error.digest && (
            <p className="mt-3 font-mono text-[11px] text-muted-foreground/50">
              ref: {error.digest}
            </p>
          )}

          <button
            onClick={reset}
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/80"
          >
            <RotateCcw className="h-4 w-4" />
            Try again
          </button>
        </div>
      </body>
    </html>
  )
}
