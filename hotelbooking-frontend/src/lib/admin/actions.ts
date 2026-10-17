"use server";

import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import {
  createRoom,
  createRoomType,
  createStaff,
  deleteRoom,
  deleteRoomType,
  updateRoom,
  updateRoomType,
  type RoomTypeBody,
} from "@/lib/api/admin";
import { errorMessage, redirectIfUnauthorized } from "@/lib/auth/guard";
import { ADMIN_ROLES, getSession } from "@/lib/auth/session";
import type { FormState } from "@/lib/auth/types";
import { EMAIL_PATTERN, passwordProblem } from "@/lib/auth/validation";

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function text(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

// Fungsi di berkas "use server" bisa dipanggil dari luar, jadi peran selalu dicek di sini.
async function adminToken() {
  const session = await getSession();
  if (!session) redirect("/login?next=%2Fadmin");
  if (!session.user.roles.some((role) => ADMIN_ROLES.includes(role))) {
    throw new Error("Not allowed");
  }
  return session.token;
}

// Membuang cache tipe kamar (halaman publik) dan menyegarkan halaman admin.
function refreshAll() {
  updateTag("room-types");
  revalidatePath("/admin", "layout");
}

// ----- Tipe kamar -----

export async function saveRoomTypeAction(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const token = await adminToken();

  const idText = text(formData, "id");
  const isEdit = idText !== "";

  const values = {
    name: text(formData, "name"),
    slug: text(formData, "slug"),
    description: text(formData, "description"),
    basePrice: text(formData, "basePrice"),
    capacity: text(formData, "capacity"),
  };

  const basePrice = Number(values.basePrice);
  const capacity = Number(values.capacity);

  if (values.name === "") return { error: "Enter a name.", values };
  if (values.name.length > 100) return { error: "The name is too long (max 100).", values };
  if (values.slug !== "" && !SLUG_PATTERN.test(values.slug)) {
    return {
      error: "The slug may only contain lowercase letters, numbers, and hyphens.",
      values,
    };
  }
  if (values.description.length > 2000) {
    return { error: "The description is too long (max 2000).", values };
  }
  if (!Number.isInteger(basePrice) || basePrice < 1 || basePrice > 100_000_000) {
    return { error: "Enter a price in Rupiah between 1 and 100,000,000.", values };
  }
  if (!Number.isInteger(capacity) || capacity < 1 || capacity > 10) {
    return { error: "Capacity must be between 1 and 10 guests.", values };
  }

  const body: RoomTypeBody = {
    name: values.name,
    slug: values.slug || undefined,
    description: values.description,
    basePrice,
    capacity,
    // PUT mengganti seluruh data, jadi nilai lama dikirim ulang.
    imageUrl: text(formData, "imageUrl") || null,
  };

  try {
    if (isEdit) {
      await updateRoomType(token, Number(idText), body);
    } else {
      await createRoomType(token, body);
    }
  } catch (error) {
    redirectIfUnauthorized(error, "/admin/room-types");
    return { error: errorMessage(error), values };
  }

  refreshAll();
  redirect("/admin/room-types?saved=1");
}

export async function deleteRoomTypeAction(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const token = await adminToken();

  const id = Number(text(formData, "id"));
  if (!Number.isInteger(id) || id <= 0) return { error: "Room type not found." };

  try {
    await deleteRoomType(token, id);
  } catch (error) {
    redirectIfUnauthorized(error, "/admin/room-types");
    return { error: errorMessage(error) };
  }

  refreshAll();
  redirect("/admin/room-types?deleted=1");
}

// ----- Kamar fisik -----

export async function saveRoomAction(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const token = await adminToken();

  const idText = text(formData, "id");
  const isEdit = idText !== "";

  const values = {
    roomNumber: text(formData, "roomNumber"),
    roomTypeId: text(formData, "roomTypeId"),
  };
  const roomTypeId = Number(values.roomTypeId);

  if (values.roomNumber === "") return { error: "Enter a room number.", values };
  if (values.roomNumber.length > 10) {
    return { error: "The room number is too long (max 10).", values };
  }
  if (!Number.isInteger(roomTypeId) || roomTypeId <= 0) {
    return { error: "Choose a room type.", values };
  }

  const body = { roomNumber: values.roomNumber, roomTypeId };

  try {
    if (isEdit) {
      await updateRoom(token, Number(idText), body);
    } else {
      await createRoom(token, body);
    }
  } catch (error) {
    redirectIfUnauthorized(error, "/admin/rooms");
    return { error: errorMessage(error), values };
  }

  refreshAll();
  redirect("/admin/rooms?saved=1");
}

export async function deleteRoomAction(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const token = await adminToken();

  const id = Number(text(formData, "id"));
  if (!Number.isInteger(id) || id <= 0) return { error: "Room not found." };

  try {
    await deleteRoom(token, id);
  } catch (error) {
    redirectIfUnauthorized(error, "/admin/rooms");
    return { error: errorMessage(error) };
  }

  refreshAll();
  redirect("/admin/rooms?deleted=1");
}

// ----- Akun resepsionis -----

export async function createStaffAction(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const token = await adminToken();

  const fullName = text(formData, "fullName");
  const email = text(formData, "email");
  const rawPassword = formData.get("password");
  const password = typeof rawPassword === "string" ? rawPassword : "";
  const values = { fullName, email };

  if (fullName === "") return { error: "Enter the full name.", values };
  if (!EMAIL_PATTERN.test(email)) return { error: "Enter a valid email address.", values };

  const problem = passwordProblem(password);
  if (problem) return { error: problem, values };

  try {
    await createStaff(token, { fullName, email, password });
  } catch (error) {
    redirectIfUnauthorized(error, "/admin/staff");
    return { error: errorMessage(error), values };
  }

  return { message: `Receptionist account created for ${email}.` };
}