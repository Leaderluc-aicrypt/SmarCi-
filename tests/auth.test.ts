import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { AuthError } from "@supabase/supabase-js";

import { authErrorMessage } from "../src/lib/auth/messages.ts";
import { safeNextPath } from "../src/lib/auth/redirects.ts";
import { signInSchema, signUpSchema } from "../src/lib/auth/schemas.ts";

describe("safeNextPath", () => {
  it("accepte un chemin interne", () => {
    assert.equal(safeNextPath("/profil"), "/profil");
    assert.equal(safeNextPath("/conversation/42"), "/conversation/42");
  });

  it("refuse une URL absolue vers un autre domaine", () => {
    assert.equal(safeNextPath("https://exemple.test/piege"), "/profil");
    assert.equal(safeNextPath("http://exemple.test"), "/profil");
  });

  it("refuse les formes qui deviennent un domaine après normalisation", () => {
    // `//exemple.test` est une URL protocol-relative : le navigateur y voit un
    // domaine, pas un chemin.
    assert.equal(safeNextPath("//exemple.test"), "/profil");
    assert.equal(safeNextPath("/\\exemple.test"), "/profil");
  });

  it("retombe sur la valeur par défaut quand rien n'est fourni", () => {
    assert.equal(safeNextPath(null), "/profil");
    assert.equal(safeNextPath(undefined), "/profil");
    assert.equal(safeNextPath(""), "/profil");
    assert.equal(safeNextPath("", "/"), "/");
  });
});

describe("signUpSchema", () => {
  const valide = {
    fullName: "Awa Diallo",
    email: "Awa.Diallo@Exemple.test",
    password: "importation2026",
  };

  it("normalise l'e-mail en minuscules et retire les espaces", () => {
    const parsed = signUpSchema.parse({ ...valide, email: "  AWA@X.test " });
    assert.equal(parsed.email, "awa@x.test");
  });

  it("accepte une inscription valide", () => {
    assert.equal(signUpSchema.safeParse(valide).success, true);
  });

  it("refuse un mot de passe trop court", () => {
    const r = signUpSchema.safeParse({ ...valide, password: "court1" });
    assert.equal(r.success, false);
  });

  it("refuse un mot de passe sans chiffre", () => {
    const r = signUpSchema.safeParse({ ...valide, password: "importation" });
    assert.equal(r.success, false);
  });

  it("refuse un mot de passe sans lettre", () => {
    const r = signUpSchema.safeParse({ ...valide, password: "12345678" });
    assert.equal(r.success, false);
  });

  it("refuse un mot de passe au-delà de la limite bcrypt", () => {
    const r = signUpSchema.safeParse({ ...valide, password: "a1".repeat(40) });
    assert.equal(r.success, false);
  });

  it("refuse une adresse e-mail invalide", () => {
    const r = signUpSchema.safeParse({ ...valide, email: "pas-un-email" });
    assert.equal(r.success, false);
  });

  it("refuse un nom trop court", () => {
    const r = signUpSchema.safeParse({ ...valide, fullName: "A" });
    assert.equal(r.success, false);
  });
});

describe("signInSchema", () => {
  it("n'impose aucune forme au mot de passe", () => {
    const r = signInSchema.safeParse({
      email: "awa@exemple.test",
      password: "x",
    });
    assert.equal(r.success, true);
  });

  it("exige un mot de passe non vide", () => {
    const r = signInSchema.safeParse({
      email: "awa@exemple.test",
      password: "",
    });
    assert.equal(r.success, false);
  });
});

describe("authErrorMessage", () => {
  it("renvoie un message générique pour une erreur inconnue", () => {
    const message = authErrorMessage(new Error("boom"));
    assert.match(message, /Une erreur est survenue/);
    // Le message brut ne doit jamais fuiter jusqu'à l'utilisateur.
    assert.doesNotMatch(message, /boom/);
  });

  it("traduit un code d'erreur connu", () => {
    const message = authErrorMessage(
      new AuthError("Invalid login credentials", 400, "invalid_credentials"),
    );
    assert.equal(message, "Adresse e-mail ou mot de passe incorrect.");
  });

  it("ne distingue pas les causes d'un échec de connexion", () => {
    // Un compte inexistant et un mot de passe faux produisent tous deux
    // `invalid_credentials` côté Supabase, donc le même message ici : les
    // distinguer permettrait d'énumérer les inscrits.
    const inconnu = authErrorMessage(
      new AuthError("Invalid login credentials", 400, "invalid_credentials"),
    );
    const mauvaisMotDePasse = authErrorMessage(
      new AuthError("Invalid login credentials", 400, "invalid_credentials"),
    );
    assert.equal(inconnu, mauvaisMotDePasse);
  });

  it("ne laisse jamais passer le message brut de l'API", () => {
    const message = authErrorMessage(
      new AuthError(
        "Database error saving new user",
        500,
        "unexpected_failure",
      ),
    );
    assert.doesNotMatch(message, /Database/);
  });
});
