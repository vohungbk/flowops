/**
 * Supabase database types.
 * Run `supabase gen types typescript --project-id YOUR_PROJECT_ID` to regenerate
 * after schema changes. This file mirrors the planned schema from the design doc.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string
          avatar_url: string | null
          role: "admin" | "manager" | "employee"
          department: string | null
          phone: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name: string
          avatar_url?: string | null
          role?: "admin" | "manager" | "employee"
          department?: string | null
          phone?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          avatar_url?: string | null
          role?: "admin" | "manager" | "employee"
          department?: string | null
          phone?: string | null
          is_active?: boolean
          updated_at?: string
        }
      }
      customers: {
        Row: {
          id: string
          company_name: string
          contact_name: string
          email: string | null
          phone: string | null
          website: string | null
          industry: string | null
          status: "active" | "inactive" | "churned"
          address: string | null
          notes: string | null
          assigned_to: string | null
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_name: string
          contact_name: string
          email?: string | null
          phone?: string | null
          website?: string | null
          industry?: string | null
          status?: "active" | "inactive" | "churned"
          address?: string | null
          notes?: string | null
          assigned_to?: string | null
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          company_name?: string
          contact_name?: string
          email?: string | null
          phone?: string | null
          website?: string | null
          industry?: string | null
          status?: "active" | "inactive" | "churned"
          address?: string | null
          notes?: string | null
          assigned_to?: string | null
          updated_at?: string
        }
      }
      leads: {
        Row: {
          id: string
          first_name: string
          last_name: string
          email: string | null
          phone: string | null
          company: string | null
          job_title: string | null
          source: "web" | "referral" | "linkedin" | "event" | "cold-outreach" | "other"
          status: "new" | "contacted" | "qualified" | "disqualified" | "converted"
          score: number
          notes: string | null
          assigned_to: string | null
          converted_to_customer_id: string | null
          converted_at: string | null
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          first_name: string
          last_name: string
          email?: string | null
          phone?: string | null
          company?: string | null
          job_title?: string | null
          source?: "web" | "referral" | "linkedin" | "event" | "cold-outreach" | "other"
          status?: "new" | "contacted" | "qualified" | "disqualified" | "converted"
          score?: number
          notes?: string | null
          assigned_to?: string | null
          converted_to_customer_id?: string | null
          converted_at?: string | null
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          first_name?: string
          last_name?: string
          email?: string | null
          phone?: string | null
          company?: string | null
          job_title?: string | null
          source?: "web" | "referral" | "linkedin" | "event" | "cold-outreach" | "other"
          status?: "new" | "contacted" | "qualified" | "disqualified" | "converted"
          score?: number
          notes?: string | null
          assigned_to?: string | null
          converted_to_customer_id?: string | null
          converted_at?: string | null
          updated_at?: string
        }
      }
      pipeline_stages: {
        Row: {
          id: string
          name: string
          order_index: number
          color: string | null
          probability: number
          is_closed_won: boolean
          is_closed_lost: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          order_index: number
          color?: string | null
          probability?: number
          is_closed_won?: boolean
          is_closed_lost?: boolean
          created_at?: string
        }
        Update: {
          name?: string
          order_index?: number
          color?: string | null
          probability?: number
          is_closed_won?: boolean
          is_closed_lost?: boolean
        }
      }
      deals: {
        Row: {
          id: string
          title: string
          value: number
          currency: string
          stage_id: string
          customer_id: string | null
          lead_id: string | null
          assigned_to: string | null
          expected_close_date: string | null
          actual_close_date: string | null
          probability: number
          lost_reason: string | null
          notes: string | null
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          value?: number
          currency?: string
          stage_id: string
          customer_id?: string | null
          lead_id?: string | null
          assigned_to?: string | null
          expected_close_date?: string | null
          actual_close_date?: string | null
          probability?: number
          lost_reason?: string | null
          notes?: string | null
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          title?: string
          value?: number
          currency?: string
          stage_id?: string
          customer_id?: string | null
          lead_id?: string | null
          assigned_to?: string | null
          expected_close_date?: string | null
          actual_close_date?: string | null
          probability?: number
          lost_reason?: string | null
          notes?: string | null
          updated_at?: string
        }
      }
      activities: {
        Row: {
          id: string
          type: "call" | "email" | "meeting" | "note" | "task"
          subject: string
          description: string | null
          outcome: string | null
          scheduled_at: string | null
          completed_at: string | null
          customer_id: string | null
          lead_id: string | null
          deal_id: string | null
          assigned_to: string | null
          created_by: string
          created_at: string
        }
        Insert: {
          id?: string
          type: "call" | "email" | "meeting" | "note" | "task"
          subject: string
          description?: string | null
          outcome?: string | null
          scheduled_at?: string | null
          completed_at?: string | null
          customer_id?: string | null
          lead_id?: string | null
          deal_id?: string | null
          assigned_to?: string | null
          created_by: string
          created_at?: string
        }
        Update: {
          type?: "call" | "email" | "meeting" | "note" | "task"
          subject?: string
          description?: string | null
          outcome?: string | null
          scheduled_at?: string | null
          completed_at?: string | null
        }
      }
      tags: {
        Row: {
          id: string
          name: string
          color: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          color: string
          created_at?: string
        }
        Update: {
          name?: string
          color?: string
        }
      }
      customer_tags: {
        Row: {
          id: string
          customer_id: string
          tag_id: string
          created_at: string
        }
        Insert: {
          id?: string
          customer_id: string
          tag_id: string
          created_at?: string
        }
        Update: never
      }
      audit_logs: {
        Row: {
          id: string
          user_id: string
          action: string
          entity_type: string
          entity_id: string | null
          old_values: Json | null
          new_values: Json | null
          ip_address: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          action: string
          entity_type: string
          entity_id?: string | null
          old_values?: Json | null
          new_values?: Json | null
          ip_address?: string | null
          created_at?: string
        }
        Update: never
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          actor_id: string | null
          type: string
          title: string
          body: string | null
          entity_type: string | null
          entity_id: string | null
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          actor_id?: string | null
          type: string
          title: string
          body?: string | null
          entity_type?: string | null
          entity_id?: string | null
          is_read?: boolean
          created_at?: string
        }
        Update: {
          is_read?: boolean
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      // NOTE: rpc() type inference fails because table types omit Relationships.
      // Call supabase.rpc() with (... as any) until Relationships are regenerated.
      set_lead_score: {
        Args: { p_lead_id: string; p_score: number }
        Returns: null
      }
    }
    Enums: {
      user_role: "admin" | "manager" | "employee"
      customer_status: "active" | "inactive" | "churned"
      lead_status: "new" | "contacted" | "qualified" | "disqualified" | "converted"
      lead_source: "web" | "referral" | "linkedin" | "event" | "cold-outreach" | "other"
      activity_type: "call" | "email" | "meeting" | "note" | "task"
    }
  }
}

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"]

export type TablesInsert<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"]

export type TablesUpdate<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"]
