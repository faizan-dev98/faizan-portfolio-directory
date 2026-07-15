/**
 * Headless E2E verification for the Sixsense reference-finder page.
 * Serves the production build via `vite preview`; Chromium drives the page and
 * asserts every section of the spec renders and behaves as described.
 *
 * Run: npm run build && node scripts/verify.mjs
 */
import { spawn } from "node:child_process";
import { createServer } from "node:net";
import { chromium } from "playwright";

const PORT = await new Promise((resolve, reject) => {
	const probe = createServer();
	probe.once("error", reject);
	probe.listen(0, () => {
		const { port } = probe.address();
		probe.close(() => resolve(port));
	});
});
const URL = `http://localhost:${PORT}/`;

let failures = 0;
const pass = (msg) => console.log(`  ✓ ${msg}`);
const fail = (msg) => {
	failures += 1;
	console.error(`  ✗ ${msg}`);
};
const check = (cond, msg) => (cond ? pass(msg) : fail(msg));

const waitForServer = async (url, timeoutMs = 15000) => {
	const deadline = Date.now() + timeoutMs;
	while (Date.now() < deadline) {
		try {
			const res = await fetch(url);
			if (res.ok) return;
		} catch {
			/* not up yet */
		}
		await new Promise((r) => setTimeout(r, 250));
	}
	throw new Error(`Preview server did not start at ${url}`);
};

const server = spawn(
	"./node_modules/.bin/vite",
	["preview", "--port", String(PORT), "--strictPort"],
	{ stdio: "ignore" },
);
server.on("exit", (code) => {
	if (code !== null && code !== 0) {
		console.error(`Preview server exited with code ${code} (port in use?)`);
		process.exit(1);
	}
});

