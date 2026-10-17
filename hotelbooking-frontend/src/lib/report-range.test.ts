import { describe, expect, it } from "vitest";
import { MAX_REPORT_DAYS, inclusiveDays, resolveRange } from "./report-range";

const TODAY = "2026-10-17";

describe("inclusiveDays", () => {
  it("menghitung kedua ujung", () => {
    expect(inclusiveDays("2026-10-17", "2026-10-17")).toBe(1);
    expect(inclusiveDays("2026-10-11", "2026-10-17")).toBe(7);
  });

  it("melewati pergantian bulan", () => {
    expect(inclusiveDays("2026-10-30", "2026-11-02")).toBe(4);
  });
});

describe("resolveRange", () => {
  it("memakai 7 hari terakhir kalau tidak ada masukan", () => {
    expect(resolveRange({}, TODAY)).toEqual({ from: "2026-10-11", to: TODAY, error: null });
  });

  it("menerima rentang yang benar", () => {
    expect(resolveRange({ from: "2026-11-01", to: "2026-11-30" }, TODAY)).toEqual({
      from: "2026-11-01",
      to: "2026-11-30",
      error: null,
    });
  });

  it("menerima rentang satu hari", () => {
    expect(resolveRange({ from: TODAY, to: TODAY }, TODAY).error).toBeNull();
  });

  it("menerima tepat 92 hari dan menolak 93 hari", () => {
    const from = "2026-01-01";
    // 1 Jan + 91 hari = 2 Apr (92 hari termasuk kedua ujung); 1 Jan + 92 hari = 3 Apr (93 hari)
    expect(resolveRange({ from, to: "2026-04-02" }, TODAY).error).toBeNull();
    expect(inclusiveDays(from, "2026-04-02")).toBe(MAX_REPORT_DAYS);
    expect(resolveRange({ from, to: "2026-04-03" }, TODAY).error).toMatch(/at most 92/);
  });

  it("menolak tanggal akhir sebelum tanggal awal dan kembali ke bawaan", () => {
    const range = resolveRange({ from: "2026-11-10", to: "2026-11-01" }, TODAY);
    expect(range.error).toMatch(/before the start/);
    expect(range.from).toBe("2026-10-11");
    expect(range.to).toBe(TODAY);
  });

  it("menolak tanggal rusak atau hanya sebagian terisi", () => {
    expect(resolveRange({ from: "abc", to: "xyz" }, TODAY).error).toMatch(/valid/);
    expect(resolveRange({ from: "2026-11-01" }, TODAY).error).toMatch(/valid/);
  });

  it("memakai nilai pertama kalau parameter berulang", () => {
    expect(
      resolveRange({ from: ["2026-11-01", "2026-12-01"], to: "2026-11-05" }, TODAY).from,
    ).toBe("2026-11-01");
  });
});