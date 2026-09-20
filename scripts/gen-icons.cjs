/* Generates VibeHai PWA icons as real PNGs (no external deps). */
const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

const CRC_TABLE = (() => {
  const t = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c;
  }
  return t;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const body = Buffer.concat([Buffer.from(type, "ascii"), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body), 0);
  return Buffer.concat([len, body, crc]);
}

function encodePng(width, height, rgba) {
  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // RGBA
  const raw = Buffer.alloc((width * 4 + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (width * 4 + 1)] = 0; // filter: none
    rgba.copy(raw, y * (width * 4 + 1) + 1, y * width * 4, (y + 1) * width * 4);
  }
  return Buffer.concat([
    sig,
    chunk("IHDR", ihdr),
    chunk("IDAT", zlib.deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

const lerp = (a, b, t) => a + (b - a) * t;
const hex = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];

/* point in triangle (sign method) */
function inTri(px, py, a, b, c) {
  const s = (ax, ay, bx, by, cx, cy) => (ax - cx) * (by - cy) - (bx - cx) * (ay - cy);
  const d1 = s(px, py, a[0], a[1], b[0], b[1]);
  const d2 = s(px, py, b[0], b[1], c[0], c[1]);
  const d3 = s(px, py, c[0], c[1], a[0], a[1]);
  const neg = d1 < 0 || d2 < 0 || d3 < 0;
  const pos = d1 > 0 || d2 > 0 || d3 > 0;
  return !(neg && pos);
}

function circle(x, y, cx, cy, r) {
  return (x - cx) ** 2 + (y - cy) ** 2 <= r * r;
}

function roundedRect(x, y, x0, y0, x1, y1, r) {
  if (x < x0 || x > x1 || y < y0 || y > y1) return false;
  const cx = Math.min(Math.max(x, x0 + r), x1 - r);
  const cy = Math.min(Math.max(y, y0 + r), y1 - r);
  return (x - cx) ** 2 + (y - cy) ** 2 <= r * r || (x >= x0 + r && x <= x1 - r) || (y >= y0 + r && y <= y1 - r);
}

function draw(size, { maskable = false } = {}) {
  const buf = Buffer.alloc(size * size * 4);
  const c1 = hex("#7c3aed");
  const c2 = hex("#d946ef");
  const c3 = hex("#fb7185");
  const radius = maskable ? 0 : size * 0.235;
  const pad = 0; // full bleed

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;
      const t = (x / size + y / size) / 2;
      let r, g, b;
      if (t < 0.5) {
        const k = t / 0.5;
        r = lerp(c1[0], c2[0], k);
        g = lerp(c1[1], c2[1], k);
        b = lerp(c1[2], c2[2], k);
      } else {
        const k = (t - 0.5) / 0.5;
        r = lerp(c2[0], c3[0], k);
        g = lerp(c2[1], c3[1], k);
        b = lerp(c2[2], c3[2], k);
      }

      let alpha = 255;
      if (radius > 0 && !roundedRect(x, y, pad, pad, size - 1 - pad, size - 1 - pad, radius)) alpha = 0;

      // soft top-left glow
      const glow = Math.max(0, 1 - Math.hypot(x - size * 0.22, y - size * 0.2) / (size * 0.72));
      r = lerp(r, 255, glow * 0.16);
      g = lerp(g, 255, glow * 0.1);
      b = lerp(b, 255, glow * 0.12);

      // white play triangle glyph
      const s = size;
      const tri = [
        [s * 0.385, s * 0.29],
        [s * 0.385, s * 0.71],
        [s * 0.735, s * 0.5],
      ];
      const glyph = inTri(x + 0.5, y + 0.5, tri[0], tri[1], tri[2]);
      if (glyph) {
        r = 255;
        g = 255;
        b = 255;
      } else if (alpha > 0) {
        // subtle inner vignette
        const vig = Math.max(0, 1 - Math.hypot(x - s / 2, y - s / 2) / (s * 0.78));
        r = lerp(r, r * 0.82, vig * 0.35);
      }

      buf[i] = Math.round(Math.min(255, r));
      buf[i + 1] = Math.round(Math.min(255, g));
      buf[i + 2] = Math.round(Math.min(255, b));
      buf[i + 3] = alpha;
    }
  }
  return encodePng(size, size, buf);
}

const outDir = path.join(process.cwd(), "public", "icons");
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, "icon-192.png"), draw(192));
fs.writeFileSync(path.join(outDir, "icon-512.png"), draw(512));
fs.writeFileSync(path.join(outDir, "maskable-512.png"), draw(512, { maskable: true }));
console.log("icons written:", fs.readdirSync(outDir).join(", "));
