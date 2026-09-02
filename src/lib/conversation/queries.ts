import "server-only";

import type { MessageRole } from "@/lib/database.types";
import { createClient } from "@/lib/supabase/server";

/** Nombre de messages chargés à l'ouverture. Au-delà, l'historique ancien
 *  n'est pas rendu : la page resterait utilisable mais deviendrait lourde. */
const FENETRE = 200;

export type Message = {
  id: string;
  role: MessageRole;
  content: string;
  created_at: string;
};

/**
 * Conversation courante de l'utilisateur, créée si elle n'existe pas encore.
 *
 * Le plan MVP §5.1 décrit une conversation continue par utilisateur : on ne
 * gère donc pas de liste de fils, on reprend le dernier.
 */
export async function conversationCourante(userId: string): Promise<string> {
  const supabase = await createClient();

  const { data: existante } = await supabase
    .from("conversations")
    .select("id")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existante) return existante.id;

  const { data, error } = await supabase
    .from("conversations")
    .insert({ user_id: userId })
    .select("id")
    .single();

  if (error) {
    throw new Error(
      `Création de la conversation impossible : ${error.message}`,
    );
  }

  return data.id;
}

/** Messages d'une conversation, du plus ancien au plus récent. */
export async function messagesDe(conversationId: string): Promise<Message[]> {
  const supabase = await createClient();

  // Tri décroissant pour prendre les plus récents, puis remis dans l'ordre de
  // lecture.
  const { data, error } = await supabase
    .from("messages")
    .select("id, role, content, created_at")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: false })
    .limit(FENETRE);

  if (error) {
    throw new Error(`Lecture des messages impossible : ${error.message}`);
  }

  return data.reverse();
}
