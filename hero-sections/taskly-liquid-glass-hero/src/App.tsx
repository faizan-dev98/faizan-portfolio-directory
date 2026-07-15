import Hero from "./components/Hero";
import Navbar from "./components/Navbar";
import TrustedBy from "./components/TrustedBy";

export default function App() {
	return (
		<div className="relative min-h-screen overflow-x-clip bg-white">
			{/* Layered gradient glow — top-left, behind everything */}
			<div aria-hidden="true" className="pointer-events-none absolute inset-0">
				<div
					data-glow="60B1FF"
					className="absolute -left-[260px] -top-[220px] h-[620px] w-[940px] rounded-full bg-[#60B1FF] opacity-[0.33] blur-[140px]"
				/>
				<div
					data-glow="319AFF"
					className="absolute -left-[120px] -top-[140px] h-[430px] w-[640px] rounded-full bg-[#319AFF] opacity-[0.26] blur-[110px]"
				/>
				<div
					data-glow="wash"
					className="absolute left-[6%] top-[180px] h-[320px] w-[520px] rounded-full bg-[#BFE0FF] opacity-[0.35] blur-[120px]"
				/>
			</div>

			{/* z-10 main container */}
			<div
				data-shell
				className="relative z-10 mx-auto max-w-[1600px] px-5 sm:px-8 lg:px-14"
			>
				<Navbar />
				<main>
					<Hero />
					<TrustedBy />
				</main>
			</div>
		</div>
	);
}
