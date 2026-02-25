export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string
          created_at: string
          email_opted_in: boolean
          email_opt_in_confirmed_at: string | null
          invite_code: string
        }
        Insert: {
          id?: string
          email: string
          name: string
          created_at?: string
          email_opted_in?: boolean
          email_opt_in_confirmed_at?: string | null
          invite_code: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          created_at?: string
          email_opted_in?: boolean
          email_opt_in_confirmed_at?: string | null
          invite_code?: string
        }
      }
      important_dates: {
        Row: {
          id: string
          user_id: string
          label: string
          date_month: number
          date_day: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          label: string
          date_month: number
          date_day: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          label?: string
          date_month?: number
          date_day?: number
          created_at?: string
        }
      }
      connections: {
        Row: {
          id: string
          user_a_id: string
          user_b_id: string
          status: string
          created_at: string
          confirmed_at: string | null
        }
        Insert: {
          id?: string
          user_a_id: string
          user_b_id: string
          status?: string
          created_at?: string
          confirmed_at?: string | null
        }
        Update: {
          id?: string
          user_a_id?: string
          user_b_id?: string
          status?: string
          created_at?: string
          confirmed_at?: string | null
        }
      }
      invites: {
        Row: {
          id: string
          inviter_id: string
          contact_name: string
          contact_email: string | null
          status: string
          created_at: string
          sent_at: string | null
          accepted_at: string | null
        }
        Insert: {
          id?: string
          inviter_id: string
          contact_name: string
          contact_email?: string | null
          status?: string
          created_at?: string
          sent_at?: string | null
          accepted_at?: string | null
        }
        Update: {
          id?: string
          inviter_id?: string
          contact_name?: string
          contact_email?: string | null
          status?: string
          created_at?: string
          sent_at?: string | null
          accepted_at?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
