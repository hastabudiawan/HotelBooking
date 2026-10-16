import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthCard } from "@/components/auth/AuthCard";
import { LoginForm } from "@/components/auth/LoginForm";
import { safeNext } from "@/lib/auth/redirect";
import { getSession } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; reauth?: string }>;
}) {
  const params = await searchParams;
  const next = safeNext(params.next);
  if (!params.reauth && (await getSession())) redirect(next);

  const registerHref =
    next === "/" ? "/register" : `/register?next=${encodeURIComponent(next)}`;
  return (
    <AuthCard
      title="Sign in"
      subtitle={
        params.reauth
          ? "Your session has ended. Please sign in again."
          : "Welcome back. Sign in to book and manage your stay."
      }
      footer={
        <>
          New to Paradise View?{" "}
          <Link
            href={registerHref}
            className="font-semibold text-brand hover:underline"
          >
            Create an account
          </Link>
        </>
      }
    >
      <LoginForm next={next} />
    </AuthCard>
  );
}
