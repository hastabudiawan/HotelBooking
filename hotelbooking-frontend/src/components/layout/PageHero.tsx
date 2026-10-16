import Image from "next/image";
import { Container } from "./Container";

type PageHeroProps = {
  title: string;
  subtitle?: string;
  image?: string;
};

export function PageHero({ title, subtitle, image }: PageHeroProps) {
  return (
    <section className="relative isolate flex min-h-80 items-center justify-center overflow-hidden bg-brand-dark text-center text-white md:min-h-[420px]">
      {image && (
        <Image
          src={image}
          alt=""
          fill
          priority
          sizes="100vw"
          className="-z-10 object-cover"
        />
      )}
      <div aria-hidden className="absolute inset-0 -z-10 bg-brand-dark/60" />

      <Container className="py-16">
        <h1 className="text-4xl font-bold md:text-5xl">{title}</h1>
        {subtitle && (
          <p className="mx-auto mt-5 max-w-xl text-base text-white/90 md:text-lg">
            {subtitle}
          </p>
        )}
      </Container>
    </section>
  );
}