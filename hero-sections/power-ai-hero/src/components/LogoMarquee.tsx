const BRANDS = [
	"Vortex",
	"Nimbus",
	"Prysma",
	"Cirrus",
	"Kynder",
	"Halcyn",
] as const;

function BrandRow({ hidden = false }: { hidden?: boolean }) {
	return (
		<div
			className="flex shrink-0 items-center gap-16 pr-16"
			aria-hidden={hidden || undefined}
		>
			{BRANDS.map((name) => (
				<div key={name} className="flex items-center gap-3">
					<span className="liquid-glass flex h-6 w-6 items-center justify-center rounded-lg font-display text-[11px] font-semibold leading-none text-foreground/90">
						{name[0]}
					</span>
					<span className="text-base font-semibold text-foreground">
						{name}
					</span>
				</div>
			))}
		</div>
	);
}

export default function LogoMarquee() {
	return (
		<div
			className="relative w-full animate-rise pb-10"
			style={{ animationDelay: "0.45s" }}
		>
			<div className="mx-auto flex max-w-5xl flex-col items-center gap-12 px-8 md:flex-row">
				<p className="shrink-0 text-center text-sm leading-5 text-foreground/50 md:text-left">
					Relied on by brands
					<br />
					across the globe
				</p>

				<div className="marquee-mask min-w-0 flex-1 self-stretch overflow-hidden md:self-auto">
					<div className="flex w-max animate-marquee items-center">
						<BrandRow />
						<BrandRow hidden />
					</div>
				</div>
			</div>
		</div>
	);
}
