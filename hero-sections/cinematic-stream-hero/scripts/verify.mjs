/**
 * Headless verification for the LUMIÈRE cinematic streaming hero.
 *
 * Boots `vite preview` against the production build, then drives headless
 * Chromium through every requirement in prompt.md: background video, masked
 * bottom blur veil, Inter font, liquid-glass styling, blurFadeUp staggering,
 * hero copy, z-index layering, no-scroll layout, and responsive behaviour
 * (mobile menu open/close, hamburger icon swap, sm/lg visibility rules).
 *
 * Usage: node scripts/verify.mjs
 */
import { spawn } from "node:child_process";
import { mkdirSync } from "node:fs";
import { chromium } from "playwright";

const PORT = 4321;
const URL = `http://localhost:${PORT}/`;

let passed = 0;
let failed = 0;

function check(name, condition, detail = "") {
	if (condition) {
		passed += 1;
		console.log(`  PASS  ${name}${detail ? `  (${detail})` : ""}`);
	} else {
		failed += 1;
		console.log(`  FAIL  ${name}${detail ? `  (${detail})` : ""}`);
	}
}

async function waitForServer(url, attempts = 60) {
	for (let i = 0; i < attempts; i += 1) {
		try {
			const res = await fetch(url);
			if (res.ok) return;
		} catch {
			/* not up yet */
		}
		await new Promise((r) => setTimeout(r, 250));
	}
	throw new Error(`Preview server never came up at ${url}`);
}

const server = spawn(
	"npx",
	["vite", "preview", "--port", String(PORT), "--strictPort"],
	{ stdio: "ignore", detached: false },
);

