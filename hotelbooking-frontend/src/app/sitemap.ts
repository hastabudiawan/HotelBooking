import type { MetadataRoute } from "next";
import { getRoomTypes } from "@/lib/api/rooms";
import { getSiteUrl } from "@/lib/site-url";

// Dibuat ulang paling cepat sekali per jam.
export const revalidate = 3600;

const staticPaths = ["", "/rooms", "/explore", "/about", "/contact"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();

  const entries: MetadataRoute.Sitemap = staticPaths.map((path) => ({
    url: `${base}${path}`,
    changeFrequency: "weekly",
    priority: path === "" ? 1 : 0.7,
  }));

  try {
    const roomTypes = await getRoomTypes();
    for (const room of roomTypes) {
      entries.push({
        url: `${base}/rooms/${room.slug}`,
        changeFrequency: "weekly",
        priority: 0.8,
      });
    }
  } catch {
    // Backend tidak terjangkau: lanjut tanpa halaman kamar.
  }

  return entries;
}