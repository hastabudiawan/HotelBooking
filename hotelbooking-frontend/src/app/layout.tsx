import type { Metadata } from "next";
import { Dancing_Script, Mulish, Raleway } from "next/font/google";
import "./globals.css";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { site } from "@/lib/site";
import { getSiteUrl } from "@/lib/site-url";
import { getSession } from "@/lib/auth/session";
import { ROLES } from "@/lib/auth/types";
// import { ROLES } from "@/lib/auth/types";

const mulish = Mulish({
  subsets: ["latin"],
  variable: "--font-mulish",
  display: "swap",
});

const raleway = Raleway({
  subsets: ["latin"],
  variable: "--font-raleway",
  display: "swap",
});

const dancing = Dancing_Script({
  subsets: ["latin"],
  variable: "--font-dancing",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: `${site.name} | ${site.tagline}`,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  openGraph: {
    type: "website",
    siteName: site.name,
    title: `${site.name} | ${site.tagline}`,
    description: site.description,
    images: [{ url: "/images/hero-home.jpg" }],
  },
  twitter: { card: "summary_large_image" },
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await getSession();

  return (
    <html
      lang="en"
      className={`${mulish.variable} ${raleway.variable} ${dancing.variable}`}
    >
      <body className="flex min-h-screen flex-col">
        <Navbar
          user={
            session
              ? {
                  name: session.user.name,
                  isGuest: session.user.roles.includes(ROLES.guest),
                  isStaff: session.user.roles.some(
                    (role) =>
                      role === ROLES.receptionist || role === ROLES.admin,
                  ),
                  isAdmin: session.user.roles.includes(ROLES.admin),
                }
              : null
          }
        />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
