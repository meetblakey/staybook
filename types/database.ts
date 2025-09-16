export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

type BookingKind = "booking" | "block";

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
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      booking_kind: BookingKind;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};
