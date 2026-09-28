import { describe, expect, it } from "vitest";
import * as packageEntry from "../index.js";

const PUBLIC_FUNCTIONS = ["date", "digits", "number", "stretch", "time"];

const REMOVED_PUBLIC_NAMES = [
  "formatDate",
  "formatNumber",
  "formatTime",
  "toArabicDigits",
  "toLatinDigits",
];

describe("public API", () => {
  it("exports exactly the documented functions", () => {
    expect(Object.keys(packageEntry).sort()).toEqual(
      [...PUBLIC_FUNCTIONS].sort(),
    );
  });

  it("exports functions, not implementation details", () => {
    for (const name of PUBLIC_FUNCTIONS) {
      expect(typeof packageEntry[name as keyof typeof packageEntry]).toBe(
        "function",
      );
    }
  });

  it("does not leak internal helpers", () => {
    const internalNames = [
      "applyDigitStyle",
      "applyGrouping",
      "isNumeric",
      "parseDate",
      "parseTime",
      "resolveDigitStyle",
      "LOCALE_TAGS",
      "LOCALE_DIGIT_STYLES",
      "DIGIT_INDEX",
      "MONTHS",
      "AR_DAYS",
      "NON_CONNECTING_LETTERS",
    ];

    for (const name of internalNames) {
      expect(packageEntry).not.toHaveProperty(name);
    }
  });

  it("does not export the previous public surface", () => {
    for (const name of REMOVED_PUBLIC_NAMES) {
      expect(packageEntry).not.toHaveProperty(name);
    }
  });
});
