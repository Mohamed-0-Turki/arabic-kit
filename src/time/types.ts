import type { DigitStyle, Locale } from "../locale/index.js";

export type TimeInput = string | null | undefined;

export interface TimeOptions {
  locale?: Locale;
  digits?: DigitStyle | "auto";
  hour12?: boolean;
  seconds?: boolean;
}
