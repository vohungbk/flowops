import type { MetadataRoute } from "next"
import { APP_URL } from "@/lib/site"

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: `${APP_URL}/login`,
      changeFrequency: "monthly",
      priority: 1,
    },
  ]
}
