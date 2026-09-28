import type { Locale } from "../locale/index.js";

export type DateInput = string | Date | null | undefined;

export type MonthStyle = "none" | "short" | "long";

export interface DateOptions {
  locale?: Locale;
  month?: MonthStyle;
  weekday?: boolean;
}
