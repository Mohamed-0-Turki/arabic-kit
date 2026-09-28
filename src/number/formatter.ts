import type { Locale } from "../locale/index.js";
import { resolveDigitStyle } from "../locale/index.js";
import type { NumberInput, NumberOptions } from "./types.js";
import { applyDigitStyle } from "../utils/digits.js";
import { applyGrouping, isNumeric } from "./numeric.js";

const EMPTY = "";
const DEFAULT_LOCALE: Locale = "en";

export const number = (
  value: NumberInput,
  options: NumberOptions = {},
): string => {
  const { locale = DEFAULT_LOCALE, digits = "auto", group = false } = options;

  if (value === null || value === undefined) {
    return EMPTY;
  }

  const text = String(value);

  if (typeof value === "string" && !isNumeric(text)) {
    return text;
  }

  const grouped = group ? applyGrouping(text, locale) : text;

  return applyDigitStyle(grouped, resolveDigitStyle(locale, digits));
};
