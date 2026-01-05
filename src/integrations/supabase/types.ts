export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      construction_costs: {
        Row: {
          comments: string | null
          cost_amount: number
          cost_item: string
          created_at: string | null
          id: string
          project_id: string | null
          updated_at: string | null
          vendor_contact: string | null
          vendor_email: string | null
          vendor_name: string
          vendor_phone: string | null
          year: number
        }
        Insert: {
          comments?: string | null
          cost_amount: number
          cost_item: string
          created_at?: string | null
          id?: string
          project_id?: string | null
          updated_at?: string | null
          vendor_contact?: string | null
          vendor_email?: string | null
          vendor_name: string
          vendor_phone?: string | null
          year: number
        }
        Update: {
          comments?: string | null
          cost_amount?: number
          cost_item?: string
          created_at?: string | null
          id?: string
          project_id?: string | null
          updated_at?: string | null
          vendor_contact?: string | null
          vendor_email?: string | null
          vendor_name?: string
          vendor_phone?: string | null
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "construction_costs_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice_items: {
        Row: {
          created_at: string | null
          description: string
          id: string
          invoice_id: string | null
          line_total: number
          quantity: number
          unit_price: number
        }
        Insert: {
          created_at?: string | null
          description: string
          id?: string
          invoice_id?: string | null
          line_total: number
          quantity?: number
          unit_price: number
        }
        Update: {
          created_at?: string | null
          description?: string
          id?: string
          invoice_id?: string | null
          line_total?: number
          quantity?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoice_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          client_address: string | null
          client_company: string | null
          client_email: string | null
          client_name: string
          client_phone: string | null
          created_at: string | null
          due_date: string
          gst_amount: number
          id: string
          invoice_date: string
          invoice_number: string
          notes: string | null
          status: string | null
          subtotal: number
          terms: string | null
          total_amount: number
          updated_at: string | null
        }
        Insert: {
          client_address?: string | null
          client_company?: string | null
          client_email?: string | null
          client_name: string
          client_phone?: string | null
          created_at?: string | null
          due_date: string
          gst_amount?: number
          id?: string
          invoice_date: string
          invoice_number: string
          notes?: string | null
          status?: string | null
          subtotal?: number
          terms?: string | null
          total_amount?: number
          updated_at?: string | null
        }
        Update: {
          client_address?: string | null
          client_company?: string | null
          client_email?: string | null
          client_name?: string
          client_phone?: string | null
          created_at?: string | null
          due_date?: string
          gst_amount?: number
          id?: string
          invoice_date?: string
          invoice_number?: string
          notes?: string | null
          status?: string | null
          subtotal?: number
          terms?: string | null
          total_amount?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      pipeline_projects: {
        Row: {
          comments: string | null
          created_at: string | null
          id: string
          primary_contact_name: string | null
          primary_contact_phone: string | null
          project_address: string
          project_name: string
          status: string | null
          target_month: number | null
          target_year: number | null
          updated_at: string | null
        }
        Insert: {
          comments?: string | null
          created_at?: string | null
          id?: string
          primary_contact_name?: string | null
          primary_contact_phone?: string | null
          project_address: string
          project_name: string
          status?: string | null
          target_month?: number | null
          target_year?: number | null
          updated_at?: string | null
        }
        Update: {
          comments?: string | null
          created_at?: string | null
          id?: string
          primary_contact_name?: string | null
          primary_contact_phone?: string | null
          project_address?: string
          project_name?: string
          status?: string | null
          target_month?: number | null
          target_year?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      projects: {
        Row: {
          associated_project_id: string | null
          buyer_email: string | null
          buyer_name: string | null
          buyer_phone: string | null
          closed_price: number | null
          created_at: string | null
          id: string
          insurance_policy: string | null
          project_address: string
          project_finish_date: string | null
          project_name: string
          project_start_date: string | null
          realtor_email: string | null
          realtor_name: string | null
          status: Database["public"]["Enums"]["project_status"] | null
          updated_at: string | null
          warranty_end_date: string | null
          warranty_start_date: string | null
          wcb_policy: string | null
        }
        Insert: {
          associated_project_id?: string | null
          buyer_email?: string | null
          buyer_name?: string | null
          buyer_phone?: string | null
          closed_price?: number | null
          created_at?: string | null
          id?: string
          insurance_policy?: string | null
          project_address: string
          project_finish_date?: string | null
          project_name: string
          project_start_date?: string | null
          realtor_email?: string | null
          realtor_name?: string | null
          status?: Database["public"]["Enums"]["project_status"] | null
          updated_at?: string | null
          warranty_end_date?: string | null
          warranty_start_date?: string | null
          wcb_policy?: string | null
        }
        Update: {
          associated_project_id?: string | null
          buyer_email?: string | null
          buyer_name?: string | null
          buyer_phone?: string | null
          closed_price?: number | null
          created_at?: string | null
          id?: string
          insurance_policy?: string | null
          project_address?: string
          project_finish_date?: string | null
          project_name?: string
          project_start_date?: string | null
          realtor_email?: string | null
          realtor_name?: string | null
          status?: Database["public"]["Enums"]["project_status"] | null
          updated_at?: string | null
          warranty_end_date?: string | null
          warranty_start_date?: string | null
          wcb_policy?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "projects_associated_project_id_fkey"
            columns: ["associated_project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      tax_documents: {
        Row: {
          document_name: string
          document_type: string | null
          file_path: string
          id: string
          tax_record_id: string | null
          uploaded_at: string | null
        }
        Insert: {
          document_name: string
          document_type?: string | null
          file_path: string
          id?: string
          tax_record_id?: string | null
          uploaded_at?: string | null
        }
        Update: {
          document_name?: string
          document_type?: string | null
          file_path?: string
          id?: string
          tax_record_id?: string | null
          uploaded_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tax_documents_tax_record_id_fkey"
            columns: ["tax_record_id"]
            isOneToOne: false
            referencedRelation: "tax_records"
            referencedColumns: ["id"]
          },
        ]
      }
      tax_records: {
        Row: {
          accountant_email: string | null
          accountant_name: string
          accountant_phone: string | null
          cra_tax_paid: number | null
          cra_tax_year: number | null
          created_at: string | null
          filing_deadline: string | null
          fiscal_year: number
          gst_paid: number | null
          gst_year: number | null
          id: string
          notes: string | null
          updated_at: string | null
          year_end_date: string | null
        }
        Insert: {
          accountant_email?: string | null
          accountant_name: string
          accountant_phone?: string | null
          cra_tax_paid?: number | null
          cra_tax_year?: number | null
          created_at?: string | null
          filing_deadline?: string | null
          fiscal_year: number
          gst_paid?: number | null
          gst_year?: number | null
          id?: string
          notes?: string | null
          updated_at?: string | null
          year_end_date?: string | null
        }
        Update: {
          accountant_email?: string | null
          accountant_name?: string
          accountant_phone?: string | null
          cra_tax_paid?: number | null
          cra_tax_year?: number | null
          created_at?: string | null
          filing_deadline?: string | null
          fiscal_year?: number
          gst_paid?: number | null
          gst_year?: number | null
          id?: string
          notes?: string | null
          updated_at?: string | null
          year_end_date?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      project_status: "active" | "completed" | "archived"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      project_status: ["active", "completed", "archived"],
    },
  },
} as const
