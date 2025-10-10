import { Navigation } from "@/components/landing/Navigation";
import { AboutHero } from "@/components/about/AboutHero";
import { OurStory } from "@/components/about/OurStory";
import { OurValues } from "@/components/about/OurValues";
import { OurMission } from "@/components/about/OurMission";
import { OurVision } from "@/components/about/OurVision";
import { OurCommitment } from "@/components/about/OurCommitment";
import { FooterSection } from "@/components/landing/FooterSection";

export const runtime = "edge";

export const metadata = {
	title: "About - Atenra",
	description: "The human-first platform for trusted service discovery.",
};

export default function AboutPage() {
	return (
		<main className="min-h-screen bg-background">
			<Navigation />
			<div className="pt-8">
				<AboutHero />
				<OurStory />
				<OurValues />
				<OurMission />
				<OurVision />
				<OurCommitment />
				<FooterSection />
			</div>
		</main>
	);
}