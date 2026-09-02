import { cn } from "@/lib/utils";
import type { Message } from "@/lib/conversation/queries";

/** Un message dans le fil. L'utilisateur à droite, le copilote à gauche. */
export function MessageBubble({
  message,
  enCours = false,
}: {
  message: Pick<Message, "role" | "content">;
  /** Message affiché avant confirmation du serveur. */
  enCours?: boolean;
}) {
  const deLUtilisateur = message.role === "user";

  return (
    <div
      className={cn(
        "flex w-full",
        deLUtilisateur ? "justify-end" : "justify-start",
      )}
    >
      <div
        className={cn(
          "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap",
          deLUtilisateur
            ? "rounded-br-md bg-accent text-accent-foreground"
            : "rounded-bl-md bg-card text-card-foreground shadow-sm",
          enCours && "opacity-60",
        )}
      >
        {message.content}
      </div>
    </div>
  );
}
