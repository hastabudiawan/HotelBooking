import type { Metadata } from "next";
import { AdminNav } from "@/components/admin/AdminNav";
import { Container } from "@/components/layout/Container";
import { ADMIN_ROLES, requireRole } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s | Admin" },
  robots: { index: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireRole(ADMIN_ROLES, "/admin");

  return (
    <Container className="py-10 md:py-14">
      <h1 className="text-3xl font-bold">Admin</h1>
      <div className="mt-5">
        <AdminNav />
      </div>
      <div className="mt-8">{children}</div>
    </Container>
  );
}