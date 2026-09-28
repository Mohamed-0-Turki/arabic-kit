import type { Locale } from "../locale/index.js";
import { LOCALE_TAGS } from "../locale/index.js";
import type { DateInput, DateOptions, MonthStyle } from "./types.js";
import { parseDate } from "./parser.js";

const EMPTY = "";
const DEFAULT_LOCALE: Locale = "en";
const PAD_LENGTH = 2;
const YEAR_LENGTH = 4;

export const date = (value: DateInput, options: DateOptions = {}): string => {
  const { locale = DEFAULT_LOCALE, month = "none", weekday = false } = options;
  const parsed = parseDate(value);

  if (parsed === null) {
    return typeof value === "string" ? value : EMPTY;
  }

  if (month === "none") {
    return toIsoDate(parsed);
  }

  return toLocalizedDate(parsed, locale, month, weekday);
};

const toIsoDate = (value: Date): string => {
  const year = String(value.getFullYear()).padStart(YEAR_LENGTH, "0");
  const month = String(value.getMonth() + 1).padStart(PAD_LENGTH, "0");
  const day = String(value.getDate()).padStart(PAD_LENGTH, "0");

  return `${year}-${month}-${day}`;
};

const toLocalizedDate = (
  value: Date,
  locale: Locale,
  month: Exclude<MonthStyle, "none">,
  weekday: boolean,
): string => {
  const options: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month,
    year: "numeric",
  };

  if (weekday) {
    options.weekday = "long";
  }

  return new Intl.DateTimeFormat(LOCALE_TAGS[locale], options).format(value);
};
