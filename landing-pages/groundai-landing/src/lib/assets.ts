// All media for the GroundAI landing page is referenced through this single `A`
// object. The original remote source is documented in REMOTE_BASE, but every
// asset has been vendored locally into /public/assets so the project is fully
// self-contained and runnable offline. `BASE` therefore points at the local
// asset root and every value is `${BASE}/<filename>`.
export const REMOTE_BASE = "https://qclay.design/lovable/groundai";

const BASE = "/assets";

export const A = {
	BASE,
	Hero: `${BASE}/hero1.mp4`,
	backgroundCard: `${BASE}/backgroundCard.png`,
	bottomWonem: `${BASE}/bottomWonem.png`,
	womem: `${BASE}/womem.png`,
	logo: `${BASE}/logo.svg`,
	ArrowUp: `${BASE}/ArrowUp.svg`,
	GreenFlag: `${BASE}/GreenFlag.svg`,
	Nueral: `${BASE}/Nueral.svg`,
	Orinya: `${BASE}/Orinya.svg`,
	Skodia: `${BASE}/Skodia.svg`,
	SkodiaSkodia: `${BASE}/SkodiaSkodia.svg`,
	Wids: `${BASE}/Wids.svg`,
	Xyreion: `${BASE}/Xyreion.svg`,
} as const;
