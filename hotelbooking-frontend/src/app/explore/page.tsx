import type { Metadata } from "next";
import { PageHero } from "@/components/layout/PageHero";
import { MediaSection } from "@/components/sections/MediaSection";
import { exploreHighlights } from "@/lib/content";

export const metadata: Metadata = {
  title: "Explore",
  description:
    "Take a look around Paradise View: the swimming pool, restaurant, gym, and our rooms.",
};

export default function ExplorePage() {
  return (
    <>
      <PageHero
        title="Explore"
        subtitle="Take a look around the rooms and facilities."
        // image="/images/hero-explore.jpg"
      />

      <div className="py-6 md:py-10">
        {exploreHighlights.map((item, index) => (
          <MediaSection
            key={item.id}
            id={item.id}
            title={item.title}
            text={item.text}
            Icon={item.Icon}
            image={item.image}
            link={item.link}
            reverse={index % 2 === 1}
          />
        ))}
      </div>
    </>
  );
}