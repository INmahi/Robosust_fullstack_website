// Hand-authored to match apps/public-site/supabase/migrations/0001_init.sql.
// Regenerate with `supabase gen types typescript` once the CLI is linked to
// the project — until then, keep this file and the migration in sync by hand.
//
// Every table carries `Relationships: []` and the schema carries empty
// `Views`/`Functions` maps solely to satisfy supabase-js's GenericSchema
// constraint (SupabaseClient<Database> resolves to `never` otherwise, since
// none of these tables use foreign-table embedding or RPC functions).

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

type Timestamped = {
  created_at: string;
  updated_at: string;
};

export interface Database {
  public: {
    Tables: {
      cms_users: {
        Row: {
          id: string;
          username: string;
          email: string;
          full_name: string;
          role: string;
          must_change_password: boolean;
          created_at: string;
        };
        Insert: {
          id: string;
          username: string;
          email: string;
          full_name: string;
          role?: string;
          must_change_password?: boolean;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["cms_users"]["Insert"]>;
        Relationships: [];
      };
      site_settings: {
        Row: {
          id: true;
          site_name: string;
          tagline: string | null;
          logo_url: string | null;
          favicon_url: string | null;
          social_facebook: string | null;
          social_youtube: string | null;
          social_linkedin: string | null;
          social_instagram: string | null;
          social_github: string | null;
          social_whatsapp: string | null;
          contact_email: string | null;
          contact_phone: string | null;
          contact_address: string | null;
          map_embed_url: string | null;
          recruitment_open: boolean;
          footer_note: string | null;
          background_image_url: string | null;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["site_settings"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["site_settings"]["Row"]>;
        Relationships: [];
      };
      navigation_items: {
        Row: {
          id: string;
          label: string;
          url: string;
          group_name: "primary" | "more" | "footer";
          parent_id: string | null;
          sort_order: number;
          visible: boolean;
        } & Timestamped;
        Insert: Partial<Database["public"]["Tables"]["navigation_items"]["Row"]> & {
          label: string;
          url: string;
          group_name: "primary" | "more" | "footer";
        };
        Update: Partial<Database["public"]["Tables"]["navigation_items"]["Insert"]>;
        Relationships: [];
      };
      home_sections: {
        Row: {
          id: string;
          section_key: string;
          eyebrow: string | null;
          heading: string | null;
          subheading: string | null;
          body: string | null;
          background_image_url: string | null;
          secondary_image_url: string | null;
          stat_text: string | null;
          cta_text: string | null;
          cta_url: string | null;
          secondary_cta_text: string | null;
          secondary_cta_url: string | null;
          visible: boolean;
          sort_order: number;
        } & Timestamped;
        Insert: Partial<Database["public"]["Tables"]["home_sections"]["Row"]> & { section_key: string };
        Update: Partial<Database["public"]["Tables"]["home_sections"]["Insert"]>;
        Relationships: [];
      };
      home_section_items: {
        Row: {
          id: string;
          section_id: string;
          value: string | null;
          label: string | null;
          body: string | null;
          image_url: string | null;
          sort_order: number;
        } & Timestamped;
        Insert: Partial<Database["public"]["Tables"]["home_section_items"]["Row"]> & { section_id: string };
        Update: Partial<Database["public"]["Tables"]["home_section_items"]["Insert"]>;
        Relationships: [];
      };
      seo_metadata: {
        Row: {
          id: string;
          page_key: string;
          title: string | null;
          description: string | null;
          share_image_url: string | null;
        } & Timestamped;
        Insert: Partial<Database["public"]["Tables"]["seo_metadata"]["Row"]> & { page_key: string };
        Update: Partial<Database["public"]["Tables"]["seo_metadata"]["Insert"]>;
        Relationships: [];
      };
      notices: {
        Row: {
          id: string;
          title: string;
          body: string | null;
          link: string | null;
          pinned: boolean;
          expires_at: string | null;
          sort_order: number;
        } & Timestamped;
        Insert: Partial<Database["public"]["Tables"]["notices"]["Row"]> & { title: string };
        Update: Partial<Database["public"]["Tables"]["notices"]["Insert"]>;
        Relationships: [];
      };
      achievements: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          image_url: string | null;
          competition: string | null;
          year: number | null;
          position: string | null;
          team_name: string | null;
          sort_order: number;
        } & Timestamped;
        Insert: Partial<Database["public"]["Tables"]["achievements"]["Row"]> & { title: string };
        Update: Partial<Database["public"]["Tables"]["achievements"]["Insert"]>;
        Relationships: [];
      };
      projects: {
        Row: {
          id: string;
          slug: string;
          title: string;
          description: string | null;
          body: string | null;
          images: string[];
          cover_image_url: string | null;
          status: "ongoing" | "completed" | "upcoming";
          flagship: boolean;
          category: string | null;
          github_url: string | null;
          demo_url: string | null;
          sort_order: number;
        } & Timestamped;
        Insert: Partial<Database["public"]["Tables"]["projects"]["Row"]> & { slug: string; title: string };
        Update: Partial<Database["public"]["Tables"]["projects"]["Insert"]>;
        Relationships: [];
      };
      events: {
        Row: {
          id: string;
          slug: string;
          title: string;
          description: string | null;
          image_url: string | null;
          category: "workshop" | "seminar" | "competition" | "meeting" | null;
          event_date: string | null;
          location: string | null;
          registration_url: string | null;
          sort_order: number;
        } & Timestamped;
        Insert: Partial<Database["public"]["Tables"]["events"]["Row"]> & { slug: string; title: string };
        Update: Partial<Database["public"]["Tables"]["events"]["Insert"]>;
        Relationships: [];
      };
      blog_posts: {
        Row: {
          id: string;
          slug: string;
          title: string;
          content: string | null;
          excerpt: string | null;
          image_url: string | null;
          author: string | null;
          category: string | null;
          published: boolean;
        } & Timestamped;
        Insert: Partial<Database["public"]["Tables"]["blog_posts"]["Row"]> & { slug: string; title: string };
        Update: Partial<Database["public"]["Tables"]["blog_posts"]["Insert"]>;
        Relationships: [];
      };
      committee_members: {
        Row: {
          id: string;
          photo_url: string | null;
          name: string;
          designation: string;
          department_session: string | null;
          tier_group: string | null;
          sort_order: number;
        } & Timestamped;
        Insert: Partial<Database["public"]["Tables"]["committee_members"]["Row"]> & {
          name: string;
          designation: string;
        };
        Update: Partial<Database["public"]["Tables"]["committee_members"]["Insert"]>;
        Relationships: [];
      };
      alumni: {
        Row: {
          id: string;
          name: string;
          department: string | null;
          batch: string | null;
          photo_url: string | null;
          current_position: string | null;
          linkedin_url: string | null;
          sort_order: number;
        } & Timestamped;
        Insert: Partial<Database["public"]["Tables"]["alumni"]["Row"]> & { name: string };
        Update: Partial<Database["public"]["Tables"]["alumni"]["Insert"]>;
        Relationships: [];
      };
      gallery_albums: {
        Row: {
          id: string;
          slug: string;
          title: string;
          cover_image_url: string | null;
          album_date: string | null;
          sort_order: number;
        } & Timestamped;
        Insert: Partial<Database["public"]["Tables"]["gallery_albums"]["Row"]> & { slug: string; title: string };
        Update: Partial<Database["public"]["Tables"]["gallery_albums"]["Insert"]>;
        Relationships: [];
      };
      gallery_images: {
        Row: {
          id: string;
          album_id: string;
          image_url: string;
          caption: string | null;
          sort_order: number;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["gallery_images"]["Row"]> & {
          album_id: string;
          image_url: string;
        };
        Update: Partial<Database["public"]["Tables"]["gallery_images"]["Insert"]>;
        Relationships: [];
      };
      agp_blocks: {
        Row: {
          id: string;
          block_key:
            | "hero"
            | "overview"
            | "rules"
            | "schedule"
            | "past_editions"
            | "photo_strip"
            | "registration_cta";
          content: Json;
          visible: boolean;
          sort_order: number;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["agp_blocks"]["Row"]> & {
          block_key: Database["public"]["Tables"]["agp_blocks"]["Row"]["block_key"];
        };
        Update: Partial<Database["public"]["Tables"]["agp_blocks"]["Insert"]>;
        Relationships: [];
      };
      forum_categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          sort_order: number;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["forum_categories"]["Row"]> & { name: string; slug: string };
        Update: Partial<Database["public"]["Tables"]["forum_categories"]["Insert"]>;
        Relationships: [];
      };
      forum_posts: {
        Row: {
          id: string;
          category_id: string | null;
          title: string;
          body: string;
          author_name: string;
          author_email: string;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["forum_posts"]["Row"]> & {
          title: string;
          body: string;
          author_name: string;
          author_email: string;
        };
        Update: Partial<Database["public"]["Tables"]["forum_posts"]["Insert"]>;
        Relationships: [];
      };
      forum_replies: {
        Row: {
          id: string;
          post_id: string;
          body: string;
          author_name: string;
          author_email: string;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["forum_replies"]["Row"]> & {
          post_id: string;
          body: string;
          author_name: string;
          author_email: string;
        };
        Update: Partial<Database["public"]["Tables"]["forum_replies"]["Insert"]>;
        Relationships: [];
      };
      contact_submissions: {
        Row: {
          id: string;
          name: string;
          email: string;
          department: string | null;
          batch: string | null;
          area_of_interest: string | null;
          message: string | null;
          resolved: boolean;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["contact_submissions"]["Row"]> & {
          name: string;
          email: string;
        };
        Update: Partial<Database["public"]["Tables"]["contact_submissions"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

export type Tables<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Row"];
export type TablesInsert<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Insert"];
export type TablesUpdate<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Update"];
