import type { Config } from "tailwindcss";

export default {
	content: ["./index.html", "./src/**/*.{ts,tsx}"],
	theme: {
		extend: {
			fontFamily: {
				sans: ['"Poppins"', "ui-sans-serif", "system-ui", "sans-serif"],
				display: ['"Poppins"', "ui-sans-serif", "system-ui", "sans-serif"],
				serif: ['"Source Serif 4"', "Georgia", "serif"],
			},
			colors: {
				background: "hsl(var(--background))",
				foreground: "hsl(var(--foreground))",
			},
			borderRadius: {
				lg: "var(--radius)",
				md: "calc(var(--radius) - 2px)",
				sm: "calc(var(--radius) - 4px)",
			},
		},
	},
	plugins: [],
} satisfies Config;
