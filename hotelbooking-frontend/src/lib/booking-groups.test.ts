import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { BookingDto } from "@/lib/api/types";
import { effectiveStatus, groupOf } from "./booking-groups";

const NOW = "2026-10-17T10:00:00Z";

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(NOW));
});

afterEach(() => {
  vi.useRealTimers();
});

describe("effectiveStatus", () => {
  it("Pending yang batas bayarnya lewat dianggap Expired", () => {
    expect(effectiveStatus({ status: "Pending", expiresAt: "2026-10-17T09:59:00Z" })).toBe("Expired");
  });

  it("Pending yang masih punya waktu tetap Pending", () => {
    expect(effectiveStatus({ status: "Pending", expiresAt: "2026-10-17T10:10:00Z" })).toBe("Pending");
  });

  it("status lain tidak berubah walau expiresAt sudah lewat", () => {
    expect(effectiveStatus({ status: "Confirmed", expiresAt: "2026-10-17T09:00:00Z" })).toBe("Confirmed");
  });

  it("Pending tanpa batas waktu tetap Pending", () => {
    expect(effectiveStatus({ status: "Pending", expiresAt: null })).toBe("Pending");
  });
});

describe("groupOf", () => {
  const booking = (status: BookingDto["status"], expiresAt: string | null = null) =>
    ({ status, expiresAt }) as BookingDto;

  it("mengelompokkan booking berjalan sebagai active", () => {
    expect(groupOf(booking("Pending", "2026-10-17T10:10:00Z"))).toBe("active");
    expect(groupOf(booking("Confirmed"))).toBe("active");
    expect(groupOf(booking("CheckedIn"))).toBe("active");
  });

  it("mengelompokkan yang selesai sebagai completed", () => {
    expect(groupOf(booking("CheckedOut"))).toBe("completed");
    expect(groupOf(booking("NoShow"))).toBe("completed");
  });

  it("mengelompokkan batal dan kedaluwarsa sebagai closed", () => {
    expect(groupOf(booking("Cancelled"))).toBe("closed");
    expect(groupOf(booking("Expired"))).toBe("closed");
    expect(groupOf(booking("Pending", "2026-10-17T09:00:00Z"))).toBe("closed");
  });
});