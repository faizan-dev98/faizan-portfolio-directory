import { fireEvent, render, screen, within } from "@testing-library/react";
import App from "./App";

describe("CodeNest hero", () => {
	beforeEach(() => {
		render(<App />);
	});

	it("renders the main headline with a green final period", () => {
		const heading = screen.getByRole("heading", { level: 1 });
		expect(heading.textContent?.replace(/\s+/g, " ").trim()).toBe(
			"LAUNCH YOUR CODING CAREER.",
		);
		const period = heading.querySelector("span");
		expect(period?.textContent).toBe(".");
		expect(period?.className).toContain("text-mint");
	});

	it("renders the eyebrow in mint Plus Jakarta Sans", () => {
		const eyebrow = screen.getByText(/career-ready curriculum/i);
		expect(eyebrow.className).toContain("font-jakarta");
		expect(eyebrow.className).toContain("text-[11px]");
		expect(eyebrow.className).toContain("text-mint");
	});

	it("renders the description with 70% white opacity and 512px max width", () => {
		const desc = screen.getByText(/master in-demand coding skills/i);
		expect(desc.className).toContain("text-white/70");
		expect(desc.className).toContain("text-[14px]");
		expect(desc.className).toContain("max-w-lg"); // 32rem = 512px
	});

	it("renders the Get Started CTA", () => {
		const cta = screen.getByRole("button", { name: /get started/i });
		expect(cta.className).toContain("rounded-full");
		expect(cta.className).toContain("bg-mint");
		expect(cta.className).toContain("text-ink");
		expect(cta.className).toContain("uppercase");
		expect(cta.className).toContain("font-bold");
		expect(cta.querySelector("svg")).not.toBeNull(); // ArrowRight icon
	});

	it("renders the liquid glass card with exact spec classes and content", () => {
		const card = screen.getByTestId("glass-card");
		expect(card.className).toContain("liquid-glass");
		expect(card.className).toContain("h-[200px]");
		expect(card.className).toContain("w-[200px]");
		expect(card.className).toContain("translate-y-[-50px]");

		expect(within(card).getByText("[ 2025 ]")).toBeTruthy();
		const serifWord = within(card).getByText("Industry");
		expect(serifWord.tagName).toBe("EM");
		expect(serifWord.className).toContain("font-serif");
		expect(serifWord.className).toContain("italic");
		expect(
			within(card).getByText(/live cohorts, real code reviews/i).className,
		).toContain("text-[11px]");
	});

	it("renders desktop navigation links", () => {
		const nav = screen.getByRole("navigation", { name: "Primary" });
		for (const link of ["PROJECTS", "BLOG", "ABOUT", "RESUME"]) {
			expect(within(nav).getByText(link)).toBeTruthy();
		}
	});

	it("toggles the mobile menu overlay via hamburger and close buttons", () => {
		expect(document.getElementById("mobile-menu")).toBeNull();

		fireEvent.click(screen.getByRole("button", { name: "Open menu" }));
		const overlay = document.getElementById("mobile-menu");
		expect(overlay).not.toBeNull();
		expect(within(overlay as HTMLElement).getAllByRole("link")).toHaveLength(5); // logo + 4 links
		expect(document.body.style.overflow).toBe("hidden");

		fireEvent.click(screen.getByRole("button", { name: "Close menu" }));
		expect(document.getElementById("mobile-menu")).toBeNull();
		expect(document.body.style.overflow).toBe("");
	});

	it("renders the background video element configured for autoplay looping", () => {
		const video = screen.getByTestId("bg-video") as HTMLVideoElement;
		expect(video.muted).toBe(true);
		expect(video.loop).toBe(true);
		expect(video.autoplay).toBe(true);
		expect(video.playsInline).toBe(true);
		expect(video.className).toContain("opacity-60");
		expect(video.className).toContain("object-cover");
	});

	it("renders three vertical grid lines at 25/50/75%", () => {
		const lines = screen.getAllByTestId("grid-line");
		expect(lines).toHaveLength(3);
		expect(lines.map((l) => l.style.left)).toEqual(["25%", "50%", "75%"]);
		for (const line of lines) {
			expect(line.className).toContain("bg-white/10");
		}
	});

	it("renders the central SVG glow with a 25px gaussian blur", () => {
		const glow = screen.getByTestId("central-glow");
		const blur = glow.querySelector("feGaussianBlur");
		expect(blur?.getAttribute("stdDeviation")).toBe("25");
		expect(glow.querySelectorAll("ellipse").length).toBeGreaterThanOrEqual(1);
	});
});
