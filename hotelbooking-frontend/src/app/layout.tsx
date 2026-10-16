import type { Metadata } from "next";
import { Dancing_Script, Mulish, Raleway } from "next/font/google";
import "./globals.css";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { site } from "@/lib/site";

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
  title: {
    default: `${site.name} | ${site.tagline}`,
    template: `%s | ${site.name}`,
  },
  description: site.description,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${mulish.variable} ${raleway.variable} ${dancing.variable}`}
    >
      <body className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}