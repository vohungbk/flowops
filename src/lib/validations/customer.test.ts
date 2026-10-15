import { describe, it, expect } from "vitest"
import { customerSchema } from "./customer"

describe("customerSchema", () => {
  it("should accept a customer with only required fields", () => {
    const result = customerSchema.safeParse({ company_name: "Acme", status: "active" })
    expect(result.success).toBe(true)
  })

  it("should return error when company name is empty", () => {
    const result = customerSchema.safeParse({ company_name: "", status: "active" })
    expect(result.success).toBe(false)
  })

  it("should accept an empty email string", () => {
    const result = customerSchema.safeParse({ company_name: "Acme", status: "active", email: "" })
    expect(result.success).toBe(true)
  })

  it("should return error when email is invalid", () => {
    const result = customerSchema.safeParse({ company_name: "Acme", status: "active", email: "bad" })
    expect(result.success).toBe(false)
  })

  it("should return error when status is not allowed", () => {
    const result = customerSchema.safeParse({ company_name: "Acme", status: "unknown" })
    expect(result.success).toBe(false)
  })
})
