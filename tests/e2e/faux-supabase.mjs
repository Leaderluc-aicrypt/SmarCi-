/**
 * Faux Supabase : juste assez de GoTrue et PostgREST pour faire tourner
 * l'interface de conversation en local. Outil de vérification, pas de
 * production — Docker Hub est bloqué ici, donc la vraie pile est hors
 * de portée.
 */
import { createServer } from "node:http";

const UTILISATEUR = {
  id: "11111111-1111-1111-1111-111111111111",
  aud: "authenticated",
  role: "authenticated",
  email: "awa@exemple.test",
  email_confirmed_at: "2026-09-01T10:00:00Z",
  created_at: "2026-09-01T10:00:00Z",
  updated_at: "2026-09-01T10:00:00Z",
  app_metadata: { provider: "email" },
  user_metadata: { full_name: "Awa Diallo" },
};

const db = {
  profiles: [
    {
      id: UTILISATEUR.id,
      email: UTILISATEUR.email,
      full_name: "Awa Diallo",
      experience_level: "debutant",
      created_at: "2026-09-01T10:00:00Z",
      updated_at: "2026-09-01T10:00:00Z",
    },
  ],
  conversations: [],
  messages: [],
};

let seq = 0;
const uuid = () => `00000000-0000-4000-8000-${String(++seq).padStart(12, "0")}`;

const lireCorps = (req) =>
  new Promise((resolve) => {
    let data = "";
    req.on("data", (c) => (data += c));
    req.on("end", () => resolve(data ? JSON.parse(data) : null));
  });

function repondre(res, code, corps, accept) {
  // PostgREST renvoie un objet, pas un tableau, quand le client demande
  // `application/vnd.pgrst.object+json` (c'est ce que fait `.single()`).
  const objet = accept?.includes("pgrst.object");
  if (objet && Array.isArray(corps)) {
    if (corps.length === 0) {
      res.writeHead(406, { "content-type": "application/json" });
      res.end(JSON.stringify({ code: "PGRST116", message: "0 rows" }));
      return;
    }
    corps = corps[0];
  }
  res.writeHead(code, { "content-type": "application/json" });
  res.end(JSON.stringify(corps));
}

createServer(async (req, res) => {
  const url = new URL(req.url, "http://localhost");
  const accept = req.headers.accept ?? "";

  if (url.pathname === "/auth/v1/user") {
    return repondre(res, 200, UTILISATEUR);
  }

  const table = url.pathname.replace("/rest/v1/", "");
  if (!(table in db)) {
    res.writeHead(404).end("{}");
    return;
  }

  if (req.method === "GET") {
    let lignes = [...db[table]];

    const filtreConv = url.searchParams.get("conversation_id");
    if (filtreConv) {
      const id = filtreConv.replace("eq.", "");
      lignes = lignes.filter((l) => l.conversation_id === id);
    }
    const filtreId = url.searchParams.get("id");
    if (filtreId) {
      const id = filtreId.replace("eq.", "");
      lignes = lignes.filter((l) => l.id === id);
    }

    const ordre = url.searchParams.get("order");
    if (ordre?.startsWith("created_at")) {
      lignes.sort((a, b) =>
        ordre.includes("desc")
          ? b.created_at.localeCompare(a.created_at)
          : a.created_at.localeCompare(b.created_at),
      );
    }

    const limite = url.searchParams.get("limit");
    if (limite) lignes = lignes.slice(0, Number(limite));

    return repondre(res, 200, lignes, accept);
  }

  // Panne simulée, pour vérifier que l'application rend son message à
  // l'utilisateur au lieu de le perdre (voir docs/verification-interface.md).
  if (req.method === "POST" && table === "messages" && process.env.ECHEC) {
    res.writeHead(500, { "content-type": "application/json" });
    res.end(JSON.stringify({ message: "panne simulée" }));
    return;
  }

  if (req.method === "POST") {
    const corps = await lireCorps(req);
    const entrees = Array.isArray(corps) ? corps : [corps];
    const creees = entrees.map((e) => {
      const ligne = {
        id: uuid(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...e,
      };
      db[table].push(ligne);
      return ligne;
    });
    return repondre(res, 201, creees, accept);
  }

  if (req.method === "PATCH") {
    res.writeHead(204).end();
    return;
  }

  res.writeHead(405).end("{}");
}).listen(54321, "127.0.0.1", () =>
  console.log("faux Supabase sur http://127.0.0.1:54321"),
);
