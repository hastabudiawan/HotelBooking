// Batas kolom ImageUrl di backend.
export const MAX_IMAGE_URL_LENGTH = 500;

// https penuh, atau jalur dalam situs yang diawali satu "/".
export function isValidImageUrl(value: string): boolean {
  if (value.length === 0 || value.length > MAX_IMAGE_URL_LENGTH) return false;

  if (value.startsWith("/")) {
    return !value.startsWith("//") && !value.includes("\\");
  }

  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

// Alamat dari situs lain (dimuat tanpa optimasi Next.js).
export function isRemoteImage(src: string): boolean {
  return src.startsWith("https://");
}