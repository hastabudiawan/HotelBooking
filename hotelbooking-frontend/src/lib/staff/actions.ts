"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { RoomStatus } from "@/lib/api/types";
import {
  checkInBooking,
  checkOutBooking,
  markNoShow,
  updateRoomStatus,
} from "@/lib/api/staff";
import { errorMessage, redirectIfUnauthorized } from "@/lib/auth/guard";
import { STAFF_ROLES, getSession } from "@/lib/auth/session";
import type { FormState } from "@/lib/auth/types";

const EDITABLE_ROOM_STATUSES: RoomStatus[] = ["Available", "Cleaning", "Maintenance"];

function text(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

// Membaca sesi dan memastikan penggunanya staf.
async function staffToken() {
  const session = await getSession();
  if (!session) redirect("/login?next=%2Fstaff");
  if (!session.user.roles.some((role) => STAFF_ROLES.includes(role))) {
    throw new Error("Not allowed");
  }
  return session.token;
}

async function runBookingAction(
  formData: FormData,
  call: (token: string, id: number) => Promise<unknown>,
): Promise<FormState> {
  const token = await staffToken();

  const id = Number(text(formData, "bookingId"));
  if (!Number.isInteger(id) || id <= 0) return { error: "Booking not found." };

  try {
    await call(token, id);
  } catch (error) {
    redirectIfUnauthorized(error, "/staff");
    // Data mungkin sudah berubah (diproses staf lain): segarkan tampilan.
    revalidatePath("/staff", "layout");
    return { error: errorMessage(error) };
  }

  revalidatePath("/staff", "layout");
  return {};
}

export async function checkInAction(_previous: FormState, formData: FormData) {
  return runBookingAction(formData, checkInBooking);
}

export async function checkOutAction(_previous: FormState, formData: FormData) {
  return runBookingAction(formData, checkOutBooking);
}

export async function noShowAction(_previous: FormState, formData: FormData) {
  return runBookingAction(formData, markNoShow);
}

export async function updateRoomStatusAction(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const token = await staffToken();

  const roomId = Number(text(formData, "roomId"));
  const status = text(formData, "status") as RoomStatus;

  if (!Number.isInteger(roomId) || roomId <= 0) return { error: "Room not found." };
  if (!EDITABLE_ROOM_STATUSES.includes(status)) return { error: "Choose a valid status." };

  try {
    await updateRoomStatus(token, roomId, status);
  } catch (error) {
    redirectIfUnauthorized(error, "/staff/rooms");
    revalidatePath("/staff", "layout");
    return { error: errorMessage(error) };
  }

  revalidatePath("/staff", "layout");
  return {};
}