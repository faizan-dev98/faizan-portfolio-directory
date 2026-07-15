/** @type {import('tailwindcss').Config} */
export default {
	content: ["./index.html", "./src/**/*.{ts,tsx}"],
	theme: {
		extend: {
			colors: {
				ink: "#070b0a",
				mint: "#5ed29c",
			},
			fontFamily: {
				sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
				jakarta: [
					'"Plus Jakarta Sans"',
					"Inter",
					"ui-sans-serif",
					"sans-serif",
				],
				serif: ['"Instrument Serif"', "Georgia", "serif"],
			},
		},
	},
	plugins: [],
};
