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
// Validasi otomatis mengembalikan { title, errors: { Field: [pesan] } }.
async function readErrorMessage(response: Response): Promise<string> {
  try {
    const data = await response.json();
    if (typeof data === "string") return data;
    if (data?.detail) return String(data.detail);
    if (data?.errors) {
      const first = Object.values(data.errors).flat()[0];
      if (first) return String(first);
    }
    if (data?.title) return String(data.title);
  } catch {
    // Body bukan JSON: pakai pesan bawaan di bawah.
  }
  return `Request failed with status ${response.status}`;
}

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  // JWT pengguna. Kalau ada, dikirim sebagai header Authorization.
  token?: string;
  // Detik data GET boleh dipakai ulang dari cache. Diabaikan kalau ada token
  // (data pribadi tidak boleh di-cache bersama).
  revalidate?: number;
};

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const baseUrl = process.env.API_URL;
  if (!baseUrl) {
    throw new Error("API_URL belum diatur. Isi di .env.local lalu restart npm run dev.");
  }

  const { method = "GET", body, token, revalidate } = options;

  const headers: Record<string, string> = { Accept: "application/json" };
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (token) headers.Authorization = `Bearer ${token}`;

  const cacheable = method === "GET" && !token && revalidate !== undefined;

  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
    ...(cacheable
      ? { next: { revalidate } }
      : { cache: "no-store" as const }),
  });

  if (!response.ok) {
    throw new ApiError(response.status, await readErrorMessage(response));
  }

  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

type ReadOptions = Pick<RequestOptions, "token" | "revalidate">;

export function apiGet<T>(path: string, options: ReadOptions = {}) {
  return apiRequest<T>(path, { ...options, method: "GET" });
}

export function apiPost<T>(
  path: string,
  body?: unknown,
  options: Pick<RequestOptions, "token"> = {},
) {
  return apiRequest<T>(path, { ...options, method: "POST", body });
}