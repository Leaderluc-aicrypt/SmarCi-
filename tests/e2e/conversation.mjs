import { chromium } from "playwright";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const out = process.argv[2];
const cookie = readFileSync(process.argv[3], "utf8");

const browser = await chromium.launch({
  executablePath: "/opt/pw-browsers/chromium",
});
const ctx = await browser.newContext({
  viewport: { width: 390, height: 780 },
  deviceScaleFactor: 2,
});
await ctx.addCookies([
  { name: "sb-127-auth-token", value: cookie, domain: "127.0.0.1", path: "/" },
]);
const page = await ctx.newPage();
page.locator(
  'form ~ div, [class*="rounded-2xl"][class*="whitespace-pre-wrap"]',
);

await page.goto("http://127.0.0.1:3000/conversation", {
  waitUntil: "networkidle",
});
await page.screenshot({ path: `${out}/chat-vide.png` });
console.log("• état vide rendu");

// Les amorces du plan §8 doivent remplir le champ.
await page.click("text=Je veux commencer l'importation");
assert.match(await page.inputValue("#contenu"), /Par quoi commencer/);
console.log("• amorce injectée dans le champ");

// Entrée envoie.
await page.fill("#contenu", "Je veux importer des pagnes depuis la Chine.");
await page.press("#contenu", "Enter");
await page.waitForSelector("text=pagnes depuis la Chine", { timeout: 8000 });
assert.equal(
  await page.inputValue("#contenu"),
  "",
  "le champ doit se vider après envoi",
);
console.log("• envoi par Entrée, champ vidé");

// RÉGRESSION : taper pendant qu'un envoi est en cours ne doit rien effacer.
// React 19 réinitialise un formulaire non contrôlé à la fin de son action.
await page.fill("#contenu", "premier");
await page.press("#contenu", "Enter");
await page.fill("#contenu", "saisi pendant l'envoi");
await page.waitForTimeout(2500);
assert.equal(
  await page.inputValue("#contenu"),
  "saisi pendant l'envoi",
  "la saisie en cours ne doit pas être effacée par la fin de l'action précédente",
);
console.log("• saisie préservée pendant un envoi en cours");

// Envoi au bouton.
await page.click('button[aria-label="Envoyer le message"]');
await page.waitForSelector("text=saisi pendant l'envoi", { timeout: 8000 });
await page.screenshot({ path: `${out}/chat-fil.png` });
console.log("• envoi au bouton");

// Maj+Entrée passe à la ligne sans envoyer.
await page.fill("#contenu", "ligne un");
await page.press("#contenu", "Shift+Enter");
assert.match(await page.inputValue("#contenu"), /ligne un/);
console.log("• Maj+Entrée ne déclenche pas l'envoi");
await page.fill("#contenu", "");

// Le bouton est inerte tant que rien n'est écrit.
assert.ok(
  await page.locator('button[aria-label="Envoyer le message"]').isDisabled(),
  "le bouton doit être désactivé sur un champ vide",
);
console.log("• bouton désactivé sur champ vide");

// Persistance après rechargement complet.
await page.reload({ waitUntil: "networkidle" });
for (const t of [
  "pagnes depuis la Chine",
  "premier",
  "saisi pendant l'envoi",
]) {
  await page.waitForSelector(`text=${t}`, { timeout: 8000 });
}
console.log("• les trois messages survivent au rechargement");

await browser.close();
console.log("\nTous les contrôles sont passés.");
