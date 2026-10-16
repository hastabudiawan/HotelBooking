import { Container } from "@/components/layout/Container";
import { ButtonLink } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <Container className="flex flex-col items-center py-24 text-center">
      <p className="font-script text-5xl text-brand">404</p>
      <h1 className="mt-2 text-3xl font-bold">Page not found</h1>
      <p className="mt-3 max-w-md text-muted">
        The page you are looking for does not exist or has been moved.
      </p>
      <ButtonLink href="/" className="mt-8">
        Back to home
      </ButtonLink>
    </Container>
  );
}