import { describe, expect, it } from "vitest";
import { time } from "../formatter.js";

describe("time", () => {
  it("returns an empty string for nullish input", () => {
    expect(time(null)).toBe("");
    expect(time(undefined)).toBe("");
    expect(time("")).toBe("");
  });

  it("renders 24-hour time by default", () => {
    expect(time("14:30")).toBe("14:30");
    expect(time("00:00")).toBe("00:00");
    expect(time("23:59")).toBe("23:59");
  });

  it("renders Arabic-Indic digits for the Arabic locale", () => {
    expect(time("14:30", { locale: "ar" })).toBe("١٤:٣٠");
    expect(time("00:07", { locale: "ar" })).toBe("٠٠:٠٧");
  });

  it("shows seconds only when requested and present", () => {
    expect(time("14:30:45", { seconds: true })).toBe("14:30:45");
    expect(time("14:30", { seconds: true })).toBe("14:30");
    expect(time("14:30:45")).toBe("14:30");
  });

  it("renders 12-hour time with Latin periods", () => {
    expect(time("14:30", { hour12: true })).toBe("02:30 PM");
    expect(time("09:05", { hour12: true })).toBe("09:05 AM");
    expect(time("00:00", { hour12: true })).toBe("12:00 AM");
    expect(time("12:00", { hour12: true })).toBe("12:00 PM");
  });

  it("renders 12-hour time with Arabic periods and digits", () => {
    expect(time("14:30", { locale: "ar", hour12: true })).toBe("٠٢:٣٠ م");
    expect(time("09:05", { locale: "ar", hour12: true })).toBe("٠٩:٠٥ ص");
    expect(time("00:00", { locale: "ar", hour12: true })).toBe("١٢:٠٠ ص");
    expect(time("12:00", { locale: "ar", hour12: true })).toBe("١٢:٠٠ م");
  });

  it("combines every option", () => {
    expect(
      time("18:05:09", { locale: "ar", hour12: true, seconds: true }),
    ).toBe("٠٦:٠٥:٠٩ م");
  });

  it("forces digit styles independently of the locale", () => {
    expect(time("14:30", { digits: "arabic" })).toBe("١٤:٣٠");
    expect(time("14:30", { locale: "ar", digits: "latin" })).toBe("14:30");
    expect(time("14:30", { locale: "ar", digits: "latin", hour12: true })).toBe(
      "02:30 م",
    );
    expect(time("14:30", { locale: "en", digits: "arabic" })).toBe("١٤:٣٠");
  });

  it("returns invalid input unchanged", () => {
    expect(time("25:00")).toBe("25:00");
    expect(time("12:60")).toBe("12:60");
    expect(time("9:30")).toBe("9:30");
    expect(time("14:30:45:60")).toBe("14:30:45:60");
    expect(time("14:3o")).toBe("14:3o");
    expect(time("abc")).toBe("abc");
  });
});
