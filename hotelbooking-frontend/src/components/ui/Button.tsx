import Link from "next/link";
import { cn } from "@/lib/utils";

const base =
  "inline-flex items-center justify-center rounded-md px-6 py-3 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-not-allowed disabled:opacity-60";

const variants = {
  primary: "bg-brand text-white hover:bg-brand-dark",
  outline: "border border-brand text-brand hover:bg-brand-soft",
  light: "bg-white text-brand hover:bg-brand-soft",
};

type Variant = keyof typeof variants;

export function buttonClass(variant: Variant = "primary", className?: string) {
  return cn(base, variants[variant], className);
}

export function ButtonLink({
  variant = "primary",
  className,
  ...props
}: React.ComponentProps<typeof Link> & { variant?: Variant }) {
  return <Link className={buttonClass(variant, className)} {...props} />;
}

export function Button({
  variant = "primary",
  className,
  ...props
}: React.ComponentProps<"button"> & { variant?: Variant }) {
  return <button className={buttonClass(variant, className)} {...props} />;
}