import { describe, expect, it } from "vitest";
import { addDays, formatDate, formatRupiah, isIsoDate, plural } from "./format";

describe("addDays", () => {
  it("melewati batas bulan", () => {
    expect(addDays("2026-01-31", 1)).toBe("2026-02-01");
  });

  it("mengenali tahun kabisat", () => {
    expect(addDays("2028-02-28", 1)).toBe("2028-02-29");
    expect(addDays("2026-02-28", 1)).toBe("2026-03-01");
  });

  it("bisa mundur", () => {
    expect(addDays("2026-03-01", -1)).toBe("2026-02-28");
    expect(addDays("2026-01-01", -1)).toBe("2025-12-31");
  });
});

describe("isIsoDate", () => {
  it("menerima tanggal yang benar", () => {
    expect(isIsoDate("2026-11-10")).toBe(true);
  });

  it("menolak bentuk atau nilai yang salah", () => {
    expect(isIsoDate("10-11-2026")).toBe(false);
    expect(isIsoDate("2026-13-01")).toBe(false);
    expect(isIsoDate("abc")).toBe(false);
    expect(isIsoDate(undefined)).toBe(false);
    expect(isIsoDate(20261110)).toBe(false);
  });
});

describe("formatDate", () => {
  it("tidak bergeser karena zona waktu", () => {
    expect(formatDate("2026-11-10")).toBe("10 Nov 2026");
    expect(formatDate("2026-01-01")).toBe("1 Jan 2026");
  });
});

describe("formatRupiah", () => {
  it("memakai pemisah ribuan titik", () => {
    expect(formatRupiah(450000)).toMatch(/450\.000/);
    expect(formatRupiah(1500000)).toMatch(/1\.500\.000/);
  });
});

describe("plural", () => {
  it("memilih bentuk tunggal dan jamak", () => {
    expect(plural(1, "room")).toBe("1 room");
    expect(plural(0, "room")).toBe("0 rooms");
    expect(plural(3, "night")).toBe("3 nights");
  });

  it("menerima bentuk jamak khusus", () => {
    expect(plural(2, "person", "people")).toBe("2 people");
  });
});