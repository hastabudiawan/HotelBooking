import { Container } from "@/components/layout/Container";
import { RoomCard } from "@/components/rooms/RoomCard";
import { ButtonLink } from "@/components/ui/Button";
import { getRoomTypes } from "@/lib/api/rooms";

export async function FeaturedRooms() {
  const roomTypes = await getRoomTypes();
  const featured = roomTypes.slice(0, 3);

  return (
    <section className="py-16 md:py-20">
      <Container>
        <div className="mx-auto max-w-xl text-center">
          <h2 className="text-3xl font-bold md:text-4xl">Our rooms</h2>
          <p className="mt-3 text-muted">
            Choose from comfortable rooms and suites for every kind of stay.
          </p>
        </div>

        {featured.length > 0 && (
          <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((item) => (
              <RoomCard
                key={item.slug}
                room={{
                  slug: item.slug,
                  name: item.name,
                  capacity: item.capacity,
                  pricePerNight: item.basePrice,
                  imageUrl: item.imageUrl,
                }}
              />
            ))}
          </div>
        )}

        <div className="mt-10 text-center">
          <ButtonLink href="/rooms" variant="outline">
            View all rooms
          </ButtonLink>
        </div>
      </Container>
    </section>
  );
}