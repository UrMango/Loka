/**** @type {import('tailwindcss').Config} ****/
export default {
	content: ['./index.html', './src/**/*.{ts,tsx}'],
	theme: {
		extend: {
			colors: {
				// Loka color tokens
				primary: {
					DEFAULT: '#009D85',
				},
				'loka-black': '#001A16',
				'loka-white': '#F1FFFD',
				// optional background alias
				'app-bg': '#F1FFFD',
			},
		},
	},
	plugins: [],
};
