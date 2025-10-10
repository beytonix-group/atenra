import { Navigation } from "@/components/landing/Navigation";
import { FAQ } from "@/components/more/FAQ";
import { FooterSection } from "@/components/landing/FooterSection";

export const runtime = "edge";

export const metadata = {
	title: "FAQ's - Atenra",
	description: "Frequently asked questions about Atenra and our services.",
};

export default function FAQPage() {
	return (
		<main className="min-h-screen bg-background">
			<Navigation />
			<div className="pt-24 pb-16">
				<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="mb-8">
						<h1 className="text-4xl font-light mb-4">Frequently Asked Questions</h1>
						<p className="text-muted-foreground font-light">
							Find answers to common questions about Atenra&apos;s matching service, pricing, and how we work.
						</p>
					</div>
					<FAQ />
				</div>
			</div>
			<FooterSection />
		</main>
	);
}
