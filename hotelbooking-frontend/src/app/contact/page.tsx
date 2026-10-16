import { Clock, Mail, MapPin, Phone, type LucideIcon } from "lucide-react";
import type { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { PageHero } from "@/components/layout/PageHero";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact us",
  description: `Get in touch with ${site.name}: address, phone, and email.`,
};

type Item = { label: string; value: string; href?: string; Icon: LucideIcon };

export default function ContactPage() {
  const { address, phone, email, hours } = site.contact;

  const items: Item[] = [
    { label: "Address", value: address, Icon: MapPin },
    {
      label: "Phone",
      value: phone,
      href: phone ? `tel:${phone.replace(/[^\d+]/g, "")}` : undefined,
      Icon: Phone,
    },
    {
      label: "Email",
      value: email,
      href: email ? `mailto:${email}` : undefined,
      Icon: Mail,
    },
    { label: "Opening hours", value: hours, Icon: Clock },
  ].filter((item) => item.value.trim() !== "");

  return (
    <>
      <PageHero
        title="Contact us"
        subtitle="We are happy to help with your stay."
        // image="/images/hero-contact.jpg"
      />

      <Container className="py-14 md:py-20">
        {items.length === 0 ? (
          <p className="text-center text-muted">Contact details will be available soon.</p>
        ) : (
          <ul className="mx-auto grid max-w-3xl gap-6 sm:grid-cols-2">
            {items.map(({ label, value, href, Icon }) => (
              <li key={label} className="flex gap-4 rounded-lg bg-surface p-6">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-brand">
                  <Icon size={20} aria-hidden />
                </span>
                <div className="min-w-0">
                  <h2 className="text-sm font-semibold text-muted">{label}</h2>
                  {href ? (
                    <a
                      href={href}
                      className="mt-1 block wrap-break-word font-semibold hover:text-brand"
                    >
                      {value}
                    </a>
                  ) : (
                    <p className="mt-1 wrap-break-word font-semibold">{value}</p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </Container>
    </>
  );
}