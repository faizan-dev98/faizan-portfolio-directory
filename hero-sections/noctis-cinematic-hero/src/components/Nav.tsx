const LINKS = ["Films", "Studio", "Journal", "Archive"];

export default function Nav() {
	return (
		<header
			className="reveal-fade absolute inset-x-0 top-8 z-30 md:top-12"
			style={{ animationDelay: "0.55s" }}
		>
			<div className="mx-auto flex w-full max-w-[1640px] items-center justify-between px-6 md:px-12">
				<a
					href="#"
					aria-label="Noctis — home"
					className="font-display text-[1.45rem] leading-none tracking-[0.34em] text-bone"
				>
					NOCTIS
				</a>

				<nav
					aria-label="Primary"
					className="hidden items-center gap-10 md:flex"
				>
					{LINKS.map((link) => (
						<a
							key={link}
							href="#"
							className="nav-link font-mono text-[0.62rem] font-light uppercase tracking-[0.32em] text-bone/65 transition-colors duration-300 hover:text-bone"
						>
							{link}
						</a>
					))}
				</nav>

				<a
					href="#"
					className="group flex items-center gap-3 border border-bone/25 px-5 py-2.5 font-mono text-[0.6rem] uppercase tracking-[0.3em] text-bone/80 transition-all duration-500 hover:border-champagne hover:text-champagne"
				>
					<span
						className="glow-pulse h-1 w-1 rounded-full bg-champagne"
						aria-hidden="true"
					/>
					Tickets
				</a>
			</div>
		</header>
	);
}
