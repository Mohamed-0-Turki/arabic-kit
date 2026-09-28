import { describe, expect, it } from "vitest";
import { number } from "../formatter.js";

describe("number", () => {
  it("returns an empty string for nullish input", () => {
    expect(number(null)).toBe("");
    expect(number(undefined)).toBe("");
    expect(number("")).toBe("");
  });

  it("renders numbers as-is by default", () => {
    expect(number(123456)).toBe("123456");
    expect(number(1234.5)).toBe("1234.5");
    expect(number(0)).toBe("0");
  });

  it("handles negative numbers", () => {
    expect(number(-42.5)).toBe("-42.5");
    expect(number(-1234, { group: true })).toBe("-1,234");
    expect(number(-42.5, { locale: "ar" })).toBe("-٤٢.٥");
  });

  it("handles bigint", () => {
    expect(number(123n, { locale: "ar" })).toBe("١٢٣");
    expect(number(9007199254740993n, { locale: "ar" })).toBe(
      "٩٠٠٧١٩٩٢٥٤٧٤٠٩٩٣",
    );
    expect(number(123456789012345678901234567890n, { group: true })).toBe(
      "123,456,789,012,345,678,901,234,567,890",
    );
  });

  it("uses Arabic-Indic digits for the Arabic locale", () => {
    expect(number(123456, { locale: "ar" })).toBe("١٢٣٤٥٦");
    expect(number(0.5, { locale: "ar" })).toBe("٠.٥");
    expect(number(-7, { locale: "ar" })).toBe("-٧");
  });

  it("uses Latin digits for the English locale", () => {
    expect(number(123456, { locale: "en" })).toBe("123456");
    expect(number(1234.5, { locale: "en" })).toBe("1234.5");
  });

  it("groups digits when group is enabled", () => {
    expect(number(123456, { group: true })).toBe("123,456");
    expect(number(1000000, { group: true })).toBe("1,000,000");
    expect(number(1234.5, { group: true })).toBe("1,234.5");
  });

  it("groups Arabic digits with the Arabic thousands separator", () => {
    expect(number(123456, { locale: "ar", group: true })).toBe("١٢٣٬٤٥٦");
    expect(number(1000000, { locale: "ar", group: true })).toBe("١٬٠٠٠٬٠٠٠");
  });

  it("normalizes the Arabic decimal separator to a dot", () => {
    expect(number(1234.5, { locale: "ar", group: true })).toBe("١٬٢٣٤.٥");
  });

  it("applies Intl fraction defaults when group is enabled", () => {
    expect(number(1234.56789, { group: true })).toBe("1,234.568");
  });

  it("groups zero and values below one", () => {
    expect(number(0, { locale: "ar", group: true })).toBe("٠");
    expect(number(0.5, { locale: "ar", group: true })).toBe("٠.٥");
  });

  it("keeps separators locale-driven and glyphs style-driven", () => {
    expect(number(123456, { locale: "ar", digits: "latin", group: true })).toBe(
      "123٬456",
    );
    expect(number(123456, { locale: "ar", digits: "latin" })).toBe("123456");
    expect(number(123456, { digits: "arabic" })).toBe("١٢٣٤٥٦");
    expect(number(123456, { locale: "en", digits: "arabic" })).toBe("١٢٣٤٥٦");
  });

  it("resolves digits: auto from the locale", () => {
    expect(number(42, { locale: "ar", digits: "auto" })).toBe("٤٢");
    expect(number(42, { locale: "en", digits: "auto" })).toBe("42");
  });

  it("formats numeric strings", () => {
    expect(number("987654321", { locale: "ar" })).toBe("٩٨٧٦٥٤٣٢١");
    expect(number("1234.5", { locale: "ar" })).toBe("١٢٣٤.٥");
    expect(number("123456", { group: true })).toBe("123,456");
    expect(number("+42", { locale: "ar" })).toBe("+٤٢");
  });

  it("keeps leading-zero strings intact when group is enabled", () => {
    expect(number("0501234567", { locale: "ar" })).toBe("٠٥٠١٢٣٤٥٦٧");
    expect(number("0501234567", { locale: "ar", group: true })).toBe(
      "٠٥٠١٢٣٤٥٦٧",
    );
    expect(number("0123", { group: true })).toBe("0123");
  });

  it("keeps phone numbers and national IDs intact", () => {
    expect(number("+966501234567", { locale: "ar" })).toBe("+٩٦٦٥٠١٢٣٤٥٦٧");
    expect(number("+966501234567", { locale: "ar", group: true })).toBe(
      "+٩٦٦٥٠١٢٣٤٥٦٧",
    );
    expect(number("007", { group: true })).toBe("007");
  });

  it("returns non-numeric text unchanged, without touching its digits", () => {
    expect(number("abc")).toBe("abc");
    expect(number("abc", { locale: "ar" })).toBe("abc");
    expect(number("N/A", { locale: "ar" })).toBe("N/A");
    expect(number("order #42", { locale: "ar" })).toBe("order #42");
    expect(number("Total: 42 USD", { locale: "ar", group: true })).toBe(
      "Total: 42 USD",
    );
    expect(number("1e3", { locale: "ar", group: true })).toBe("1e3");
    expect(number("0x10", { locale: "ar", group: true })).toBe("0x10");
    expect(number("1,000", { locale: "ar", group: true })).toBe("1,000");
    expect(number("٤٢", { locale: "en", digits: "latin" })).toBe("٤٢");
  });

  it("returns non-finite numbers as text instead of throwing", () => {
    expect(number(Number.NaN, { group: true })).toBe("NaN");
    expect(number(Number.POSITIVE_INFINITY, { group: true })).toBe("Infinity");
    expect(number(Number.NEGATIVE_INFINITY, { locale: "ar" })).toBe(
      "-Infinity",
    );
  });

  it("does not group numbers written in exponential notation", () => {
    expect(number(1e21, { group: true })).toBe("1e+21");
  });
});
