import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  LONGUEUR_MAX,
  messageSchema,
} from "../src/lib/conversation/schemas.ts";

describe("messageSchema", () => {
  it("accepte un message ordinaire", () => {
    const r = messageSchema.safeParse({ contenu: "Bonjour SmarCi" });
    assert.equal(r.success, true);
  });

  it("retire les espaces autour du message", () => {
    const r = messageSchema.parse({ contenu: "  Bonjour  " });
    assert.equal(r.contenu, "Bonjour");
  });

  it("refuse un message vide", () => {
    assert.equal(messageSchema.safeParse({ contenu: "" }).success, false);
  });

  it("refuse un message fait uniquement d'espaces", () => {
    // Sans le `trim` avant contrôle, cette saisie créerait une bulle vide.
    assert.equal(
      messageSchema.safeParse({ contenu: "   \n\t " }).success,
      false,
    );
  });

  it("accepte la longueur maximale", () => {
    const r = messageSchema.safeParse({ contenu: "a".repeat(LONGUEUR_MAX) });
    assert.equal(r.success, true);
  });

  it("refuse au-delà de la longueur maximale", () => {
    const r = messageSchema.safeParse({
      contenu: "a".repeat(LONGUEUR_MAX + 1),
    });
    assert.equal(r.success, false);
  });
});
