import type { LucideIcon } from "lucide-react";
import Image from "next/image";
import { Container } from "@/components/layout/Container";
import { ButtonLink } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

type MediaSectionProps = {
  id?: string;
  title: string;
  text: string;
  Icon: LucideIcon;
  image?: string;
  reverse?: boolean;
  link?: { href: string; label: string };
};

export function MediaSection({
  id,
  title,
  text,
  Icon,
  image,
  reverse = false,
  link,
}: MediaSectionProps) {
  return (
    <section id={id} className="py-10 md:py-14">
      <Container
        className={cn(
          "grid items-center gap-8 md:grid-cols-2 md:gap-14",
          reverse && "md:[&>*:first-child]:order-2",
        )}
      >
        <div className="relative aspect-4/3 overflow-hidden rounded-lg bg-surface">
          {image ? (
            <Image
              src={image}
              alt={title}
              fill
              sizes="(min-width: 768px) 560px, 100vw"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-line">
              <Icon size={72} aria-hidden />
            </div>
          )}
        </div>

        <div>
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-soft text-brand">
            <Icon size={22} aria-hidden />
          </span>
          <h2 className="mt-4 text-2xl font-bold md:text-3xl">{title}</h2>
          <p className="mt-3 leading-relaxed text-muted">{text}</p>
          {link && (
            <div className="mt-6">
              <ButtonLink href={link.href} variant="outline">
                {link.label}
              </ButtonLink>
            </div>
          )}
        </div>
      </Container>
    </section>
  );
}