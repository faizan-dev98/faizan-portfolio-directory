import { motion } from "motion/react";
import type { CSSProperties } from "react";
import AppleButton from "./AppleButton";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const gradientStyle: CSSProperties = {
	backgroundImage:
		"linear-gradient(to right, #091020 0%, #0B2551 12.5%, #A4F4FD 32.5%, #00d2ff 50%, #0B2551 67.5%, #091020 87.5%, #091020 100%)",
	backgroundSize: "200% auto",
	WebkitBackgroundClip: "text",
	backgroundClip: "text",
	color: "transparent",
	WebkitTextFillColor: "transparent",
	filter: "url(#c3-noise)",
};

export default function Hero() {
	return (
		<section className="pt-16 md:pt-28 pb-20 text-center flex flex-col items-center px-6">
			<motion.h1
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.8, delay: 0.3, ease: EASE }}
				className="text-4xl md:text-7xl font-semibold tracking-tight leading-[0.9]"
			>
				<span className="block">Your email.</span>
				<span className="block animate-shiny" style={gradientStyle}>
					Revitalized
				</span>
			</motion.h1>

			<motion.p
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.8, delay: 0.5, ease: EASE }}
				className="mt-8 text-white/60 max-w-md text-base leading-[1.5]"
			>
				Aura is the premier inbox platform for the current era. It leverages
				powerful AI to organize, prioritize, and refine your messages into total
				clarity.
			</motion.p>

			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.8, delay: 0.7, ease: EASE }}
				className="mt-10 flex flex-col items-center gap-3"
			>
				<AppleButton />
				<span className="text-xs text-white/40">
					Download for Intel / Apple Silicon
				</span>
			</motion.div>
		</section>
	);
}
