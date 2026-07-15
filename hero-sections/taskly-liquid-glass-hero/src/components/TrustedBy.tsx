import type { CSSProperties } from "react";

type LogoProps = { name: string; children: React.ReactNode };

function Logo({ name, children }: LogoProps) {
	return (
		<svg
			data-logo={name}
			height="30"
			viewBox="0 0 158 36"
			fill="currentColor"
			role="img"
			aria-label={`${name} logo`}
			className="shrink-0"
		>
			{children}
			<text
				x="44"
				y="25.5"
				fontFamily="Inter, sans-serif"
				fontSize="21"
				fontWeight="600"
				letterSpacing="-0.4"
			>
				{name}
			</text>
		</svg>
	);
}

export default function TrustedBy() {
	return (
		<section
			style={{ "--d": "0.5s" } as CSSProperties}
			className="reveal pb-20 pt-10 lg:pb-24 lg:pt-2"
		>
			<p className="text-center font-inter text-[14px] font-medium tracking-[0.02em] text-slate-500">
				Trusted by Top-tier product companies
			</p>

			<div
				data-logo-row
				className="mt-9 flex flex-wrap items-center justify-center gap-x-12 gap-y-8 text-gray-400 lg:gap-x-[100px]"
			>
				<Logo name="Hexora">
					<path d="M18 3l13 7.5v15L18 33 5 25.5v-15L18 3zm0 5.2L9.5 13v10L18 27.8 26.5 23V13L18 8.2z" />
				</Logo>

				<Logo name="Nimbus">
					<path d="M24 28H11a8 8 0 01-1.5-15.86 10 10 0 0119.3 2.4A7 7 0 0124 28zm0-4a3 3 0 000-6h-1.6l-.4-2.5a6 6 0 00-11.6-1.4l-.7 2.1-2.2.2A4 4 0 0011 24h13z" />
				</Logo>

				<Logo name="Vertex">
					<path d="M18 4l15 27H3L18 4zm0 9.2L10.8 26h14.4L18 13.2z" />
				</Logo>

				<Logo name="Orbita">
					<path d="M18 7a11 11 0 110 22 11 11 0 010-22zm0 4.4a6.6 6.6 0 100 13.2 6.6 6.6 0 000-13.2z" />
					<circle cx="29.5" cy="9" r="3.6" />
				</Logo>

				<Logo name="Quantix">
					<path d="M18 4a14 14 0 0110.6 23.1l3 3-3.1 3.1-3.2-3.2A14 14 0 1118 4zm0 4.5a9.5 9.5 0 100 19 9.5 9.5 0 000-19z" />
				</Logo>
			</div>
		</section>
	);
}
