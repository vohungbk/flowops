import { describe, it, expect } from "vitest"
import { calculateLeadScore } from "./lead-scoring"

const baseLead = {
  email: null,
  phone: null,
  company: null,
  job_title: null,
  source: "other",
  status: "new",
} as Parameters<typeof calculateLeadScore>[0]

describe("calculateLeadScore", () => {
  it("should return the minimum score for an empty new lead", () => {
    const result = calculateLeadScore(baseLead)
    expect(result.completeness).toBe(0)
    expect(result.engagement).toBe(0)
    expect(result.total).toBe(10) // source other (5) + status new (5)
  })

  it("should give full completeness when all contact fields are filled", () => {
    const result = calculateLeadScore({
      ...baseLead,
      email: "a@b.com",
      phone: "0123",
      company: "Acme",
      job_title: "CEO",
    })
    expect(result.completeness).toBe(25)
  })

  it("should score referral qualified leads higher than cold outreach new leads", () => {
    const high = calculateLeadScore({ ...baseLead, source: "referral", status: "qualified" })
    const low = calculateLeadScore({ ...baseLead, source: "cold-outreach", status: "new" })
    expect(high.total).toBeGreaterThan(low.total)
  })

  it("should cap engagement at 30 points", () => {
    const result = calculateLeadScore(baseLead, {
      meeting: 100,
      call: 100,
      email: 100,
      task: 100,
      note: 100,
    })
    expect(result.engagement).toBe(30)
  })

  it("should never exceed 100 in total", () => {
    const result = calculateLeadScore(
      {
        email: "a@b.com",
        phone: "0123",
        company: "Acme",
        job_title: "CEO",
        source: "referral",
        status: "converted",
      } as Parameters<typeof calculateLeadScore>[0],
      { meeting: 10, call: 10, email: 10, task: 10, note: 10 }
    )
    expect(result.total).toBeLessThanOrEqual(100)
  })

  it("should give zero status points to disqualified leads", () => {
    const result = calculateLeadScore({ ...baseLead, status: "disqualified" })
    expect(result.status).toBe(0)
  })
})
