import { Navigation } from "@/components/landing/Navigation";
import { MoreHero } from "@/components/more/MoreHero";
import { LegalSection } from "@/components/more/LegalSection";
import { FooterSection } from "@/components/landing/FooterSection";


export const metadata = {
	title: "More Info - Atenra",
	description: "Legal information and everything you need to know about using Atenra.",
};

export default function MorePage() {
	return (
		<main className="min-h-screen bg-background">
			<Navigation />
			<div className="pt-8">
				<MoreHero />
				<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
					<LegalSection />
				</div>
				<FooterSection />
			</div>
		</main>
	);
}