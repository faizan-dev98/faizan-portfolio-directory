/**
 * Generates the two PNG assets used by the page:
 *   public/logo.png          — white flower mark, transparent background (256×256)
 *   src/assets/hero-flowers.png — grayscale floral thumbnail (384×256, shown 96×64)
 *
 * Run: npm run generate:assets
 */

import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

/* ---------- logo.png — eight-petal bloom mark ---------- */
const petals = Array.from({ length: 8 }, (_, i) => {
	const angle = i * 45;
	return `<ellipse cx="128" cy="74" rx="26" ry="54"
            transform="rotate(${angle} 128 128)"
            fill="rgba(255,255,255,0.82)" />`;
}).join("\n");

const logoSvg = `
<svg width="256" height="256" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
  <g style="mix-blend-mode:screen">${petals}</g>
  <circle cx="128" cy="128" r="22" fill="#0a0a0a" />
  <circle cx="128" cy="128" r="14" fill="#ffffff" />
</svg>`;

/* ---------- hero-flowers.png — layered grayscale bloom field ---------- */
const bloom = (cx, cy, scale, opacity) =>
	Array.from({ length: 6 }, (_, i) => {
		const angle = i * 60 + 15;
		return `<ellipse cx="${cx}" cy="${cy - 34 * scale}" rx="${13 * scale}" ry="${34 * scale}"
              transform="rotate(${angle} ${cx} ${cy})"
              fill="rgba(255,255,255,${opacity})" />`;
	}).join("\n") +
	`<circle cx="${cx}" cy="${cy}" r="${9 * scale}" fill="rgba(20,20,20,0.9)" />
   <circle cx="${cx}" cy="${cy}" r="${5 * scale}" fill="rgba(255,255,255,0.85)" />`;

const flowersSvg = `
<svg width="384" height="256" viewBox="0 0 384 256" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="glow" cx="50%" cy="42%" r="75%">
      <stop offset="0%" stop-color="#3d3d3d" />
      <stop offset="55%" stop-color="#1c1c1c" />
      <stop offset="100%" stop-color="#0a0a0a" />
    </radialGradient>
    <linearGradient id="haze" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="rgba(255,255,255,0.12)" />
      <stop offset="100%" stop-color="rgba(255,255,255,0)" />
    </linearGradient>
  </defs>
  <rect width="384" height="256" fill="url(#glow)" />
  <rect width="384" height="120" fill="url(#haze)" />
  ${bloom(96, 178, 1.5, 0.28)}
  ${bloom(300, 96, 1.2, 0.22)}
  ${bloom(196, 130, 2.1, 0.5)}
</svg>`;

await mkdir(path.join(root, "public"), { recursive: true });
await mkdir(path.join(root, "src/assets"), { recursive: true });

await sharp(Buffer.from(logoSvg))
	.png()
	.toFile(path.join(root, "public/logo.png"));
await sharp(Buffer.from(flowersSvg))
	.png()
	.toFile(path.join(root, "src/assets/hero-flowers.png"));

console.log("✓ generated public/logo.png and src/assets/hero-flowers.png");
