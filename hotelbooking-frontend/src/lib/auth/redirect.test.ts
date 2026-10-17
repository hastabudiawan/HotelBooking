import { describe, expect, it } from "vitest";
import { safeNext } from "./redirect";

describe("safeNext", () => {
  it("menerima alamat dalam situs", () => {
    expect(safeNext("/account/bookings")).toBe("/account/bookings");
    expect(safeNext("/rooms/deluxe?checkIn=2026-11-10")).toBe("/rooms/deluxe?checkIn=2026-11-10");
  });

  it("memakai bawaan kalau kosong", () => {
    expect(safeNext(undefined)).toBe("/");
    expect(safeNext("")).toBe("/");
    expect(safeNext(undefined, "/account")).toBe("/account");
  });

  it("menolak alamat ke situs lain (open redirect)", () => {
    expect(safeNext("https://evil.example")).toBe("/");
    expect(safeNext("//evil.example")).toBe("/");
    expect(safeNext("/\\evil.example")).toBe("/");
    expect(safeNext("javascript:alert(1)")).toBe("/");
  });

  it("memakai nilai pertama kalau berupa daftar", () => {
    expect(safeNext(["/staff", "/admin"])).toBe("/staff");
  });
});