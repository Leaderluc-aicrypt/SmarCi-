/**
 * Types de la base SmarCi.
 *
 * Écrits à la main pour refléter `supabase/migrations/0001_init.sql`.
 * À régénérer dès que le schéma évolue :
 *
 *   npx supabase gen types typescript --project-id <ref> --schema public \
 *     > src/lib/database.types.ts
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

/** Niveau d'expérience de l'utilisateur (cf. plan MVP §5.1). */
export type ExperienceLevel =
  "aspirant" | "debutant" | "amateur" | "professionnel";

/** Rôle d'un message dans une conversation. */
export type MessageRole = "user" | "assistant" | "system" | "tool";

/** Type de calcul déterministe enregistré (cf. plan MVP §5.2). */
export type CalculationType = "import_cost" | "margin";

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string | null;
          full_name: string | null;
          experience_level: ExperienceLevel;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email?: string | null;
          full_name?: string | null;
          experience_level?: ExperienceLevel;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string | null;
          full_name?: string | null;
          experience_level?: ExperienceLevel;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      conversations: {
        Row: {
          id: string;
          user_id: string;
          title: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      messages: {
        Row: {
          id: string;
          conversation_id: string;
          role: MessageRole;
          content: string;
          tool_calls: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          conversation_id: string;
          role: MessageRole;
          content?: string;
          tool_calls?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          conversation_id?: string;
          role?: MessageRole;
          content?: string;
          tool_calls?: Json | null;
          created_at?: string;
        };
        Relationships: [];
      };
      calculations: {
        Row: {
          id: string;
          user_id: string;
          message_id: string | null;
          type: CalculationType;
          inputs: Json;
          results: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          message_id?: string | null;
          type: CalculationType;
          inputs: Json;
          results: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          message_id?: string | null;
          type?: CalculationType;
          inputs?: Json;
          results?: Json;
          created_at?: string;
        };
        Relationships: [];
      };
      guide_documents: {
        Row: {
          id: string;
          title: string;
          source: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          source?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          source?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      guide_chunks: {
        Row: {
          id: string;
          document_id: string;
          content: string;
          /** Vecteur pgvector(1536), sérialisé en chaîne par PostgREST. */
          embedding: string | null;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          document_id: string;
          content: string;
          embedding?: string | null;
          metadata?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          document_id?: string;
          content?: string;
          embedding?: string | null;
          metadata?: Json;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<never, never>;
    Functions: Record<never, never>;
    Enums: {
      experience_level: ExperienceLevel;
    };
    CompositeTypes: Record<never, never>;
  };
};
