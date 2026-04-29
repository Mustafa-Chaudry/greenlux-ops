export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      users_profile: {
        Row: {
          id: string;
          full_name: string | null;
          phone: string | null;
          email: string | null;
          role: Database["public"]["Enums"]["user_role"];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          phone?: string | null;
          email?: string | null;
          role?: Database["public"]["Enums"]["user_role"];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          full_name?: string | null;
          phone?: string | null;
          email?: string | null;
          role?: Database["public"]["Enums"]["user_role"];
          updated_at?: string;
        };
        Relationships: [];
      };
      rooms: {
        Row: {
          id: string;
          name: string;
          slug: string;
          type: Database["public"]["Enums"]["room_type"];
          description: string | null;
          base_price_pkr: number;
          max_guests: number;
          amenities: string[];
          status: Database["public"]["Enums"]["room_status"];
          image_urls: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          type: Database["public"]["Enums"]["room_type"];
          description?: string | null;
          base_price_pkr: number;
          max_guests: number;
          amenities?: string[];
          status?: Database["public"]["Enums"]["room_status"];
          image_urls?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["rooms"]["Insert"]>;
        Relationships: [];
      };
      guest_checkins: {
        Row: {
          id: string;
          guest_user_id: string | null;
          full_name: string;
          phone: string;
          email: string;
          cnic_passport_number: string;
          address: string;
          city_country_from: string;
          check_in_date: string;
          check_out_date: string;
          estimated_arrival_time: string | null;
          number_of_guests: number;
          purpose_of_visit: Database["public"]["Enums"]["purpose_of_visit"];
          booking_source: Database["public"]["Enums"]["booking_source"];
          has_stayed_before: boolean;
          payment_method: Database["public"]["Enums"]["payment_method"];
          agreed_room_rate_pkr: number | null;
          advance_paid_amount_pkr: number | null;
          total_expected_amount_pkr: number | null;
          amount_paid_pkr: number | null;
          payment_status: Database["public"]["Enums"]["payment_status"];
          status: Database["public"]["Enums"]["checkin_status"];
          assigned_room_id: string | null;
          special_requests: string | null;
          internal_notes: string | null;
          guest_tag: Database["public"]["Enums"]["guest_tag"];
          cnic_verified: boolean;
          payment_verified: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["guest_checkins"]["Row"]> & {
          full_name: string;
          phone: string;
          email: string;
          cnic_passport_number: string;
          address: string;
          city_country_from: string;
          check_in_date: string;
          check_out_date: string;
          number_of_guests: number;
          purpose_of_visit: Database["public"]["Enums"]["purpose_of_visit"];
          booking_source: Database["public"]["Enums"]["booking_source"];
          payment_method: Database["public"]["Enums"]["payment_method"];
        };
        Update: Partial<Database["public"]["Tables"]["guest_checkins"]["Row"]>;
        Relationships: [];
      };
      guest_documents: {
        Row: {
          id: string;
          checkin_id: string;
          uploaded_by: string | null;
          document_type: Database["public"]["Enums"]["document_type"];
          file_url: string | null;
          file_path: string;
          mime_type: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          checkin_id: string;
          uploaded_by?: string | null;
          document_type: Database["public"]["Enums"]["document_type"];
          file_url?: string | null;
          file_path: string;
          mime_type: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["guest_documents"]["Insert"]>;
        Relationships: [];
      };
      expenses: {
        Row: {
          id: string;
          category: Database["public"]["Enums"]["expense_category"];
          amount_pkr: number;
          expense_date: string;
          paid_to: string;
          payment_method: Database["public"]["Enums"]["payment_method"];
          related_room_id: string | null;
          receipt_file_url: string | null;
          receipt_file_path: string | null;
          notes: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["expenses"]["Row"]> & {
          category: Database["public"]["Enums"]["expense_category"];
          amount_pkr: number;
          expense_date: string;
          paid_to: string;
          payment_method: Database["public"]["Enums"]["payment_method"];
        };
        Update: Partial<Database["public"]["Tables"]["expenses"]["Row"]>;
        Relationships: [];
      };
      room_maintenance_logs: {
        Row: {
          id: string;
          room_id: string;
          issue_title: string;
          issue_description: string | null;
          status: Database["public"]["Enums"]["maintenance_status"];
          cost_pkr: number | null;
          reported_date: string;
          resolved_date: string | null;
          notes: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["room_maintenance_logs"]["Row"]> & {
          room_id: string;
          issue_title: string;
          reported_date: string;
        };
        Update: Partial<Database["public"]["Tables"]["room_maintenance_logs"]["Row"]>;
        Relationships: [];
      };
      audit_logs: {
        Row: {
          id: string;
          actor_user_id: string | null;
          action: string;
          entity_type: string;
          entity_id: string | null;
          metadata: Json;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["audit_logs"]["Row"]> & {
          action: string;
          entity_type: string;
        };
        Update: never;
        Relationships: [];
      };
    };
    Views: {
      guest_checkins_guest_view: {
        Row: Omit<
          Database["public"]["Tables"]["guest_checkins"]["Row"],
          "agreed_room_rate_pkr" | "total_expected_amount_pkr" | "amount_paid_pkr" | "internal_notes" | "guest_tag"
        >;
        Insert: never;
        Update: never;
        Relationships: [];
      };
    };
    Functions: {
      is_management: {
        Args: { user_id?: string };
        Returns: boolean;
      };
      is_super_admin: {
        Args: { user_id?: string };
        Returns: boolean;
      };
      owns_checkin: {
        Args: { checkin_id: string; user_id?: string };
        Returns: boolean;
      };
    };
    Enums: {
      user_role: "guest" | "manager" | "admin" | "super_admin";
      room_type: "economy_room" | "executive_room" | "deluxe_room" | "studio" | "apartment";
      room_status: "active" | "inactive" | "maintenance";
      purpose_of_visit: "family_visit" | "business" | "medical" | "tourism" | "event_wedding" | "other";
      booking_source: "booking_com" | "airbnb" | "direct_whatsapp_call" | "referral" | "other";
      payment_method: "cash" | "bank_transfer" | "online_payment" | "other";
      payment_status: "pending" | "partial" | "paid" | "refunded";
      checkin_status: "submitted" | "under_review" | "approved" | "checked_in" | "checked_out" | "issue";
      guest_tag: "new" | "repeat" | "vip" | "issue" | "do_not_host";
      document_type: "primary_cnic" | "additional_guest_cnic" | "payment_proof" | "other";
      expense_category:
        | "maintenance"
        | "repairs"
        | "cleaning"
        | "salaries"
        | "utilities"
        | "electricity"
        | "gas"
        | "internet"
        | "laundry"
        | "supplies"
        | "platform_commission"
        | "other";
      maintenance_status: "reported" | "in_progress" | "resolved";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};
