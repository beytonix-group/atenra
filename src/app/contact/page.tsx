import { Navigation } from "@/components/landing/Navigation";
import { ContactHero } from "@/components/contact/ContactHero";
import { ContactForm } from "@/components/contact/ContactForm";
import { ContactInfo } from "@/components/contact/ContactInfo";
import { FooterSection } from "@/components/landing/FooterSection";


export const metadata = {
	title: "Contact - Atenra",
	description: "Get in touch with Atenra. Questions, support, or partnership inquiries welcome.",
};

export default function ContactPage() {
	return (
		<main className="min-h-screen bg-background">
			<Navigation />
			<div className="pt-8">
				<ContactHero />
				<div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
						<ContactForm />
						<ContactInfo />
					</div>
				</div>
				<FooterSection />
			</div>
		</main>
	);
}