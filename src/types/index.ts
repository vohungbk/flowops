import type { Tables } from "./database"

// ─── Domain entity types (Row shortcuts) ────────────────────────────────────
export type Profile = Tables<"profiles">
export type Customer = Tables<"customers">
export type Lead = Tables<"leads">
export type Deal = Tables<"deals">
export type PipelineStage = Tables<"pipeline_stages">
export type Activity = Tables<"activities">
export type Tag = Tables<"tags">
export type AuditLog = Tables<"audit_logs">
export type AppNotification = Tables<"notifications">

// ─── Enum types ──────────────────────────────────────────────────────────────
export type UserRole = "admin" | "manager" | "employee"
export type CustomerStatus = "active" | "inactive" | "churned"
export type LeadStatus = "new" | "contacted" | "qualified" | "disqualified" | "converted"
export type LeadSource = "web" | "referral" | "linkedin" | "event" | "cold-outreach" | "other"
export type ActivityType = "call" | "email" | "meeting" | "note" | "task"

// ─── Extended types with joins ───────────────────────────────────────────────
export type CustomerWithTags = Customer & {
  tags: Tag[]
  assigned_profile: Pick<Profile, "id" | "full_name" | "avatar_url"> | null
}

export type DealWithStageAndCustomer = Deal & {
  stage: PipelineStage
  customer: Pick<Customer, "id" | "company_name"> | null
  assigned_profile: Pick<Profile, "id" | "full_name" | "avatar_url"> | null
}

export type LeadWithAssignee = Lead & {
  assigned_profile: Pick<Profile, "id" | "full_name" | "avatar_url"> | null
}

// ─── Dashboard & Analytics types ─────────────────────────────────────────────
export type KpiMetrics = {
  totalCustomers: number
  newCustomersThisMonth: number
  totalLeads: number
  activeDeals: number
  monthlyRevenue: number
  monthlyRevenueLastMonth: number
  pipelineValue: number
  winRate: number
  avgDealSize: number
  activitiesThisWeek: number
}

export type RevenueDataPoint = {
  month: string
  revenue: number
}

export type PipelineStageSummary = PipelineStage & {
  dealCount: number
  totalValue: number
}

// ─── Server Action response type ─────────────────────────────────────────────
export type ActionResult<T = null> =
  | { success: true; data: T; error?: never }
  | { success: false; error: string; data?: never }

// ─── Pagination ───────────────────────────────────────────────────────────────
export type PaginatedResult<T> = {
  data: T[]
  total: number
  page: number
  pageSize: number
}

export type PaginationParams = {
  page?: number
  pageSize?: number
}
