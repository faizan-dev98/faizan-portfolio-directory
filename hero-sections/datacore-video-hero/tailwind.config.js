/** @type {import('tailwindcss').Config} */
export default {
	content: ["./index.html", "./src/**/*.{ts,tsx}"],
	theme: {
		extend: {
			colors: {
				primary: "#7b39fc",
				"primary-light": "#8d53ff",
				dark: "#2b2344",
				"dark-light": "#3a2f5a",
			},
			fontFamily: {
				manrope: ["Manrope", "sans-serif"],
				cabin: ["Cabin", "sans-serif"],
				instrument: ['"Instrument Serif"', "serif"],
				inter: ["Inter", "sans-serif"],
			},
		},
	},
	plugins: [],
};
