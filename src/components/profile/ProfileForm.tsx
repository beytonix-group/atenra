"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { sanitizeAvatarUrl } from "@/lib/utils/avatar";
import { formatStatus, formatRoleName } from "@/lib/utils/format";
import { User, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

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

	return (
		<div className="bg-card/50 backdrop-blur-sm rounded-2xl border p-8 shadow-xl">
			<div className="flex items-center space-x-4 mb-8">
				{sanitizeAvatarUrl(session?.user?.image) ? (
					<>
						<img 
							src={sanitizeAvatarUrl(session?.user?.image)!} 
							alt={session?.user?.name || "User"}
							className="w-16 h-16 rounded-full object-cover"
							onError={(e) => {
								e.currentTarget.style.display = 'none';
								const fallback = e.currentTarget.nextElementSibling as HTMLElement;
								if (fallback) fallback.classList.remove('hidden');
							}}
						/>
						<div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center hidden">
							<User className="h-6 w-6" />
						</div>
					</>
				) : (
					<div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
						<User className="h-6 w-6" />
					</div>
				)}
				<div>
					<h2 className="text-2xl font-semibold">{profile.displayName || session?.user?.name}</h2>
					<p className="text-muted-foreground">{profile.email}</p>
					<div className="flex items-center gap-2 mt-2">
						{profile.roles && profile.roles.length > 0 && (
							<Badge variant="default">
								{formatRoleName(profile.roles[0].roleName)}
							</Badge>
						)}
						<span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
							{formatStatus(profile.status)}
						</span>
						{profile.emailVerified ? (
							<span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
								Email Verified
							</span>
						) : (
							<span className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
								Email Not Verified
							</span>
						)}
					</div>
				</div>
			</div>
			
			{message && (
				<div className={`mb-6 p-4 rounded-lg ${message.includes('successfully') ? 'bg-green-50 text-green-800 border border-green-200 dark:bg-green-900/20 dark:text-green-200 dark:border-green-800' : 'bg-red-50 text-red-800 border border-red-200 dark:bg-red-900/20 dark:text-red-200 dark:border-red-800'}`}>
					{message}
				</div>
			)}
			
			<form onSubmit={handleSubmit} className="space-y-6">
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div className="space-y-2">
						<Label htmlFor="firstName">First Name</Label>
						<Input
							id="firstName"
							value={profile.firstName || ""}
							onChange={(e) => setProfile({...profile, firstName: e.target.value})}
							placeholder="Enter first name"
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="lastName">Last Name</Label>
						<Input
							id="lastName"
							value={profile.lastName || ""}
							onChange={(e) => setProfile({...profile, lastName: e.target.value})}
							placeholder="Enter last name"
						/>
					</div>
				</div>
				
				<div className="space-y-2">
					<Label htmlFor="displayName">Display Name</Label>
					<Input
						id="displayName"
						value={profile.displayName || ""}
						onChange={(e) => setProfile({...profile, displayName: e.target.value})}
						placeholder="Enter display name"
					/>
				</div>
				
				<div className="space-y-2">
					<Label htmlFor="email">Email</Label>
					<Input
						id="email"
						value={profile.email}
						disabled
						className="bg-muted"
					/>
				</div>
				
				<div className="space-y-2">
					<Label htmlFor="phone">Phone</Label>
					<Input
						id="phone"
						value={profile.phone || ""}
						onChange={(e) => setProfile({...profile, phone: e.target.value})}
						placeholder="Enter phone number"
					/>
				</div>
				
				<div className="space-y-4">
					<h3 className="text-lg font-semibold">Address</h3>
					
					<div className="space-y-2">
						<Label htmlFor="addressLine1">Address Line 1</Label>
						<Input
							id="addressLine1"
							value={profile.addressLine1 || ""}
							onChange={(e) => setProfile({...profile, addressLine1: e.target.value})}
							placeholder="Enter street address"
						/>
					</div>
					
					<div className="space-y-2">
						<Label htmlFor="addressLine2">Address Line 2 (Optional)</Label>
						<Input
							id="addressLine2"
							value={profile.addressLine2 || ""}
							onChange={(e) => setProfile({...profile, addressLine2: e.target.value})}
							placeholder="Apartment, suite, etc."
						/>
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
								onChange={(e) => setProfile({...profile, zipCode: e.target.value})}
								placeholder="Enter ZIP code"
							/>
						</div>
					</div>
					
					<div className="space-y-2">
						<Label htmlFor="country">Country</Label>
						<Input
							id="country"
							value={profile.country || ""}
							onChange={(e) => setProfile({...profile, country: e.target.value})}
							placeholder="Enter country"
						/>
					</div>
				</div>
				
				<div className="flex justify-end pt-6 border-t">
					<Button type="submit" disabled={isSaving} className="min-w-[120px]">
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
		</div>
	);
}