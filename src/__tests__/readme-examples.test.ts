import { describe, expect, it } from "vitest";
import { date, digits, number, stretch, time } from "../index.js";

describe("README examples", () => {
  it("quick start", () => {
    expect(number(123456, { locale: "ar" })).toBe("١٢٣٤٥٦");
    expect(digits("order #42", "arabic")).toBe("order #٤٢");
    expect(
      date("2026-09-28", { locale: "ar", month: "long", weekday: true }),
    ).toBe("الاثنين، ٢٨ سبتمبر ٢٠٢٦");
    expect(time("18:30", { locale: "ar" })).toBe("١٨:٣٠");
    expect(stretch("مرحبا", 2)).toBe("مــرحــبــا");
  });

  it("number", () => {
    expect(number(123456)).toBe("123456");
    expect(number(123456.78)).toBe("123456.78");
    expect(number(-42.5)).toBe("-42.5");
    expect(number(1234n)).toBe("1234");
    expect(number(123456, { locale: "ar" })).toBe("١٢٣٤٥٦");
    expect(number(123456, { locale: "ar", group: true })).toBe("١٢٣٬٤٥٦");
    expect(number(123456.78, { locale: "en", group: true })).toBe("123,456.78");
    expect(number(1000000, { locale: "ar", group: true })).toBe("١٬٠٠٠٬٠٠٠");
    expect(number(1234.5, { locale: "ar", group: true })).toBe("١٬٢٣٤.٥");
    expect(number(1234.56789, { group: true })).toBe("1,234.568");
    expect(number(null)).toBe("");
    expect(number(undefined)).toBe("");
    expect(number(Number.NaN, { group: true })).toBe("NaN");
    expect(number(Number.POSITIVE_INFINITY, { group: true })).toBe("Infinity");
  });

  it("identifiers are never grouped", () => {
    expect(number("0501234567", { locale: "ar" })).toBe("٠٥٠١٢٣٤٥٦٧");
    expect(number("0501234567", { locale: "ar", group: true })).toBe(
      "٠٥٠١٢٣٤٥٦٧",
    );
    expect(number("+966501234567", { locale: "ar", group: true })).toBe(
      "+٩٦٦٥٠١٢٣٤٥٦٧",
    );
    expect(number("0123", { locale: "en", group: true })).toBe("0123");
    expect(number(123456789012345678901234567890n, { group: true })).toBe(
      "123,456,789,012,345,678,901,234,567,890",
    );
  });

  it("number() does not format text", () => {
    expect(number("abc", { locale: "ar" })).toBe("abc");
    expect(number("order #42", { locale: "ar" })).toBe("order #42");
    expect(number("1,000", { locale: "ar", group: true })).toBe("1,000");
    expect(number("1e3", { locale: "ar", group: true })).toBe("1e3");
  });

  it("digits", () => {
    expect(digits("0123456789", "arabic")).toBe("٠١٢٣٤٥٦٧٨٩");
    expect(digits("order #42", "arabic")).toBe("order #٤٢");
    expect(digits("2026-09-28 18:30", "arabic")).toBe("٢٠٢٦-٠٩-٢٨ ١٨:٣٠");
    expect(digits("٢٠٢٦-٠٩-٢٨", "latin")).toBe("2026-09-28");
    expect(digits("۰۱۲۳۴۵۶۷۸۹", "latin")).toBe("0123456789");
    expect(digits("۰۱۲۳۴۵۶۷۸۹", "arabic")).toBe("٠١٢٣٤٥٦٧٨٩");
    expect(digits("٠١٢٣٤٥٦٧٨٩", "latin")).toBe("0123456789");
    expect(digits("الفاتورة رقم 42 — 2026", "arabic")).toBe(
      "الفاتورة رقم ٤٢ — ٢٠٢٦",
    );
    expect(digits("Total: $1,299.00 (paid)", "arabic")).toBe(
      "Total: $١,٢٩٩.٠٠ (paid)",
    );
    expect(digits("(+966) 50-123-4567", "arabic")).toBe("(+٩٦٦) ٥٠-١٢٣-٤٥٦٧");
    expect(digits("مرحبا بالعالم!", "latin")).toBe("مرحبا بالعالم!");
    expect(digits("hello", "latin")).toBe("hello");
    expect(digits("", "arabic")).toBe("");
    expect(digits("١٬٠٠٠", "latin")).toBe("1٬000");
  });

  it("date", () => {
    expect(date("2026-09-28")).toBe("2026-09-28");
    expect(date("2026-09-28", { locale: "ar" })).toBe("٢٠٢٦-٠٩-٢٨");
    expect(date("2026-09-28", { month: "none" })).toBe("2026-09-28");
    expect(date("2026-09-28", { locale: "ar", month: "long" })).toBe(
      "٢٨ سبتمبر ٢٠٢٦",
    );
    expect(date("2026-09-28", { locale: "en", month: "long" })).toBe(
      "September 28, 2026",
    );
    expect(date("2026-09-28", { locale: "en", month: "short" })).toBe(
      "Sep 28, 2026",
    );
    expect(date("2026-09-28", { locale: "ar", month: "short" })).toBe(
      "٢٨ سبتمبر ٢٠٢٦",
    );
    expect(
      date("2026-09-28", { locale: "ar", month: "long", weekday: true }),
    ).toBe("الاثنين، ٢٨ سبتمبر ٢٠٢٦");
    expect(
      date("2026-09-28", { locale: "en", month: "long", weekday: true }),
    ).toBe("Monday, September 28, 2026");
    expect(
      date("2024-02-29", { locale: "ar", month: "long", weekday: true }),
    ).toBe("الخميس، ٢٩ فبراير ٢٠٢٤");
    expect(date(new Date(2026, 8, 28), { locale: "ar", month: "long" })).toBe(
      "٢٨ سبتمبر ٢٠٢٦",
    );
    expect(date(null)).toBe("");
    expect(date(undefined)).toBe("");
    expect(date(new Date("not a date"))).toBe("");
    expect(date("28/09/2026")).toBe("28/09/2026");
    expect(date("2026-9-8")).toBe("2026-9-8");
    expect(date("2026-02-31")).toBe("2026-02-31");
    expect(date("2026-13-01")).toBe("2026-13-01");
  });

  it("time", () => {
    expect(time("18:30")).toBe("18:30");
    expect(time("18:30", { locale: "ar" })).toBe("١٨:٣٠");
    expect(time("09:05", { hour12: true })).toBe("09:05 AM");
    expect(time("18:30", { hour12: true })).toBe("06:30 PM");
    expect(time("18:30", { locale: "ar", hour12: true })).toBe("٠٦:٣٠ م");
    expect(time("09:05", { locale: "ar", hour12: true })).toBe("٠٩:٠٥ ص");
    expect(time("18:30", { locale: "ar", digits: "latin", hour12: true })).toBe(
      "06:30 م",
    );
    expect(time("18:30", { locale: "en", digits: "arabic" })).toBe("١٨:٣٠");
    expect(time("00:00", { hour12: true })).toBe("12:00 AM");
    expect(time("00:00", { locale: "ar", hour12: true })).toBe("١٢:٠٠ ص");
    expect(time("12:00", { hour12: true })).toBe("12:00 PM");
    expect(time("12:30", { locale: "ar", hour12: true })).toBe("١٢:٣٠ م");
    expect(time("18:30:45")).toBe("18:30");
    expect(time("18:30:45", { seconds: true })).toBe("18:30:45");
    expect(time("18:30", { seconds: true })).toBe("18:30");
    expect(
      time("18:30:45", { locale: "ar", hour12: true, seconds: true }),
    ).toBe("٠٦:٣٠:٤٥ م");
    expect(time(null)).toBe("");
    expect(time("25:00")).toBe("25:00");
    expect(time("18:5")).toBe("18:5");
    expect(time("8:30")).toBe("8:30");
    expect(time("18:30:99")).toBe("18:30:99");
  });

  it("stretch", () => {
    expect(stretch("مرحبا")).toBe("مـرحـبـا");
    expect(stretch("مرحبا", 2)).toBe("مــرحــبــا");
    expect(stretch("مرحبا", 3)).toBe("مـــرحـــبـــا");
    expect(stretch("أحمد", 3)).toBe("أحـــمـــد");
    expect(stretch("مُحَمَّد", 2)).toBe("مُــحَــمَّــد");
    expect(stretch("مرحبا بالعالم", 2)).toBe("مــرحــبــا بــالــعــالــم");
    expect(stretch("Hello", 2)).toBe("Hello");
    expect(stretch("2026", 2)).toBe("2026");
    expect(stretch("مرحبا 2026", 2)).toBe("مــرحــبــا 2026");
    expect(stretch("مرحباً، بالعالم!", 2)).toBe(
      "مــرحــبــاً، بــالــعــالــم!",
    );
    expect(stretch("  مرحبا   بالعالم  ", 1)).toBe(" مـرحـبـا بـالـعـالـم ");
    expect(stretch("مرحبا", 0)).toBe("مرحبا");
    expect(stretch("مرحبا", -3)).toBe("مرحبا");
    expect(stretch("مرحبا", 1.9)).toBe("مـرحـبـا");
    expect(stretch("مرحبا", Number.NaN)).toBe("مرحبا");
  });

  it("real-world example: dashboard KPI tiles", () => {
    const tiles = [
      { label: "إجمالي الطلبات", value: 1284730, period: "2026-09-28" },
      { label: "المتوسط", value: 154.87, period: "2026-09-28" },
    ];

    const lines = tiles.flatMap((tile) => [
      `${tile.label}: ${number(tile.value, { locale: "ar", group: true })}`,
      date(tile.period, { locale: "ar", month: "long" }),
    ]);

    expect(lines).toEqual([
      "إجمالي الطلبات: ١٬٢٨٤٬٧٣٠",
      "٢٨ سبتمبر ٢٠٢٦",
      "المتوسط: ١٥٤.٨٧",
      "٢٨ سبتمبر ٢٠٢٦",
    ]);
  });

  it("real-world example: admin table", () => {
    const orders = [
      { id: "ORD-2026-00412", total: 8490, createdAt: "14:05" },
      { id: "ORD-2026-00413", total: 1290.5, createdAt: "18:30" },
    ];

    const rows = orders.map((order) =>
      [
        order.id,
        number(order.total, { locale: "ar", group: true }),
        time(order.createdAt, { locale: "ar", hour12: true }),
      ].join(" "),
    );

    expect(rows).toEqual([
      "ORD-2026-00412 ٨٬٤٩٠ ٠٢:٠٥ م",
      "ORD-2026-00413 ١٬٢٩٠.٥ ٠٦:٣٠ م",
    ]);
  });

  it("real-world example: form input typed in Arabic", () => {
    const onNationalIdInput = (typed: string): string =>
      digits(typed, "latin").replace(/\D/g, "").slice(0, 10);

    const onDateInput = (typed: string): string =>
      date(digits(typed, "latin"), { locale: "ar", month: "long" });

    expect(onNationalIdInput("١٠٩٨٧٦٥٤٣٢")).toBe("1098765432");
    expect(onDateInput("2026-09-28")).toBe("٢٨ سبتمبر ٢٠٢٦");
    expect(onDateInput("٢٠٢٦-٠٩-٢٨")).toBe("٢٨ سبتمبر ٢٠٢٦");
    expect(number("1098765432", { digits: "arabic" })).toBe("١٠٩٨٧٦٥٤٣٢");
  });
});