try {
	await waitForServer(URL);
	console.log(`Preview server ready at ${URL}\n`);
	mkdirSync("screenshots", { recursive: true });

	const browser = await chromium.launch({
		args: ["--autoplay-policy=no-user-gesture-required"],
	});
	const page = await browser.newPage({
		viewport: { width: 1440, height: 900 },
	});

	const consoleErrors = [];
	page.on("console", (msg) => {
		if (msg.type() === "error") consoleErrors.push(msg.text());
	});
	page.on("pageerror", (err) => consoleErrors.push(String(err)));

	await page.goto(URL, { waitUntil: "networkidle" });
	await page.waitForTimeout(2500); // let entrance animations finish

	console.log("— Page basics —");
	check(
		"Body uses Inter font",
		await page.evaluate(() =>
			getComputedStyle(document.body).fontFamily.includes("Inter"),
		),
	);
	check(
		"Page background is pure black",
		await page.evaluate(
			() => getComputedStyle(document.body).backgroundColor === "rgb(0, 0, 0)",
		),
	);
	check(
		"No scrolling (content fits viewport)",
		await page.evaluate(
			() =>
				document.scrollingElement.scrollHeight <= window.innerHeight + 1 &&
				getComputedStyle(document.body).overflow === "hidden",
		),
	);

	console.log("\n— Background video —");
	const video = await page.evaluate(() => {
		const v = document.querySelector("video");
		if (!v) return null;
		const cs = getComputedStyle(v);
		return {
			muted: v.muted,
			loop: v.loop,
			autoplay: v.autoplay,
			playsInline: v.playsInline,
			paused: v.paused,
			readyState: v.readyState,
			position: cs.position,
			zIndex: cs.zIndex,
			objectFit: cs.objectFit,
			coversViewport:
				v.getBoundingClientRect().width >= window.innerWidth &&
				v.getBoundingClientRect().height >= window.innerHeight,
			src: v.currentSrc || v.src,
		};
	});
	check("Video element exists", Boolean(video));
	check("Video is muted", video?.muted === true);
	check("Video loops", video?.loop === true);
	check("Video autoplays (attr)", video?.autoplay === true);
	check("Video plays inline", video?.playsInline === true);
	check(
		"Video is actually playing",
		video?.paused === false,
		`readyState=${video?.readyState}`,
	);
	check(
		"Video fixed at z-index 0",
		video?.position === "fixed" && video?.zIndex === "0",
	);
	check("Video object-cover", video?.objectFit === "cover");
	check("Video covers full viewport", video?.coversViewport === true);
	check(
		"Video src is the CloudFront mp4",
		/d8j0ntlcm91z4\.cloudfront\.net.+\.mp4/.test(video?.src ?? ""),
	);

	console.log("\n— Bottom blur veil —");
	const veil = await page.evaluate(() => {
		const el = document.querySelector(".bottom-blur-mask");
		if (!el) return null;
		const cs = getComputedStyle(el);
		return {
			backdropFilter: cs.backdropFilter || cs.webkitBackdropFilter,
			maskImage: cs.maskImage || cs.webkitMaskImage,
			pointerEvents: cs.pointerEvents,
			position: cs.position,
			zIndex: cs.zIndex,
			background: cs.backgroundImage,
			backgroundColor: cs.backgroundColor,
			coversViewport:
				el.getBoundingClientRect().width >= window.innerWidth &&
				el.getBoundingClientRect().height >= window.innerHeight,
		};
	});
	check("Overlay exists & covers viewport", veil?.coversViewport === true);
	check(
		"Overlay uses backdrop-blur-xl (24px)",
		veil?.backdropFilter?.includes("blur(24px)"),
		veil?.backdropFilter,
	);
	check(
		"Overlay masked bottom→transparent 45%",
		// Chromium normalizes `to top, black 0%, transparent 45%` to the
		// equivalent to-bottom form `rgba(0,0,0,0) 55%, rgb(0,0,0)`.
		/linear-gradient\(to top,\s*(black|rgb\(0, 0, 0\)) 0%,\s*transparent 45%\)/.test(
			veil?.maskImage ?? "",
		) ||
			/linear-gradient\(rgba\(0, 0, 0, 0\) 55%,\s*rgb\(0, 0, 0\)\)/.test(
				veil?.maskImage ?? "",
			),
		veil?.maskImage,
	);
	check("Overlay pointer-events none", veil?.pointerEvents === "none");
	check(
		"Overlay fixed at z-index 1",
		veil?.position === "fixed" && veil?.zIndex === "1",
	);
	check(
		"No dark gradient overlay (transparent bg)",
		veil?.background === "none" && veil?.backgroundColor === "rgba(0, 0, 0, 0)",
	);

	console.log("\n— Liquid glass —");
	const glass = await page.evaluate(() => {
		const el = [...document.querySelectorAll("header .liquid-glass")].find(
			(b) => b.textContent.includes("Search"),
		);
		if (!el) return null;
		const cs = getComputedStyle(el);
		const before = getComputedStyle(el, "::before");
		return {
			backgroundColor: cs.backgroundColor,
			blendMode: cs.backgroundBlendMode,
			backdropFilter: cs.backdropFilter || cs.webkitBackdropFilter,
			boxShadow: cs.boxShadow,
			position: cs.position,
			overflow: cs.overflow,
			borderStyle: cs.borderStyle,
			borderRadius: cs.borderRadius,
			beforeContent: before.content,
			beforePadding: before.padding,
			beforeBackground: before.backgroundImage,
			beforePointerEvents: before.pointerEvents,
			beforePosition: before.position,
		};
	});
	check(
		"Glass background rgba(255,255,255,0.01)",
		glass?.backgroundColor === "rgba(255, 255, 255, 0.01)",
	);
	check("Glass blend-mode luminosity", glass?.blendMode === "luminosity");
	check(
		"Glass backdrop blur(4px)",
		glass?.backdropFilter?.includes("blur(4px)"),
	);
	check("Glass inset highlight shadow", glass?.boxShadow?.includes("inset"));
	check(
		"Glass relative + overflow hidden + no border",
		glass?.position === "relative" &&
			glass?.overflow === "hidden" &&
			glass?.borderStyle === "none",
	);
	check(
		"Glass pill is rounded-full",
		parseFloat(glass?.borderRadius ?? "0") > 100,
	);
	check(
		"Glass ::before stroke (1.4px gradient rim)",
		glass?.beforeContent === '""' &&
			glass?.beforePadding === "1.4px" &&
			glass?.beforeBackground?.includes("linear-gradient") &&
			glass?.beforePointerEvents === "none" &&
			glass?.beforePosition === "absolute",
	);
	const glassCount = await page.evaluate(
		() => document.querySelectorAll(".liquid-glass").length,
	);
	check(
		"Liquid glass reused across buttons",
		glassCount >= 5,
		`${glassCount} elements`,
	);

	console.log("\n— Entrance animation & stagger —");
	const anim = await page.evaluate(() => {
		const delayOf = (el) => (el ? getComputedStyle(el).animationDelay : null);
		const nameOf = (el) => (el ? getComputedStyle(el).animationName : null);
		const h1 = document.querySelector("h1");
		const logo = document.querySelector("header a[aria-label]");
		const navLinks = [...document.querySelectorAll("header nav a")];
		const desc = document.querySelector("main p");
		const buttons = [...document.querySelectorAll("main button")];
		const watch = buttons.find((b) => b.textContent.includes("Watch Now"));
		const learn = buttons.find((b) => b.textContent.includes("Learn More"));
		const prev = buttons.find((b) => b.textContent.includes("Previous"));
		const next = buttons.find((b) => b.textContent.includes("Next"));
		const search = [...document.querySelectorAll("header button")].find((b) =>
			b.textContent.includes("Search"),
		);
		const user = document.querySelector(
			'header button[aria-label="Your profile"]',
		);
		const meta = document.querySelector("main .animate-blur-fade-up");
		return {
			animName: nameOf(h1),
			animFill: getComputedStyle(h1).animationFillMode,
			animDuration: getComputedStyle(h1).animationDuration,
			h1Opacity: getComputedStyle(h1).opacity,
			delays: {
				logo: delayOf(logo),
				nav: navLinks.map(delayOf),
				search: delayOf(search),
				user: delayOf(user),
				meta: delayOf(meta),
				title: delayOf(h1),
				desc: delayOf(desc),
				watch: delayOf(watch),
				learn: delayOf(learn),
				prev: delayOf(prev),
				next: delayOf(next),
			},
			animatedCount: document.querySelectorAll(".animate-blur-fade-up").length,
		};
	});
	check("blurFadeUp keyframes applied", anim.animName === "blurFadeUp");
	check(
		"1s ease-out forwards",
		anim.animDuration === "1s" && anim.animFill === "forwards",
	);
	check("Elements resolve to opacity 1", anim.h1Opacity === "1");
	check("Logo delay 0ms", anim.delays.logo === "0s");
	check(
		"Nav link stagger 100→300ms",
		JSON.stringify(anim.delays.nav) ===
			JSON.stringify(["0.1s", "0.15s", "0.2s", "0.25s", "0.3s"]),
		anim.delays.nav.join(", "),
	);
	check(
		"Search 350ms / User 400ms",
		anim.delays.search === "0.35s" && anim.delays.user === "0.4s",
	);
	check("Metadata 300ms", anim.delays.meta === "0.3s");
	check(
		"Title 400ms / Desc 500ms",
		anim.delays.title === "0.4s" && anim.delays.desc === "0.5s",
	);
	check(
		"CTAs 600/700ms, arrows 800/900ms",
		anim.delays.watch === "0.6s" &&
			anim.delays.learn === "0.7s" &&
			anim.delays.prev === "0.8s" &&
			anim.delays.next === "0.9s",
	);
	check(
		"Stagger applied broadly",
		anim.animatedCount >= 13,
		`${anim.animatedCount} animated elements`,
	);

	console.log("\n— Hero content —");
	const hero = await page.evaluate(() => {
		const h1 = document.querySelector("h1");
		const csH1 = getComputedStyle(h1);
		const main = document.querySelector("main");
		return {
			title: h1.textContent.trim(),
			titleTracking: csH1.letterSpacing,
			titleSizePx: parseFloat(csH1.fontSize),
			titleWeight: csH1.fontWeight,
			desc: document
				.querySelector("main p")
				.textContent.trim()
				.replace(/\s+/g, " "),
			descColor: getComputedStyle(document.querySelector("main p")).color,
			mainZ: getComputedStyle(main).zIndex,
			headerZ: getComputedStyle(document.querySelector("header")).zIndex,
			metaText: document
				.querySelector("main .animate-blur-fade-up")
				.textContent.replace(/\s+/g, " ")
				.trim(),
			bottomAligned:
				Math.abs(
					document.querySelector("main > div").getBoundingClientRect().bottom -
						(window.innerHeight - 64),
				) < 2,
			watchNow: (() => {
				const b = [...document.querySelectorAll("main button")].find((x) =>
					x.textContent.includes("Watch Now"),
				);
				const cs = getComputedStyle(b);
				return { bg: cs.backgroundColor, color: cs.color };
			})(),
		};
	});
	check("Title text", hero.title === "Step Through. Work Smarter.");
	check(
		"Title -0.04em tracking @72px (lg:text-7xl)",
		hero.titleSizePx === 72 &&
			Math.abs(parseFloat(hero.titleTracking) - 72 * -0.04) < 0.1,
		`${hero.titleSizePx}px / ${hero.titleTracking}`,
	);
	check("Title font-normal", hero.titleWeight === "400");
	check(
		"Description text + gray-400",
		hero.desc ===
			"A voyage through forgotten realms, where past and future intertwine." &&
			hero.descColor === "oklch(0.707 0.022 261.325)",
		hero.descColor,
	);
	check(
		"Metadata row (IMDB / 132 min / April, 2025)",
		hero.metaText.includes("8.7/10 IMDB") &&
			hero.metaText.includes("132 min") &&
			hero.metaText.includes("April, 2025"),
	);
	check("Hero pinned to bottom (pb-16)", hero.bottomAligned);
	check(
		"Watch Now is the only solid button (white/black)",
		hero.watchNow.bg === "rgb(255, 255, 255)" &&
			hero.watchNow.color === "rgb(0, 0, 0)",
	);
	check(
		"Navbar z-50 above hero z-10",
		hero.headerZ === "50" && hero.mainZ === "10",
	);

	console.log("\n— Desktop chrome —");
	const desktop = await page.evaluate(() => {
		const visible = (el) => el && getComputedStyle(el).display !== "none";
		const navLinks = [...document.querySelectorAll("header nav a")].map((a) =>
			a.textContent.trim(),
		);
		const hamburger = document.querySelector(
			'header button[aria-controls="mobile-menu"]',
		);
		return {
			navLinks,
			navVisible: visible(document.querySelector("header nav")),
			hamburgerHidden: !visible(hamburger),
			menuHidden:
				getComputedStyle(document.querySelector("#mobile-menu")).display ===
				"none",
		};
	});
	check(
		"5 nav links present",
		JSON.stringify(desktop.navLinks) ===
			JSON.stringify([
				"Movies",
				"TV Series",
				"Editor's Pick",
				"Interviews",
				"User Reviews",
			]),
		desktop.navLinks.join(", "),
	);
	check(
		"Nav visible on lg, hamburger hidden",
		desktop.navVisible && desktop.hamburgerHidden,
	);
	check("Mobile menu hidden on lg", desktop.menuHidden);
	await page.screenshot({ path: "screenshots/desktop.png" });

	console.log("\n— Tablet (768px): hamburger + sm buttons —");
	await page.setViewportSize({ width: 768, height: 1024 });
	await page.waitForTimeout(400);
	const tablet = await page.evaluate(() => {
		const visible = (el) => el && getComputedStyle(el).display !== "none";
		return {
			navHidden: !visible(document.querySelector("header nav")),
			hamburgerVisible: visible(
				document.querySelector('header button[aria-controls="mobile-menu"]'),
			),
			searchVisible: visible(
				[...document.querySelectorAll("header button")].find((b) =>
					b.textContent.includes("Search"),
				),
			),
		};
	});
	check(
		"Below lg: links hidden, hamburger shown, Search still visible",
		tablet.navHidden && tablet.hamburgerVisible && tablet.searchVisible,
	);

	console.log("\n— Mobile (375px) + menu interaction —");
	await page.setViewportSize({ width: 375, height: 812 });
	await page.waitForTimeout(400);
	const mobileClosed = await page.evaluate(() => {
		const visible = (el) => el && getComputedStyle(el).display !== "none";
		const menu = document.querySelector("#mobile-menu");
		const cs = getComputedStyle(menu);
		return {
			searchHidden: !visible(
				[...document.querySelectorAll("header button")].find((b) =>
					b.textContent.includes("Search"),
				),
			),
			userHidden: !visible(
				document.querySelector('header button[aria-label="Your profile"]'),
			),
			menuOpacity: cs.opacity,
			menuPointer: cs.pointerEvents,
			noHScroll: document.documentElement.scrollWidth <= window.innerWidth,
		};
	});
	check(
		"Below sm: Search & User hidden in navbar",
		mobileClosed.searchHidden && mobileClosed.userHidden,
	);
	check(
		"Menu closed: opacity 0 + pointer-events none",
		mobileClosed.menuOpacity === "0" && mobileClosed.menuPointer === "none",
	);
	check("No horizontal overflow on mobile", mobileClosed.noHScroll);
	await page.screenshot({ path: "screenshots/mobile.png" });

	await page.click('header button[aria-controls="mobile-menu"]');
	await page.waitForTimeout(900); // 500ms transition + stagger
	const mobileOpen = await page.evaluate(() => {
		const menu = document.querySelector("#mobile-menu");
		const cs = getComputedStyle(menu);
		const links = [...menu.querySelectorAll("nav a")];
		const visible = (el) => el && getComputedStyle(el).display !== "none";
		// Tailwind v4 translate-* utilities drive the CSS `translate` property
		// (transform stays "none"), so "neutral" means either is identity.
		const settled = (s) =>
			(s.transform === "none" || s.transform === "matrix(1, 0, 0, 1, 0, 0)") &&
			(s.translate === "none" ||
				s.translate === "" ||
				/^0px(?: 0px)?$/.test(s.translate));
		return {
			opacity: cs.opacity,
			settled: settled(cs),
			bg: cs.backgroundColor,
			blur: cs.backdropFilter || cs.webkitBackdropFilter,
			top: menu.getBoundingClientRect().top,
			zIndex: cs.zIndex,
			linkCount: links.length,
			linksSettled: links.every((l) => {
				const lcs = getComputedStyle(l);
				return lcs.opacity === "1" && settled(lcs);
			}),
			bottomSearchVisible: visible(
				[...menu.querySelectorAll("button")].find((b) =>
					b.textContent.includes("Search"),
				),
			),
			hamburgerExpanded:
				document
					.querySelector('header button[aria-controls="mobile-menu"]')
					.getAttribute("aria-expanded") === "true",
		};
	});
	check(
		"Menu opens (opacity 1, translate-y-0)",
		mobileOpen.opacity === "1" && mobileOpen.settled,
	);
	check(
		"Menu at top-[72px], z-40",
		mobileOpen.top === 72 && mobileOpen.zIndex === "40",
	);
	check(
		"Menu styling (gray-900/95 + backdrop blur)",
		mobileOpen.bg === "rgba(16, 24, 40, 0.95)" ||
			mobileOpen.bg.startsWith("oklab") ||
			mobileOpen.bg.startsWith("color("),
		mobileOpen.bg,
	);
	check(
		"Menu has 5 staggered links, all settled in",
		mobileOpen.linkCount === 5 && mobileOpen.linksSettled,
	);
	check(
		"Below sm: Search shown inside menu footer",
		mobileOpen.bottomSearchVisible,
	);
	check("Hamburger aria-expanded toggles", mobileOpen.hamburgerExpanded);
	await page.screenshot({ path: "screenshots/mobile-menu-open.png" });

	// Icon swap on the hamburger
	const iconSwap = await page.evaluate(() => {
		const btn = document.querySelector(
			'header button[aria-controls="mobile-menu"]',
		);
		const [menuIcon, xIcon] = btn.querySelectorAll("svg");
		return {
			menuHidden: getComputedStyle(menuIcon).opacity === "0",
			xShown: getComputedStyle(xIcon).opacity === "1",
		};
	});
	check("Hamburger icon morphs Menu→X", iconSwap.menuHidden && iconSwap.xShown);

	await page.click("#mobile-menu nav a"); // tapping a link closes the menu
	await page.waitForTimeout(700);
	const closedAgain = await page.evaluate(() => {
		const cs = getComputedStyle(document.querySelector("#mobile-menu"));
		return cs.opacity === "0" && cs.pointerEvents === "none";
	});
	check("Tapping a link closes the menu", closedAgain);

	console.log("\n— Console health —");
	const realErrors = consoleErrors.filter((e) => !/favicon/i.test(e));
	check(
		"No console/page errors",
		realErrors.length === 0,
		realErrors.join(" | ").slice(0, 200),
	);

	await browser.close();

	console.log(`\n${passed} passed, ${failed} failed`);
	if (failed > 0) process.exitCode = 1;
} finally {
	server.kill("SIGTERM");
}
