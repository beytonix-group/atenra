import { Navigation } from "@/components/landing/Navigation";
import { AboutHero } from "@/components/about/AboutHero";
import { OurStory } from "@/components/about/OurStory";
import { OurValues } from "@/components/about/OurValues";
import { SupportedServices } from "@/components/about/SupportedServices";
import { FooterSection } from "@/components/landing/FooterSection";

// Only use edge runtime in production
export const runtime = process.env.NODE_ENV === 'production' ? 'edge' : 'nodejs';

export const metadata = {
	title: "About - Atenra",
	description: "Learn about Atenra's mission to revolutionize service provider connections through human-first matching.",
};

export default function AboutPage() {
	return (
		<main className="min-h-screen bg-background">
			<Navigation />
			<div className="pt-8">
				<AboutHero />
				<OurStory />
				<OurValues />
				<SupportedServices />
				<FooterSection />
			</div>
		</main>
	);
}