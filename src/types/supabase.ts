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
      user: {
        Row: {
          id: string
          email: string
          name: string
          emailVerified: boolean
          image: string | null
          createdAt: string
          updatedAt: string
          is_admin: boolean
        }
        Insert: {
          id?: string
          email: string
          name: string
          emailVerified?: boolean
          image?: string | null
          createdAt?: string
          updatedAt?: string
          is_admin?: boolean
        }
        Update: {
          id?: string
          email?: string
          name?: string
          emailVerified?: boolean
          image?: string | null
          createdAt?: string
          updatedAt?: string
          is_admin?: boolean
        }
      }
      rooms: {
        Row: {
          id: number
          room_number: string
          owner_name: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          room_number: string
          owner_name?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          room_number?: string
          owner_name?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      water_readings: {
        Row: {
          id: number
          room_id: number
          month: string
          last_month_reading: number
          this_month_reading: number
          price_per_unit: number
          usage: number
          total_price: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          room_id: number
          month: string
          last_month_reading: number
          this_month_reading: number
          price_per_unit: number
          usage?: number
          total_price?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          room_id?: number
          month?: string
          last_month_reading?: number
          this_month_reading?: number
          price_per_unit?: number
          usage?: number
          total_price?: number
          created_at?: string
          updated_at?: string
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
