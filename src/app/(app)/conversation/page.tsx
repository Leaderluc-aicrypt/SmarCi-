import type { Metadata } from "next";

import { Conversation } from "@/components/conversation/conversation";
import { requireUser } from "@/lib/auth/session";
import { conversationCourante, messagesDe } from "@/lib/conversation/queries";

export const metadata: Metadata = { title: "Conversation" };

export default async function ConversationPage() {
  const user = await requireUser();

  // Conversation continue par utilisateur (plan MVP §5.1) : pas de liste de
  // fils, on reprend là où l'utilisateur s'était arrêté.
  const conversationId = await conversationCourante(user.id);
  const messages = await messagesDe(conversationId);

  return <Conversation messagesInitiaux={messages} />;
}
