/** @type {import('tailwindcss').Config} */
export default {
	content: ["./index.html", "./src/**/*.{ts,tsx}"],
	theme: {
		extend: {
			fontFamily: {
				fustat: ["Fustat", "sans-serif"],
				inter: ["Inter", "system-ui", "sans-serif"],
			},
		},
	},
	plugins: [],
};
