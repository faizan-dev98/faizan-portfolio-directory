/** Hero block anchored to the bottom-left corner of the viewport. */
export default function Hero() {
	return (
		<section className="hero" id="top">
			<p className="hero__kicker reveal" style={{ "--reveal-order": 1 }}>
				<span className="hero__pulse" aria-hidden="true" />
				Live · Global edge network · 04 continents
			</p>

			<h1 className="hero__title">
				<span className="hero__line reveal" style={{ "--reveal-order": 2 }}>
					Broadcast
				</span>
				<span className="hero__line reveal" style={{ "--reveal-order": 3 }}>
					beyond the
				</span>
				<span
					className="hero__line hero__line--accent reveal"
					style={{ "--reveal-order": 4 }}
				>
					horizon.
				</span>
			</h1>

			<p className="hero__copy reveal" style={{ "--reveal-order": 5 }}>
				Auroracast moves live video across the planet in under a heartbeat —
				adaptive HLS delivery, broadcast-grade reliability, and an edge that
				never sleeps.
			</p>

			<div className="hero__actions reveal" style={{ "--reveal-order": 6 }}>
				<a className="btn btn--solid" href="#start">
					Go live in minutes
				</a>
				<a className="btn btn--ghost" href="#docs">
					Read the docs
					<svg viewBox="0 0 16 16" aria-hidden="true">
						<path
							d="M3 8h9M9 4.5 12.5 8 9 11.5"
							fill="none"
							stroke="currentColor"
							strokeWidth="1.6"
							strokeLinecap="round"
							strokeLinejoin="round"
						/>
					</svg>
				</a>
			</div>
		</section>
	);
}
