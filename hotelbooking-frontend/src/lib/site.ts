export type NavItem = { label: string; href: string };

export const site = {
  name: "Paradise View",
  tagline: "Hotel for every moment rich in emotion",
  description:
    "Comfortable rooms, a pool, a gym and a restaurant. Search availability and book your stay at Paradise View online.",
  footerText:
    "Paradise View offers comfortable rooms and relaxing facilities. Book online and manage your reservation anytime.",
  copyrightYear: 2026,

  // Ubah ke "/logo-pv.svg" kalau kamu punya versi SVG
  logo: "/logo-pv.png",

  nav: [
    { label: "Home", href: "/" },
    { label: "Explore", href: "/explore" },
    { label: "Rooms", href: "/rooms" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
  ] as NavItem[],

  footerLinks: [
    { label: "Rooms", href: "/rooms" },
    { label: "Explore", href: "/explore" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
  ] as NavItem[],

  // Isi dengan tautan sosial yang asli, misalnya:
  // { label: "Instagram", href: "https://instagram.com/akunmu" }
  // Kalau kosong, kolom "Social media" di footer tidak ditampilkan.
  socials: [] as NavItem[],

  // Isi dengan data kamu. Kolom yang dibiarkan kosong ("") tidak ditampilkan.
  contact: {
    address: "Street 123, City, Country",
    phone: "+62 123 4567",
    email: "info@paradiseview.com",
    hours: "Front desk open 24 hours",
  },
};
