import { ChevronRight } from "lucide-react";
import { motion } from "motion/react";
import AppleButton from "./AppleButton";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export default function FinalCTA() {
	return (
		<section className="max-w-6xl mx-auto px-6 py-20 md:py-32">
			<motion.div
				initial={{ opacity: 0, y: 30 }}
				whileInView={{ opacity: 1, y: 0 }}
				viewport={{ once: true, margin: "-80px" }}
				transition={{ duration: 0.8, ease: EASE }}
				className="liquid-glass relative overflow-hidden rounded-3xl px-8 py-16 md:py-24 text-center"
			>
				<div
					className="absolute inset-0 opacity-30 pointer-events-none"
					style={{
						background:
							"radial-gradient(600px circle at 50% 0%, rgba(255,255,255,0.15), transparent 70%)",
					}}
				/>
				<div className="relative">
					<h2 className="text-4xl md:text-6xl font-semibold tracking-tight leading-[1.02]">
						Close the tabs.
						<br />
						Open your day.
					</h2>
					<p className="mt-6 text-white/60 max-w-md mx-auto text-sm leading-[1.6]">
						Join thousands of builders, founders, and operators who treat email
						like a tool — not an obligation.
					</p>
					<div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
						<AppleButton label="Download Aura" />
						<button
							type="button"
							className="group inline-flex items-center justify-center gap-2 rounded-full border border-white/15 text-white text-sm font-medium px-5 py-3 hover:bg-white/5 transition-colors"
						>
							Talk to sales
							<ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-[1px]" />
						</button>
					</div>
				</div>
			</motion.div>
		</section>
	);
}
