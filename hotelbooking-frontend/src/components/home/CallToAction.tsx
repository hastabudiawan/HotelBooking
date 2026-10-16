import { Container } from "@/components/layout/Container";
import { ButtonLink } from "@/components/ui/Button";
import { site } from "@/lib/site";

export function CallToAction() {
  return (
    <section className="bg-brand py-16 text-center text-white md:py-20">
      <Container>
        <h2 className="mx-auto max-w-2xl text-3xl font-bold md:text-4xl">
          Ready for your stay at {site.name}?
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-white/90">
          Pick your dates and book your room in a few minutes.
        </p>
        <div className="mt-8">
          <ButtonLink href="/rooms" variant="light">
            Book now
          </ButtonLink>
        </div>
      </Container>
    </section>
  );
}