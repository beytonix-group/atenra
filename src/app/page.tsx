import { HeroSection } from "@/components/landing/HeroSection";
import { FooterSection } from "@/components/landing/FooterSection";
import { Navigation } from "@/components/landing/Navigation";

// Only use edge runtime in production
export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export const metadata = {
	title: "Atenra - Begin Your Referral Journey",
	description: "Exceptional service matching powered by intelligent technology and genuine human expertise.",
};

export default function Page() {
	return (
		<main className="min-h-screen bg-background">
			<Navigation />
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<HeroSection />
				<FooterSection />
			</div>
		</main>
	);
}
