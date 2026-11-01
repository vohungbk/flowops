export const SITE_NAME = "FlowOps"
export const SITE_TITLE = "FlowOps — CRM & Business Management"
export const SITE_DESCRIPTION =
  "Streamline your sales pipeline, manage customers, and track leads — all in one place."
export const BRAND_COLOR = "#4f46e5"

export const APP_URL = (() => {
  const raw = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
  const withProtocol = raw.startsWith("http") ? raw : `https://${raw}`
  return withProtocol.replace(/\/+$/, "")
})()
