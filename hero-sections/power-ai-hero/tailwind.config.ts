import type { Config } from "tailwindcss";

export default {
	content: ["./index.html", "./src/**/*.{ts,tsx}"],
	theme: {
		extend: {
			fontFamily: {
				display: [
					"General Sans",
					"Geist Sans",
					"ui-sans-serif",
					"system-ui",
					"sans-serif",
				],
				body: ["Geist Sans", "ui-sans-serif", "system-ui", "sans-serif"],
			},
			colors: {
				background: "hsl(var(--background))",
				foreground: "hsl(var(--foreground))",
				"hero-sub": "hsl(var(--hero-sub))",
			},
			keyframes: {
				marquee: {
					from: { transform: "translateX(0%)" },
					to: { transform: "translateX(-50%)" },
				},
				rise: {
					// `to` deliberately omits opacity so the animation settles on each
					// element's own computed opacity (e.g. the subtitle's opacity-80).
					from: { opacity: "0", transform: "translateY(28px)" },
					to: { transform: "translateY(0)" },
				},
			},
			animation: {
				marquee: "marquee 20s linear infinite",
				rise: "rise 0.9s cubic-bezier(0.22, 1, 0.36, 1) both",
			},
		},
	},
	plugins: [],
} satisfies Config;
