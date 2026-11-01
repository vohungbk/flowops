import type { MetadataRoute } from "next"
import { APP_URL } from "@/lib/site"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/login"],
      disallow: ["/api/", "/auth/", "/dashboard", "/customers", "/leads", "/pipeline", "/analytics", "/employees", "/audit-log", "/settings", "/reset-password"],
    },
    sitemap: `${APP_URL}/sitemap.xml`,
  }
}
