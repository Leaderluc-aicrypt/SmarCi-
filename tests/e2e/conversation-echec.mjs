import { chromium } from "playwright";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const out = process.argv[2];
const cookie = readFileSync(process.argv[3], "utf8");
const b = await chromium.launch({
  executablePath: "/opt/pw-browsers/chromium",
});
const ctx = await b.newContext({
  viewport: { width: 390, height: 780 },
  deviceScaleFactor: 2,
});
await ctx.addCookies([
  { name: "sb-127-auth-token", value: cookie, domain: "127.0.0.1", path: "/" },
]);
const p = await ctx.newPage();
await p.goto("http://127.0.0.1:3000/conversation", {
  waitUntil: "networkidle",
});

await p.fill("#contenu", "message qui va échouer");
await p.press("#contenu", "Enter");
await p.waitForSelector('[role="alert"]', { timeout: 8000 });

const alerte = await p.textContent('form [role="alert"]');
console.log("• erreur affichée :", JSON.stringify(alerte));
assert.match(alerte, /n'a pas pu être enregistré/);

assert.equal(
  await p.inputValue("#contenu"),
  "message qui va échouer",
  "le message doit être rendu à l'utilisateur en cas d'échec",
);
console.log("• texte restauré dans le champ");

const corps = await p.innerText("body");
assert.ok(
  !corps.includes("panne simulée"),
  "le message brut du serveur ne doit pas fuiter",
);
console.log("• message technique non exposé");

await p.screenshot({ path: `${out}/chat-echec.png` });
await b.close();
console.log("\nChemin d'échec vérifié.");
