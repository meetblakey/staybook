export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

type BookingKind = "booking" | "block";
type PriceRuleKind =
  | "weekend_markup"
  | "seasonal"
  | "length_of_stay"
  | "last_minute"
  | "early_bird"
  | "extra_guest"
  | "pet_fee";
type ReportKind = "listing" | "message" | "user" | "review";

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          avatar_url: string | null;
          created_at: string | null;
          full_name: string | null;
          id: string;
          role: "guest" | "host" | "admin";
        };
        Insert: {
          avatar_url?: string | null;
          created_at?: string | null;
          full_name?: string | null;
          id: string;
          role?: "guest" | "host" | "admin";
        };
        Update: {
          avatar_url?: string | null;
          created_at?: string | null;
          full_name?: string | null;
          id?: string;
          role?: "guest" | "host" | "admin";
        };
        Relationships: [];
      };
      cancellation_policies: {
        Row: {
          id: string;
          name: string;
          rules: Json;
        };
        Insert: {
          id: string;
          name: string;
          rules: Json;
        };
        Update: {
          id?: string;
          name?: string;
          rules?: Json;
        };
        Relationships: [];
      };
      listing_price_rules: {
        Row: {
          id: string;
          listing_id: string;
          kind: Database["public"]["Enums"]["price_rule_kind"];
          date_range: string | null;
          min_nights: number | null;
          threshold_days: number | null;
          amount: string | number;
          is_percent: boolean | null;
          extra_guest_threshold: number | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          listing_id: string;
          kind: Database["public"]["Enums"]["price_rule_kind"];
          date_range?: string | null;
          min_nights?: number | null;
          threshold_days?: number | null;
          amount: string | number;
          is_percent?: boolean | null;
          extra_guest_threshold?: number | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          listing_id?: string;
          kind?: Database["public"]["Enums"]["price_rule_kind"];
          date_range?: string | null;
          min_nights?: number | null;
          threshold_days?: number | null;
          amount?: string | number;
          is_percent?: boolean | null;
          extra_guest_threshold?: number | null;
          created_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "listing_price_rules_listing_id_fkey";
            columns: ["listing_id"];
            referencedRelation: "listings";
            referencedColumns: ["id"];
          }
        ];
      };
      calendar_overrides: {
        Row: {
          id: string;
          listing_id: string;
          date: string;
          price: string | number;
        };
        Insert: {
          id?: string;
          listing_id: string;
          date: string;
          price: string | number;
        };
        Update: {
          id?: string;
          listing_id?: string;
          date?: string;
          price?: string | number;
        };
        Relationships: [
          {
            foreignKeyName: "calendar_overrides_listing_id_fkey";
            columns: ["listing_id"];
            referencedRelation: "listings";
            referencedColumns: ["id"];
          }
        ];
      };
      tax_rules: {
        Row: {
          id: string;
          country: string | null;
          state: string | null;
          city: string | null;
          occupancy_tax_pct: string | number | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          country?: string | null;
          state?: string | null;
          city?: string | null;
          occupancy_tax_pct?: string | number | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          country?: string | null;
          state?: string | null;
          city?: string | null;
          occupancy_tax_pct?: string | number | null;
          created_at?: string | null;
        };
        Relationships: [];
      };
      fee_rules: {
        Row: {
          id: string;
          listing_id: string | null;
          service_fee_bps: number | null;
          cleaning_fee: string | number | null;
          security_deposit: string | number | null;
          extra_guest_fee: string | number | null;
          pet_fee: string | number | null;
        };
        Insert: {
          id?: string;
          listing_id?: string | null;
          service_fee_bps?: number | null;
          cleaning_fee?: string | number | null;
          security_deposit?: string | number | null;
          extra_guest_fee?: string | number | null;
          pet_fee?: string | number | null;
        };
        Update: {
          id?: string;
          listing_id?: string | null;
          service_fee_bps?: number | null;
          cleaning_fee?: string | number | null;
          security_deposit?: string | number | null;
          extra_guest_fee?: string | number | null;
          pet_fee?: string | number | null;
        };
        Relationships: [
          {
            foreignKeyName: "fee_rules_listing_id_fkey";
            columns: ["listing_id"];
            referencedRelation: "listings";
            referencedColumns: ["id"];
          }
        ];
      };
      payment_intents: {
        Row: {
          id: string;
          booking_id: string | null;
          provider: string;
          provider_id: string | null;
          client_secret: string | null;
          status: string | null;
          amount_total: number;
          currency: string;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          booking_id?: string | null;
          provider?: string;
          provider_id?: string | null;
          client_secret?: string | null;
          status?: string | null;
          amount_total: number;
          currency?: string;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          booking_id?: string | null;
          provider?: string;
          provider_id?: string | null;
          client_secret?: string | null;
          status?: string | null;
          amount_total?: number;
          currency?: string;
          created_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "payment_intents_booking_id_fkey";
            columns: ["booking_id"];
            referencedRelation: "bookings";
            referencedColumns: ["id"];
          }
        ];
      };
      payout_accounts: {
        Row: {
          user_id: string;
          stripe_account_id: string | null;
          status: string | null;
          updated_at: string | null;
        };
        Insert: {
          user_id: string;
          stripe_account_id?: string | null;
          status?: string | null;
          updated_at?: string | null;
        };
        Update: {
          user_id?: string;
          stripe_account_id?: string | null;
          status?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "payout_accounts_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      payouts: {
        Row: {
          id: string;
          booking_id: string | null;
          stripe_transfer_id: string | null;
          amount: number;
          status: string | null;
          scheduled_for: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          booking_id?: string | null;
          stripe_transfer_id?: string | null;
          amount: number;
          status?: string | null;
          scheduled_for?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          booking_id?: string | null;
          stripe_transfer_id?: string | null;
          amount?: number;
          status?: string | null;
          scheduled_for?: string | null;
          created_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "payouts_booking_id_fkey";
            columns: ["booking_id"];
            referencedRelation: "bookings";
            referencedColumns: ["id"];
          }
        ];
      };
      verification_requests: {
        Row: {
          id: string;
          user_id: string;
          doc_front_path: string | null;
          doc_back_path: string | null;
          status: string | null;
          reviewed_by: string | null;
          reviewed_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          doc_front_path?: string | null;
          doc_back_path?: string | null;
          status?: string | null;
          reviewed_by?: string | null;
          reviewed_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          doc_front_path?: string | null;
          doc_back_path?: string | null;
          status?: string | null;
          reviewed_by?: string | null;
          reviewed_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "verification_requests_reviewed_by_fkey";
            columns: ["reviewed_by"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "verification_requests_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      saved_searches: {
        Row: {
          id: string;
          user_id: string;
          title: string | null;
          filters: Json;
          notify: boolean | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          title?: string | null;
          filters: Json;
          notify?: boolean | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string | null;
          filters?: Json;
          notify?: boolean | null;
          created_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "saved_searches_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      wishlist_collaborators: {
        Row: {
          wishlist_id: string;
          user_id: string;
          role: "owner" | "editor" | "viewer";
        };
        Insert: {
          wishlist_id: string;
          user_id: string;
          role?: "owner" | "editor" | "viewer";
        };
        Update: {
          wishlist_id?: string;
          user_id?: string;
          role?: "owner" | "editor" | "viewer";
        };
        Relationships: [
          {
            foreignKeyName: "wishlist_collaborators_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "wishlist_collaborators_wishlist_id_fkey";
            columns: ["wishlist_id"];
            referencedRelation: "wishlists";
            referencedColumns: ["id"];
          }
        ];
      };
      reports: {
        Row: {
          id: string;
          reporter_id: string | null;
          kind: Database["public"]["Enums"]["report_kind"];
          target_id: string;
          reason: string | null;
          status: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          reporter_id?: string | null;
          kind: Database["public"]["Enums"]["report_kind"];
          target_id: string;
          reason?: string | null;
          status?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          reporter_id?: string | null;
          kind?: Database["public"]["Enums"]["report_kind"];
          target_id?: string;
          reason?: string | null;
          status?: string | null;
          created_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "reports_reporter_id_fkey";
            columns: ["reporter_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      exchange_rates: {
        Row: {
          base: string;
          quote: string;
          rate: string | number;
          as_of: string;
        };
        Insert: {
          base?: string;
          quote: string;
          rate: string | number;
          as_of: string;
        };
        Update: {
          base?: string;
          quote?: string;
          rate?: string | number;
          as_of?: string;
        };
        Relationships: [];
      };
      external_calendars: {
        Row: {
          id: string;
          listing_id: string;
          url: string;
          kind: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          listing_id: string;
          url: string;
          kind?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          listing_id?: string;
          url?: string;
          kind?: string | null;
          created_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "external_calendars_listing_id_fkey";
            columns: ["listing_id"];
            referencedRelation: "listings";
            referencedColumns: ["id"];
          }
        ];
      };
      audit_logs: {
        Row: {
          id: string;
          user_id: string | null;
          action: string;
          entity: string | null;
          entity_id: string | null;
          meta: Json | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          action: string;
          entity?: string | null;
          entity_id?: string | null;
          meta?: Json | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          action?: string;
          entity?: string | null;
          entity_id?: string | null;
          meta?: Json | null;
          created_at?: string | null;
        };
        Relationships: [];
      };
      listings: {
        Row: {
          address_line1: string | null;
          address_line2: string | null;
          amenities: Json;
          bathrooms: string | number | null;
          bedrooms: number | null;
          beds: number | null;
          city: string | null;
          cleaning_fee: string | number | null;
          country: string | null;
          created_at: string | null;
          currency: string | null;
          description: string | null;
          host_id: string;
          id: string;
          location: Json | null;
          max_guests: number;
          price_nightly: string | number;
          property_type: string | null;
          postal_code: string | null;
          cancellation_policy_id: string | null;
          room_type: string | null;
          search: string | null;
          service_fee: string | number | null;
          state: string | null;
          status: "draft" | "published" | "snoozed" | "paused" | "deleted";
          title: string;
        };
        Insert: {
          address_line1?: string | null;
          address_line2?: string | null;
          amenities?: Json;
          bathrooms?: string | number | null;
          bedrooms?: number | null;
          beds?: number | null;
          city?: string | null;
          cleaning_fee?: string | number | null;
          country?: string | null;
          created_at?: string | null;
          currency?: string | null;
          description?: string | null;
          host_id: string;
          id?: string;
          location?: Json | null;
          max_guests: number;
          price_nightly: string | number;
          property_type?: string | null;
          postal_code?: string | null;
          cancellation_policy_id?: string | null;
          room_type?: string | null;
          search?: string | null;
          service_fee?: string | number | null;
          state?: string | null;
          status?: "draft" | "published" | "snoozed" | "paused" | "deleted";
          title: string;
        };
        Update: {
          address_line1?: string | null;
          address_line2?: string | null;
          amenities?: Json;
          bathrooms?: string | number | null;
          bedrooms?: number | null;
          beds?: number | null;
          city?: string | null;
          cleaning_fee?: string | number | null;
          country?: string | null;
          created_at?: string | null;
          currency?: string | null;
          description?: string | null;
          host_id?: string;
          id?: string;
          location?: Json | null;
          max_guests?: number;
          price_nightly?: string | number;
          property_type?: string | null;
          postal_code?: string | null;
          cancellation_policy_id?: string | null;
          room_type?: string | null;
          search?: string | null;
          service_fee?: string | number | null;
          state?: string | null;
          status?: "draft" | "published" | "snoozed" | "paused" | "deleted";
          title?: string;
        };
        Relationships: [
          {
            foreignKeyName: "listings_host_id_fkey";
            columns: ["host_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "listings_cancellation_policy_id_fkey";
            columns: ["cancellation_policy_id"];
            referencedRelation: "cancellation_policies";
            referencedColumns: ["id"];
          }
        ];
      };
      listing_photos: {
        Row: {
          created_at: string | null;
          id: string;
          listing_id: string;
          path: string;
          sort_order: number | null;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          listing_id: string;
          path: string;
          sort_order?: number | null;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          listing_id?: string;
          path?: string;
          sort_order?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "listing_photos_listing_id_fkey";
            columns: ["listing_id"];
            referencedRelation: "listings";
            referencedColumns: ["id"];
          }
        ];
      };
      bookings: {
        Row: {
          created_at: string | null;
          date_range: string;
          guest_id: string | null;
          id: string;
          kind: BookingKind;
          listing_id: string;
          guests_count: number;
          payment_status: "unpaid" | "paid" | "refunded" | "test";
          status: "pending" | "confirmed" | "canceled" | "completed";
          total_price: string | number;
        };
        Insert: {
          created_at?: string | null;
          date_range: string;
          guest_id?: string | null;
          id?: string;
          kind?: BookingKind;
          listing_id: string;
          guests_count?: number;
          payment_status?: "unpaid" | "paid" | "refunded" | "test";
          status?: "pending" | "confirmed" | "canceled" | "completed";
          total_price?: string | number;
        };
        Update: {
          created_at?: string | null;
          date_range?: string;
          guest_id?: string | null;
          id?: string;
          kind?: BookingKind;
          listing_id?: string;
          guests_count?: number;
          payment_status?: "unpaid" | "paid" | "refunded" | "test";
          status?: "pending" | "confirmed" | "canceled" | "completed";
          total_price?: string | number;
        };
        Relationships: [
          {
            foreignKeyName: "bookings_guest_id_fkey";
            columns: ["guest_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "bookings_listing_id_fkey";
            columns: ["listing_id"];
            referencedRelation: "listings";
            referencedColumns: ["id"];
          }
        ];
      };
      threads: {
        Row: {
          created_at: string | null;
          guest_id: string;
          host_id: string;
          id: string;
          last_message_at: string | null;
          listing_id: string | null;
          status: "open" | "archived" | "resolved";
        };
        Insert: {
          created_at?: string | null;
          guest_id: string;
          host_id: string;
          id?: string;
          last_message_at?: string | null;
          listing_id?: string | null;
          status?: "open" | "archived" | "resolved";
        };
        Update: {
          created_at?: string | null;
          guest_id?: string;
          host_id?: string;
          id?: string;
          last_message_at?: string | null;
          listing_id?: string | null;
          status?: "open" | "archived" | "resolved";
        };
        Relationships: [
          {
            foreignKeyName: "threads_guest_id_fkey";
            columns: ["guest_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "threads_host_id_fkey";
            columns: ["host_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "threads_listing_id_fkey";
            columns: ["listing_id"];
            referencedRelation: "listings";
            referencedColumns: ["id"];
          }
        ];
      };
      messages: {
        Row: {
          content: string;
          created_at: string | null;
          id: string;
          sender_id: string;
          thread_id: string;
        };
        Insert: {
          content: string;
          created_at?: string | null;
          id?: string;
          sender_id: string;
          thread_id: string;
        };
        Update: {
          content?: string;
          created_at?: string | null;
          id?: string;
          sender_id?: string;
          thread_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "messages_sender_id_fkey";
            columns: ["sender_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "messages_thread_id_fkey";
            columns: ["thread_id"];
            referencedRelation: "threads";
            referencedColumns: ["id"];
          }
        ];
      };
      wishlists: {
        Row: {
          created_at: string | null;
          id: string;
          title: string;
          user_id: string;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          title: string;
          user_id: string;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          title?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "wishlists_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      wishlist_items: {
        Row: {
          listing_id: string | null;
          wishlist_id: string | null;
        };
        Insert: {
          listing_id?: string | null;
          wishlist_id?: string | null;
        };
        Update: {
          listing_id?: string | null;
          wishlist_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "wishlist_items_listing_id_fkey";
            columns: ["listing_id"];
            referencedRelation: "listings";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "wishlist_items_wishlist_id_fkey";
            columns: ["wishlist_id"];
            referencedRelation: "wishlists";
            referencedColumns: ["id"];
          }
        ];
      };
      reviews: {
        Row: {
          accuracy: number | null;
          author_id: string;
          booking_id: string;
          checkin: number | null;
          cleanliness: number | null;
          comment: string | null;
          communication: number | null;
          created_at: string | null;
          id: string;
          listing_id: string;
          location: number | null;
          overall: number;
          target_user_id: string;
          value: number | null;
        };
        Insert: {
          accuracy?: number | null;
          author_id: string;
          booking_id: string;
          checkin?: number | null;
          cleanliness?: number | null;
          comment?: string | null;
          communication?: number | null;
          created_at?: string | null;
          id?: string;
          listing_id: string;
          location?: number | null;
          overall: number;
          target_user_id: string;
          value?: number | null;
        };
        Update: {
          accuracy?: number | null;
          author_id?: string;
          booking_id?: string;
          checkin?: number | null;
          cleanliness?: number | null;
          comment?: string | null;
          communication?: number | null;
          created_at?: string | null;
          id?: string;
          listing_id?: string;
          location?: number | null;
          overall?: number;
          target_user_id?: string;
          value?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "reviews_author_id_fkey";
            columns: ["author_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "reviews_booking_id_fkey";
            columns: ["booking_id"];
            referencedRelation: "bookings";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "reviews_listing_id_fkey";
            columns: ["listing_id"];
            referencedRelation: "listings";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "reviews_target_user_id_fkey";
            columns: ["target_user_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {
      host_metrics: {
        Row: {
          host_id: string | null;
          avg_rating: number | null;
          cancel_rate: number | null;
          response_rate: number | null;
        };
        Relationships: [];
      };
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      booking_kind: BookingKind;
      price_rule_kind: PriceRuleKind;
      report_kind: ReportKind;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};
