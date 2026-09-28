import type { DigitStyle, Locale } from "../locale/index.js";

export type NumberInput = string | number | bigint | null | undefined;

export interface NumberOptions {
  locale?: Locale;
  digits?: DigitStyle | "auto";
  group?: boolean;
}
