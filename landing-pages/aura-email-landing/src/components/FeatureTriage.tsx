import { motion } from "motion/react";
import SectionEyebrow from "./SectionEyebrow";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const CHIPS = [
	"Auto-categorize",
	"Snooze for later",
	"Silent newsletters",
	"One-tap unsubscribe",
];

const CATEGORIES = [
	{
		name: "Priority",
		count: 4,
		color: "#ffffff",
		items: ["Sophia Chen — Q3 review", "David Lim — contract signoff"],
	},
	{
		name: "Follow-up",
		count: 7,
		color: "#e5e5e5",
		items: ["Marcus — design review", "Figma — comment thread"],
	},
	{
		name: "Updates",
		count: 18,
		color: "#a3a3a3",
		items: ["Vercel — deploy ready", "GitHub — PR #482 merged"],
	},
	{
		name: "Archived",
		count: 13,
		color: "#525252",
		items: ["Stripe payout · Newsletter · Receipts"],
	},
];

export default function FeatureTriage() {
	return (
		<section className="max-w-6xl mx-auto px-6 py-20 md:py-28">
			<div className="grid md:grid-cols-2 gap-10 md:gap-16 items-start">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true, margin: "-80px" }}
					transition={{ duration: 0.7, ease: EASE }}
				>
					<SectionEyebrow label="Triage" tag="AI-native" />
					<h2 className="mt-5 text-3xl md:text-5xl font-semibold tracking-tight leading-[1.02]">
						Clear your inbox
						<br />
						in a single pass.
					</h2>
					<p className="mt-6 text-white/60 text-base leading-[1.6] max-w-md">
						Aura reads every message, understands intent, and routes the noise
						away from the signal. Focus on what moves your day forward — the
						rest handles itself.
					</p>
					<div className="mt-8 flex flex-wrap gap-2">
						{CHIPS.map((chip) => (
							<span
								key={chip}
								className="text-xs text-white/70 px-3 py-1.5 rounded-full border border-white/10 bg-white/[0.03]"
							>
								{chip}
							</span>
						))}
					</div>
				</motion.div>

				<motion.div
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true, margin: "-80px" }}
					transition={{ duration: 0.7, delay: 0.15, ease: EASE }}
					className="liquid-glass rounded-2xl p-5"
				>
					<p className="text-xs text-white/50">Today · 42 messages triaged</p>
					<div className="mt-4 space-y-3">
						{CATEGORIES.map(({ name, count, color, items }) => (
							<div key={name} className="liquid-glass rounded-lg p-3">
								<div className="flex items-center gap-2">
									<span
										className="w-2 h-2 rounded-full"
										style={{ backgroundColor: color }}
									/>
									<span className="text-sm font-medium text-white">{name}</span>
									<span className="text-xs text-white/40">({count})</span>
								</div>
								<div className="mt-2 space-y-1">
									{items.map((item) => (
										<p key={item} className="text-xs text-white/50 truncate">
											{item}
										</p>
									))}
								</div>
							</div>
						))}
					</div>
				</motion.div>
			</div>
		</section>
	);
}
