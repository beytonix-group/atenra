import { redirect } from "next/navigation";


export default async function AdminPage() {
	// Redirect to the new admin dashboard
	redirect("/admindashboard");
}