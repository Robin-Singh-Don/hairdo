// ========================================
// SUPABASE GENERATED TYPES
// ========================================
// This file will contain types generated from your Supabase schema
// Run: npx supabase gen types typescript --project-id YOUR_PROJECT_ID > app/structure/Supabase-Types.ts
// ========================================

// For now, we'll define the types manually based on our schema
// In production, these should be auto-generated from Supabase

export interface Database {
  public: {
    Tables: {
      bookings: {
        Row: {
          id: string;
          customer_id: string;
          salon_id: string;
          employee_id: string;
          scheduled_start: string;
          scheduled_end: string;
          status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
          payment_status: 'unpaid' | 'paid' | 'refunded' | 'failed';
          base_price: number;
          discount_amount: number;
          tax_amount: number;
          total_price: number;
          special_instructions?: string;
          preferred_employee_id?: string;
          payment_method_id?: string;
          payment_intent_id?: string;
          points_earned: number;
          points_redeemed: number;
          created_at: string;
          updated_at: string;
          confirmed_at?: string;
          cancelled_at?: string;
          completed_at?: string;
        };
        Insert: {
          id?: string;
          customer_id: string;
          salon_id: string;
          employee_id: string;
          scheduled_start: string;
          scheduled_end: string;
          status?: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
          payment_status?: 'unpaid' | 'paid' | 'refunded' | 'failed';
          base_price: number;
          discount_amount?: number;
          tax_amount?: number;
          total_price: number;
          special_instructions?: string;
          preferred_employee_id?: string;
          payment_method_id?: string;
          payment_intent_id?: string;
          points_earned?: number;
          points_redeemed?: number;
          created_at?: string;
          updated_at?: string;
          confirmed_at?: string;
          cancelled_at?: string;
          completed_at?: string;
        };
        Update: {
          id?: string;
          customer_id?: string;
          salon_id?: string;
          employee_id?: string;
          scheduled_start?: string;
          scheduled_end?: string;
          status?: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
          payment_status?: 'unpaid' | 'paid' | 'refunded' | 'failed';
          base_price?: number;
          discount_amount?: number;
          tax_amount?: number;
          total_price?: number;
          special_instructions?: string;
          preferred_employee_id?: string;
          payment_method_id?: string;
          payment_intent_id?: string;
          points_earned?: number;
          points_redeemed?: number;
          created_at?: string;
          updated_at?: string;
          confirmed_at?: string;
          cancelled_at?: string;
          completed_at?: string;
        };
      };
      booking_services: {
        Row: {
          id: string;
          booking_id: string;
          service_id: string;
          name: string;
          category: string;
          duration: number;
          price: number;
        };
        Insert: {
          id?: string;
          booking_id: string;
          service_id: string;
          name: string;
          category: string;
          duration: number;
          price: number;
        };
        Update: {
          id?: string;
          booking_id?: string;
          service_id?: string;
          name?: string;
          category?: string;
          duration?: number;
          price?: number;
        };
      };
      booking_reviews: {
        Row: {
          id: string;
          booking_id: string;
          rating: number;
          review_text?: string;
          photos?: string[];
          is_anonymous: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          booking_id: string;
          rating: number;
          review_text?: string;
          photos?: string[];
          is_anonymous?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          booking_id?: string;
          rating?: number;
          review_text?: string;
          photos?: string[];
          is_anonymous?: boolean;
          created_at?: string;
        };
      };
      payments: {
        Row: {
          id: string;
          booking_id: string;
          amount: number;
          method: string;
          status: 'pending' | 'completed' | 'failed' | 'refunded';
          transaction_id?: string;
          refund_amount?: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          booking_id: string;
          amount: number;
          method: string;
          status?: 'pending' | 'completed' | 'failed' | 'refunded';
          transaction_id?: string;
          refund_amount?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          booking_id?: string;
          amount?: number;
          method?: string;
          status?: 'pending' | 'completed' | 'failed' | 'refunded';
          transaction_id?: string;
          refund_amount?: number;
          created_at?: string;
        };
      };
      salons: {
        Row: {
          id: string;
          business_id: string;
          name: string;
          description?: string;
          address: string;
          city: string;
          state: string;
          zip_code: string;
          phone: string;
          email: string;
          image?: string;
          rating: number;
          total_reviews: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          name: string;
          description?: string;
          address: string;
          city: string;
          state: string;
          zip_code: string;
          phone: string;
          email: string;
          image?: string;
          rating?: number;
          total_reviews?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          business_id?: string;
          name?: string;
          description?: string;
          address?: string;
          city?: string;
          state?: string;
          zip_code?: string;
          phone?: string;
          email?: string;
          image?: string;
          rating?: number;
          total_reviews?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      employees: {
        Row: {
          id: string;
          user_id: string;
          business_id: string;
          display_name: string;
          email: string;
          phone?: string;
          profile_image?: string;
          role: string;
          specialization: string[];
          chair_number?: string;
          rating: number;
          total_reviews: number;
          is_active: boolean;
          is_available: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          business_id: string;
          display_name: string;
          email: string;
          phone?: string;
          profile_image?: string;
          role: string;
          specialization: string[];
          chair_number?: string;
          rating?: number;
          total_reviews?: number;
          is_active?: boolean;
          is_available?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          business_id?: string;
          display_name?: string;
          email?: string;
          phone?: string;
          profile_image?: string;
          role?: string;
          specialization?: string[];
          chair_number?: string;
          rating?: number;
          total_reviews?: number;
          is_active?: boolean;
          is_available?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      customers: {
        Row: {
          id: string;
          user_id: string;
          business_id: string;
          display_name: string;
          email: string;
          phone?: string;
          profile_image?: string;
          is_active: boolean;
          loyalty_points: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          business_id: string;
          display_name: string;
          email: string;
          phone?: string;
          profile_image?: string;
          is_active?: boolean;
          loyalty_points?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          business_id?: string;
          display_name?: string;
          email?: string;
          phone?: string;
          profile_image?: string;
          is_active?: boolean;
          loyalty_points?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}

// Type aliases for easier use
export type BookingRow = Database['public']['Tables']['bookings']['Row'];
export type BookingInsert = Database['public']['Tables']['bookings']['Insert'];
export type BookingUpdate = Database['public']['Tables']['bookings']['Update'];

export type BookingServiceRow = Database['public']['Tables']['booking_services']['Row'];
export type BookingServiceInsert = Database['public']['Tables']['booking_services']['Insert'];

export type BookingReviewRow = Database['public']['Tables']['booking_reviews']['Row'];
export type BookingReviewInsert = Database['public']['Tables']['booking_reviews']['Insert'];

export type PaymentRow = Database['public']['Tables']['payments']['Row'];
export type PaymentInsert = Database['public']['Tables']['payments']['Insert'];

export type SalonRow = Database['public']['Tables']['salons']['Row'];
export type EmployeeRow = Database['public']['Tables']['employees']['Row'];
export type CustomerRow = Database['public']['Tables']['customers']['Row'];
