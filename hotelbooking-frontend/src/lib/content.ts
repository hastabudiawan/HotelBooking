import { BedDouble, Dumbbell, Utensils, Waves, type LucideIcon } from "lucide-react";

export type Highlight = {
  id: string;
  title: string;
  text: string;
  Icon: LucideIcon;
  // Aktifkan kalau fotonya sudah ada di public/images/explore/
  image?: string;
  link?: { href: string; label: string };
};

export const exploreHighlights: Highlight[] = [
  {
    id: "pool",
    title: "Swimming pool",
    text: "Start the morning with a quiet swim or spend the afternoon on a lounger. The pool is open every day and is surrounded by greenery.",
    Icon: Waves,
    // image: "/images/explore/pool.jpg",
  },
  {
    id: "restaurant",
    title: "Restaurant",
    text: "Our kitchen prepares breakfast, lunch, and dinner with fresh ingredients, from local favorites to familiar classics.",
    Icon: Utensils,
    // image: "/images/explore/restaurant.jpg",
  },
  {
    id: "gym",
    title: "Gym",
    text: "A well-equipped gym for your daily routine, open from early morning until late evening, free for all guests.",
    Icon: Dumbbell,
    // image: "/images/explore/gym.jpg",
  },
  {
    id: "rooms",
    title: "Rooms and suites",
    text: "Comfortable rooms for every kind of stay, from a simple weekend to a longer holiday with the family.",
    Icon: BedDouble,
    // image: "/images/explore/rooms.jpg",
    link: { href: "/rooms", label: "See all rooms" },
  },
];

export const aboutValues = [
  {
    title: "Comfort first",
    text: "Clean rooms, good beds, and quiet nights. Everything else is built on top of that.",
  },
  {
    title: "Warm service",
    text: "Our team greets every guest as a person, not a booking number.",
  },
  {
    title: "Simple booking",
    text: "Search dates, see the price, and book online in a few minutes, with no hidden steps.",
  },
];

export const aboutStory = [
  "Paradise View started with a simple idea: a hotel where every stay feels personal. Not a place you pass through, but a place you remember.",
  "From the first message to the last goodbye, we want each moment of your stay to feel unhurried and well cared for, whether you are here for a weekend, a business trip, or a family holiday.",
];