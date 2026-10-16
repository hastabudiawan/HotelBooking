"use client";

import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/Button";

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <Container className="flex flex-col items-center py-24 text-center">
      <h1 className="text-3xl font-bold">Something went wrong</h1>
      <p className="mt-3 max-w-md text-muted">
        We could not load this page. Please try again in a moment.
      </p>
      <Button onClick={() => reset()} className="mt-8">
        Try again
      </Button>
    </Container>
  );
}