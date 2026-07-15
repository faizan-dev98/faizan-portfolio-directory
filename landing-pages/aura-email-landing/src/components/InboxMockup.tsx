import type { LucideIcon } from "lucide-react";
import {
	Archive,
	File,
	Forward,
	Inbox,
	MoreHorizontal,
	Paperclip,
	Reply,
	Search,
	Send,
	Sparkles,
	Star,
	Trash2,
} from "lucide-react";
import { motion } from "motion/react";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const TRAFFIC_LIGHTS = ["#ff5f57", "#febc2e", "#28c840"];

const NAV_ITEMS: {
	icon: LucideIcon;
	label: string;
	count?: number;
	active?: boolean;
}[] = [
	{ icon: Inbox, label: "Inbox", count: 12, active: true },
	{ icon: Star, label: "Starred", count: 3 },
	{ icon: Send, label: "Sent" },
	{ icon: File, label: "Drafts", count: 2 },
	{ icon: Archive, label: "Archive" },
	{ icon: Trash2, label: "Trash" },
];

const LABELS = [
	{ name: "Work", color: "#00d2ff" },
	{ name: "Personal", color: "#A4F4FD" },
	{ name: "Travel", color: "#f59e0b" },
	{ name: "Finance", color: "#10b981" },
];

const MESSAGES: {
	name: string;
	subject: string;
	preview: string;
	time: string;
	unread?: boolean;
	active?: boolean;
}[] = [
	{
		name: "Linear",
		subject: "Weekly product digest",
		preview: "Your team shipped 23 issues this week...",
		time: "9:41 AM",
		unread: true,
		active: true,
	},
	{
		name: "Sophia Chen",
		subject: "Re: Q3 roadmap review",
		preview: "Thanks for sending the deck over. I had a few thoughts...",
		time: "8:12 AM",
		unread: true,
	},
	{
		name: "Figma",
		subject: "Marcus commented on your file",
		preview: "Love the new direction on the landing hero.",
		time: "Yesterday",
	},
	{
		name: "Stripe",
		subject: "Payout of $12,480.00 sent",
		preview: "Your payout is on its way to your bank...",
		time: "Yesterday",
	},
	{
		name: "Vercel",
		subject: "Deployment ready for aura-web",
		preview: "Preview is live at aura-web-g3f.vercel.app",
		time: "Mon",
	},
	{
		name: "GitHub",
		subject: "[aura/core] PR #482 approved",
		preview: "david-lim approved your pull request.",
		time: "Mon",
	},
];

const BODY_PARAGRAPHS = [
	"Hi team,",
	"Here is your weekly digest of everything happening across your projects. This was a strong week with significant progress on the Q3 roadmap.",
	"Twenty-three issues were closed, fourteen pull requests were merged, and two customer-facing features went out. The velocity trend continues to climb.",
	"Let me know if you would like a deeper breakdown by project or contributor.",
];

const TOOLBAR_ICONS: { icon: LucideIcon; label: string }[] = [
	{ icon: Reply, label: "Reply" },
	{ icon: Forward, label: "Forward" },
	{ icon: Archive, label: "Archive" },
	{ icon: Trash2, label: "Delete" },
];

