import { Container } from "@/components/layout/Container";

export function AuthCard({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <Container className="flex justify-center py-12 md:py-20">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-[0_4px_20px_rgba(0,0,0,0.08)] sm:p-8">
        <h1 className="text-2xl font-bold md:text-3xl">{title}</h1>
        {subtitle && <p className="mt-2 text-sm text-muted">{subtitle}</p>}
        <div className="mt-6">{children}</div>
        {footer && <div className="mt-6 text-center text-sm text-muted">{footer}</div>}
      </div>
    </Container>
  );
}