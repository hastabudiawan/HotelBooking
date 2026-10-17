export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Aturan sama dengan backend: minimal 8 karakter, ada huruf besar, huruf kecil, dan angka.
export function passwordProblem(password: string) {
  if (password.length < 8) return "Password must be at least 8 characters.";
  if (!/[a-z]/.test(password)) return "Password must contain a lowercase letter.";
  if (!/[A-Z]/.test(password)) return "Password must contain an uppercase letter.";
  if (!/\d/.test(password)) return "Password must contain a number.";
  return null;
}