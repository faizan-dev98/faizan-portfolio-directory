import { useEffect, useState } from "react";

const LINKS = ["Platform", "Network", "Pricing", "Docs"];

/** Glassmorphic navigation header with a working mobile drawer. */
export default function GlassNav() {
	const [open, setOpen] = useState(false);

	useEffect(() => {
		if (!open) return undefined;
		const close = (event) => {
			if (event.key === "Escape") setOpen(false);
		};
		window.addEventListener("keydown", close);
		return () => window.removeEventListener("keydown", close);
	}, [open]);

	return (
		<header className="nav reveal" style={{ "--reveal-order": 0 }}>
			<div className="nav__glass">
				<a className="nav__brand" href="#top" aria-label="Auroracast home">
					<svg className="nav__mark" viewBox="0 0 32 32" aria-hidden="true">
						<circle
							cx="16"
							cy="16"
							r="6"
							fill="none"
							stroke="currentColor"
							strokeWidth="2.4"
						/>
						<circle
							cx="16"
							cy="16"
							r="12"
							fill="none"
							stroke="currentColor"
							strokeWidth="1.2"
							strokeDasharray="3.4 4.6"
							opacity="0.55"
						/>
					</svg>
					<span className="nav__wordmark">
						Auroracast<sup>°</sup>
					</span>
				</a>

				<nav className="nav__links" aria-label="Primary">
					{LINKS.map((label) => (
						<a
							key={label}
							className="nav__link"
							href={`#${label.toLowerCase()}`}
						>
							{label}
						</a>
					))}
				</nav>

				<div className="nav__actions">
					<a className="nav__signin" href="#signin">
						Sign in
					</a>
					<a className="nav__cta" href="#start">
						Start streaming
						<span className="nav__cta-dot" aria-hidden="true" />
					</a>
					<button
						type="button"
						className={`nav__burger${open ? " is-open" : ""}`}
						aria-expanded={open}
						aria-controls="mobile-menu"
						aria-label={open ? "Close menu" : "Open menu"}
						onClick={() => setOpen((v) => !v)}
					>
						<span />
						<span />
					</button>
				</div>
			</div>

			<div id="mobile-menu" className={`nav__sheet${open ? " is-open" : ""}`}>
				{LINKS.map((label, i) => (
					<a
						key={label}
						className="nav__sheet-link"
						style={{ "--sheet-order": i }}
						href={`#${label.toLowerCase()}`}
						onClick={() => setOpen(false)}
					>
						<span className="nav__sheet-index">0{i + 1}</span>
						{label}
					</a>
				))}
				<a
					className="nav__sheet-link nav__sheet-link--cta"
					style={{ "--sheet-order": LINKS.length }}
					href="#start"
					onClick={() => setOpen(false)}
				>
					<span className="nav__sheet-index">→</span>
					Start streaming
				</a>
			</div>
		</header>
	);
}
