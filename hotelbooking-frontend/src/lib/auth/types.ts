// Respons dari POST /api/auth/login dan /api/auth/register
export type AuthResponse = {
  token: string;
  expiresAtUtc: string;
  userId: number;
  fullName: string;
  email: string;
  roles: string[];
};

export type SessionUser = {
  id: number;
  name: string;
  email: string;
  roles: string[];
};

export type Session = {
  token: string;
  user: SessionUser;
};

// Nama peran, sama dengan AppRoles di backend.
export const ROLES = {
  guest: "Guest",
  receptionist: "Receptionist",
  admin: "Admin",
} as const;

// State yang dikembalikan Server Action ke form.
export type FormState = {
  error?: string;
  // Nilai yang diketik, supaya tidak hilang saat ada error (password tidak pernah dikirim balik).
  values?: { fullName?: string; email?: string };
};