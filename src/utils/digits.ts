import type { DigitStyle } from "../locale/index.js";

const LATIN_DIGITS = "0123456789";
const ARABIC_INDIC_DIGITS = "٠١٢٣٤٥٦٧٨٩";
const EXTENDED_ARABIC_INDIC_DIGITS = "۰۱۲۳۴۵۶۷۸۹";
const DIGIT_FAMILIES = [
  LATIN_DIGITS,
  ARABIC_INDIC_DIGITS,
  EXTENDED_ARABIC_INDIC_DIGITS,
];
const DIGIT_PATTERN = /[0-9٠-٩۰-۹]/g;

const TARGETS: Record<DigitStyle, string> = {
  arabic: ARABIC_INDIC_DIGITS,
  latin: LATIN_DIGITS,
};

const DIGIT_INDEX = new Map(
  DIGIT_FAMILIES.flatMap((family) =>
    [...family].map((glyph, digit) => [glyph, digit] as const),
  ),
);

export const applyDigitStyle = (text: string, style: DigitStyle): string =>
  text.replace(DIGIT_PATTERN, (glyph) => toGlyph(glyph, style));

const toGlyph = (glyph: string, style: DigitStyle): string => {
  const index = DIGIT_INDEX.get(glyph);

  return index === undefined ? glyph : TARGETS[style].charAt(index);
};
