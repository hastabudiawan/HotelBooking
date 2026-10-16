import { Container } from "@/components/layout/Container";
import { ButtonLink } from "@/components/ui/Button";
import { site } from "@/lib/site";

export default function HomePage() {
  return (
    <Container className="py-20">
      <p className="font-script text-4xl text-brand">{site.name}</p>
      <h1 className="mt-4 max-w-md text-4xl font-bold leading-tight md:text-5xl">
        {site.tagline}
      </h1>
      <p className="mt-4 text-sm text-muted">
        Every moment feels like the first time at {site.name}.
      </p>
      <div className="mt-8 flex flex-wrap gap-4">
        <ButtonLink href="/rooms">Book now</ButtonLink>
        <ButtonLink href="/explore" variant="outline">
          Explore
        </ButtonLink>
      </div>
    </Container>
  );
}