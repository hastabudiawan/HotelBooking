import { Container } from "@/components/layout/Container";
import { PageHero } from "@/components/layout/PageHero";

export default function RoomsLoading() {
  return (
    <>
      <PageHero
        title="Rooms and Suites"
        subtitle="Choose the room that fits your stay."
      />
      <Container className="py-12 md:py-16">
        <div
          className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3"
          aria-busy="true"
          aria-label="Loading rooms"
        >
          {[0, 1, 2].map((item) => (
            <div
              key={item}
              className="animate-pulse overflow-hidden rounded-lg bg-white shadow-[0_4px_20px_rgba(0,0,0,0.08)]"
            >
              <div className="aspect-3/2 bg-surface" />
              <div className="space-y-3 p-4">
                <div className="h-5 w-1/2 rounded bg-surface" />
                <div className="h-5 w-1/3 rounded bg-surface" />
                <div className="h-10 rounded bg-surface" />
              </div>
            </div>
          ))}
        </div>
      </Container>
    </>
  );
}