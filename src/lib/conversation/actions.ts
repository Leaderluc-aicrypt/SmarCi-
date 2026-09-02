"use server";

import { revalidatePath } from "next/cache";

import { requireUser } from "@/lib/auth/session";
import type { EnvoiState } from "@/lib/conversation/form-state";
import { conversationCourante } from "@/lib/conversation/queries";
import { messageSchema } from "@/lib/conversation/schemas";
import { createClient } from "@/lib/supabase/server";

/**
 * Enregistre un message de l'utilisateur.
 *
 * Le copilote ne répond pas encore : l'intégration OpenAI est la Phase 4. Rien
 * de factice n'est écrit en base à sa place — l'historique doit rester
 * exactement ce que l'utilisateur a dit, puisque c'est ce contexte que le
 * modèle lira.
 */
export async function envoyerMessage(
  _prevState: EnvoiState,
  formData: FormData,
): Promise<EnvoiState> {
  const user = await requireUser();

  const parsed = messageSchema.safeParse({
    contenu: String(formData.get("contenu") ?? ""),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message,
    };
  }

  const conversationId = await conversationCourante(user.id);
  const supabase = await createClient();

  const { error } = await supabase.from("messages").insert({
    conversation_id: conversationId,
    role: "user",
    content: parsed.data.contenu,
  });

  if (error) {
    return {
      status: "error",
      message: "Votre message n'a pas pu être enregistré. Réessayez.",
    };
  }

  // Remonte la conversation en tête de liste et rafraîchit l'historique rendu.
  await supabase
    .from("conversations")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", conversationId);

  revalidatePath("/conversation");

  return { status: "idle" };
}
