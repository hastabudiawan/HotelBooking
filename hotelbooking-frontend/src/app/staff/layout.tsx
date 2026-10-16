import type { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { StaffNav } from "@/components/staff/StaffNav";
import { STAFF_ROLES, requireRole } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: { default: "Front desk", template: "%s | Front desk" },
  robots: { index: false },
};

export default async function StaffLayout({ children }: { children: React.ReactNode }) {
  await requireRole(STAFF_ROLES, "/staff");

  return (
    <Container className="py-10 md:py-14">
      <h1 className="text-3xl font-bold">Front desk</h1>
      <div className="mt-5">
        <StaffNav />
      </div>
      <div className="mt-8">{children}</div>
    </Container>
  );
}