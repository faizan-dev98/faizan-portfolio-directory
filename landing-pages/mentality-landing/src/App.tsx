import Hero from "./components/Hero";
import Navbar from "./components/Navbar";

export default function App() {
	return (
		<div className="min-h-screen bg-bg-base selection:bg-brand-green selection:text-black">
			<Navbar />
			<main>
				<Hero />
			</main>
		</div>
	);
}
