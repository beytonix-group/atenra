import { Navigation } from "@/components/landing/Navigation";
import { MoreHero } from "@/components/more/MoreHero";
import { FAQ } from "@/components/more/FAQ";
import { LegalSection } from "@/components/more/LegalSection";
import { FooterSection } from "@/components/landing/FooterSection";

export const runtime = "edge";

export const metadata = {
	title: "More Info - Atenra",
	description: "FAQs, legal information, and everything you need to know about using Atenra.",
};

export default function MorePage() {
	return (
		<main className="min-h-screen bg-background">
			<Navigation />
			<div className="pt-8">
				<MoreHero />
				<div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="grid grid-cols-1 lg:grid-cols-3 gap-8 py-12">
						<div className="lg:col-span-2">
							<FAQ />
						</div>
						<div>
							<LegalSection />
						</div>
					</div>
				</div>
				<FooterSection />
			</div>
		</main>
	);
}