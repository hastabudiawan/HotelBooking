import type { Metadata } from "next";
import Image from "next/image";
import { CallToAction } from "@/components/home/CallToAction";
import { Facilities } from "@/components/home/Facilities";
import { FeaturedRooms } from "@/components/home/FeaturedRooms";
import { SearchBox } from "@/components/home/SearchBox";
import { Container } from "@/components/layout/Container";
import { ButtonLink } from "@/components/ui/Button";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: { absolute: `${site.name} | ${site.tagline}` },
  description: `Book a room at ${site.name}. ${site.tagline}.`,
};

export default function HomePage() {
  return (
    <>
      <section className="relative isolate flex min-h-[480px] items-center overflow-hidden bg-brand-dark text-white md:min-h-[600px]">
        <Image
          src="/images/hero-home.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="-z-10 object-cover"
        />
        <div aria-hidden className="absolute inset-0 -z-10 bg-black/45" />

        <Container className="pt-16 pb-28">
          <p className="font-script text-4xl text-white md:text-5xl">{site.name}</p>
          <h1 className="mt-4 max-w-xl text-4xl font-bold leading-tight md:text-6xl">
            {site.tagline}
          </h1>
          <p className="mt-4 max-w-md text-white/90">
            Every moment feels like the first time at {site.name}.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <ButtonLink href="/rooms" variant="light">
              Book now
            </ButtonLink>
            <ButtonLink
              href="/explore"
              variant="outline"
              className="border-white text-white hover:bg-white/10"
            >
              Explore
            </ButtonLink>
          </div>
        </Container>
      </section>

      <Container className="relative z-10 -mt-14">
        <SearchBox />
      </Container>

      <FeaturedRooms />
      <Facilities />
      <CallToAction />
    </>
  );
}