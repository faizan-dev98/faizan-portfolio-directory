import { motion } from "framer-motion";

interface ShinyTextProps {
	/** The text to render with the shiny sweep effect. */
	text: string;
	/** Seconds for one full left-to-right sweep. */
	speed?: number;
	/** Gradient angle in degrees. */
	spread?: number;
	/** Resting color of the text. */
	baseColor?: string;
	/** Color of the moving shine band. */
	shineColor?: string;
	className?: string;
}

/**
 * Text with a continuously sweeping shine.
 *
 * The gradient is painted onto the glyphs via `background-clip: text` with a
 * transparent text fill. The background is twice the element width
 * (`background-size: 200%`), and framer-motion slides `background-position-x`
 * from 100% to -100% forever. Because the tile period equals the background
 * width, the loop restart is seamless, and the decreasing position percentage
 * translates the gradient image rightward — so the shine band sweeps across
 * the text from left to right.
 */
export default function ShinyText({
	text,
	speed = 3,
	spread = 100,
	baseColor = "#64CEFB",
	shineColor = "#ffffff",
	className = "",
}: ShinyTextProps) {
	return (
		<motion.span
			className={className}
			style={{
				backgroundImage: `linear-gradient(${spread}deg, ${baseColor} 35%, ${shineColor} 50%, ${baseColor} 65%)`,
				backgroundSize: "200% 100%",
				backgroundRepeat: "repeat",
				WebkitBackgroundClip: "text",
				backgroundClip: "text",
				WebkitTextFillColor: "transparent",
				color: "transparent",
			}}
			initial={{ backgroundPosition: "100% 0%" }}
			animate={{ backgroundPosition: "-100% 0%" }}
			transition={{ duration: speed, repeat: Infinity, ease: "linear" }}
		>
			{text}
		</motion.span>
	);
}