try {
	await waitForServer(URL);
	console.log(`Preview server up at ${URL}\n`);

	const browser = await chromium.launch();
	const page = await browser.newPage({
		viewport: { width: 1280, height: 800 },
		deviceScaleFactor: 2,
	});
	page.setDefaultTimeout(10000);

	const consoleErrors = [];
	page.on("console", (msg) => {
		if (msg.type() === "error") consoleErrors.push(msg.text());
	});
	page.on("pageerror", (err) => consoleErrors.push(String(err)));

	const failedRequests = [];
	page.on("requestfailed", (req) =>
		failedRequests.push(`${req.url()} (${req.failure()?.errorText})`),
	);
	page.on("response", (res) => {
		if (res.status() >= 400)
			failedRequests.push(`${res.url()} -> ${res.status()}`);
	});

	await page.goto(URL, { waitUntil: "load" });

	console.log("Section 1 — Pixel-grid background");
	check(
		(await page.locator("canvas").count()) === 2,
		"two pixel-grid canvases rendered (left + right)",
	);
	// After mount the reveal animation paints some tiles -> canvas not blank.
	await page.waitForTimeout(1200);
	const canvasHasPixels = await page
		.locator("canvas")
		.first()
		.evaluate((c) => {
			const ctx = c.getContext("2d");
			const data = ctx.getImageData(0, 0, c.width, c.height).data;
			for (let i = 3; i < data.length; i += 4) if (data[i] > 0) return true;
			return false;
		});
	check(
		canvasHasPixels,
		"left grid canvas has painted (non-transparent) tiles",
	);

	console.log("\nSection 2 — Navbar");
	check(
		(await page.locator('nav img[src*="logo-icon"]').count()) === 1 &&
			(await page.locator('nav img[src*="logo-text"]').count()) === 1,
		"logo icon + text images present in navbar",
	);

	console.log("\nSection 3 — Left sidebar");
	check(
		(await page.locator('img[src*="chat.svg"]').count()) === 1,
		"chat icon button present",
	);
	check(
		(await page.locator('img[src*="search.svg"]').count()) === 1,
		"search icon button present",
	);

	console.log("\nSection 4a/4b — Folder stack + floating cards");
	check(
		(await page.locator('img[src*="folder-0.svg"]').count()) === 1,
		"folder-0 (?v=2) present",
	);
	check(
		(await page.locator('img[src*="image-1.png"]').count()) === 1 &&
			(await page.locator('img[src*="image-2.png"]').count()) === 1 &&
			(await page.locator('img[src*="image-3.png"]').count()) === 1,
		"three floating card images present",
	);
	// Cards should have grown well past their 20px start size after entrance.
	await page.waitForTimeout(2600);
	const cardW = await page
		.locator('img[src*="image-2.png"]')
		.evaluate((el) => el.getBoundingClientRect().width);
	check(
		cardW > 60,
		`card entrance tween ran (image-2 width ${cardW.toFixed(0)}px > 60)`,
	);

	console.log("\nSection 4c/4d — Heading + subtitle");
	check(
		await page
			.getByText("Let's find the right references for your work")
			.isVisible(),
		"heading text rendered",
	);
	check(
		await page
			.getByText("What type of references are you looking for?")
			.isVisible(),
		"subtitle text rendered",
	);
	const headingOpacity = await page
		.locator("h1")
		.evaluate((el) => getComputedStyle(el).opacity);
	check(headingOpacity === "1", "heading entrance settled (opacity 1)");

	console.log("\nSection 4e — Prompt input + typewriter");
	const tw1 = await page.locator('span[style*="pre"]').first().textContent();
	await page.waitForTimeout(900);
	const tw2 = await page.locator('span[style*="pre"]').first().textContent();
	check(tw1 !== tw2, `typewriter is animating ("${tw1}" -> "${tw2}")`);
	check(
		await page.getByText("Top Expert").isVisible(),
		"Top Expert pill present",
	);
	check(
		await page.getByText("UI Design").isVisible(),
		"UI Design tag pill present",
	);
	check(
		(await page.locator('img[src*="ai-select.svg"]').count()) === 1 &&
			(await page.locator('img[src*="image.svg"]').count()) >= 1 &&
			(await page.locator('img[src*="Capa_1.svg"]').count()) === 1,
		"toolbar icons (ai-select, image, Capa_1) present",
	);

	console.log("\nSection 4f — Send button");
	check(
		(await page.locator('img[src*="dots.svg"]').count()) === 1,
		"dots overlay present",
	);
	check(
		(await page.locator('img[src*="arrow-up.svg"]').count()) >= 1,
		"arrow-up icon present",
	);
	// Hover should kick the spinning ring (transform changes over time).
	const sendBtn = page.locator('img[src*="arrow-up.svg"]').first();
	await sendBtn.scrollIntoViewIfNeeded();
	await sendBtn.hover();
	await page.waitForTimeout(120);
	const ring = page.locator('div[style*="conic-gradient"]').first();
	const r1 = await ring.evaluate((el) => getComputedStyle(el).transform);
	await page.waitForTimeout(400);
	const r2 = await ring.evaluate((el) => getComputedStyle(el).transform);
	check(r1 !== r2, "send-button ring spins on hover (transform changes)");

	console.log("\nSection 5 — Footer");
	check(
		await page.getByText(/By sending a message to ChatBot/).isVisible(),
		"footer disclaimer present",
	);
	check(
		(await page.getByText("Terms", { exact: true }).isVisible()) &&
			(await page.getByText("Privacy Policy.").isVisible()),
		"Terms + Privacy Policy links present",
	);

	console.log("\nAsset health");
	const brokenAssets = failedRequests.filter((u) =>
		/\.(svg|png|woff2)/.test(u),
	);
	check(
		brokenAssets.length === 0,
		`all vendored assets loaded (${brokenAssets.length} failures)`,
	);
	if (brokenAssets.length)
		brokenAssets.forEach((u) => console.error(`    ${u}`));

	console.log("\nConsole health");
	check(
		consoleErrors.length === 0,
		`no console/page errors (${consoleErrors.length} found)`,
	);
	if (consoleErrors.length)
		consoleErrors.forEach((e) => console.error(`    ${e}`));

	await browser.close();
} finally {
	server.kill("SIGTERM");
}

console.log(
	failures === 0 ? "\nALL CHECKS PASSED" : `\n${failures} CHECK(S) FAILED`,
);
process.exit(failures === 0 ? 0 : 1);
