import { describe, expect, it } from "vitest";
import { digits } from "../digits.js";

describe("digits", () => {
  it("converts Latin digits to Arabic-Indic digits", () => {
    expect(digits("0123456789", "arabic")).toBe("٠١٢٣٤٥٦٧٨٩");
    expect(digits("2026-09-28 18:30", "arabic")).toBe("٢٠٢٦-٠٩-٢٨ ١٨:٣٠");
    expect(digits("42.5", "arabic")).toBe("٤٢.٥");
    expect(digits("-7", "arabic")).toBe("-٧");
  });

  it("converts Arabic-Indic digits to Latin digits", () => {
    expect(digits("٠١٢٣٤٥٦٧٨٩", "latin")).toBe("0123456789");
    expect(digits("٢٠٢٦-٠٩-٢٨ ١٨:٣٠", "latin")).toBe("2026-09-28 18:30");
    expect(digits("٤٢.٥", "latin")).toBe("42.5");
  });

  it("converts Persian / extended Arabic-Indic digits to Latin digits", () => {
    expect(digits("۰۱۲۳۴۵۶۷۸۹", "latin")).toBe("0123456789");
    expect(digits("۱۴۰۳/۰۶/۱۲", "latin")).toBe("1403/06/12");
  });

  it("converts mixed digit families in one string", () => {
    expect(digits("١٢٣4٥٦۷۸۹", "latin")).toBe("123456789");
    expect(digits("۱۲۳4٥۶٧٨٩", "arabic")).toBe("١٢٣٤٥٦٧٨٩");
  });

  it("normalises every digit family into the requested one", () => {
    expect(digits("۰۱۲۳۴۵۶۷۸۹", "arabic")).toBe("٠١٢٣٤٥٦٧٨٩");
    expect(digits("۰۱۲۳۴۵۶۷۸۹", "latin")).toBe("0123456789");
    expect(digits("٠١٢٣٤٥٦٧٨٩", "latin")).toBe("0123456789");
    expect(digits("٠١٢٣٤٥٦٧٨٩", "arabic")).toBe("٠١٢٣٤٥٦٧٨٩");
  });

  it("leaves every other character alone", () => {
    expect(digits("order #42", "arabic")).toBe("order #٤٢");
    expect(digits("الفاتورة رقم 42 — 2026", "arabic")).toBe(
      "الفاتورة رقم ٤٢ — ٢٠٢٦",
    );
    expect(digits("مرحبا بالعالم!", "latin")).toBe("مرحبا بالعالم!");
    expect(digits("Total: $1,299.00 (paid)", "arabic")).toBe(
      "Total: $١,٢٩٩.٠٠ (paid)",
    );
  });

  it("handles separators, punctuation and whitespace", () => {
    expect(digits("1,000,000", "arabic")).toBe("١,٠٠٠,٠٠٠");
    expect(digits("(+966) 50-123-4567", "arabic")).toBe("(+٩٦٦) ٥٠-١٢٣-٤٥٦٧");
    expect(digits("  12\t34\n56  ", "arabic")).toBe("  ١٢\t٣٤\n٥٦  ");
  });

  it("never touches separators, which is number()'s job", () => {
    expect(digits("١٬٠٠٠٬٠٠٠", "latin")).toBe("1٬000٬000");
    expect(digits("1.5", "arabic")).toBe("١.٥");
  });

  it("returns text without digits unchanged", () => {
    expect(digits("مرحبا", "arabic")).toBe("مرحبا");
    expect(digits("hello", "latin")).toBe("hello");
    expect(digits("", "arabic")).toBe("");
    expect(digits("no digits ٤٢", "latin")).toBe("no digits 42");
  });

  it("is idempotent when the glyphs already match", () => {
    expect(digits("٤٢.٥", "arabic")).toBe("٤٢.٥");
    expect(digits("42.5", "latin")).toBe("42.5");
  });

  it("handles every single-digit mapping", () => {
    expect(digits("٠١٢٣٤٥٦٧٨٩", "arabic")).toBe("٠١٢٣٤٥٦٧٨٩");
    expect(digits("۰۱۲۳۴۵۶۷۸۹", "latin")).toBe("0123456789");
    expect(digits("٠۱۲۳۴۵۶۷۸۹", "latin")).toBe("0123456789");
  });
});
