/* Inline lucide-style SVG icons (currentColor stroke) + Material icon glyphs. */
(() => {
	const ArrowUpRight = ({ className }) => (
		<svg
			className={className}
			width="24"
			height="24"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
			aria-hidden="true"
		>
			<path d="M7 17L17 7" />
			<path d="M7 7h10v10" />
		</svg>
	);

	const PlayIcon = ({ className }) => (
		<svg
			className={className}
			width="24"
			height="24"
			viewBox="0 0 24 24"
			fill="currentColor"
			stroke="none"
			aria-hidden="true"
		>
			<polygon points="6 4 20 12 6 20 6 4" />
		</svg>
	);

	/* 28x28 outline icons for the hero stat cards. */
	const ClockIcon = () => (
		<svg
			width="28"
			height="28"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="1.5"
			strokeLinecap="round"
			strokeLinejoin="round"
			className="text-white"
			aria-hidden="true"
		>
			<circle cx="12" cy="12" r="10" />
			<polyline points="12 6 12 12 16 14" />
		</svg>
	);

	const GlobeIcon = () => (
		<svg
			width="28"
			height="28"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="1.5"
			strokeLinecap="round"
			strokeLinejoin="round"
			className="text-white"
			aria-hidden="true"
		>
			<circle cx="12" cy="12" r="10" />
			<path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
			<path d="M2 12h20" />
		</svg>
	);

	/* Material Icons glyph (fill currentColor) used inside capability cards. */
	const MaterialIcon = ({ d, className }) => (
		<svg
			className={className}
			viewBox="0 0 24 24"
			fill="currentColor"
			stroke="none"
			aria-hidden="true"
		>
			<path d={d} />
		</svg>
	);

	window.ArrowUpRight = ArrowUpRight;
	window.PlayIcon = PlayIcon;
	window.ClockIcon = ClockIcon;
	window.GlobeIcon = GlobeIcon;
	window.MaterialIcon = MaterialIcon;
})();
