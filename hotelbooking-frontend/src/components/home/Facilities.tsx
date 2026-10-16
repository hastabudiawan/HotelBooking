import { Dumbbell, Utensils, Waves, Wifi, type LucideIcon } from "lucide-react";
import { Container } from "@/components/layout/Container";

const facilities: { title: string; text: string; Icon: LucideIcon }[] = [
  {
    title: "Swimming pool",
    text: "Swim in the open-air pool, with loungers and a view of the garden.",
    Icon: Waves,
  },
  {
    title: "Restaurant",
    text: "Breakfast, lunch, and dinner prepared fresh every day.",
    Icon: Utensils,
  },
  {
    title: "Gym",
    text: "A fully equipped gym open from early morning until late evening.",
    Icon: Dumbbell,
  },
  {
    title: "Free wifi",
    text: "Fast internet in every room and public area, at no extra charge.",
    Icon: Wifi,
  },
];

export function Facilities() {
  return (
    <section className="bg-brand-soft py-16 md:py-20">
      <Container>
        <div className="mx-auto max-w-xl text-center">
          <h2 className="text-3xl font-bold md:text-4xl">Facilities</h2>
          <p className="mt-3 text-muted">
            Everything you need for a comfortable stay, all in one place.
          </p>
        </div>

        <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {facilities.map(({ title, text, Icon }) => (
            <li key={title} className="rounded-lg bg-white p-6 text-center">
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-soft text-brand">
                <Icon size={26} aria-hidden />
              </span>
              <h3 className="mt-4 text-lg font-semibold">{title}</h3>
              <p className="mt-2 text-sm text-muted">{text}</p>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}