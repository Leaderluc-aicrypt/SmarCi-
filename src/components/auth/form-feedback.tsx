import { cn } from "@/lib/utils";

/** Erreurs de validation d'un champ. */
export function FieldError({ errors }: { errors?: string[] }) {
  if (!errors?.length) return null;

  return (
    <p className="text-sm text-destructive" role="alert">
      {errors[0]}
    </p>
  );
}

/** Message global du formulaire : échec, ou confirmation à venir. */
export function FormMessage({
  message,
  tone,
}: {
  message?: string;
  tone: "error" | "info";
}) {
  if (!message) return null;

  return (
    <p
      role={tone === "error" ? "alert" : "status"}
      className={cn(
        "rounded-md border px-3 py-2 text-sm",
        tone === "error"
          ? "border-destructive/40 bg-destructive/10 text-destructive"
          : "border-teal-500/40 bg-teal-500/10 text-teal-300",
      )}
    >
      {message}
    </p>
  );
}
