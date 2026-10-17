import { describe, expect, it } from "vitest";
import { decodeJwtPayload } from "./jwt";

// Membuat token palsu: header.payload.tanda-tangan. Hanya untuk tes, tanda tangannya tidak diperiksa.
function makeToken(payload: object) {
  const encode = (value: object) =>
    Buffer.from(JSON.stringify(value)).toString("base64url");
  return `${encode({ alg: "none" })}.${encode(payload)}.signature`;
}

describe("decodeJwtPayload", () => {
  it("membaca klaim dasar", () => {
    const payload = decodeJwtPayload(
      makeToken({ sub: "7", email: "a@b.com", name: "Budi", role: "Admin" }),
    );
    expect(payload).toMatchObject({ sub: "7", email: "a@b.com", name: "Budi", role: "Admin" });
  });

  it("membaca beberapa peran sebagai daftar", () => {
    const payload = decodeJwtPayload(makeToken({ role: ["Admin", "Receptionist"] }));
    expect(payload?.role).toEqual(["Admin", "Receptionist"]);
  });

  it("membaca huruf non-ASCII dengan benar", () => {
    const payload = decodeJwtPayload(makeToken({ name: "Siti Nurhaliza é" }));
    expect(payload?.name).toBe("Siti Nurhaliza é");
  });

  it("mengembalikan null untuk token rusak", () => {
    expect(decodeJwtPayload("")).toBeNull();
    expect(decodeJwtPayload("bukan-token")).toBeNull();
    expect(decodeJwtPayload("a.%%%.c")).toBeNull();
  });
});