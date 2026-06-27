import { redirect } from "next/navigation";

// /admin redirects to the dashboard inside the portal route group
export default function AdminRoot() {
  redirect("/admin/dashboard");
}
