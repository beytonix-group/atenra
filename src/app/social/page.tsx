import { Navigation } from "@/components/landing/Navigation";
import { SocialHero } from "@/components/social/SocialHero";
import { SocialContent } from "@/components/social/SocialContent";
import { FooterSection } from "@/components/landing/FooterSection";

// Only use edge runtime in production
export const runtime = 'edge';

export const metadata = {
	title: "Social - Atenra",
	description: "Connect with Atenra across all platforms. Follow our journey and join our community.",
};

export default function SocialPage() {
	return (
		<main className="min-h-screen bg-background">
			<Navigation />
			<div className="pt-8">
				<SocialHero />
				<SocialContent />
				<FooterSection />
			</div>
		</main>
	);
}