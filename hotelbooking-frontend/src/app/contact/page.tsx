import type { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { PageHero } from "@/components/layout/PageHero";

export const metadata: Metadata = { title: "Contact us" };

export default function ContactPage() {
  return (
    <>
      <PageHero
        title="Contact us"
        subtitle="We would love to hear from you."
      />
      <Container className="py-16 text-muted">
        This page is built in a later part.
      </Container>
    </>
  );
}