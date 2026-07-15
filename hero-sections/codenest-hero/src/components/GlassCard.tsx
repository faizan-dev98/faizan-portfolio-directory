export default function GlassCard() {
	return (
		<div className="reveal" style={{ animationDelay: "0.1s" }}>
			<div className="float-slow">
				<div
					data-testid="glass-card"
					className="liquid-glass flex h-[200px] w-[200px] translate-y-[-50px] flex-col justify-between rounded-2xl p-5 text-left"
				>
					<div className="flex items-center justify-between">
						<span className="text-[14px] font-medium tracking-[0.08em] text-white/80">
							[ 2025 ]
						</span>
						<span
							className="pulse-dot h-1.5 w-1.5 rounded-full bg-mint shadow-[0_0_10px_#5ed29c]"
							aria-hidden="true"
						/>
					</div>

					<p className="text-[18px] font-medium leading-snug text-white">
						Taught by{" "}
						<em className="font-serif text-[20px] italic">Industry</em>{" "}
						Professionals
					</p>

					<p className="text-[11px] leading-relaxed text-white/55">
						Live cohorts, real code reviews &amp; interview prep with senior
						engineers.
					</p>
				</div>
			</div>
		</div>
	);
}
