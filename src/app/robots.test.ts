import { describe, expect, it } from "vitest"
import robots from "./robots"
import sitemap from "./sitemap"

describe("robots and sitemap", () => {
  it("should point robots to the sitemap", () => {
    expect(robots().sitemap).toMatch(/\/sitemap\.xml$/)
  })

  it("should disallow private app routes", () => {
    const rules = robots().rules as { disallow: string[] }
    expect(rules.disallow).toContain("/dashboard")
    expect(rules.disallow).toContain("/api/")
  })

  it("should list only the public login page in the sitemap", () => {
    const urls = sitemap().map((entry) => entry.url)
    expect(urls).toHaveLength(1)
    expect(urls[0]).toMatch(/\/login$/)
  })
})
