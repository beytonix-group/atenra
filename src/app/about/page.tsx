import { Navigation } from "@/components/landing/Navigation";
import { AboutHero } from "@/components/about/AboutHero";
import { OurStory } from "@/components/about/OurStory";
import { OurValues } from "@/components/about/OurValues";
import { SupportedServices } from "@/components/about/SupportedServices";
import { FooterSection } from "@/components/landing/FooterSection";

export const runtime = "edge";

export const metadata = {
	title: "About - Atenra",
	description: "Learn about Atenra's mission to revolutionize service provider connections through human-first matching.",
};

export default function AboutPage() {
	return (
		<main className="min-h-screen bg-background">
			<Navigation />
			<div className="pt-16">
				<AboutHero />
				<OurStory />
				<OurValues />
				<SupportedServices />
				<FooterSection />
			</div>
		</main>
	);
}