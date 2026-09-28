import type { Locale } from "../locale/index.js";
import { LOCALE_TAGS } from "../locale/index.js";

const NUMERIC_PATTERN = /^[+-]?\d+(?:\.\d+)?$/;
const GROUPABLE_PATTERN = /^-?(?:0|[1-9]\d*)(?:\.\d+)?$/;
const DECIMAL_NOTATION_PATTERN = /[.eE]/;
const ARABIC_DECIMAL_SEPARATOR = "\u066b";
const LATIN_DECIMAL_SEPARATOR = ".";

export const isNumeric = (text: string): boolean => NUMERIC_PATTERN.test(text);

export const applyGrouping = (text: string, locale: Locale): string => {
  if (!GROUPABLE_PATTERN.test(text)) {
    return text;
  }

  return new Intl.NumberFormat(LOCALE_TAGS[locale])
    .format(toExactValue(text))
    .replace(ARABIC_DECIMAL_SEPARATOR, LATIN_DECIMAL_SEPARATOR);
};

const toExactValue = (text: string): number | bigint =>
  DECIMAL_NOTATION_PATTERN.test(text) ? Number(text) : BigInt(text);
