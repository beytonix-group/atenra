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
					firstName: profile.firstName,
					lastName: profile.lastName,
					displayName: profile.displayName,
					phone: profile.phone,
					addressLine1: profile.addressLine1,
					addressLine2: profile.addressLine2,
					city: profile.city,
					state: profile.state,
					zipCode: profile.zipCode,
					country: profile.country,
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
		<div className="space-y-6">
			{/* Profile Header Card */}
			<Card>
				<CardHeader>
					<div className="flex items-center space-x-4">
						<Avatar className="h-20 w-20">
							<AvatarImage src={sanitizeAvatarUrl(session?.user?.image) || ""} alt={session?.user?.name || ""} />
							<AvatarFallback>
								{getUserInitials(session?.user?.name || profile.displayName, profile.email)}
							</AvatarFallback>
						</Avatar>
						<div className="flex-1">
							<CardTitle className="text-2xl">{profile.displayName || session?.user?.name || "User"}</CardTitle>
							<CardDescription className="mt-1">{profile.email}</CardDescription>
							<div className="flex items-center gap-2 mt-3">
								{profile.roles && profile.roles.length > 0 && (
									<RoleBadge role={profile.roles[0].roleName} />
								)}
								<Badge variant={getStatusBadgeVariant(profile.status) as any}>
									{formatStatus(profile.status)}
								</Badge>
								{profile.emailVerified ? (
									<Badge variant="outline" className="gap-1">
										<CheckCircle className="h-3 w-3" />
										Verified
									</Badge>
								) : (
									<Badge variant="outline" className="text-yellow-600">
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
					<AlertDescription>{message}</AlertDescription>
				</Alert>
			)}
			
			{/* Profile Form */}
			<Card>
				<CardContent className="pt-6">
					<form onSubmit={handleSubmit} className="space-y-6">
						{/* Personal Information Section */}
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label htmlFor="firstName">First Name</Label>
								<Input
									id="firstName"
									value={profile.firstName || ""}
									onChange={(e) => setProfile({...profile, firstName: e.target.value.slice(0, 30)})}
									placeholder="Enter first name"
									maxLength={30}
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="lastName">Last Name</Label>
								<Input
									id="lastName"
									value={profile.lastName || ""}
									onChange={(e) => setProfile({...profile, lastName: e.target.value.slice(0, 30)})}
									placeholder="Enter last name"
									maxLength={30}
								/>
							</div>
						</div>
						
						<div className="space-y-2">
							<Label htmlFor="displayName">Display Name</Label>
							<Input
								id="displayName"
								value={profile.displayName || ""}
								onChange={(e) => setProfile({...profile, displayName: e.target.value.slice(0, 65)})}
								placeholder="Enter display name"
								maxLength={65}
							/>
						</div>

						{/* Contact Information Section */}
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label htmlFor="email">Email</Label>
								<div className="relative">
									<Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
									<Input
										id="email"
										value={profile.email}
										disabled
										className="bg-muted pl-10"
									/>
								</div>
							</div>
							<div className="space-y-2">
								<Label htmlFor="phone">Phone</Label>
								<div className="relative">
									<Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
									<Input
										id="phone"
										value={profile.phone || ""}
										onChange={(e) => {
											const formatted = formatPhoneNumber(e.target.value);
											setProfile({...profile, phone: formatted});
										}}
										placeholder="(555) 555-5555"
										type="tel"
										className="pl-10"
									/>
								</div>
							</div>
						</div>

						{/* Address Information Section */}
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label htmlFor="addressLine1">Address Line 1</Label>
								<Input
									id="addressLine1"
									value={profile.addressLine1 || ""}
									onChange={(e) => setProfile({...profile, addressLine1: e.target.value.slice(0, 50)})}
									placeholder="Enter street address"
									maxLength={50}
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="addressLine2">Address Line 2 (Optional)</Label>
								<Input
									id="addressLine2"
									value={profile.addressLine2 || ""}
									onChange={(e) => setProfile({...profile, addressLine2: e.target.value.slice(0, 50)})}
									placeholder="Apartment, suite, etc."
									maxLength={50}
								/>
							</div>
						</div>
						
						<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
							<div className="space-y-2">
								<Label htmlFor="city">City</Label>
								<Input
									id="city"
									value={profile.city || ""}
									onChange={(e) => setProfile({...profile, city: e.target.value})}
									placeholder="Enter city"
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="state">State/Province</Label>
								<Input
									id="state"
									value={profile.state || ""}
									onChange={(e) => setProfile({...profile, state: e.target.value})}
									placeholder="Enter state"
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="zipCode">ZIP Code</Label>
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
								/>
							</div>
						</div>
						
						<div className="space-y-2">
							<Label htmlFor="country">Country</Label>
							<div className="relative">
								<MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
								<Input
									id="country"
									value={profile.country || ""}
									onChange={(e) => setProfile({...profile, country: e.target.value})}
									placeholder="Enter country"
									className="pl-10"
								/>
							</div>
						</div>

						{/* Save Button */}
						<div className="flex justify-end pt-4">
							<Button type="submit" disabled={isSaving} size="lg">
								{isSaving ? (
									<>
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										Saving...
									</>
								) : (
									<>
										<Save className="mr-2 h-4 w-4" />
										Save Changes
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