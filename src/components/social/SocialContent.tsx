"use client";

import { ExternalLink, Users, TrendingUp, MessageCircle, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n/LanguageContext";

const socialPlatforms = [
	{
		name: "X (Twitter)",
		handle: "@atenra",
		url: "https://x.com/atenra",
		description: "Real-time updates, industry insights, and quick tips for finding trusted service providers.",
		icon: "𝕏",
		color: "from-gray-900 to-black",
		textColor: "text-white",
		stats: "12.5K followers"
	},
	{
		name: "LinkedIn",
		handle: "Atenra",
		url: "https://linkedin.com/company/atenra",
		description: "Professional insights, company updates, and B2B networking for service industry leaders.",
		icon: "💼",
		color: "from-blue-600 to-blue-800",
		textColor: "text-white",
		stats: "8.2K connections"
	},
	{
		name: "Instagram",
		handle: "@atenra",
		url: "https://instagram.com/atenra",
		description: "Behind-the-scenes content, team highlights, and visual stories of successful service matches.",
		icon: "📸",
		color: "from-pink-500 to-purple-600",
		textColor: "text-white",
		stats: "15.3K followers"
	},
	{
		name: "TikTok",
		handle: "@atenra",
		url: "https://tiktok.com/@atenra",
		description: "Quick tips, service provider spotlights, and trending content about home and business services.",
		icon: "🎵",
		color: "from-gray-900 to-gray-700",
		textColor: "text-white",
		stats: "24.7K followers"
	},
	{
		name: "Facebook",
		handle: "Atenra",
		url: "https://facebook.com/atenra",
		description: "Community discussions, detailed guides, and local service provider recommendations.",
		icon: "👥",
		color: "from-blue-600 to-blue-700",
		textColor: "text-white",
		stats: "9.8K likes"
	},
	{
		name: "YouTube",
		handle: "Atenra Official",
		url: "https://youtube.com/@atenra",
		description: "In-depth tutorials, service provider interviews, and comprehensive guides to home improvement.",
		icon: "📺",
		color: "from-red-600 to-red-700",
		textColor: "text-white",
		stats: "5.2K subscribers"
	}
];

const communityFeatures = [
	{
		icon: Users,
		title: "Community Forums",
		description: "Join discussions with other users and share experiences about service providers."
	},
	{
		icon: TrendingUp,
		title: "Industry Insights",
		description: "Stay updated with the latest trends in home services and business solutions."
	},
	{
		icon: MessageCircle,
		title: "Expert Q&A",
		description: "Get answers from our team of service industry experts and verified providers."
	},
	{
		icon: Video,
		title: "Live Sessions",
		description: "Participate in live Q&A sessions and virtual meetups with service professionals."
	}
];

export function SocialContent() {
	const { t } = useLanguage();
	return (
		<div className="space-y-24 md:space-y-32">
			<section className="py-20 md:py-32">
				<div className="max-w-6xl mx-auto px-4">
					<div className="text-center mb-16">
						<h2 className="text-4xl md:text-5xl font-light mb-6">{t.social.followUs}</h2>
						<p className="text-xl text-muted-foreground max-w-2xl mx-auto">
							{t.social.followUsSubtitle}
						</p>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
						{socialPlatforms.map((platform, index) => (
							<div key={index} className="group">
								<div className="relative overflow-hidden rounded-2xl border bg-card p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-2">
									<div className={`absolute inset-0 bg-gradient-to-br ${platform.color} opacity-5 group-hover:opacity-10 transition-opacity`} />
									
									<div className="relative">
										<div className="flex items-center justify-between mb-4">
											<div className="text-2xl">{platform.icon}</div>
											<div className="text-sm text-muted-foreground">{platform.stats}</div>
										</div>
										
										<h3 className="text-xl font-semibold mb-2">{platform.name}</h3>
										<p className="text-muted-foreground text-sm mb-2 font-medium">{platform.handle}</p>
										<p className="text-muted-foreground text-sm leading-relaxed mb-6">
											{platform.description}
										</p>
										
										<a
											href={platform.url}
											target="_blank"
											rel="noopener noreferrer"
											className="w-full"
										>
											<Button 
												variant="outline" 
												className="w-full group-hover:scale-105 transition-transform"
											>
												Follow
												<ExternalLink className="ml-2 h-4 w-4" />
											</Button>
										</a>
									</div>
								</div>
							</div>
						))}
					</div>
				</div>
			</section>

			<section className="py-20 md:py-32 bg-muted/20">
				<div className="max-w-6xl mx-auto px-4">
					<div className="text-center mb-16">
						<h2 className="text-4xl md:text-5xl font-light mb-6">{t.social.joinCommunity}</h2>
						<p className="text-xl text-muted-foreground max-w-2xl mx-auto">
							{t.social.joinCommunitySubtitle}
						</p>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
						{communityFeatures.map((feature, index) => {
							const Icon = feature.icon;
							return (
								<div key={index} className="text-center group">
									<div className="flex justify-center mb-6">
										<div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 group-hover:bg-gradient-to-br group-hover:from-primary/20 group-hover:to-secondary/20">
											<Icon className="h-8 w-8 text-primary" />
										</div>
									</div>
									<h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
									<p className="text-muted-foreground leading-relaxed text-sm">
										{feature.description}
									</p>
								</div>
							);
						})}
					</div>

					<div className="text-center mt-12">
						<Link href="/register">
							<Button size="lg" className="font-semibold px-8">
								{t.social.joinCommunity}
							</Button>
						</Link>
					</div>
				</div>
			</section>

			<section className="py-20 md:py-32">
				<div className="max-w-4xl mx-auto px-4 text-center">
					<div className="bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10 rounded-3xl p-8 md:p-12 border">
						<h2 className="text-3xl md:text-4xl font-bold mb-6">{t.social.stayUpdated}</h2>
						<p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
							{t.social.stayUpdatedSubtitle}
						</p>
						
						<div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
							<input
								type="email"
								placeholder={t.social.emailPlaceholder}
								className="flex-grow px-4 py-3 rounded-lg border bg-background focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
							/>
							<Button className="px-6 py-3 font-semibold">
								{t.social.subscribe}
							</Button>
						</div>
						
						<p className="text-xs text-muted-foreground mt-4">
							{t.social.disclaimer}
						</p>
					</div>
				</div>
			</section>
		</div>
	);
}