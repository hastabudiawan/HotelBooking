import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthCard } from "@/components/auth/AuthCard";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { safeNext } from "@/lib/auth/redirect";
import { getSession } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Create account",
  robots: { index: false },
};

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const next = safeNext((await searchParams).next);
  if (await getSession()) redirect(next);

  const loginHref =
    next === "/" ? "/login" : `/login?next=${encodeURIComponent(next)}`;

  return (
    <AuthCard
      title="Create account"
      subtitle="Create a free account to book rooms and see your reservations."
      footer={
        <>
          Already have an account?{" "}
          <Link href={loginHref} className="font-semibold text-brand hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <RegisterForm next={next} />
    </AuthCard>
  );
}