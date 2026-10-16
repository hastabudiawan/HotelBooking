// Hanya jalur di dalam situs ini yang diterima ("/rooms", bukan "//evil.com" atau "https://...").
export function safeNext(value: string | string[] | undefined, fallback = "/") {
  const candidate = Array.isArray(value) ? value[0] : value;
  if (!candidate) return fallback;
  if (!candidate.startsWith("/") || candidate.startsWith("//")) return fallback;
  if (candidate.includes("\\")) return fallback;
  return candidate;
}