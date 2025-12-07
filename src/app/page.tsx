import { HeroSection } from "@/components/landing/HeroSection";
import { ServicesShowcase } from "@/components/landing/ServicesShowcase";
import { FooterSection } from "@/components/landing/FooterSection";
import { Navigation } from "@/components/landing/Navigation";


export const metadata = {
	title: "Atenra - Begin Your Referral Journey",
	description: "Exceptional service matching powered by intelligent technology and genuine human expertise.",
};

export default async function Page() {
	return (
		<main className="min-h-screen bg-background">
			<Navigation />
			<HeroSection />
			<ServicesShowcase />
			<FooterSection />
		</main>
	);
}