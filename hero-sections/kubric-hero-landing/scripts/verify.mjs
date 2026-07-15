#!/usr/bin/env node
/**
 * Headless verification for the Kubric™ hero landing.
 *
 * Drives an already-running dev server (default http://localhost:5199/) through
 * a headless Chromium and asserts the structure, the video-gated reveal, the
 * runtime character-splitting, the side-nav active marker, and that there are no
 * console / page errors. Exit code 0 = all checks passed.
 *
 * Usage: node scripts/verify.mjs [url]   (Playwright resolved from the recorder)
 */
import { createRequire } from "node:module";

const URL = process.argv[2] || "http://localhost:5199/";
const require = createRequire(import.meta.url);

// Reuse the recorder's already-installed Playwright + Chromium.
let chromium;
try {
	({ chromium } = require("playwright"));
} catch {
	({
		chromium,
	} = require("../../scripts/record-demos/node_modules/playwright/index.js"));
}

const results = [];
const ok = (name) => results.push({ name, pass: true });
const fail = (name, detail) => results.push({ name, pass: false, detail });
const assert = (cond, name, detail) => (cond ? ok(name) : fail(name, detail));

async function main() {
	const browser = await chromium.launch({ headless: true });
	const page = await browser.newPage({
		viewport: { width: 1280, height: 800 },
	});

	const consoleErrors = [];
	const pageErrors = [];
	page.on("console", (m) => {
		if (m.type() === "error") consoleErrors.push(m.text());
	});
	page.on("pageerror", (e) => pageErrors.push(e.message));

	const resp = await page.goto(URL, { waitUntil: "load", timeout: 60000 });
	assert(
		resp && resp.status() === 200,
		"page returns HTTP 200",
		resp?.status(),
	);

	// Structural checks (server-rendered + hydrated).
	const counts = await page.evaluate(() => ({
		hero: document.querySelectorAll(".hero").length,
		video: document.querySelectorAll("video.hero__video").length,
		source:
			document.querySelector("video.hero__video source")?.getAttribute("src") ||
			"",
		blurLayers: document.querySelectorAll(".hero__blur-layer").length,
		navLinks: document.querySelectorAll(".nav-pill__link").length,
		badge: document.querySelector(".nav-pill__badge")?.textContent || "",
		headingLines: document.querySelectorAll(".hero__heading .hero__line")
			.length,
		sideLinks: document.querySelectorAll(".side-nav__link").length,
		activeSide: document.querySelectorAll(".side-nav__link--active").length,
		btnHeader: document.querySelectorAll(".btn--header").length,
		btnFooter: document.querySelectorAll(".btn--footer").length,
		scrollDown: document.querySelectorAll("#scrollDown").length,
		aboutCard: document.querySelectorAll(".about-card").length,
		cardImg:
			document.querySelector(".about-card__image img")?.getAttribute("src") ||
			"",
		label: document.querySelector(".hero__label")?.textContent || "",
		logoArcs: document.querySelectorAll(
			".logo__arc-1a,.logo__arc-1b,.logo__arc-2a,.logo__arc-2b",
		).length,
	}));

	assert(counts.hero === 1, "single .hero root", counts.hero);
	assert(counts.video === 1, "one background video", counts.video);
	assert(
		/body\.mp4/.test(counts.source),
		"video sourced from vendored body.mp4",
		counts.source,
	);
	assert(
		counts.blurLayers === 8,
		"8 progressive-blur layers",
		counts.blurLayers,
	);
	assert(counts.navLinks === 4, "4 nav-pill links", counts.navLinks);
	assert(counts.badge.trim() === "3", 'nav badge reads "3"', counts.badge);
	assert(counts.headingLines === 3, "3 headline lines", counts.headingLines);
	assert(counts.sideLinks === 5, "5 side-nav links", counts.sideLinks);
	assert(
		counts.activeSide === 1,
		"one active side-nav link",
		counts.activeSide,
	);
	assert(
		counts.btnHeader === 1,
		'"Book a call" header button',
		counts.btnHeader,
	);
	assert(
		counts.btnFooter === 1,
		'"Discuss the project" footer button',
		counts.btnFooter,
	);
	assert(counts.scrollDown === 1, "scroll-down pill", counts.scrollDown);
	assert(counts.aboutCard === 1, "about-card present", counts.aboutCard);
	assert(
		/card-image\.png/.test(counts.cardImg),
		"about-card uses vendored card-image.png",
		counts.cardImg,
	);
	assert(
		counts.label.includes("01 — Our goal"),
		'label is "01 — Our goal"',
		counts.label,
	);
	assert(counts.logoArcs === 4, "4 animated logo arcs", counts.logoArcs);

	// The video gates the reveal: body must gain .is-ready and chars must split.
	await page.waitForFunction(
		() => document.body.classList.contains("is-ready"),
		{
			timeout: 8000,
		},
	);
	ok("body gains .is-ready after video/fallback");

	const reveal = await page.evaluate(() => {
		const chars = document.querySelectorAll(".hero__heading .hero__char");
		const firstDelay = chars[0]?.style.animationDelay || "";
		const lastDelay = chars[chars.length - 1]?.style.animationDelay || "";
		return {
			charCount: chars.length,
			firstDelay,
			lastDelay,
			labelChars: document.querySelectorAll(".hero__label .hero__char").length,
			descChars: document.querySelectorAll(".hero__desc .hero__char").length,
		};
	});
	assert(
		reveal.charCount > 30,
		"headline split into many .hero__char spans",
		reveal.charCount,
	);
	assert(
		reveal.labelChars > 0,
		"label split into .hero__char spans",
		reveal.labelChars,
	);
	assert(
		reveal.descChars > 0,
		"description split into .hero__char spans",
		reveal.descChars,
	);
	assert(
		reveal.firstDelay !== "",
		"chars carry staggered animationDelay",
		reveal.firstDelay,
	);

	// After animations settle, a headline char should be fully revealed (opacity ~1).
	await page.waitForTimeout(3500);
	const charOpacity = await page.evaluate(() => {
		const c = document.querySelector(".hero__heading .hero__char");
		return c ? Number(getComputedStyle(c).opacity) : -1;
	});
	assert(
		charOpacity > 0.9,
		"headline chars are revealed (opacity ~1)",
		charOpacity,
	);

	// Buttons stay solid white (rule 9/10), no glass.
	const btnBg = await page.evaluate(() => {
		const b = document.querySelector(".btn--header");
		return b ? getComputedStyle(b).backgroundColor : "";
	});
	assert(btnBg === "rgb(255, 255, 255)", "header button is solid white", btnBg);

	// Side-nav active marker follows clicks.
	await page.evaluate(() => {
		const links = document.querySelectorAll(".side-nav__link");
		links[2].dispatchEvent(new MouseEvent("click", { bubbles: true }));
	});
	await page.waitForTimeout(150);
	const sideState = await page.evaluate(() => {
		const links = [...document.querySelectorAll(".side-nav__link")];
		const activeIdx = links.findIndex((l) =>
			l.classList.contains("side-nav__link--active"),
		);
		const lineParent = document.querySelector(".side-nav__line")?.parentElement;
		const lineIdx = links.indexOf(lineParent);
		return {
			activeIdx,
			lineIdx,
			lineCount: document.querySelectorAll(".side-nav__line").length,
		};
	});
	assert(
		sideState.activeIdx === 2,
		"clicked side-nav link becomes active",
		sideState.activeIdx,
	);
	assert(
		sideState.lineIdx === 2,
		"active underline marker follows the click",
		sideState.lineIdx,
	);
	assert(
		sideState.lineCount === 1,
		"only one underline marker exists",
		sideState.lineCount,
	);

	// The font link is in the <head>, not via @import in CSS.
	const fontLink = await page.evaluate(
		() => !!document.querySelector('link[href*="Inter+Tight"]'),
	);
	assert(fontLink, "Inter Tight loaded via <link> in head", fontLink);

	assert(
		consoleErrors.length === 0,
		"no console errors",
		consoleErrors.slice(0, 3),
	);
	assert(pageErrors.length === 0, "no page errors", pageErrors.slice(0, 3));

	await browser.close();

	// Report.
	let failed = 0;
	for (const r of results) {
		if (r.pass) {
			console.log(`  PASS  ${r.name}`);
		} else {
			failed++;
			console.log(`  FAIL  ${r.name}  ->  ${JSON.stringify(r.detail)}`);
		}
	}
	console.log(`\n${results.length - failed}/${results.length} checks passed`);
	process.exit(failed === 0 ? 0 : 1);
}

main().catch((e) => {
	console.error("verify crashed:", e);
	process.exit(1);
});
