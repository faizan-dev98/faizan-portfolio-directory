import { createFileRoute } from "@tanstack/react-router";
import ValmaxLanding from "@/components/ValmaxLanding";

export const Route = createFileRoute("/")({
	head: () => ({
		meta: [
			{ title: "VALMAX — Ralph Edwards Photography" },
			{
				name: "description",
				content:
					"VALMAX. Photography studio of Ralph Edwards. Crafting cinematic visual stories — portraits, landscapes, brand campaigns.",
			},
			{ property: "og:title", content: "VALMAX — Ralph Edwards Photography" },
			{
				property: "og:description",
				content:
					"Cinematic photography studio. Portraits, landscapes, brand campaigns.",
			},
		],
	}),
	component: Home,
});

function Home() {
	return <ValmaxLanding />;
}
