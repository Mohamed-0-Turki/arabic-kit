import { describe, expect, it } from "vitest";
import { date } from "../formatter.js";

describe("date", () => {
  it("returns an ISO date by default", () => {
    expect(date("2026-09-28")).toBe("2026-09-28");
    expect(date("2026-09-28", { locale: "ar" })).toBe("٢٠٢٦-٠٩-٢٨");
    expect(date("2026-09-28", { month: "none" })).toBe("2026-09-28");
  });

  it("uses Arabic-Indic digits in the ISO form for the Arabic locale", () => {
    expect(date("2026-09-28", { locale: "ar" })).toBe("٢٠٢٦-٠٩-٢٨");
    expect(date("2026-09-28", { locale: "ar", month: "none" })).toBe(
      "٢٠٢٦-٠٩-٢٨",
    );
    expect(date("2026-01-05", { locale: "ar" })).toBe("٢٠٢٦-٠١-٠٥");
  });

  it("keeps Latin digits in the ISO form for the English locale", () => {
    expect(date("2026-09-28", { locale: "en" })).toBe("2026-09-28");
    expect(date("2026-01-05", { locale: "en" })).toBe("2026-01-05");
    expect(date("2026-09-28")).toBe("2026-09-28");
  });

  it("converts a Date instance to Arabic-Indic digits in the ISO form", () => {
    expect(date(new Date(2026, 8, 28), { locale: "ar" })).toBe("٢٠٢٦-٠٩-٢٨");
  });

  it("uses Arabic-Indic digits in a localized Arabic date with a weekday", () => {
    const formatted = date("2026-09-28", {
      locale: "ar",
      month: "long",
      weekday: true,
    });

    expect(formatted).toBe("الاثنين، ٢٨ سبتمبر ٢٠٢٦");
    expect(formatted).toMatch(/[٠-٩]/);
    expect(formatted).not.toMatch(/[0-9]/);
  });

  it("keeps the ISO shape, including zero padding, when converting digits", () => {
    expect(date("2026-01-05", { locale: "ar" })).toBe("٢٠٢٦-٠١-٠٥");
    expect(date("2024-02-29", { locale: "ar" })).toBe("٢٠٢٤-٠٢-٢٩");
  });

  it("accepts a Date instance", () => {
    expect(date(new Date(2026, 8, 28))).toBe("2026-09-28");
    expect(date(new Date(2026, 8, 28), { month: "long" })).toBe(
      "September 28, 2026",
    );
  });

  it("renders Arabic month names with Arabic digits", () => {
    expect(date("2026-09-28", { locale: "ar", month: "long" })).toBe(
      "٢٨ سبتمبر ٢٠٢٦",
    );
    expect(date("2026-01-05", { locale: "ar", month: "long" })).toBe(
      "٥ يناير ٢٠٢٦",
    );
  });

  it("renders English month names", () => {
    expect(date("2026-09-28", { locale: "en", month: "long" })).toBe(
      "September 28, 2026",
    );
    expect(date("2026-09-28", { locale: "en", month: "short" })).toBe(
      "Sep 28, 2026",
    );
  });

  it("uses the full Arabic month name for the short style", () => {
    expect(date("2026-09-28", { locale: "ar", month: "short" })).toBe(
      "٢٨ سبتمبر ٢٠٢٦",
    );
  });

  it("prepends the weekday when requested", () => {
    expect(
      date("2026-09-28", { locale: "ar", month: "long", weekday: true }),
    ).toBe("الاثنين، ٢٨ سبتمبر ٢٠٢٦");
    expect(
      date("2026-09-28", { locale: "en", month: "long", weekday: true }),
    ).toBe("Monday, September 28, 2026");
    expect(
      date("2024-02-29", { locale: "ar", month: "long", weekday: true }),
    ).toBe("الخميس، ٢٩ فبراير ٢٠٢٤");
  });

  it("ignores the weekday when no month name is rendered", () => {
    expect(date("2026-09-28", { weekday: true })).toBe("2026-09-28");
  });

  it("keeps leap days intact", () => {
    expect(date("2024-02-29", { month: "long" })).toBe("February 29, 2024");
  });

  it("returns unsupported input unchanged", () => {
    expect(date("28/09/2026")).toBe("28/09/2026");
    expect(date("2026-9-8")).toBe("2026-9-8");
    expect(date("not a date")).toBe("not a date");
    expect(date("2026-09-28T10:00:00Z")).toBe("2026-09-28T10:00:00Z");
  });

  it("rejects impossible calendar dates", () => {
    expect(date("2026-02-31")).toBe("2026-02-31");
    expect(date("2025-02-29")).toBe("2025-02-29");
    expect(date("2026-13-01")).toBe("2026-13-01");
    expect(date("2026-00-10")).toBe("2026-00-10");
    expect(date("2026-09-00")).toBe("2026-09-00");
  });

  it("returns an empty string for nullish and invalid input", () => {
    expect(date(null)).toBe("");
    expect(date(undefined)).toBe("");
    expect(date(new Date("not a date"))).toBe("");
  });
});
