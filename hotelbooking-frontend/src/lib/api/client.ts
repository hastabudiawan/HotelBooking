import "server-only";

export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

// Backend mengembalikan ProblemDetails: { title, detail, status }.
async function readErrorMessage(response: Response): Promise<string> {
  try {
    const data = await response.json();
    if (typeof data === "string") return data;
    if (data?.detail) return String(data.detail);
    if (data?.title) return String(data.title);
    if (data?.errors) {
      const first = Object.values(data.errors).flat()[0];
      if (first) return String(first);
    }
  } catch {
    // Body bukan JSON: pakai pesan bawaan di bawah.
  }
  return `Request failed with status ${response.status}`;
}

type GetOptions = {
  // Detik data boleh dipakai ulang dari cache. Kosong berarti selalu ambil baru.
  revalidate?: number;
};

export async function apiGet<T>(path: string, options: GetOptions = {}): Promise<T> {
  const baseUrl = process.env.API_URL;
  if (!baseUrl) {
    throw new Error("API_URL belum diatur. Isi di .env.local lalu restart npm run dev.");
  }

  const response = await fetch(`${baseUrl}${path}`, {
    headers: { Accept: "application/json" },
    ...(options.revalidate === undefined
      ? { cache: "no-store" as const }
      : { next: { revalidate: options.revalidate } }),
  });

  if (!response.ok) {
    throw new ApiError(response.status, await readErrorMessage(response));
  }

  return (await response.json()) as T;
}