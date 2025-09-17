import { redirect } from "next/navigation";

export const runtime = "edge";

export default async function AdminPage() {
	// Redirect to the new admin dashboard
	redirect("/admindashboard");
}