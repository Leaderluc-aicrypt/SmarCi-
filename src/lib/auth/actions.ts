"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import type { AuthFormState } from "@/lib/auth/form-state";
import { authErrorMessage } from "@/lib/auth/messages";
import { safeNextPath } from "@/lib/auth/redirects";
import { signInSchema, signUpSchema } from "@/lib/auth/schemas";
import { createClient } from "@/lib/supabase/server";

/**
 * URL publique de l'application, pour construire le lien de confirmation.
 *
 * `NEXT_PUBLIC_SITE_URL` fait foi si elle est définie ; sinon on retombe sur
 * les en-têtes de la requête. Supabase n'accepte de toute façon que les URL
 * inscrites dans sa liste de redirections autorisées, ce qui empêche un
 * en-tête `Host` falsifié de détourner l'e-mail.
 */
async function siteUrl(): Promise<string> {
  const configured = process.env.NEXT_PUBLIC_SITE_URL;
  if (configured) return configured.replace(/\/$/, "");

  const headerList = await headers();
  const host = headerList.get("x-forwarded-host") ?? headerList.get("host");
  const protocol =
    headerList.get("x-forwarded-proto") ??
    (host?.startsWith("localhost") ? "http" : "https");

  return `${protocol}://${host}`;
}

export async function signUp(
  _prevState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const raw = {
    fullName: String(formData.get("fullName") ?? ""),
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
  };

  const values = { fullName: raw.fullName, email: raw.email };
  const parsed = signUpSchema.safeParse(raw);

  if (!parsed.success) {
    return {
      status: "error",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<
        string,
        string[]
      >,
      values,
    };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      // Repris par le trigger `handle_new_user` pour renseigner le profil.
      data: { full_name: parsed.data.fullName },
      emailRedirectTo: `${await siteUrl()}/auth/confirm`,
    },
  });

  if (error) {
    return { status: "error", message: authErrorMessage(error), values };
  }

  // Confirmation par e-mail désactivée : la session est ouverte immédiatement.
  if (data.session) {
    redirect("/profil");
  }

  // Sinon, un e-mail de confirmation part. Ce message est volontairement le
  // même que l'adresse soit déjà inscrite ou non : le contraire permettrait de
  // découvrir qui a un compte.
  return {
    status: "confirmation",
    message:
      "Vérifiez votre boîte mail : un lien de confirmation vient de vous être envoyé.",
    values,
  };
}

export async function signIn(
  _prevState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const raw = {
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
  };

  const values = { email: raw.email };
  const parsed = signInSchema.safeParse(raw);

  if (!parsed.success) {
    return {
      status: "error",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<
        string,
        string[]
      >,
      values,
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    return { status: "error", message: authErrorMessage(error), values };
  }

  // `redirect` lève une exception de contrôle : elle doit rester en dehors de
  // tout try/catch, sinon Next.js ne peut plus l'intercepter.
  redirect(safeNextPath(String(formData.get("next") ?? "")));
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();

  redirect("/");
}
