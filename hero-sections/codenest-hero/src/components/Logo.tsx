export default function Logo() {
	return (
		<a
			href="#top"
			aria-label="CodeNest home"
			className="flex items-center gap-2.5 text-white transition-opacity duration-200 hover:opacity-80"
		>
			<svg
				width="26"
				height="26"
				viewBox="0 0 26 26"
				fill="none"
				aria-hidden="true"
			>
				<path
					d="M9.5 6 4 13l5.5 7"
					stroke="currentColor"
					strokeWidth="2.4"
					strokeLinecap="round"
					strokeLinejoin="round"
				/>
				<path
					d="M16.5 6 22 13l-5.5 7"
					stroke="currentColor"
					strokeWidth="2.4"
					strokeLinecap="round"
					strokeLinejoin="round"
				/>
				<circle cx="13" cy="13" r="2.4" fill="#5ed29c" />
			</svg>
			<span className="font-jakarta text-[15px] font-extrabold tracking-[0.22em]">
				CODENEST
			</span>
		</a>
	);
}
