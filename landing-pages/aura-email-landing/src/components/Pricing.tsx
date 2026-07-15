import { useState } from "react";

const PLANS = [
	{
		tier: "Free",
		monthly: "Free",
		yearly: "Free",
		desc: "For creators taking their first steps with Forma.",
		features: [
			"Up to 3 projects in the cloud",
			"Image export up to 1080p",
			"Basic editing tools",
			"Free templates and icons",
			"Access via web and mobile app",
		],
		pro: false,
	},
	{
		tier: "Standard",
		monthly: "$9,99/m",
		yearly: "$99,99/y",
		desc: "For freelancers and small teams who need more freedom and flexibility.",
		features: [
			"Up to 50 projects in the cloud",
			"Export up to 4K",
			"Advanced editing toolkit",
			"Team collaboration (up to 5 members)",
			"Access to premium template library",
		],
		pro: false,
	},
	{
		tier: "Pro",
		monthly: "$19,99/m",
		yearly: "$199,99/y",
		desc: "For studios, agencies, and professional creators working with brands.",
		features: [
			"Unlimited projects",
			"Export up to 8K + animations",
			"AI-powered content generation tools",
			"Unlimited team members",
			"Brand customization",
		],
		pro: true,
	},
];

export default function Pricing() {
	const [yearly, setYearly] = useState(false);

	return (
		<section className="c3-pricing-section">
			{/* Pricing noise filter — fractal noise, overlay blend (watermark) */}
			<svg className="absolute w-0 h-0" aria-hidden="true">
				<filter id="c3-noise">
					<feTurbulence
						type="fractalNoise"
						baseFrequency="0.5"
						numOctaves="2"
						stitchTiles="stitch"
					/>
					<feComponentTransfer>
						<feFuncA type="linear" slope="0.075" />
					</feComponentTransfer>
					<feComposite in2="SourceGraphic" operator="in" result="noise" />
					<feBlend in="SourceGraphic" in2="noise" mode="overlay" />
				</filter>
			</svg>

			<div className="c3-watermark-container">
				<div className="c3-watermark-main">
					<span className="c3-watermark-line-1">Your email.</span>
					<span className="c3-watermark-line-2">Revitalized</span>
				</div>
			</div>

			<div className="c3-grid">
				{PLANS.map(
					({ tier, monthly, yearly: yearlyPrice, desc, features, pro }) => (
						<div key={tier} className={`c3-card${pro ? " c3-card-pro" : ""}`}>
							<p className="c3-tier-small">{tier}</p>
							<p className="c3-tier-large">{yearly ? yearlyPrice : monthly}</p>
							<p className="c3-desc">{desc}</p>
							<ul className="c3-list">
								{features.map((feature) => (
									<li key={feature}>
										<span className="c3-check">
											<svg
												width="12"
												height="12"
												viewBox="0 0 24 24"
												fill="none"
												stroke="#fff"
												strokeWidth="3"
												strokeLinecap="round"
												strokeLinejoin="round"
												aria-hidden="true"
											>
												<path d="M20 6 9 17l-5-5" />
											</svg>
										</span>
										{feature}
									</li>
								))}
							</ul>
							<button type="button" className="c3-btn">
								Choose Plan
							</button>
						</div>
					),
				)}
			</div>

			<div className="c3-toggle-wrap">
				<span className="text-sm text-white/70">Yearly</span>
				<button
					type="button"
					role="switch"
					aria-checked={yearly}
					aria-label="Toggle yearly billing"
					className={`c3-toggle${yearly ? " active" : ""}`}
					onClick={() => setYearly((v) => !v)}
				>
					<span className="c3-toggle-knob" />
				</button>
			</div>
		</section>
	);
}
