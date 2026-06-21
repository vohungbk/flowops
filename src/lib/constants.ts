export const APP_NAME = "FlowOps"
export const APP_DESCRIPTION = "CRM & Business Management for modern teams"

export const CUSTOMER_STATUSES = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "churned", label: "Churned" },
] as const

export const LEAD_STATUSES = [
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "qualified", label: "Qualified" },
  { value: "disqualified", label: "Disqualified" },
  { value: "converted", label: "Converted" },
] as const

export const LEAD_SOURCES = [
  { value: "web", label: "Website" },
  { value: "referral", label: "Referral" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "event", label: "Event" },
  { value: "cold-outreach", label: "Cold Outreach" },
  { value: "other", label: "Other" },
] as const

export const ACTIVITY_TYPES = [
  { value: "call", label: "Call" },
  { value: "email", label: "Email" },
  { value: "meeting", label: "Meeting" },
  { value: "note", label: "Note" },
  { value: "task", label: "Task" },
] as const

export const INDUSTRIES = [
  "Technology",
  "Finance",
  "Healthcare",
  "Retail",
  "Manufacturing",
  "Education",
  "Real Estate",
  "Consulting",
  "Marketing",
  "Legal",
  "Other",
] as const

export const USER_ROLES = [
  { value: "admin", label: "Admin" },
  { value: "manager", label: "Manager" },
  { value: "employee", label: "Employee" },
] as const

export const PAGINATION_PAGE_SIZE = 20

export const ROUTES = {
  home: "/",
  login: "/login",
  resetPassword: "/reset-password",
  dashboard: "/dashboard",
  customers: "/customers",
  leads: "/leads",
  pipeline: "/pipeline",
  analytics: "/analytics",
  employees: "/employees",
  settings: "/settings",
} as const
