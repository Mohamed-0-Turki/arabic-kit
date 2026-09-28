import type { Locale } from "../locale/index.js";
import { resolveDigitStyle } from "../locale/index.js";
import type { TimeInput, TimeOptions } from "./types.js";
import { applyDigitStyle } from "../utils/digits.js";
import { parseTime } from "./parser.js";

const EMPTY = "";
const DEFAULT_LOCALE: Locale = "en";
const TIME_SEPARATOR = ":";
const PERIOD_SEPARATOR = " ";
const PAD_LENGTH = 2;
const HOURS_PER_PERIOD = 12;
const LAST_PERIOD_HOUR = 12;

const PERIODS: Record<Locale, Record<"am" | "pm", string>> = {
  ar: { am: "ص", pm: "م" },
  en: { am: "AM", pm: "PM" },
};

export const time = (value: TimeInput, options: TimeOptions = {}): string => {
  const {
    locale = DEFAULT_LOCALE,
    digits = "auto",
    hour12 = false,
    seconds = false,
  } = options;
  const parts = parseTime(value);

  if (parts === null) {
    return typeof value === "string" ? value : EMPTY;
  }

  const { hour, minute, second } = parts;
  const segments = [pad(hour12 ? to12Hour(hour) : hour), pad(minute)];

  if (seconds && second !== null) {
    segments.push(pad(second));
  }

  const clock = segments.join(TIME_SEPARATOR);
  const text = hour12 ? addPeriod(clock, hour, locale) : clock;

  return applyDigitStyle(text, resolveDigitStyle(locale, digits));
};

const to12Hour = (hour: number): number => {
  const wrapped = hour % HOURS_PER_PERIOD;

  return wrapped === 0 ? LAST_PERIOD_HOUR : wrapped;
};

const addPeriod = (text: string, hour: number, locale: Locale): string => {
  const period = hour < HOURS_PER_PERIOD ? "am" : "pm";

  return `${text}${PERIOD_SEPARATOR}${PERIODS[locale][period]}`;
};

const pad = (value: number): string => String(value).padStart(PAD_LENGTH, "0");
