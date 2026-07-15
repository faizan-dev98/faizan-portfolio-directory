import About from "./components/About";
import Collection from "./components/Collection";
import Cta from "./components/Cta";
import Hero from "./components/Hero";

export default function App() {
	return (
		<main className="bg-background text-cream">
			<Hero />
			<About />
			<Collection />
			<Cta />
			{/* Full-screen grain overlay above everything */}
			<div className="texture-overlay" aria-hidden="true" />
		</main>
	);
}
