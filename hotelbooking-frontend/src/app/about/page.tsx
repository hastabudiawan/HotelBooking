import type { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { PageHero } from "@/components/layout/PageHero";
import { ButtonLink } from "@/components/ui/Button";
import { aboutStory, aboutValues } from "@/lib/content";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "About us",
  description: `The story and the values behind ${site.name}.`,
};

export default function AboutPage() {
  return (
    <>
      <PageHero
        title="About us"
        subtitle="The story and the people behind Paradise View."
        // image="/images/hero-about.jpg"
      />

      <Container className="py-14 md:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <p className="font-script text-3xl text-brand">{site.name}</p>
          <h2 className="mt-2 text-3xl font-bold md:text-4xl">Our story</h2>
          <div className="mt-6 space-y-4 leading-relaxed text-muted">
            {aboutStory.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </div>
      </Container>

      <section className="bg-brand-soft py-14 md:py-20">
        <Container>
          <h2 className="text-center text-3xl font-bold">What we care about</h2>
          <ul className="mt-10 grid gap-6 md:grid-cols-3">
            {aboutValues.map((value) => (
              <li key={value.title} className="rounded-lg bg-white p-6">
                <h3 className="text-lg font-semibold text-brand-dark">{value.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{value.text}</p>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <Container className="py-14 text-center md:py-20">
        <h2 className="text-2xl font-bold md:text-3xl">Come and stay with us</h2>
        <div className="mt-6">
          <ButtonLink href="/rooms">See our rooms</ButtonLink>
        </div>
      </Container>
    </>
  );
}