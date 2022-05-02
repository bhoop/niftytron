module.exports = {
	content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
	theme: {
		extend: {
			backgroundImage: {
				"radial":
					"radial-gradient(circle, var(--tw-gradient-stops))",
			}
		},
	},
	plugins: [],
};