export default function InboxMockup() {
	return (
		<section className="max-w-6xl mx-auto px-6 py-16 md:py-24">
			<motion.div
				initial={{ opacity: 0, y: 40 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.8, delay: 1.1, ease: EASE }}
				className="relative rounded-2xl overflow-hidden border border-white/10 bg-[#0e1014]/90 backdrop-blur-2xl"
			>
				{/* Title bar */}
				<div className="relative flex items-center h-10 px-4 border-b border-white/10">
					<div className="flex items-center gap-2">
						{TRAFFIC_LIGHTS.map((color) => (
							<span
								key={color}
								className="w-3 h-3 rounded-full"
								style={{ backgroundColor: color }}
							/>
						))}
					</div>
					<span className="absolute left-1/2 -translate-x-1/2 text-xs text-white/50">
						Aura — Inbox
					</span>
				</div>

				{/* Body */}
				<div className="grid grid-cols-12 h-[520px]">
					{/* Sidebar */}
					<aside className="hidden md:block md:col-span-3 border-r border-white/10 bg-black/30 p-4">
						<button
							type="button"
							className="w-full inline-flex items-center justify-center gap-1.5 rounded-lg bg-white text-black text-xs font-semibold px-3 py-2 transition-colors hover:bg-white/90"
						>
							<Sparkles className="w-3.5 h-3.5" />
							Compose with Aura
						</button>

						<nav className="mt-4 space-y-0.5">
							{NAV_ITEMS.map(({ icon: Icon, label, count, active }) => (
								<a
									key={label}
									href="#"
									className={`flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors ${
										active
											? "bg-white/10 text-white"
											: "text-white/60 hover:bg-white/5"
									}`}
								>
									<Icon className="w-3.5 h-3.5" />
									<span className="flex-1">{label}</span>
									{count !== undefined && (
										<span className="text-[10px] text-white/40">{count}</span>
									)}
								</a>
							))}
						</nav>

						<div className="mt-6">
							<p className="px-2.5 text-[10px] font-semibold uppercase tracking-widest text-white/30">
								Labels
							</p>
							<div className="mt-2 space-y-0.5">
								{LABELS.map(({ name, color }) => (
									<a
										key={name}
										href="#"
										className="flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-xs text-white/60 hover:bg-white/5 transition-colors"
									>
										<span
											className="w-2 h-2 rounded-full"
											style={{ backgroundColor: color }}
										/>
										{name}
									</a>
								))}
							</div>
						</div>
					</aside>

					{/* Message list */}
					<div className="hidden sm:flex sm:flex-col sm:col-span-5 md:col-span-4 border-r border-white/10">
						<div className="flex items-center gap-2 px-4 h-11 border-b border-white/10 text-white/40">
							<Search className="w-3.5 h-3.5" />
							<span className="text-xs">Search mail</span>
						</div>
						<div className="flex-1 overflow-y-auto">
							{MESSAGES.map((m) => (
								<button
									key={m.subject}
									type="button"
									className={`w-full text-left px-4 py-3 border-b border-white/5 transition-colors ${
										m.active ? "bg-white/[0.07]" : "hover:bg-white/[0.03]"
									}`}
								>
									<div className="flex items-center justify-between gap-2">
										<span
											className={`text-xs truncate ${
												m.unread
													? "font-semibold text-white"
													: "font-medium text-white/70"
											}`}
										>
											{m.name}
										</span>
										<span className="text-[10px] text-white/40 shrink-0">
											{m.time}
										</span>
									</div>
									<div className="mt-0.5 flex items-center gap-1.5">
										{m.unread && (
											<span className="w-1.5 h-1.5 rounded-full bg-[#00d2ff] shrink-0" />
										)}
										<span
											className={`text-xs truncate ${m.unread ? "text-white" : "text-white/60"}`}
										>
											{m.subject}
										</span>
									</div>
									<p className="mt-0.5 text-xs text-white/40 truncate">
										{m.preview}
									</p>
								</button>
							))}
						</div>
					</div>

					{/* Reader */}
					<div className="col-span-12 sm:col-span-7 md:col-span-5 flex flex-col">
						<div className="flex items-center justify-between px-4 h-11 border-b border-white/10">
							<div className="flex items-center gap-1">
								{TOOLBAR_ICONS.map(({ icon: Icon, label }) => (
									<button
										key={label}
										type="button"
										aria-label={label}
										className="w-7 h-7 rounded-md hover:bg-white/5 inline-flex items-center justify-center text-white/60 transition-colors"
									>
										<Icon className="w-3.5 h-3.5" />
									</button>
								))}
							</div>
							<button
								type="button"
								aria-label="More options"
								className="w-7 h-7 rounded-md hover:bg-white/5 inline-flex items-center justify-center text-white/60 transition-colors"
							>
								<MoreHorizontal className="w-3.5 h-3.5" />
							</button>
						</div>

						<div className="flex-1 overflow-y-auto p-5">
							<h3 className="text-sm font-semibold text-white">
								Weekly product digest
							</h3>
							<div className="mt-3 flex items-center gap-2.5">
								<span className="w-7 h-7 rounded-full bg-gradient-to-br from-[#00d2ff] to-[#0B2551] inline-flex items-center justify-center text-[10px] font-bold text-white">
									L
								</span>
								<div className="flex-1 min-w-0">
									<p className="text-xs font-medium text-white">Linear</p>
									<p className="text-[11px] text-white/40">to me · 9:41 AM</p>
								</div>
								<span className="inline-flex items-center gap-1.5 text-[10px] px-2 py-0.5 rounded-full border border-white/10 text-white/50">
									<span className="w-1.5 h-1.5 rounded-full bg-[#00d2ff]" />
									Work
								</span>
							</div>

							<div className="liquid-glass rounded-lg p-3 mt-4">
								<div className="flex items-center gap-1.5">
									<Sparkles
										className="w-3.5 h-3.5"
										style={{ color: "#A4F4FD" }}
									/>
									<span className="text-[11px] font-semibold text-white">
										Summary by Aura
									</span>
								</div>
								<p className="mt-1.5 text-xs text-white/70 leading-[1.6]">
									Your team closed 23 issues, merged 14 PRs, and shipped 2
									features. Top contributor: Marcus. No action needed.
								</p>
							</div>

							<div className="mt-4 space-y-3">
								{BODY_PARAGRAPHS.map((paragraph) => (
									<p
										key={paragraph}
										className="text-xs text-white/70 leading-[1.7]"
									>
										{paragraph}
									</p>
								))}
								<p className="text-xs text-white/50 leading-[1.7]">
									— The Linear team
								</p>
							</div>

							<button
								type="button"
								className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-white/70 hover:bg-white/[0.06] transition-colors"
							>
								<Paperclip className="w-3.5 h-3.5" />
								digest-may-6.pdf
							</button>
						</div>
					</div>
				</div>
			</motion.div>
		</section>
	);
}
