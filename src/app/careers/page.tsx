import { Navigation } from "@/components/landing/Navigation";
import { FooterSection } from "@/components/landing/FooterSection";
import { Briefcase, Users, Rocket, Heart } from "lucide-react";

export const runtime = "edge";

export const metadata = {
	title: "Careers - Atenra",
	description: "Join our team and help transform how people discover trusted services.",
};

const values = [
	{
		icon: Heart,
		title: "Human-First",
		description: "We believe in the power of human expertise over algorithms. Join a team that values genuine connections.",
	},
	{
		icon: Users,
		title: "Transparency",
		description: "Built for transparency means working with transparency. Open communication, honest feedback, real growth.",
	},
	{
		icon: Rocket,
		title: "Innovation",
		description: "Reimagine service discovery with us. We're building something new, and your ideas matter.",
	},
	{
		icon: Briefcase,
		title: "Ownership",
		description: "Take ownership of your work. We trust our team to make decisions and drive impact.",
	},
];

export default function CareersPage() {
	return (
		<main className="min-h-screen bg-background">
			<Navigation />
			<div className="pt-24 pb-16">
				<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
					{/* Hero Section */}
					<div className="mb-16 text-center">
						<h1 className="text-5xl font-light mb-6">Join Our Team</h1>
						<p className="text-xl text-muted-foreground font-light max-w-2xl mx-auto">
							Help us transform how people discover trusted services. We&apos;re building something different, and we need exceptional people to make it happen.
						</p>
					</div>

					{/* Values */}
					<div className="mb-16">
						<h2 className="text-3xl font-light mb-8 text-center">Our Values</h2>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
							{values.map((value) => (
								<div
									key={value.title}
									className="rounded-lg border border-border/50 bg-card/50 backdrop-blur-sm p-6 hover:shadow-lg transition-shadow"
								>
									<value.icon className="h-10 w-10 text-amber-700 dark:text-amber-400 mb-4" />
									<h3 className="text-xl font-light mb-2">{value.title}</h3>
									<p className="text-muted-foreground font-light leading-relaxed">
										{value.description}
									</p>
								</div>
							))}
						</div>
					</div>

					{/* Current Openings */}
					<div className="mb-16">
						<h2 className="text-3xl font-light mb-8 text-center">Current Openings</h2>
						<div className="rounded-lg border border-border/50 bg-card/50 backdrop-blur-sm p-12 text-center">
							<p className="text-lg text-muted-foreground font-light mb-6">
								We&apos;re currently building our team and will be posting opportunities soon.
							</p>
							<p className="text-muted-foreground font-light">
								Interested in joining us? Send your resume and a note about what excites you about Atenra to{" "}
								<a
									href="mailto:careers@atenra.com"
									className="text-primary hover:opacity-70 transition-opacity"
								>
									careers@atenra.com
								</a>
							</p>
						</div>
					</div>

					{/* Why Atenra */}
					<div className="rounded-lg border border-border/50 bg-card/50 backdrop-blur-sm p-8">
						<h2 className="text-2xl font-light mb-6">Why Atenra?</h2>
						<div className="space-y-4 text-muted-foreground font-light leading-relaxed">
							<p>
								We&apos;re not another tech platform trying to automate everything. We believe in the irreplaceable value of human expertise and genuine connections.
							</p>
							<p>
								At Atenra, you&apos;ll work on meaningful problems that affect real people&apos;s lives. Every match we make, every connection we facilitate, helps someone find the right service provider and helps a business grow.
							</p>
							<p>
								If you value transparency, authenticity, and the human touch in technology—we&apos;d love to hear from you.
							</p>
						</div>
					</div>
				</div>
			</div>
			<FooterSection />
		</main>
	);
}
