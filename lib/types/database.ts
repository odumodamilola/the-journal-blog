export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.18";
  };
  public: {
    Tables: {
      admin_users: {
        Row: {
          singleton: boolean;
          user_id: string;
        };
        Insert: {
          singleton?: boolean;
          user_id: string;
        };
        Update: {
          singleton?: boolean;
          user_id?: string;
        };
        Relationships: [];
      };
      media_assets: {
        Row: {
          alt: string;
          caption: string;
          created_at: string;
          deleted_at: string | null;
          filename: string;
          height: number | null;
          id: string;
          lease_token: string | null;
          mime_type: string;
          original_bytes: number;
          owner_id: string;
          status: string;
          updated_at: string;
          variants: Json;
          width: number | null;
        };
        Insert: {
          alt?: string;
          caption?: string;
          created_at?: string;
          deleted_at?: string | null;
          filename: string;
          height?: number | null;
          id?: string;
          lease_token?: string | null;
          mime_type: string;
          original_bytes: number;
          owner_id: string;
          status?: string;
          updated_at?: string;
          variants?: Json;
          width?: number | null;
        };
        Update: {
          alt?: string;
          caption?: string;
          created_at?: string;
          deleted_at?: string | null;
          filename?: string;
          height?: number | null;
          id?: string;
          lease_token?: string | null;
          mime_type?: string;
          original_bytes?: number;
          owner_id?: string;
          status?: string;
          updated_at?: string;
          variants?: Json;
          width?: number | null;
        };
        Relationships: [];
      };
      post_revisions: {
        Row: {
          created_at: string;
          data: Json;
          id: string;
          post_id: string;
          version: number;
        };
        Insert: {
          created_at?: string;
          data: Json;
          id?: string;
          post_id: string;
          version: number;
        };
        Update: {
          created_at?: string;
          data?: Json;
          id?: string;
          post_id?: string;
          version?: number;
        };
        Relationships: [
          {
            foreignKeyName: "post_revisions_post_id_fkey";
            columns: ["post_id"];
            isOneToOne: false;
            referencedRelation: "posts";
            referencedColumns: ["id"];
          },
        ];
      };
      posts: {
        Row: {
          author_id: string;
          category: string;
          content: string;
          content_document: Json | null;
          content_format: string;
          cover_image_alt: string;
          cover_image_url: string | null;
          created_at: string;
          excerpt: string;
          id: string;
          media_ids: string[];
          published_at: string | null;
          slug: string;
          status: string;
          title: string;
          updated_at: string;
          version: number;
        };
        Insert: {
          author_id: string;
          category?: string;
          content?: string;
          content_document?: Json | null;
          content_format?: string;
          cover_image_alt?: string;
          cover_image_url?: string | null;
          created_at?: string;
          excerpt?: string;
          id?: string;
          media_ids?: string[];
          published_at?: string | null;
          slug: string;
          status?: string;
          title?: string;
          updated_at?: string;
          version?: number;
        };
        Update: {
          author_id?: string;
          category?: string;
          content?: string;
          content_document?: Json | null;
          content_format?: string;
          cover_image_alt?: string;
          cover_image_url?: string | null;
          created_at?: string;
          excerpt?: string;
          id?: string;
          media_ids?: string[];
          published_at?: string | null;
          slug?: string;
          status?: string;
          title?: string;
          updated_at?: string;
          version?: number;
        };
        Relationships: [];
      };
      site_drafts: {
        Row: {
          config: Json;
          media_ids: string[];
          singleton: boolean;
          updated_at: string;
          version: number;
        };
        Insert: {
          config?: Json;
          media_ids?: string[];
          singleton?: boolean;
          updated_at?: string;
          version?: number;
        };
        Update: {
          config?: Json;
          media_ids?: string[];
          singleton?: boolean;
          updated_at?: string;
          version?: number;
        };
        Relationships: [];
      };
      site_publications: {
        Row: {
          config: Json;
          media_ids: string[];
          published_at: string;
          singleton: boolean;
          version: number;
        };
        Insert: {
          config?: Json;
          media_ids?: string[];
          published_at?: string;
          singleton?: boolean;
          version?: number;
        };
        Update: {
          config?: Json;
          media_ids?: string[];
          published_at?: string;
          singleton?: boolean;
          version?: number;
        };
        Relationships: [];
      };
      site_revisions: {
        Row: {
          config: Json;
          created_at: string;
          id: string;
          version: number;
        };
        Insert: {
          config: Json;
          created_at?: string;
          id?: string;
          version: number;
        };
        Update: {
          config?: Json;
          created_at?: string;
          id?: string;
          version?: number;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      claim_media_job: {
        Args: { p_id: string };
        Returns: {
          alt: string;
          caption: string;
          created_at: string;
          deleted_at: string | null;
          filename: string;
          height: number | null;
          id: string;
          lease_token: string | null;
          mime_type: string;
          original_bytes: number;
          owner_id: string;
          status: string;
          updated_at: string;
          variants: Json;
          width: number | null;
        }[];
        SetofOptions: {
          from: "*";
          to: "media_assets";
          isOneToOne: false;
          isSetofReturn: true;
        };
      };
      save_site_document: {
        Args: {
          p_config: Json;
          p_expected_version: number;
          p_media_ids: string[];
          p_publish: boolean;
        };
        Returns: number;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  "public"
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {},
  },
} as const;
