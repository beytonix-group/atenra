"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { sanitizeAvatarUrl } from "@/lib/utils/avatar";
import { formatStatus, getStatusBadgeVariant } from "@/lib/utils/format";
import { formatPhoneNumber, formatZipCode } from "@/lib/utils/input-format";
import { User, Save, Loader2, Mail, Phone, MapPin, Calendar, Shield, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { RoleBadge } from "@/components/ui/role-badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface UserProfile {
	firstName: string;
	lastName: string;
	displayName: string;
	email: string;
	phone: string;
	addressLine1: string;
	addressLine2: string;
	city: string;
	state: string;
	zipCode: string;
	country: string;
	status: string;
	emailVerified: number;
	createdAt: string;
	roles?: { roleId: number; roleName: string }[];
}

export function ProfileForm() {
	const { data: session } = useSession();
	const [profile, setProfile] = useState<UserProfile | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [isSaving, setIsSaving] = useState(false);
	const [message, setMessage] = useState("");
	
	useEffect(() => {
		if (session?.user) {
			fetchProfile();
		}
	}, [session]);
	
	const fetchProfile = async () => {
		try {
			const response = await fetch("/api/profile");
			if (response.ok) {
				const data = await response.json() as UserProfile;
				setProfile(data);
			}
		} catch (error) {
			console.error("Failed to fetch profile:", error);
		} finally {
			setIsLoading(false);
		}
	};
	
	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!profile) return;
		
		setIsSaving(true);
		setMessage("");
		
		try {
			const response = await fetch("/api/profile", {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					firstName: profile.firstName || "",
					lastName: profile.lastName || "",
					displayName: profile.displayName || "",
					phone: profile.phone || "",
					addressLine1: profile.addressLine1 || "",
					addressLine2: profile.addressLine2 || "",
					city: profile.city || "",
					state: profile.state || "",
					zipCode: profile.zipCode || "",
					country: profile.country || "",
				}),
			});
			
			if (response.ok) {
				setMessage("Profile updated successfully!");
				setTimeout(() => setMessage(""), 3000);
			} else {
				const error = await response.json() as { error?: string };
				setMessage(error.error || "Failed to update profile");
			}
		} catch (error) {
			console.error("Update profile error:", error);
			setMessage("Failed to update profile");
		} finally {
			setIsSaving(false);
		}
	};

	if (isLoading) {
		return (
			<div className="flex items-center justify-center py-12">
				<Loader2 className="h-8 w-8 animate-spin" />
			</div>
		);
	}

	if (!profile) {
		return (
			<div className="text-center py-12">
				<p>Failed to load profile</p>
			</div>
		);
	}

	const getUserInitials = (name?: string | null, email?: string) => {
		if (name) {
			return name
				.split(" ")
				.map((n) => n[0])
				.join("")
				.toUpperCase()
				.slice(0, 2);
		}
		return email ? email[0].toUpperCase() : "U";
	};

	return (
		<div className="space-y-4 md:space-y-6">
			{/* Profile Header Card */}
			<Card>
				<CardHeader>
					<div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
						<Avatar className="h-16 w-16 md:h-20 md:w-20 flex-shrink-0">
							<AvatarImage src={sanitizeAvatarUrl(session?.user?.image) || ""} alt={session?.user?.name || ""} />
							<AvatarFallback>
								{getUserInitials(session?.user?.name || profile.displayName, profile.email)}
							</AvatarFallback>
						</Avatar>
						<div className="flex-1 min-w-0 w-full sm:w-auto">
							<CardTitle className="text-xl md:text-2xl truncate">{profile.displayName || session?.user?.name || "User"}</CardTitle>
							<CardDescription className="mt-1 text-sm truncate">{profile.email}</CardDescription>
							<div className="flex flex-wrap items-center gap-1.5 md:gap-2 mt-2 md:mt-3">
								{profile.roles && profile.roles.length > 0 && (
									<RoleBadge role={profile.roles[0].roleName} />
								)}
								<Badge variant={getStatusBadgeVariant(profile.status) as any} className="text-xs">
									{formatStatus(profile.status)}
								</Badge>
								{profile.emailVerified ? (
									<Badge variant="outline" className="gap-1 text-xs">
										<CheckCircle className="h-3 w-3" />
										Verified
									</Badge>
								) : (
									<Badge variant="outline" className="text-yellow-600 text-xs">
										Unverified
									</Badge>
								)}
							</div>
						</div>
					</div>
				</CardHeader>
			</Card>
			
			{message && (
				<Alert className={message.includes('successfully') ? 'border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-900/20 dark:text-green-200' : 'border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-200'}>
					<AlertDescription className="text-sm">{message}</AlertDescription>
				</Alert>
			)}

			{/* Profile Form */}
			<Card>
				<CardContent className="pt-4 md:pt-6">
					<form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
						{/* Personal Information Section */}
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
							<div className="space-y-2">
								<Label htmlFor="firstName" className="text-sm">First Name</Label>
								<Input
									id="firstName"
									value={profile.firstName || ""}
									onChange={(e) => setProfile({...profile, firstName: e.target.value.slice(0, 30)})}
									placeholder="Enter first name"
									maxLength={30}
									className="text-sm"
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="lastName" className="text-sm">Last Name</Label>
								<Input
									id="lastName"
									value={profile.lastName || ""}
									onChange={(e) => setProfile({...profile, lastName: e.target.value.slice(0, 30)})}
									placeholder="Enter last name"
									maxLength={30}
									className="text-sm"
								/>
							</div>
						</div>

						<div className="space-y-2">
							<Label htmlFor="displayName" className="text-sm">Display Name</Label>
							<Input
								id="displayName"
								value={profile.displayName || ""}
								onChange={(e) => setProfile({...profile, displayName: e.target.value.slice(0, 65)})}
								placeholder="Enter display name"
								maxLength={65}
								className="text-sm"
							/>
						</div>

						{/* Contact Information Section */}
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
							<div className="space-y-2">
								<Label htmlFor="email" className="text-sm">Email</Label>
								<div className="relative">
									<Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
									<Input
										id="email"
										value={profile.email}
										disabled
										className="bg-muted pl-10 text-sm"
									/>
								</div>
							</div>
							<div className="space-y-2">
								<Label htmlFor="phone" className="text-sm">Phone</Label>
								<div className="relative">
									<Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
									<Input
										id="phone"
										value={profile.phone || ""}
										onChange={(e) => {
											const formatted = formatPhoneNumber(e.target.value);
											setProfile({...profile, phone: formatted});
										}}
										placeholder="(555) 555-5555"
										type="tel"
										className="pl-10 text-sm"
									/>
								</div>
							</div>
						</div>

						{/* Address Information Section */}
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
							<div className="space-y-2">
								<Label htmlFor="addressLine1" className="text-sm">Address Line 1</Label>
								<Input
									id="addressLine1"
									value={profile.addressLine1 || ""}
									onChange={(e) => setProfile({...profile, addressLine1: e.target.value.slice(0, 50)})}
									placeholder="Enter street address"
									maxLength={50}
									className="text-sm"
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="addressLine2" className="text-sm">Address Line 2 (Optional)</Label>
								<Input
									id="addressLine2"
									value={profile.addressLine2 || ""}
									onChange={(e) => setProfile({...profile, addressLine2: e.target.value.slice(0, 50)})}
									placeholder="Apt, suite, etc."
									maxLength={50}
									className="text-sm"
								/>
							</div>
						</div>

						<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
							<div className="space-y-2">
								<Label htmlFor="city" className="text-sm">City</Label>
								<Input
									id="city"
									value={profile.city || ""}
									onChange={(e) => setProfile({...profile, city: e.target.value})}
									placeholder="Enter city"
									className="text-sm"
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="state" className="text-sm">State/Province</Label>
								<Input
									id="state"
									value={profile.state || ""}
									onChange={(e) => setProfile({...profile, state: e.target.value})}
									placeholder="Enter state"
									className="text-sm"
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="zipCode" className="text-sm">ZIP Code</Label>
								<Input
									id="zipCode"
									value={profile.zipCode || ""}
									onChange={(e) => {
										const formatted = formatZipCode(e.target.value);
										setProfile({...profile, zipCode: formatted});
									}}
									placeholder="12345"
									maxLength={5}
									pattern="[0-9]{5}"
									className="text-sm"
								/>
							</div>
						</div>

						<div className="space-y-2">
							<Label htmlFor="country" className="text-sm">Country</Label>
							<div className="relative">
								<MapPin className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
								<Input
									id="country"
									value={profile.country || ""}
									onChange={(e) => setProfile({...profile, country: e.target.value})}
									placeholder="Enter country"
									className="pl-10 text-sm"
								/>
							</div>
						</div>

						{/* Save Button */}
						<div className="flex justify-end pt-2 md:pt-4">
							<Button type="submit" disabled={isSaving} size="lg" className="w-full sm:w-auto">
								{isSaving ? (
									<>
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										<span className="text-sm">Saving...</span>
									</>
								) : (
									<>
										<Save className="mr-2 h-4 w-4" />
										<span className="text-sm">Save Changes</span>
									</>
								)}
							</Button>
						</div>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}