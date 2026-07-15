import { ArrowLeft, ArrowRight } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import * as React from "react";
import blurDoctor from "@/assets/blur-doctor.png";
import happyDoctor from "@/assets/happy-doctor.png";
import youngDoctor from "@/assets/young-doctor.png";
import { MaskedImage } from "@/components/AnimatedHeading";

const TT_HOVES = '"TT Hoves", "Helvetica Neue", Helvetica, Arial, sans-serif';

type Member = {
	img: string;
	role: string;
	name: string;
};

const team: Member[] = [
	{ img: blurDoctor, role: "SURGEON GENERAL", name: "Dr. Helga Brooks" },
	{ img: happyDoctor, role: "PEDIATRICIAN", name: "Dr. Kwame Mbeki" },
	{ img: youngDoctor, role: "THERAPIST", name: "Dr. Matteo Dubois" },
	{ img: happyDoctor, role: "NEUROLOGIST", name: "Dr. Hana Sato" },
	{ img: blurDoctor, role: "CARDIOLOGIST", name: "Dr. Aria Vance" },
];

// Left intro text column (~270px text + ~54px right gap); also forces the
// first card to start at x=335.26 so it aligns with the section heading.
const INTRO_WIDTH = 324;
// Pixel gap between intro and cards AND between cards.
const GAP = 11.26;
// 3 full cards + a sliver of the 4th visible to the right.
const visible = 3.25;
const maxIndex = Math.max(0, Math.ceil(team.length - visible));

interface TeamCarouselProps {
	intro: React.ReactNode;
}

export function TeamCarousel({ intro }: TeamCarouselProps) {
	const [index, setIndex] = React.useState(0);
	const [hovered, setHovered] = React.useState(false);

	return (
		<div
			className="relative"
			onMouseEnter={() => setHovered(true)}
			onMouseLeave={() => setHovered(false)}
		>
			<div className="flex" style={{ gap: GAP }}>
				{/* Intro column */}
				<div className="shrink-0" style={{ width: INTRO_WIDTH }}>
					{intro}
				</div>

				{/* Viewport */}
				<div className="relative overflow-hidden flex-1 min-w-0">
					<motion.div
						className="flex"
						style={{
							gap: GAP,
							width: `calc(${team.length} * ((100% - ${
								(visible - 1) * GAP
							}px) / ${visible}) + ${(team.length - 1) * GAP}px)`,
						}}
						animate={{
							x: `calc(${-index} * (100% + ${GAP}px) / ${team.length})`,
						}}
						transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
					>
						{team.map((m, i) => (
							<div
								key={`${m.name}-${i}`}
								className="shrink-0"
								style={{
									width: `calc((100% - ${
										(team.length - 1) * GAP
									}px) / ${team.length})`,
									fontFamily: TT_HOVES,
								}}
							>
								<div className="aspect-[3/4] overflow-hidden bg-muted">
									<MaskedImage
										src={m.img}
										alt={m.name}
										className="w-full h-full"
										delay={i * 0.08}
									/>
								</div>
								<div className="pt-6">
									<p className="text-xs tracking-[0.2em] text-muted-foreground uppercase">
										{m.role}
									</p>
									<p className="text-xl mt-2 font-medium">{m.name}</p>
								</div>
							</div>
						))}
					</motion.div>

					{/* Central circular arrow puck (shows on hover) */}
					<AnimatePresence>
						{hovered && (
							<motion.div
								className="absolute top-[35%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-10"
								initial={{ opacity: 0, scale: 0.85 }}
								animate={{ opacity: 1, scale: 1 }}
								exit={{ opacity: 0, scale: 0.85 }}
								transition={{ duration: 0.25 }}
							>
								<div
									className="flex items-center justify-center gap-4 rounded-full cursor-pointer"
									style={{
										width: 126,
										height: 126,
										background: "rgba(72, 72, 72, 0.16)",
										backdropFilter: "blur(84px)",
										WebkitBackdropFilter: "blur(84px)",
									}}
								>
									<button
										type="button"
										className="flex items-center justify-center text-white disabled:opacity-30 transition cursor-pointer"
										disabled={index === 0}
										onClick={() => setIndex((i) => Math.max(0, i - 1))}
										aria-label="Previous"
									>
										<ArrowLeft className="w-7 h-7" />
									</button>
									<button
										type="button"
										className="flex items-center justify-center text-white disabled:opacity-30 transition cursor-pointer"
										disabled={index >= maxIndex}
										onClick={() => setIndex((i) => Math.min(maxIndex, i + 1))}
										aria-label="Next"
									>
										<ArrowRight className="w-7 h-7" />
									</button>
								</div>
							</motion.div>
						)}
					</AnimatePresence>
				</div>
			</div>
		</div>
	);
}
