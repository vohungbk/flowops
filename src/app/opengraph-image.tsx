import { ImageResponse } from "next/og"
import { BRAND_COLOR, SITE_DESCRIPTION, SITE_NAME } from "@/lib/site"

export const alt = "FlowOps — CRM & Business Management"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 80,
          background: "linear-gradient(135deg, #312e81 0%, #4f46e5 100%)",
          color: "white",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <div
            style={{
              width: 96,
              height: 96,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "white",
              borderRadius: 24,
            }}
          >
            <svg width="60" height="60" viewBox="0 0 24 24" fill={BRAND_COLOR}>
              <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
          </div>
          <div style={{ fontSize: 84, fontWeight: 700 }}>{SITE_NAME}</div>
        </div>
        <div style={{ fontSize: 48, fontWeight: 600, marginTop: 56 }}>
          CRM & Business Management
        </div>
        <div style={{ fontSize: 30, marginTop: 20, opacity: 0.85, maxWidth: 900 }}>
          {SITE_DESCRIPTION}
        </div>
      </div>
    ),
    size
  )
}
