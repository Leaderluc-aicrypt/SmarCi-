/**
 * Génère les icônes PWA de SmarCi.
 *
 *   node scripts/generate-icons.mjs
 *
 * Ce sont des PLACEHOLDERS : un disque doré évidé sur fond night. À remplacer
 * par le logo définitif dès qu'il est disponible — il suffit de déposer les
 * PNG aux mêmes chemins et de supprimer ce script.
 */
import { deflateSync } from "node:zlib";
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "public", "icons");

const NIGHT = [0x05, 0x07, 0x0b];
const GOLD = [0xc9, 0x9b, 0x24];

const CRC_TABLE = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});

function crc32(buf) {
  let c = 0xffffffff;
  for (const byte of buf) c = CRC_TABLE[(c ^ byte) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, "ascii"), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([length, body, crc]);
}

/** Couleur d'un pixel : anneau doré centré, fond night. */
function pixel(x, y, size) {
  const c = (size - 1) / 2;
  const d = Math.hypot(x - c, y - c);
  const outer = size * 0.38;
  const inner = size * 0.24;
  const dot = size * 0.1;
  const onRing = d <= outer && d >= inner;
  return onRing || d <= dot ? GOLD : NIGHT;
}

function png(size) {
  const raw = Buffer.alloc(size * (size * 3 + 1));
  let offset = 0;
  for (let y = 0; y < size; y++) {
    raw[offset++] = 0; // filtre "None"
    for (let x = 0; x < size; x++) {
      const [r, g, b] = pixel(x, y, size);
      raw[offset++] = r;
      raw[offset++] = g;
      raw[offset++] = b;
    }
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // 8 bits par canal
  ihdr[9] = 2; // couleur RGB
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

mkdirSync(OUT, { recursive: true });
for (const size of [192, 512]) {
  writeFileSync(join(OUT, `icon-${size}.png`), png(size));
}
writeFileSync(join(OUT, "apple-touch-icon.png"), png(180));
console.log("Icônes générées dans public/icons/");
