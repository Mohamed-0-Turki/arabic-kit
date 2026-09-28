import type { DigitStyle } from "../locale/index.js";
import { applyDigitStyle } from "../utils/digits.js";

export const digits = (value: string, style: DigitStyle): string =>
  applyDigitStyle(value, style);
