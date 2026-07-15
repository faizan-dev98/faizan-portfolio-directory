// All assets are vendored locally under /public/assets so the project runs
// fully offline. Paths are absolute (served from the dev/build root).
export const ASSETS = {
	// Hero background video (transcoded locally from the original Mux HLS stream).
	heroVideo: "/assets/hero.mp4",
	// Original remote HLS source, kept for spec fidelity / Safari-native playback.
	heroHls:
		"https://stream.mux.com/rfmAy41mljxrk4K28xbeP6bt7UOMsf6d6Ce7C7Ul4vs.m3u8",

	// Brand mark (white wordmark + glyph).
	logoLov: "/assets/Logo-lov.svg",

	// Hero "Nationally recognized" marquee logos.
	logoTaa: "/assets/logo-taa.png",
	logoHarris: "/assets/logo-harris.png",
	logoSiemens: "/assets/logo-siemens.png",
	logoSummit: "/assets/logo-summit.png",

	// Hero story card portrait.
	person1: "/assets/person-1.png",

	// Section 2 — Analytics.
	block1: "/assets/block-1.png",
	block2: "/assets/block-2.png",
	person2: "/assets/person-2.png",

	// Section 3 — AI Intelligence card backgrounds.
	back31: "/assets/back-3-1.png",
	back32: "/assets/back-3-2.png",
	back33: "/assets/back-3-3.png",
} as const;
