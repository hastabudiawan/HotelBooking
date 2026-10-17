import { describe, expect, it } from "vitest";
import { MAX_IMAGE_URL_LENGTH, isRemoteImage, isValidImageUrl } from "./image-url";

describe("isValidImageUrl", () => {
  it("menerima https penuh", () => {
    expect(isValidImageUrl("https://images.example.com/rooms/family.jpg")).toBe(true);
  });

  it("menerima jalur dalam situs", () => {
    expect(isValidImageUrl("/images/rooms/family.jpg")).toBe(true);
  });

  it("menolak http dan skema berbahaya", () => {
    expect(isValidImageUrl("http://images.example.com/a.jpg")).toBe(false);
    expect(isValidImageUrl("javascript:alert(1)")).toBe(false);
    expect(isValidImageUrl("data:image/png;base64,AAAA")).toBe(false);
  });

  it("menolak alamat tanpa skema atau yang mengarah ke host lain lewat //", () => {
    expect(isValidImageUrl("images.example.com/a.jpg")).toBe(false);
    expect(isValidImageUrl("//evil.example/a.jpg")).toBe(false);
    expect(isValidImageUrl("/\\evil.example/a.jpg")).toBe(false);
  });

  it("menolak kosong dan terlalu panjang", () => {
    expect(isValidImageUrl("")).toBe(false);
    const long = `https://example.com/${"a".repeat(MAX_IMAGE_URL_LENGTH)}`;
    expect(isValidImageUrl(long)).toBe(false);
  });
});

describe("isRemoteImage", () => {
  it("membedakan alamat luar dan jalur dalam situs", () => {
    expect(isRemoteImage("https://example.com/a.jpg")).toBe(true);
    expect(isRemoteImage("/images/rooms/a.jpg")).toBe(false);
  });
});