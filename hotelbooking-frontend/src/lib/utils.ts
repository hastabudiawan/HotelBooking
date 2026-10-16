import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// Menggabungkan class secara kondisional dan membuang class Tailwind yang bentrok.
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}