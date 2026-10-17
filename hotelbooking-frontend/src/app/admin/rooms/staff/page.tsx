import type { Metadata } from "next";
import { StaffForm } from "@/components/admin/StaffForm";
import { ADMIN_ROLES, requireRole } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Staff" };

export default async function AdminStaffPage() {
  await requireRole(ADMIN_ROLES, "/admin/staff");

  return (
    <>
      <h2 className="text-xl font-semibold">Create receptionist</h2>
      <p className="mt-2 max-w-xl text-sm text-muted">
        The new account can sign in and use the front desk. Share the temporary password
        privately. Listing, editing, and removing staff accounts is not available yet.
      </p>
      <div className="mt-6">
        <StaffForm />
      </div>
    </>
  );
}