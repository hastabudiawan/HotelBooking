import type { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { PageHero } from "@/components/layout/PageHero";

export const metadata: Metadata = { title: "About us" };

export default function AboutPage() {
  return (
    <>
      <PageHero
        title="About us"
        subtitle="The story and the people behind Paradise View."
      />
      <Container className="py-16 text-muted">
        This page is built in a later part.
      </Container>
    </>
  );
}