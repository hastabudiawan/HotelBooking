import Link from "next/link";
import { site } from "@/lib/site";
import { Container } from "./Container";

export function Footer() {
  return (
    <footer className="bg-brand text-white">
      <Container className="grid gap-10 py-14 md:grid-cols-[2fr_1fr_1fr]">
        <div>
          <p className="font-script text-3xl">{site.name}</p>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/85">
            {site.footerText}
          </p>
        </div>

        <div>
          <h2 className="text-sm font-semibold">Quick links</h2>
          <ul className="mt-4 space-y-2 text-sm text-white/85">
            {site.footerLinks.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="hover:text-white hover:underline">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {site.socials.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold">Social media</h2>
            <ul className="mt-4 space-y-2 text-sm text-white/85">
              {site.socials.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white hover:underline"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </Container>

      <div className="border-t border-white/15">
        <Container className="py-6 text-center text-sm text-white/85">
          {site.name} © {site.copyrightYear}
        </Container>
      </div>
    </footer>
  );
}