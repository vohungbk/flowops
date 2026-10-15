import { describe, it, expect } from "vitest"
import { loginSchema, resetPasswordSchema } from "./auth"

describe("loginSchema", () => {
  it("should accept a valid email and password", () => {
    const result = loginSchema.safeParse({ email: "user@example.com", password: "secret1" })
    expect(result.success).toBe(true)
  })

  it("should return error when email is invalid", () => {
    const result = loginSchema.safeParse({ email: "not-an-email", password: "secret1" })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Please enter a valid email address")
    }
  })

  it("should return error when password is shorter than 6 characters", () => {
    const result = loginSchema.safeParse({ email: "user@example.com", password: "12345" })
    expect(result.success).toBe(false)
  })
})

describe("resetPasswordSchema", () => {
  it("should accept a strong matching password", () => {
    const result = resetPasswordSchema.safeParse({
      password: "Password1",
      confirmPassword: "Password1",
    })
    expect(result.success).toBe(true)
  })

  it("should return error when passwords do not match", () => {
    const result = resetPasswordSchema.safeParse({
      password: "Password1",
      confirmPassword: "Password2",
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Passwords do not match")
    }
  })

  it("should return error when password has no uppercase letter", () => {
    const result = resetPasswordSchema.safeParse({
      password: "password1",
      confirmPassword: "password1",
    })
    expect(result.success).toBe(false)
  })

  it("should return error when password has no number", () => {
    const result = resetPasswordSchema.safeParse({
      password: "Password",
      confirmPassword: "Password",
    })
    expect(result.success).toBe(false)
  })
})
