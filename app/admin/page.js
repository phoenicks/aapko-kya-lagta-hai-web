import { isAdminAuthenticated } from "@/lib/adminAuth";
import AdminLogin from "@/components/admin/AdminLogin";
import AdminDashboard from "@/components/admin/AdminDashboard";

export const metadata = { robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default function AdminPage() {
  const authed = isAdminAuthenticated();
  return authed ? <AdminDashboard /> : <AdminLogin />;
}
