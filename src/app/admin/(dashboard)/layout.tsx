import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/admin-auth";
import { AdminSidebar } from "@/components/admin/admin-sidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  const session = verifySessionToken(token);

  if (!session) {
    redirect("/admin/login");
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      <AdminSidebar session={session} />
      <div className="flex-1 bg-[#070707] p-6 sm:p-8">{children}</div>
    </div>
  );
}
