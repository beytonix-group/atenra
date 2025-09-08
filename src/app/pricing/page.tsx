import { PricingSection } from "@/components/landing/PricingSection";
import { Navigation } from "@/components/landing/Navigation";

export const runtime = "edge";

export const metadata = {
	title: "Pricing - Atenra",
	description: "Simple, transparent pricing for professional service matching. Choose your access level.",
};

export default function PricingPage() {
	return (
		<main className="min-h-screen bg-background">
			<Navigation />
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
				<PricingSection />
			</div>
		</main>
	);
}