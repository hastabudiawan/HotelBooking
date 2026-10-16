"use server";

import { redirect } from "next/navigation";
import { ApiError, apiPost } from "@/lib/api/client";
import { safeNext } from "./redirect";
import { clearSession, setSession } from "./session";
import type { AuthResponse, FormState } from "./types";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Aturan sama dengan backend: minimal 8 karakter, ada huruf besar, huruf kecil, dan angka.
function passwordProblem(password: string) {
  if (password.length < 8) return "Password must be at least 8 characters.";
  if (!/[a-z]/.test(password)) return "Password must contain a lowercase letter.";
  if (!/[A-Z]/.test(password)) return "Password must contain an uppercase letter.";
  if (!/\d/.test(password)) return "Password must contain a number.";
  return null;
}

function text(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

// Error dari backend ditampilkan apa adanya. Backend yang mati diubah jadi pesan ramah.
function messageFrom(error: unknown) {
  if (error instanceof ApiError) return error.message;
  return "We could not reach the server. Please try again in a moment.";
}

export async function loginAction(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const email = text(formData, "email").trim();
  const password = text(formData, "password");
  const next = safeNext(text(formData, "next"));

  if (!EMAIL_PATTERN.test(email) || password === "") {
    return { error: "Enter your email and password.", values: { email } };
  }

  let auth: AuthResponse;
  try {
    auth = await apiPost<AuthResponse>("/api/auth/login", { email, password });
  } catch (error) {
    return { error: messageFrom(error), values: { email } };
  }

  await setSession(auth);
  redirect(next); // redirect() melempar sinyal khusus, jadi harus di luar try/catch
}

export async function registerAction(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const fullName = text(formData, "fullName").trim();
  const email = text(formData, "email").trim();
  const password = text(formData, "password");
  const confirmPassword = text(formData, "confirmPassword");
  const next = safeNext(text(formData, "next"));
  const values = { fullName, email };

  if (fullName === "") return { error: "Enter your full name.", values };
  if (!EMAIL_PATTERN.test(email)) return { error: "Enter a valid email address.", values };

  const problem = passwordProblem(password);
  if (problem) return { error: problem, values };
  if (password !== confirmPassword) return { error: "Passwords do not match.", values };

  let auth: AuthResponse;
  try {
    auth = await apiPost<AuthResponse>("/api/auth/register", {
      fullName,
      email,
      password,
    });
  } catch (error) {
    return { error: messageFrom(error), values };
  }

  await setSession(auth);
  redirect(next);
}

export async function logoutAction() {
  await clearSession();
  redirect("/");
}