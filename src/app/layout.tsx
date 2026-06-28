import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/layout/theme-provider"
import { TooltipProvider } from "@/components/ui/tooltip"

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
})

const appUrl = (() => {
  const raw = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
  return raw.startsWith("http") ? raw : `https://${raw}`
})()

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: "FlowOps — CRM & Business Management",
    template: "%s | FlowOps",
  },
  description:
    "Streamline your sales pipeline, manage customers, and track leads — all in one place.",
  openGraph: {
    type: "website",
    siteName: "FlowOps",
    title: "FlowOps — CRM & Business Management",
    description:
      "Streamline your sales pipeline, manage customers, and track leads — all in one place.",
  },
  twitter: {
    card: "summary",
    title: "FlowOps — CRM & Business Management",
    description:
      "Streamline your sales pipeline, manage customers, and track leads — all in one place.",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full`} suppressHydrationWarning>
      <body className="min-h-full antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <TooltipProvider delay={200}>
            {children}
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
