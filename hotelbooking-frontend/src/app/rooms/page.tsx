import type { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { PageHero } from "@/components/layout/PageHero";

export const metadata: Metadata = { title: "Rooms and Suites" };

export default function RoomsPage() {
  return (
    <>
      <PageHero
        title="Rooms and Suites"
        subtitle="Choose the room that fits your stay."
      />
      <Container className="py-16 text-muted">
        The room list is built in the next part.
      </Container>
    </>
  );
}