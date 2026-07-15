#!/usr/bin/env node
/**
 * Lightweight dev entry used by the repo demo recorder (`npm run dev`).
 *
 * TanStack Start's full HMR dev server (`npm run dev:hmr` -> `vite dev`) does
 * SSR + on-demand compilation and is memory-heavy; on constrained machines it
 * can be OOM-killed while a headless Chromium records alongside it. To keep the
 * recording deterministic and light, this script builds the app once (if the
 * server bundle is missing) and then serves the production output via
 * `vite preview`, which renders byte-for-byte the same page without the
 * compiler/HMR overhead.
 *
 * For day-to-day development with hot reload, use `npm run dev:hmr`.
 *
 * Any extra CLI args (e.g. `--port 5199 --strictPort` passed by the recorder)
 * are forwarded straight to `vite preview`.
 */
import { spawn, spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const serverBundle = path.join(root, "dist", "server", "server.js");
const viteBin = path.join(root, "node_modules", ".bin", "vite");

const extraArgs = process.argv.slice(2);

if (!existsSync(serverBundle)) {
	console.log("[dev] No build found — running `vite build`...");
	const build = spawnSync(viteBin, ["build"], {
		cwd: root,
		stdio: "inherit",
	});
	if (build.status !== 0) {
		process.exit(build.status ?? 1);
	}
}

console.log(
	`[dev] Serving production build via \`vite preview ${extraArgs.join(" ")}\``,
);
const preview = spawn(viteBin, ["preview", ...extraArgs], {
	cwd: root,
	stdio: "inherit",
});

const forward = (sig) => {
	if (!preview.killed) preview.kill(sig);
};
process.on("SIGINT", () => forward("SIGINT"));
process.on("SIGTERM", () => forward("SIGTERM"));
preview.on("exit", (code) => process.exit(code ?? 0));
