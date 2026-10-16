import type { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { PageHero } from "@/components/layout/PageHero";

export const metadata: Metadata = { title: "Explore" };

export default function ExplorePage() {
  return (
    <>
      <PageHero
        title="Explore"
        subtitle="Take a look around the rooms and facilities."
      />
      <Container className="py-16 text-muted">
        This page is built in a later part.
      </Container>
    </>
  );
}