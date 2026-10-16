"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createBooking, cancelBooking, payBooking } from "@/lib/api/bookings";
import { errorMessage, redirectIfUnauthorized } from "@/lib/auth/guard";
import { safeNext } from "@/lib/auth/redirect";
import { getSession } from "@/lib/auth/session";
import type { FormState } from "@/lib/auth/types";
import { isIsoDate } from "@/lib/format";

function text(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

export async function createBookingAction(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const returnTo = safeNext(text(formData, "returnTo"), "/rooms");

  const session = await getSession();
  if (!session) redirect(`/login?next=${encodeURIComponent(returnTo)}`);

  const roomTypeId = Number(text(formData, "roomTypeId"));
  const checkIn = text(formData, "checkIn");
  const checkOut = text(formData, "checkOut");
  const guestCount = Number(text(formData, "guestCount"));

  if (
    !Number.isInteger(roomTypeId) ||
    !Number.isInteger(guestCount) ||
    !isIsoDate(checkIn) ||
    !isIsoDate(checkOut)
  ) {
    return { error: "The booking details are not valid. Please go back and search again." };
  }

  let bookingId: number;
  try {
    const booking = await createBooking(session.token, {
      roomTypeId,
      checkIn,
      checkOut,
      guestCount,
    });
    bookingId = booking.id;
  } catch (error) {
    redirectIfUnauthorized(error, returnTo);
    return { error: errorMessage(error) };
  }

  redirect(`/account/bookings/${bookingId}`);
}

export async function payAction(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const bookingId = Number(text(formData, "bookingId"));
  if (!Number.isInteger(bookingId) || bookingId <= 0) {
    return { error: "Booking not found." };
  }
  const returnTo = `/account/bookings/${bookingId}`;

  const session = await getSession();
  if (!session) redirect(`/login?next=${encodeURIComponent(returnTo)}`);

  const method = text(formData, "method");
  if (method === "") return { error: "Choose a payment method." };

  const simulateFailure = formData.get("simulateFailure") === "on";

  let paid: boolean;
  try {
    const result = await payBooking(session.token, bookingId, { method, simulateFailure });
    paid = result.payment.status === "Paid";
  } catch (error) {
    redirectIfUnauthorized(error, returnTo);
    // Status booking mungkin sudah berubah (kedaluwarsa, dibatalkan): segarkan halamannya.
    revalidatePath(returnTo);
    return { error: errorMessage(error) };
  }

  revalidatePath(returnTo);
  if (!paid) {
    return {
      error: "The payment was declined. You can try again before the time runs out.",
    };
  }

  redirect(`${returnTo}?paid=1`);
}

export async function cancelAction(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const bookingId = Number(text(formData, "bookingId"));
  if (!Number.isInteger(bookingId) || bookingId <= 0) {
    return { error: "Booking not found." };
  }
  const returnTo = `/account/bookings/${bookingId}`;

  const session = await getSession();
  if (!session) redirect(`/login?next=${encodeURIComponent(returnTo)}`);

  try {
    await cancelBooking(session.token, bookingId);
  } catch (error) {
    redirectIfUnauthorized(error, returnTo);
    revalidatePath(returnTo);
    return { error: errorMessage(error) };
  }

  revalidatePath(returnTo);
  redirect(`${returnTo}?cancelled=1`);
}