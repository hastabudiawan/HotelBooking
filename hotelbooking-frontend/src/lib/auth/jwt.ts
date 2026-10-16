export type JwtPayload = {
  sub?: string;
  email?: string;
  name?: string;
  // Satu peran dikirim sebagai teks, beberapa peran sebagai daftar.
  role?: string | string[];
  exp?: number;
};

// Hanya membaca isi token. TIDAK memverifikasi tanda tangan: itu tugas backend di setiap request.
export function decodeJwtPayload(token: string): JwtPayload | null {
  try {
    const part = token.split(".")[1];
    if (!part) return null;

    const base64 = part
      .replace(/-/g, "+")
      .replace(/_/g, "/")
      .padEnd(Math.ceil(part.length / 4) * 4, "=");

    const bytes = Uint8Array.from(atob(base64), (char) => char.charCodeAt(0));
    return JSON.parse(new TextDecoder().decode(bytes)) as JwtPayload;
  } catch {
    return null;
  }
}

export function isExpired(payload: JwtPayload, skewSeconds = 10) {
  if (typeof payload.exp !== "number") return true;
  return payload.exp * 1000 <= Date.now() + skewSeconds * 1000;
}

export function rolesOf(payload: JwtPayload): string[] {
  if (!payload.role) return [];
  return Array.isArray(payload.role) ? payload.role : [payload.role];
}