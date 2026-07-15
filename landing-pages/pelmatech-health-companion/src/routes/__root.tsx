import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
	createRootRoute,
	HeadContent,
	Outlet,
	Scripts,
} from "@tanstack/react-router";
import * as React from "react";

import appCss from "@/styles.css?url";

// Uniformly downscale the whole document below 1728px using CSS `zoom`. From
// 1728px and above zoom is 1 (native pixel sizes). All pixel values in the page
// are authored at the 1728px reference width.
//
// The zoom is applied through a dedicated <style> rule (`html { zoom: … }`)
// rather than the `<html>` element's inline `style` attribute, so React never
// reconciles it on the server-rendered <html> node (no hydration mismatch).
const ZOOM_SCRIPT = `(function(){
  var s = document.getElementById('responsive-zoom-style');
  if(!s){ s = document.createElement('style'); s.id = 'responsive-zoom-style'; document.head.appendChild(s); }
  function u(){
    var w = document.documentElement.clientWidth;
    var z = w < 1728 ? w / 1728 : 1;
    s.textContent = 'html{zoom:' + z + ';}';
  }
  u();
  window.addEventListener('resize', u);
})();`;

const queryClient = new QueryClient();

export const Route = createRootRoute({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1",
			},
			{ title: "Pelmatech — Your Personal Health Companion" },
			{
				name: "description",
				content:
					"Meet your personal online health companion — a comprehensive platform offering tools for tracking your fitness goals, monitoring your nutrition, and scheduling your workouts.",
			},
		],
		links: [
			{ rel: "stylesheet", href: appCss },
			{ rel: "preconnect", href: "https://fonts.googleapis.com" },
			{
				rel: "preconnect",
				href: "https://fonts.gstatic.com",
				crossOrigin: "anonymous",
			},
			{
				rel: "stylesheet",
				href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Inter+Tight:wght@400;500;600&display=swap",
			},
		],
		scripts: [{ children: ZOOM_SCRIPT }],
	}),
	shellComponent: RootShell,
	component: RootComponent,
});

// The document shell: head, meta, stylesheets, fonts, and the zoom script all
// live here via <HeadContent />.
function RootShell({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<head>
				<HeadContent />
			</head>
			<body>
				{children}
				<Scripts />
			</body>
		</html>
	);
}

// RootComponent: QueryClientProvider + Outlet, and re-applies the responsive
// zoom logic after hydration so it stays in sync with the inline shell script.
function RootComponent() {
	React.useEffect(() => {
		let style = document.getElementById(
			"responsive-zoom-style",
		) as HTMLStyleElement | null;
		if (!style) {
			style = document.createElement("style");
			style.id = "responsive-zoom-style";
			document.head.appendChild(style);
		}
		const apply = () => {
			const w = document.documentElement.clientWidth;
			const z = w < 1728 ? w / 1728 : 1;
			style!.textContent = `html{zoom:${z};}`;
		};
		apply();
		window.addEventListener("resize", apply);
		return () => window.removeEventListener("resize", apply);
	}, []);

	return (
		<QueryClientProvider client={queryClient}>
			<Outlet />
		</QueryClientProvider>
	);
}
